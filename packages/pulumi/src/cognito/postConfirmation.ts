import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import policies from "../cognitoPasswordless/policies";

interface PostConfirmationParams {
  env: Record<string, any>;
  table: aws.dynamodb.Table;
}

class PostConfirmation {
  function: aws.lambda.Function;
  role: aws.iam.Role;

  constructor({ env, table }: PostConfirmationParams) {
    const roleName = `post-confirmation-lambda-role-${process.env.WEBINY_ENV}`;
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

    new aws.iam.RolePolicyAttachment(
      `${roleName}-AWSLambdaBasicExecutionRole`,
      {
        role: this.role,
        policyArn: aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole,
      }
    );

    const cognitoPolicy = policies.getPostConfirmationPolicy({
      table: table,
    });

    new aws.iam.RolePolicyAttachment(
      "post-confirmation-lambda-role-attachment",
      {
        role: this.role,
        policyArn: cognitoPolicy.arn,
      }
    );

    this.function = new aws.lambda.Function(
      `post-confirmation-lambda-${process.env.WEBINY_ENV}`,
      {
        runtime: "nodejs14.x",
        handler: "handler.handler",
        role: this.role.arn,
        timeout: 30,
        memorySize: 128,
        code: new pulumi.asset.AssetArchive({
          ".": new pulumi.asset.FileArchive(
            "../code/cognitoPostConfirmation/build"
          ),
        }),
        environment: {
          variables: {
            ...env,
            AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
          },
        },
      }
    );
  }
}

export default PostConfirmation;
