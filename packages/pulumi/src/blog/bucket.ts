import * as aws from "@pulumi/aws";

class Bucket {
  bucket: aws.s3.Bucket;
  constructor({ routingRules }: { routingRules?: any[] }) {
    let bucketConfig;
    if (routingRules) {
      bucketConfig = {
        acl: "public-read",
        forceDestroy: true,
        website: {
          indexDocument: "index.html",
          errorDocument: "index.html",
          routingRules,
        },
      };
    } else {
      bucketConfig = {
        acl: "public-read",
        forceDestroy: true,
        website: {
          indexDocument: "index.html",
          errorDocument: "index.html",
        },
      };
    }
    this.bucket = new aws.s3.Bucket("blog-app", bucketConfig);
  }
}

export default Bucket;
