import * as aws from "@pulumi/aws";
import policies from "./policies";

interface UserGroupsParams {
  prefix: string;
  userPool: aws.cognito.UserPool;
  api: aws.apigatewayv2.Api;
  defaultStage: aws.apigatewayv2.Stage;
}

class UserGroups {
  groups: {
    admin: aws.cognito.UserGroup;
  };

  constructor({ prefix, userPool, api, defaultStage }: UserGroupsParams) {
    const roleName = process.env.WEBINY_ENV + "-" + prefix + "-adminGroupRole";

    const groupRole = new aws.iam.Role(prefix + "-adminsGroupRole", {
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

    const policy = policies.getAdminApiPolicy({
      api,
      defaultStage,
    });

    new aws.iam.RolePolicyAttachment(
      `${roleName}-AdminsGroupRoleToAccessLambda`,
      {
        role: groupRole,
        policyArn: policy.arn.apply((arn: any) => arn),
      }
    );

    this.groups = {
      admin: new aws.cognito.UserGroup(prefix + "-admins", {
        name: "admins",
        userPoolId: userPool.id,
        description: prefix + " administrators",
        precedence: 1,
        roleArn: groupRole.arn,
      }),
    };
  }
}

export default UserGroups;
