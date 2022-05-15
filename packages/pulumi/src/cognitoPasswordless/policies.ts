import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

class Policies {
  private readonly awsRegion: string;
  private readonly callerIdentityOutput: pulumi.Output<aws.GetCallerIdentityResult>;

  constructor() {
    const current = aws.getCallerIdentity({});
    this.callerIdentityOutput = pulumi.output(current);
    this.awsRegion = aws.config.requireRegion();
  }

  getCreateAuthChallengePolicy({
    sesDomainIdentity,
  }: {
    sesDomainIdentity: aws.ses.DomainIdentity;
  }): aws.iam.Policy {
    return new aws.iam.Policy("CreateAuthChallengeLambdaPolicy", {
      description: "This policy allows auth challenges to work",
      policy: {
        Version: "2012-10-17",
        Statement: [
          {
            Sid: "PermissionForLambda",
            Effect: "Allow",
            Action: ["lambda:InvokeFunction"],
            Resource: pulumi.interpolate`arn:aws:lambda:${this.awsRegion}:${this.callerIdentityOutput.accountId}:function:*`,
          },
          {
            Sid: "PermissionForSES",
            Effect: "Allow",
            Action: "ses:SendEmail",
            Resource: pulumi.interpolate`${sesDomainIdentity.arn}`,
          },
        ],
      },
    });
  }
}

const policies = new Policies();
export default policies;
