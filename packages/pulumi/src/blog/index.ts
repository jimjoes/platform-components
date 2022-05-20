import Bucket from "./bucket";
import CloudfrontWebApp from "../cloudfrontWebapp";
import BuildProject from "./buildProject";
import Secret from "../secret";

class Blog {
  bucket: Bucket;
  webapp: CloudfrontWebApp;
  buildProject: BuildProject;

  constructor({ subdomain, repo }: { subdomain: string; repo: string }) {
    this.bucket = new Bucket();
    this.webapp = new CloudfrontWebApp({
      bucket: this.bucket.bucket,
      subdomain: subdomain,
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
