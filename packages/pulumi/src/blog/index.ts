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
  }: {
    subdomain: string;
    repo: string;
    zone: aws.route53.Zone;
    certificate: aws.acm.Certificate;
  }) {
    this.bucket = new Bucket();
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
      name: "webiny-cms-api-secret",
      value: String(process.env.WEBINY_API_SECRET),
    });
  }
}
export default Blog;
