import * as aws from "@pulumi/aws";
import { input as inputs } from "@pulumi/aws/types";
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

class CloudfrontWebApp {
  cloudfront: aws.cloudfront.Distribution;
  aliases: string[];
  constructor({
    bucket,
    subdomain,
  }: {
    bucket: aws.s3.Bucket;
    subdomain: string;
  }) {
    if (stackEnv === "dev") {
      alternateCnames.push(buildDomain(rootDomain, subdomain + "-dev"));
    } else if (stackEnv === "prod") {
      alternateCnames.push(buildDomain(rootDomain, subdomain));
    }

    let viewerCertificate: inputs.cloudfront.DistributionViewerCertificate;
    if (rootAcmCertificateArn) {
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

    let config: any = {
      enabled: true,
      waitForDeployment: false,
      origins: [
        {
          originId: bucket.arn,
          domainName: bucket.websiteEndpoint,
          customOriginConfig: {
            originProtocolPolicy: "http-only",
            httpPort: 80,
            httpsPort: 443,
            originSslProtocols: ["TLSv1.2"],
          },
        },
      ],
      aliases: this.aliases,
      defaultRootObject: "index.html",
      defaultCacheBehavior: {
        compress: true,
        targetOriginId: bucket.arn,
        viewerProtocolPolicy: "redirect-to-https",
        allowedMethods: ["GET", "HEAD", "OPTIONS"],
        cachedMethods: ["GET", "HEAD", "OPTIONS"],
        forwardedValues: {
          cookies: { forward: "none" },
          queryString: false,
        },
        minTtl: 0,
        defaultTtl: 600,
        maxTtl: 600,
      },
      priceClass: "PriceClass_100",
      customErrorResponses: [
        {
          errorCode: 404,
          responseCode: 404,
          responsePagePath: "/index.html",
        },
      ],
      restrictions: {
        geoRestriction: {
          restrictionType: "none",
        },
      },
      viewerCertificate,
    };

    if (stackEnv === "prod") {
      config.orderedCacheBehaviors = [
        {
          compress: true,
          allowedMethods: ["GET", "HEAD", "OPTIONS"],
          cachedMethods: ["GET", "HEAD", "OPTIONS"],
          forwardedValues: {
            cookies: {
              forward: "none",
            },
            headers: [],
            queryString: false,
          },
          pathPattern: "/robots.txt",
          viewerProtocolPolicy: "allow-all",
          targetOriginId: bucket.arn,
          // MinTTL <= DefaultTTL <= MaxTTL
          minTtl: 0,
          defaultTtl: 2592000, // 30 days
          maxTtl: 2592000,
        },
        {
          compress: true,
          allowedMethods: ["GET", "HEAD", "OPTIONS"],
          cachedMethods: ["GET", "HEAD", "OPTIONS"],
          forwardedValues: {
            cookies: {
              forward: "none",
            },
            headers: [],
            queryString: false,
          },
          pathPattern: "/sitemap.xml",
          viewerProtocolPolicy: "allow-all",
          targetOriginId: bucket.arn,
          // MinTTL <= DefaultTTL <= MaxTTL
          minTtl: 0,
          defaultTtl: 2592000, // 30 days
          maxTtl: 2592000,
        },
      ];
    }

    this.cloudfront = new aws.cloudfront.Distribution(
      subdomain + "-webapp-cloudfront",
      config
    );
    // create dns records
    alternateCnames
      .map(
        (domainDescriptor) =>
          new Route53(domainDescriptor, this.cloudfront, rootZoneId)
      )
      .map((route53) => route53.record.fqdn);
  }
}

export default CloudfrontWebApp;
