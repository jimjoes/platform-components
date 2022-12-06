import * as aws from "@pulumi/aws";
import Bucket from "./bucket";
import CloudfrontWebApp from "../cloudfrontWebapp";
import BuildProject from "./buildProject";
import Secret from "../secret";

class Blog {
  bucket: Bucket;
  webapp: CloudfrontWebApp;
  buildProject: BuildProject;

  constructor({
    subdomain,
    repo,
    zone,
    certificate,
    routingRules,
  }: {
    subdomain: string;
    repo: string;
    zone: aws.route53.Zone;
    certificate: aws.acm.Certificate;
    routingRules: any[];
  }) {
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

    this.bucket = new Bucket({ routingRules });
    this.webapp = new CloudfrontWebApp({
      bucket: this.bucket.bucket,
      subdomain: subdomain,
      zone,
      certificate,
    });
    this.buildProject = new BuildProject({
      bucket: this.bucket.bucket,
      repo: repo,
    });
    new Secret({
      name: `${process.env.WEBINY_ENV}/webiny-cms-api-secret`,
      value: String(process.env.WEBINY_API_SECRET),
    });
  }
}
export default Blog;
