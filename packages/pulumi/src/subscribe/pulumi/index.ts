import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import policies from "./policies";

interface SubscribeHandlerParams {
  env: Record<string, any>;
  auditTable: aws.dynamodb.Table;
}

class SubscribeHandler {
  functions: {
    subscribe: aws.lambda.Function;
  };
  role: aws.iam.Role;

  constructor({ env, auditTable }: SubscribeHandlerParams) {
    const roleName = "mailchimp-handler-api-lambda-role";
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

    const policy = policies.getSubscribeHandlerLambdaPolicy();

    new aws.iam.RolePolicyAttachment(
      `${roleName}-SubscribeHandlerLambdaPolicy`,
      {
        role: this.role,
        policyArn: policy.arn.apply((arn) => arn),
      }
    );

    new aws.iam.RolePolicyAttachment(
      `${roleName}-AWSLambdaBasicExecutionRole`,
      {
        role: this.role,
        policyArn: aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole,
      }
    );

    this.functions = {
      subscribe: new aws.lambda.Function("subscribe-handler", {
        runtime: "nodejs12.x",
        handler: "handler.handler",
        role: this.role.arn,
        timeout: 600,
        memorySize: 256,
        code: new pulumi.asset.AssetArchive({
          ".": new pulumi.asset.FileArchive("../code/subscribeHandler/build"),
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

export default SubscribeHandler;