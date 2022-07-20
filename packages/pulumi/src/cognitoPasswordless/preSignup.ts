import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

interface PreSignupParams {
  env: Record<string, any>;
}

class PreSignup {
  function: aws.lambda.Function;
  role: aws.iam.Role;

  constructor({ env }: PreSignupParams) {
    const roleName = "define-challenge-lambda-role";
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

    this.function = new aws.lambda.Function("define-auth-challenge", {
      runtime: "nodejs14.x",
      handler: "handler.handler",
      role: this.role.arn,
      timeout: 30,
      memorySize: 128,
      code: new pulumi.asset.AssetArchive({
        ".": new pulumi.asset.FileArchive("../code/cognitoPreSignup/build"),
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

export default PreSignup;
