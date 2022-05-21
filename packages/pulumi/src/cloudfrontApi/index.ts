import * as aws from "@pulumi/aws";
import { input as inputs } from "@pulumi/aws/types";
import { parse } from "url";
import ApiGateway from "./apiGateway";
import Route53 from "../route53";

type DomainDescriptor = {
  domain: string;
  subDomain: string;
  parentDomain: string;
  domainParts: string[];
};

const buildDomain = (
  parentDomain: string,
  ...subDomainParts: string[]
): DomainDescriptor => {
  const subDomain = subDomainParts.join(".");
  const domain = [subDomain, parentDomain].join(".");
  const domainParts = domain.split(".").reverse();

  return {
    domain,
    subDomain,
    parentDomain: parentDomain + ".",
    domainParts,
  };
};

const stackEnv = process.env.PULUMI_NODEJS_STACK;
const rootDomain = String(process.env.ROOT_DOMAIN);
const rootZoneId = String(process.env.ROOT_ZONE_ID);
const rootAcmCertificateArn = String(process.env.ROOT_ACM_CERTIFICATE_ARN);
const alternateCnames: DomainDescriptor[] = [];

class CloudfrontApi {
  cloudfront: aws.cloudfront.Distribution;
  apiGateway: ApiGateway;
  aliases: string[];
  constructor({
    routes,
    subdomain,
  }: {
    routes: Array<any>;
    subdomain?: string;
  }) {
    let allowedOrigins: string[] = [];

    if (stackEnv === "dev") {
      if (subdomain) {
        alternateCnames.push(buildDomain(rootDomain, subdomain + "-dev"));
        allowedOrigins = [
          "http://localhost:3000",
          "http://localhost:8000",
          "https://" + buildDomain(rootDomain, "www" + "-dev").domain,
          "https://" + buildDomain(rootDomain, "platform" + "-dev").domain,
          "https://" + buildDomain(rootDomain, "admin" + "-dev").domain,
          "https://" + buildDomain(rootDomain, "survey" + "-dev").domain,
          "https://" + buildDomain(rootDomain, "content" + "-dev").domain,
        ];
      }
    } else if (stackEnv === "prod") {
      if (subdomain) {
        alternateCnames.push(buildDomain(rootDomain, subdomain));
        allowedOrigins = [
          "https://" + buildDomain(rootDomain, "www").domain,
          "https://" + buildDomain(rootDomain, "platform").domain,
          "https://" + buildDomain(rootDomain, "admin").domain,
          "https://" + buildDomain(rootDomain, "survey").domain,
          "https://" + buildDomain(rootDomain, "content").domain,
        ];
      }
    }

    let viewerCertificate: inputs.cloudfront.DistributionViewerCertificate;
    if (rootAcmCertificateArn && subdomain) {
      viewerCertificate = {
        acmCertificateArn: rootAcmCertificateArn,
        sslSupportMethod: "sni-only",
      };
    } else {
      viewerCertificate = {
        cloudfrontDefaultCertificate: true,
      };
    }

    this.aliases = alternateCnames.map(
      (domainDescriptor) => domainDescriptor.domain
    );

    this.apiGateway = new ApiGateway({ routes, allowedOrigins });

    const config: any = {
      waitForDeployment: false,
      defaultCacheBehavior: {
        compress: true,
        allowedMethods: [
          "GET",
          "HEAD",
          "OPTIONS",
          "PUT",
          "POST",
          "PATCH",
          "DELETE",
        ],
        cachedMethods: ["GET", "HEAD", "OPTIONS"],
        forwardedValues: {
          cookies: {
            forward: "none",
          },
          headers: ["Accept", "Accept-Language"],
          queryString: true,
        },
        // MinTTL <= DefaultTTL <= MaxTTL
        minTtl: 0,
        defaultTtl: 0,
        maxTtl: 86400,
        targetOriginId: this.apiGateway.api.name,
        viewerProtocolPolicy: "allow-all",
      },
      isIpv6Enabled: true,
      enabled: true,
      orderedCacheBehaviors: [
        {
          compress: true,
          allowedMethods: [
            "GET",
            "HEAD",
            "OPTIONS",
            "PUT",
            "POST",
            "PATCH",
            "DELETE",
          ],
          cachedMethods: ["GET", "HEAD", "OPTIONS"],
          forwardedValues: {
            cookies: {
              forward: "none",
            },
            headers: ["Accept", "Accept-Language"],
            queryString: true,
          },
          pathPattern: "/cms*",
          viewerProtocolPolicy: "allow-all",
          targetOriginId: this.apiGateway.api.name,
        },
        {
          allowedMethods: [
            "GET",
            "HEAD",
            "OPTIONS",
            "PUT",
            "POST",
            "PATCH",
            "DELETE",
          ],
          cachedMethods: ["GET", "HEAD", "OPTIONS"],
          forwardedValues: {
            cookies: {
              forward: "none",
            },
            headers: ["Accept", "Accept-Language"],
            queryString: true,
          },
          // MinTTL <= DefaultTTL <= MaxTTL
          minTtl: 0,
          defaultTtl: 0,
          maxTtl: 2592000,
          pathPattern: "/files/*",
          viewerProtocolPolicy: "allow-all",
          targetOriginId: this.apiGateway.api.name,
        },
      ],
      origins: [
        {
          domainName: this.apiGateway.defaultStage.invokeUrl.apply(
            (url: string) => String(parse(url).hostname)
          ),
          originPath: this.apiGateway.defaultStage.invokeUrl.apply(
            (url: string) => String(parse(url).pathname)
          ),
          originId: this.apiGateway.api.name,
          customOriginConfig: {
            httpPort: 80,
            httpsPort: 443,
            originProtocolPolicy: "https-only",
            originSslProtocols: ["TLSv1.2"],
          },
        },
      ],
      restrictions: {
        geoRestriction: {
          restrictionType: "none",
        },
      },
      viewerCertificate,
    };

    if (subdomain) {
      config.aliases = this.aliases;
    }

    this.cloudfront = new aws.cloudfront.Distribution("api-cloudfront", config);
    if (subdomain) {
      alternateCnames
        .map(
          (domainDescriptor) =>
            new Route53(domainDescriptor, this.cloudfront, rootZoneId)
        )
        .map((route53) => route53.record.fqdn);
    }
  }
}

export default CloudfrontApi;
