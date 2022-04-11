import * as aws from "@pulumi/aws";

class Bucket {
  bucket: aws.s3.Bucket;
  constructor() {
    this.bucket = new aws.s3.Bucket("blog-app", {
      acl: "public-read",
      forceDestroy: true,
      website: {
        indexDocument: "index.html",
        errorDocument: "index.html",
      },
    });
  }
}

export default Bucket;
