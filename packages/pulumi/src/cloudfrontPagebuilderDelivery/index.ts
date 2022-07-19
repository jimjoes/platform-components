import * as aws from "@pulumi/aws";
import { input as inputs } from "@pulumi/aws/types";
import { parse } from "url";
import Route53ARecord from "../route53";

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

class CloudfrontPagebuilderDelivery {
  cloudfront: aws.cloudfront.Distribution;
  bucket: aws.s3.Bucket;
  aliases: string[];
  constructor({
    subdomain,
    appS3Bucket,
    routingRules,
    zone,
    certificate,
  }: {
    subdomain?: string;
    appS3Bucket: aws.s3.Bucket;
    routingRules?: any;
    zone?: aws.route53.Zone;
    certificate?: aws.acm.Certificate;
  }) {
    if ((stackEnv === "dev" || stackEnv === "staging") && subdomain) {
      alternateCnames.push(buildDomain(rootDomain, subdomain + "." + stackEnv));
    } else if (stackEnv === "prod" && subdomain) {
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
    let bucketConfig;
    if (routingRules) {
      bucketConfig = {
        acl: "public-read",
        forceDestroy: true,
        website: {
          indexDocument: "index.html",
          errorDocument: "_NOT_FOUND_PAGE_/index.html",
          routingRules,
        },
      };
    } else {
      bucketConfig = {
        acl: "public-read",
        forceDestroy: true,
        website: {
          indexDocument: "index.html",
          errorDocument: "_NOT_FOUND_PAGE_/index.html",
        },
      };
    }

    this.bucket = new aws.s3.Bucket("delivery", bucketConfig);

    this.aliases = alternateCnames.map(
      (domainDescriptor) => domainDescriptor.domain
    );

    const config: any = {
      enabled: true,
      waitForDeployment: false,
      origins: [
        {
          originId: this.bucket.arn,
          domainName: this.bucket.websiteEndpoint,
          customOriginConfig: {
            originProtocolPolicy: "http-only",
            httpPort: 80,
            httpsPort: 443,
            originSslProtocols: ["TLSv1.2"],
          },
        },
        {
          originId: appS3Bucket.arn,
          domainName: appS3Bucket.websiteEndpoint,
          customOriginConfig: {
            originProtocolPolicy: "http-only",
            httpPort: 80,
            httpsPort: 443,
            originSslProtocols: ["TLSv1.2"],
          },
        },
      ],
      orderedCacheBehaviors: [
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
          pathPattern: "/static/*",
          viewerProtocolPolicy: "allow-all",
          targetOriginId: appS3Bucket.arn,
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
          pathPattern: "/robots.txt",
          viewerProtocolPolicy: "allow-all",
          targetOriginId: appS3Bucket.arn,
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
          targetOriginId: appS3Bucket.arn,
          // MinTTL <= DefaultTTL <= MaxTTL
          minTtl: 0,
          defaultTtl: 2592000, // 30 days
          maxTtl: 2592000,
        },
      ],
      defaultRootObject: "index.html",
      defaultCacheBehavior: {
        compress: true,
        targetOriginId: this.bucket.arn,
        viewerProtocolPolicy: "redirect-to-https",
        allowedMethods: ["GET", "HEAD", "OPTIONS"],
        cachedMethods: ["GET", "HEAD", "OPTIONS"],
        forwardedValues: {
          cookies: { forward: "none" },
          queryString: true,
        },
        // MinTTL <= DefaultTTL <= MaxTTL
        minTtl: 0,
        defaultTtl: 30,
        maxTtl: 30,
      },
      priceClass: "PriceClass_100",
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

    this.cloudfront = new aws.cloudfront.Distribution("delivery", config);

    if (subdomain && zone) {
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
}

export default CloudfrontPagebuilderDelivery;
