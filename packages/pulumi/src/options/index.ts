import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import policies from "./policies";

interface OptionsParams {
  env: Record<string, any>;
  vpc?: aws.ec2.Vpc;
  subnets?: {
    private: aws.ec2.Subnet[];
    public: aws.ec2.Subnet[];
  };
}

class Options {
  functions: {
    options: aws.lambda.Function;
  };
  role: aws.iam.Role;

  constructor({ vpc, subnets, env }: OptionsParams) {
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

    if (vpc && subnets) {
      new aws.iam.RolePolicyAttachment(
        `${roleName}-AWSLambdaVPCAccessExecutionRole`,
        {
          role: this.role,
          policyArn: aws.iam.ManagedPolicy.AWSLambdaVPCAccessExecutionRole,
        }
      );
    } else {
      new aws.iam.RolePolicyAttachment(
        `${roleName}-AWSLambdaBasicExecutionRole`,
        {
          role: this.role,
          policyArn: aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole,
        }
      );
    }

    const config: any = {
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
    };

    if (vpc && subnets) {
      config.vpcConfig = {
        subnetIds: subnets.private.map((subNet) => subNet.id),
        securityGroupIds: [vpc.defaultSecurityGroupId],
      };
    }

    this.functions = {
      options: new aws.lambda.Function("options", config),
    };
  }
}

export default Options;
