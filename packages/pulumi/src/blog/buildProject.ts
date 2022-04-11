import * as aws from "@pulumi/aws";
import policies from "./policies";
import * as fs from "fs";

const token = String(process.env.GITHUB_ACCESS_TOKEN);

class BuildProject {
  project: aws.codebuild.Project;
  role: aws.iam.Role;
  constructor({ bucket, repo }: { bucket: aws.s3.Bucket; repo: string }) {
    new aws.codebuild.SourceCredential("github-token", {
      authType: "PERSONAL_ACCESS_TOKEN",
      serverType: "GITHUB",
      token: token,
    });

    const roleName = "codebuild-project-service-role";

    this.role = new aws.iam.Role(roleName, {
      assumeRolePolicy: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "sts:AssumeRole",
            Principal: {
              Service: "codebuild.amazonaws.com",
            },
            Effect: "Allow",
          },
        ],
      },
    });

    const policy = policies.getProjectBuildPolicy({
      bucket: bucket,
    });

    new aws.iam.RolePolicyAttachment(`${roleName}-BuildProjectServicePolicy`, {
      role: this.role,
      policyArn: policy.arn.apply((arn) => arn),
    });

    new aws.iam.RolePolicyAttachment(`${roleName}-AWSCodeDeployRole`, {
      role: this.role,
      policyArn: aws.iam.ManagedPolicy.AWSCodeDeployRole,
    });

    this.project = new aws.codebuild.Project("build-project", {
      serviceRole: this.role.arn,
      source: {
        type: "GITHUB",
        location: repo,
      },
      environment: {
        type: "LINUX_CONTAINER",
        computeType: "BUILD_GENERAL1_SMALL",
        image: "aws/codebuild/standard:5.0",
      },
      artifacts: { type: "NO_ARTIFACTS" },
    });

    new aws.codebuild.Webhook("build-project-webhook", {
      projectName: this.project.name,
      buildType: "BUILD",
      filterGroups: [
        {
          filters: [
            {
              type: "EVENT",
              pattern: "PUSH",
            },
            {
              type: "HEAD_REF",
              pattern: "refs/heads/master",
            },
          ],
        },
      ],
    });
  }
}
export default BuildProject;
