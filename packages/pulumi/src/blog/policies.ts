import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

class Policies {
  private readonly awsRegion: string;
  private readonly callerIdentityOutput: pulumi.Output<aws.GetCallerIdentityResult>;

  constructor() {
    const current = aws.getCallerIdentity({});
    this.callerIdentityOutput = pulumi.output(current);
    this.awsRegion = aws.config.requireRegion();
  }

  getProjectBuildPolicy({ bucket }: { bucket: aws.s3.Bucket }): aws.iam.Policy {
    return new aws.iam.Policy("CodeBuildPolicy", {
      description: "This policy enables access to S3 and to run codebuild",
      policy: {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Action: ["s3:GetBucketLocation"],
            Resource: "arn:aws:s3:::*",
          },
          {
            Effect: "Allow",
            Action: [
              "s3:HeadBucket",
              "s3:PutBucketWebsite",
              "s3:PutObject",
              "s3:PutObjectAcl",
              "s3:GetObject",
              "s3:ListBucket",
              "s3:DeleteObject",
            ],
            Resource: [
              pulumi.interpolate`arn:aws:s3:::${bucket.id}`,
              pulumi.interpolate`arn:aws:s3:::${bucket.id}/*`,
            ],
          },
          {
            Effect: "Allow",
            Resource: pulumi.interpolate`arn:aws:logs:${this.awsRegion}:${this.callerIdentityOutput.accountId}:log-group:/aws/codebuild/*`,
            Action: [
              "logs:CreateLogGroup",
              "logs:CreateLogStream",
              "logs:PutLogEvents",
            ],
          },
          {
            Effect: "Allow",
            Action: [
              "codebuild:CreateReportGroup",
              "codebuild:CreateReport",
              "codebuild:UpdateReport",
              "codebuild:BatchPutTestCases",
              "codebuild:BatchPutCodeCoverages",
            ],
            Resource: pulumi.interpolate`arn:aws:codebuild:${this.awsRegion}:${this.callerIdentityOutput.accountId}:report-group/blog-build`,
          },
          {
            Effect: "Allow",
            Action: ["ssm:DescribeParameters"],
            Resource: "*",
          },
          {
            Effect: "Allow",
            Action: ["ssm:GetParameters"],
            Resource: pulumi.interpolate`arn:aws:ssm:${this.awsRegion}:${this.callerIdentityOutput.accountId}:parameter/webiny-api*`,
          },
          {
            Sid: "AccessToCloudfront",
            Effect: "Allow",
            Action: [
              "cloudfront:GetInvalidation",
              "cloudfront:CreateInvalidation",
            ],
            Resource: "*",
          },
        ],
      },
    });
  }
}

const policies = new Policies();
export default policies;
