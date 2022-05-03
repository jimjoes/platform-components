import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

export type EsDomain =
  | aws.elasticsearch.Domain
  | pulumi.Output<aws.elasticsearch.GetDomainResult>;

class Policies {
  private readonly awsRegion: string;
  private readonly callerIdentityOutput: pulumi.Output<aws.GetCallerIdentityResult>;

  constructor() {
    const current = aws.getCallerIdentity({});
    this.callerIdentityOutput = pulumi.output(current);
    this.awsRegion = aws.config.requireRegion();
  }

  getSubscribeHandlerLambdaPolicy({
    userPool,
  }: {
    userPool?: aws.cognito.UserPool;
  }): aws.iam.Policy {
    const policy: any = {
      description: "This policy enables access to Lambda",
      policy: {
        Version: "2012-10-17",
        Statement: [
          {
            Sid: "PermissionForLambda",
            Effect: "Allow",
            Action: ["lambda:InvokeFunction"],
            Resource: pulumi.interpolate`arn:aws:lambda:${this.awsRegion}:${this.callerIdentityOutput.accountId}:function:*`,
          },
        ],
      },
    };
    if (userPool) {
      policy.policy.Statement.push({
        Sid: "PermissionForCognito",
        Effect: "Allow",
        Action: ["cognito-idp:AdminCreateUser"],
        Resource: pulumi.interpolate`${userPool.arn}`,
      });
    }
    return new aws.iam.Policy("subscribeHandlerLambdaPolicy", policy);
  }
}

const policies = new Policies();
export default policies;
