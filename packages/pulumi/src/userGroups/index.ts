import * as aws from "@pulumi/aws";
import policies from "./policies";

type Group = "tenantAdmin" | "superAdmin" | "user";
type Groups = Group[];

interface UserGroupsParams {
  prefix: string;
  userPool: aws.cognito.UserPool;
  api: aws.apigatewayv2.Api;
  defaultStage: aws.apigatewayv2.Stage;
}

const groups: Groups = ["tenantAdmin", "superAdmin", "user"];

class UserGroups {
  tenantAdmin: aws.cognito.UserGroup | undefined;
  superAdmin: aws.cognito.UserGroup | undefined;
  user: aws.cognito.UserGroup | undefined;
  unauthenticated: aws.cognito.UserGroup | undefined;

  constructor({ prefix, userPool, api, defaultStage }: UserGroupsParams) {
    for (const group of groups) {
      const roleName =
        process.env.WEBINY_ENV + "-" + prefix + "-" + group + "GroupRole";
      const groupRole = new aws.iam.Role(prefix + "-" + group + "GroupRole", {
        name: roleName,
        assumeRolePolicy: {
          Version: "2012-10-17",
          Statement: [
            {
              Sid: "",
              Effect: "Allow",
              Principal: {
                Service: "apigateway.amazonaws.com",
              },
              Action: "sts:AssumeRole",
            },
          ],
        },
      });
      const policy = policies.getAuthenticatedGroupPolicy({
        api,
        defaultStage,
      });
      new aws.iam.RolePolicyAttachment(`${roleName}-GroupRoleToAccessLambda`, {
        role: groupRole,
        policyArn: policy.arn.apply((arn: any) => arn),
      });
      this[group] = new aws.cognito.UserGroup(prefix + "-" + group, {
        name: group,
        userPoolId: userPool.id,
        description: prefix + " " + group,
        precedence: 1,
        roleArn: groupRole.arn,
      });
    }
    const roleName =
      process.env.WEBINY_ENV + "-" + prefix + "-unauthenticatedGroupRole";
    const groupRole = new aws.iam.Role(prefix + "-unauthenticatedGroupRole", {
      name: roleName,
      assumeRolePolicy: {
        Version: "2012-10-17",
        Statement: [
          {
            Sid: "",
            Effect: "Allow",
            Principal: {
              Service: "apigateway.amazonaws.com",
            },
            Action: "sts:AssumeRole",
          },
        ],
      },
    });
    const policy = policies.getUnAuthenticatedGroupPolicy({});

    new aws.iam.RolePolicyAttachment(`${roleName}-GroupRoleAttachment`, {
      role: groupRole,
      policyArn: policy.arn.apply((arn: any) => arn),
    });
  }
}

export default UserGroups;
