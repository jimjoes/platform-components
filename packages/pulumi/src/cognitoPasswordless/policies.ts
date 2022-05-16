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
    emailIdentity,
  }: {
    sesDomainIdentity: aws.ses.DomainIdentity;
    emailIdentity: aws.ses.EmailIdentity;
  }): aws.iam.Policy {
    return new aws.iam.Policy("CreateAuthChallengeLambdaPolicy", {
      description: "This policy allows auth challenge to be sent via ses",
      policy: {
        Version: "2012-10-17",
        Statement: [
          {
            Sid: "PermissionForSES",
            Effect: "Allow",
            Action: "ses:SendEmail",
            Resource: "*",
          },
        ],
      },
    });
  }
}

const policies = new Policies();
export default policies;
