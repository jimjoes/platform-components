import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import policies from "../cognitoPasswordless/policies";

interface PreTokenGenerationParams {
  env: Record<string, any>;
  table: aws.dynamodb.Table;
}

class PreTokenGeneration {
  function: aws.lambda.Function;
  role: aws.iam.Role;

  constructor({ env, table }: PreTokenGenerationParams) {
    const roleName = "pre-token-generation-lambda-role";
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

    const cognitoPolicy = policies.getPreTokenGenerationPolicy({ table });

    new aws.iam.RolePolicyAttachment(
      "create-challenge-lambda-role-attachment",
      {
        role: this.role,
        policyArn: cognitoPolicy.arn,
      }
    );

    this.function = new aws.lambda.Function("pre-token-generation", {
      runtime: "nodejs14.x",
      handler: "handler.handler",
      role: this.role.arn,
      timeout: 30,
      memorySize: 128,
      code: new pulumi.asset.AssetArchive({
        ".": new pulumi.asset.FileArchive(
          "../code/cognitoPreTokenGeneration/build"
        ),
      }),
      environment: {
        variables: {
          ...env,
          AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
        },
      },
    });
  }
}

export default PreTokenGeneration;
