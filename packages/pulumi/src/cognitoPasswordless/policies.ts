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
    fromEmailIdentity,
  }: {
    sesDomainIdentity: aws.ses.DomainIdentity;
    fromEmailIdentity: aws.ses.EmailIdentity;
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

  getPreTokenGenerationPolicy({
    table,
  }: {
    table: aws.dynamodb.Table;
  }): aws.iam.Policy {
    return new aws.iam.Policy("PreTokenGenerationLambdaPolicy", {
      description:
        "This policy allows token generator read-only access ddb table",
      policy: {
        Version: "2012-10-17",
        Statement: [
          {
            Sid: "SpecificTable",
            Effect: "Allow",
            Action: ["dynamodb:DescribeTable", "dynamodb:Query"],
            Resource: [
              pulumi.interpolate`${table.arn}`,
              pulumi.interpolate`${table.arn}/*`,
            ],
          },
        ],
      },
    });
  }
}

const policies = new Policies();
export default policies;
