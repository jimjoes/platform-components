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

  getAuthenticatedGroupPolicy({
    group,
    api,
    defaultStage,
  }: {
    group: string;
    api: aws.apigatewayv2.Api;
    defaultStage: aws.apigatewayv2.Stage;
  }): aws.iam.Policy {
    return new aws.iam.Policy(group + "-GroupCognitoGroupPolicy", {
      description: "This policy enables access to Lambda via the api gateway",
      policy: {
        Version: "2012-10-17",
        Statement: [
          {
            Sid: "PermissionForLambda",
            Effect: "Allow",
            Action: ["lambda:InvokeFunction"],
            Resource: pulumi.interpolate`arn:aws:execute-api:${this.awsRegion}:${this.callerIdentityOutput.accountId}:${api.id}/${defaultStage.name}/*`,
          },
        ],
      },
    });
  }

  getUnAuthenticatedGroupPolicy({}: {}): aws.iam.Policy {
    return new aws.iam.Policy("UnAuthenticatedGroupCognitoGroupPolicy", {
      description: "This policy manages unauthenticated access",
      policy: {
        Version: "2012-10-17",
        Statement: [],
      },
    });
  }
}

const policies = new Policies();
export default policies;
