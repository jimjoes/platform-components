import * as aws from "@pulumi/aws";
import ApiGateway from "./apiGateway";
import { input as inputs } from "@pulumi/aws/types";
import { parse } from "url";
import Route53 from "./route53";

type DomainDescriptor = {
    domain: string;
    subDomain: string;
    parentDomain: string;
    domainParts: string[];
};

const buildDomain = (parentDomain: string, ...subDomainParts: string[]): DomainDescriptor => {
    const subDomain = subDomainParts.join(".");
    const domain = [subDomain, parentDomain].join(".");
    const domainParts = domain.split(".").reverse();
    return {
        domain,
        subDomain,
        parentDomain: parentDomain + ".",
        domainParts
    };
};

const stackEnv = process.env.PULUMI_NODEJS_STACK;
const rootDomain = String(process.env.ROOT_DOMAIN);
const rootZoneId = String(process.env.ROOT_ZONE_ID);
const rootAcmCertificateArn = String(process.env.ROOT_ACM_CERTIFICATE_ARN);
const alternateCnames: DomainDescriptor[] = [];

class Cloudfront {
    cloudfront: aws.cloudfront.Distribution;
    aliases: string[];
    constructor({
        apiGateway,
        devSubdomain,
        prodSubdomain
    }: {
        apiGateway: ApiGateway;
        devSubdomain: string;
        prodSubdomain: string;
    }) {
        if (stackEnv === "dev") {
            alternateCnames.push(buildDomain(rootDomain, devSubdomain));
        } else if (stackEnv === "prod") {
            alternateCnames.push(buildDomain(rootDomain, prodSubdomain));
        }

        let viewerCertificate: inputs.cloudfront.DistributionViewerCertificate;
        if (rootAcmCertificateArn) {
            viewerCertificate = {
                acmCertificateArn: rootAcmCertificateArn,
                sslSupportMethod: "sni-only"
            };
        } else {
            viewerCertificate = {
                cloudfrontDefaultCertificate: true
            };
        }

        this.aliases = alternateCnames.map(domainDescriptor => domainDescriptor.domain);

        this.cloudfront = new aws.cloudfront.Distribution("api-cloudfront", {
            waitForDeployment: false,
            defaultCacheBehavior: {
                compress: true,
                allowedMethods: ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"],
                cachedMethods: ["GET", "HEAD", "OPTIONS"],
                forwardedValues: {
                    cookies: {
                        forward: "none"
                    },
                    headers: ["Accept", "Accept-Language"],
                    queryString: true
                },
                // MinTTL <= DefaultTTL <= MaxTTL
                minTtl: 0,
                defaultTtl: 0,
                maxTtl: 86400,
                targetOriginId: apiGateway.api.name,
                viewerProtocolPolicy: "allow-all"
            },
            isIpv6Enabled: true,
            enabled: true,
            aliases: this.aliases,
            orderedCacheBehaviors: [
                {
                    compress: true,
                    allowedMethods: ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"],
                    cachedMethods: ["GET", "HEAD", "OPTIONS"],
                    forwardedValues: {
                        cookies: {
                            forward: "none"
                        },
                        headers: ["Accept", "Accept-Language"],
                        queryString: true
                    },
                    pathPattern: "/cms*",
                    viewerProtocolPolicy: "allow-all",
                    targetOriginId: apiGateway.api.name
                },
                {
                    allowedMethods: ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"],
                    cachedMethods: ["GET", "HEAD", "OPTIONS"],
                    forwardedValues: {
                        cookies: {
                            forward: "none"
                        },
                        headers: ["Accept", "Accept-Language"],
                        queryString: true
                    },
                    // MinTTL <= DefaultTTL <= MaxTTL
                    minTtl: 0,
                    defaultTtl: 0,
                    maxTtl: 2592000,
                    pathPattern: "/files/*",
                    viewerProtocolPolicy: "allow-all",
                    targetOriginId: apiGateway.api.name
                }
            ],
            origins: [
                {
                    domainName: apiGateway.defaultStage.invokeUrl.apply((url: string) =>
                        String(parse(url).hostname)
                    ),
                    originPath: apiGateway.defaultStage.invokeUrl.apply((url: string) =>
                        String(parse(url).pathname)
                    ),
                    originId: apiGateway.api.name,
                    customOriginConfig: {
                        httpPort: 80,
                        httpsPort: 443,
                        originProtocolPolicy: "https-only",
                        originSslProtocols: ["TLSv1.2"]
                    }
                }
            ],
            restrictions: {
                geoRestriction: {
                    restrictionType: "none"
                }
            },
            viewerCertificate
        });
        alternateCnames
            .map(domainDescriptor => new Route53(domainDescriptor, this.cloudfront, rootZoneId))
            .map(route53 => route53.record.fqdn);
    }
}

export default Cloudfront;
