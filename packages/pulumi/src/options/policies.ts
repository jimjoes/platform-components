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

  getOptionsLambdaPolicy(): aws.iam.Policy {
    return new aws.iam.Policy("OptionsApiLambdaPolicy", {
      description: "This policy enables access to  Lambda",
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
    });
  }
}

const policies = new Policies();
export default policies;
