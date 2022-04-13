import Bucket from "./bucket";
import CloudfrontWebApp from "../cloudfrontWebapp";
import BuildProject from "./buildProject";
import Parameters from "./parameters";

class Blog {
  bucket: Bucket;
  webapp: CloudfrontWebApp;
  buildProject: BuildProject;
  parameters: Parameters;
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

    this.parameters = new Parameters();
  }
}
export default Blog;
