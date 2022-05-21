import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import policies from "./policies";

interface StripeCheckoutParams {
  vpc?: aws.ec2.Vpc;
  subnets?: {
    private: aws.ec2.Subnet[];
    public: aws.ec2.Subnet[];
  };
  env: {
    DEBUG: string;
    WEBINY_LOGS_FORWARD_URL: string;
    STRIPE_API_KEY: string;
    DOMAIN: string;
  };
}

class StripeCheckout {
  functions: {
    checkout: aws.lambda.Function;
  };
  role: aws.iam.Role;

  constructor({ env, vpc, subnets }: StripeCheckoutParams) {
    const roleName = "stripe-checkout-api-lambda-role";
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

    const policy = policies.getStripeCheckoutLambdaPolicy();

    new aws.iam.RolePolicyAttachment(
      `${roleName}-ApiStripeCheckoutLambdaPolicy`,
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

    const config: any = {
      runtime: "nodejs14.x",
      handler: "handler.handler",
      role: this.role.arn,
      timeout: 30,
      memorySize: 128,
      code: new pulumi.asset.AssetArchive({
        ".": new pulumi.asset.FileArchive("../code/stripeCheckout/build"),
      }),
      environment: {
        variables: {
          ...env,
          AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
        },
      },
    };

    if (vpc && subnets) {
      config.vpcConfig = {
        subnetIds: subnets.private.map((subNet) => subNet.id),
        securityGroupIds: [vpc.defaultSecurityGroupId],
      };
    }
    this.functions = {
      checkout: new aws.lambda.Function("stripe-checkout", config),
    };
  }
}

export default StripeCheckout;
