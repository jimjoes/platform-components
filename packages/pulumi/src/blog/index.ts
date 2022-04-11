import * as aws from "@pulumi/aws";
import Bucket from "./bucket";
import { CloudfrontWebApp } from "@jimjoes/pulumi-packages";
import BuildProject from "./buildProject";
import Parameters from "./parameters";

class Blog {
  bucket: Bucket;
  webapp: CloudfrontWebApp;
  constructor({ subdomain, repo }: { subdomain: string; repo: string }) {
    this.bucket = new Bucket();
    this.webapp = new CloudfrontWebApp({
      bucket: this.bucket.bucket,
      subdomain: subdomain,
    });

    const buildProject = new BuildProject({
      bucket: this.bucket.bucket,
      repo: repo,
    });

    const parameters = new Parameters();
  }
}
export default Blog;
