import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import policies from "./policies";

interface OptionsParams {
  env: Record<string, any>;
}

class Options {
  functions: {
    options: aws.lambda.Function;
  };
  role: aws.iam.Role;

  constructor({ env }: OptionsParams) {
    const roleName = "options-site-api-lambda-role";
    this.role = new aws.iam.Role(roleName, {
      assumeRolePolicy: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "sts:AssumeRole",
            Principal: {
              Service: "lambda.amazonaws.com",
            },
            Effect: "Allow",
          },
        ],
      },
    });

    const policy = policies.getOptionsLambdaPolicy();

    new aws.iam.RolePolicyAttachment(`${roleName}-ApiOptionsLambdaPolicy`, {
      role: this.role,
      policyArn: policy.arn.apply((arn) => arn),
    });

    new aws.iam.RolePolicyAttachment(
      `${roleName}-AWSLambdaBasicExecutionRole`,
      {
        role: this.role,
        policyArn: aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole,
      }
    );

    this.functions = {
      options: new aws.lambda.Function("options", {
        runtime: "nodejs14.x",
        handler: "handler.handler",
        role: this.role.arn,
        timeout: 30,
        memorySize: 128,
        code: new pulumi.asset.AssetArchive({
          ".": new pulumi.asset.FileArchive("../code/options/build"),
        }),
        environment: {
          variables: {
            ...env,
            AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
          },
        },
      }),
    };
  }
}

export default Options;
