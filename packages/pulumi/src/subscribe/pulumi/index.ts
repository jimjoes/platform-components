import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import policies from "./policies";

interface SubscribeHandlerParams {
  vpc?: aws.ec2.Vpc;
  subnets?: {
    private: aws.ec2.Subnet[];
    public: aws.ec2.Subnet[];
  };
  env: Record<string, any>;
  platformTable?: aws.dynamodb.Table;
  userPool?: aws.cognito.UserPool;
}

class SubscribeHandler {
  functions: {
    subscribe: aws.lambda.Function;
  };
  role: aws.iam.Role;

  constructor({
    vpc,
    subnets,
    env,
    userPool,
    platformTable,
  }: SubscribeHandlerParams) {
    const roleName = "subscribe-handler-api-lambda-role";
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

    let policyParams: any = {};

    if (userPool) {
      policyParams.userPool = userPool;
    }

    if (platformTable) {
      policyParams.platformTableArn = platformTable.arn;
    }

    const policy = policies.getSubscribeHandlerLambdaPolicy(policyParams);

    new aws.iam.RolePolicyAttachment(
      `${roleName}-SubscribeHandlerLambdaPolicy`,
      {
        role: this.role,
        policyArn: policy.arn.apply((arn) => arn),
      }
    );

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
    };

    if (vpc && subnets) {
      config.vpcConfig = {
        subnetIds: subnets.private.map((subNet) => subNet.id),
        securityGroupIds: [vpc.defaultSecurityGroupId],
      };
    }

    this.functions = {
      subscribe: new aws.lambda.Function("subscribe-handler", config),
    };
  }
}

export default SubscribeHandler;
