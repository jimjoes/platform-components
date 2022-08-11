import * as aws from "@pulumi/aws";
import { input as inputs } from "@pulumi/aws/types";
import Route53ARecord from "../route53";
// import * as fs from "fs";

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
const alternateCnames: DomainDescriptor[] = [];

class CloudfrontWebApp {
  cloudfront: aws.cloudfront.Distribution;
  aliases: string[];
  constructor({
    bucket,
    subdomain,
    zone,
    certificate,
  }: {
    bucket: aws.s3.Bucket;
    subdomain: string;
    zone: aws.route53.Zone;
    certificate: aws.acm.Certificate;
  }) {
    if (stackEnv === "dev" || stackEnv === "staging") {
      alternateCnames.push(buildDomain(rootDomain, subdomain + "." + stackEnv));
    } else if (stackEnv === "prod") {
      alternateCnames.push(buildDomain(rootDomain, subdomain));
    }

    let viewerCertificate: inputs.cloudfront.DistributionViewerCertificate;

    if (certificate) {
      viewerCertificate = {
        acmCertificateArn: certificate.arn,
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

    // fs.writeFileSync("cloudfrontConfig.json", JSON.stringify(config));
    // fs.writeFileSync("alternateCNames.json", JSON.stringify(alternateCnames));

    this.cloudfront = new aws.cloudfront.Distribution(
      subdomain + "-webapp-cloudfront",
      config
    );
    // create dns records
    alternateCnames
      .map(
        (domainDescriptor) =>
          new Route53ARecord({
            domainDescriptor,
            distribution: this.cloudfront,
            zone: zone,
          })
      )
      .map((route53) => route53.record.fqdn);
  }
}

export default CloudfrontWebApp;
