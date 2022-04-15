import * as aws from "@pulumi/aws";
import policies from "./policies";

interface UserGroupsParams {
  userPool: aws.cognito.UserPool;
  api: aws.apigatewayv2.Api;
  defaultStage: aws.apigatewayv2.Stage;
}

class UserGroups {
  groups: {
    admins: aws.cognito.UserGroup;
    users: aws.cognito.UserGroup;
  };

  constructor({ userPool, api, defaultStage }: UserGroupsParams) {
    const adminsGroupRoleName = "adminsGroupRole";
    const usersGroupRoleName = "usersGroupRole";

    const adminsGroupRole = new aws.iam.Role("adminsGroupRole", {
      name: adminsGroupRoleName,
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

    const usersGroupRole = new aws.iam.Role("usersGroupRole", {
      name: usersGroupRoleName,
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

    const adminsGroupPolicy = policies.getAdminsGroupAccessGroupPolicy({
      api,
      defaultStage,
    });

    const usersGroupPolicy = policies.getUsersGroupAccessGroupPolicy({
      api,
      defaultStage,
    });

    new aws.iam.RolePolicyAttachment(
      `${adminsGroupRoleName}-AdminsGroupRoleToAccessLambda`,
      {
        role: adminsGroupRole,
        policyArn: adminsGroupPolicy.arn.apply((arn: any) => arn),
      }
    );

    new aws.iam.RolePolicyAttachment(
      `${usersGroupRoleName}-UsersGroupRoleToAccessLambda`,
      {
        role: usersGroupRole,
        policyArn: usersGroupPolicy.arn.apply((arn: any) => arn),
      }
    );

    this.groups = {
      admins: new aws.cognito.UserGroup("admins", {
        name: "admins",
        userPoolId: userPool.id,
        description: "administrators",
        precedence: 1,
        roleArn: adminsGroupRole.arn,
      }),
      users: new aws.cognito.UserGroup("users", {
        name: "users",
        userPoolId: userPool.id,
        description: "users",
        precedence: 2,
        roleArn: usersGroupRole.arn,
      }),
    };
  }
}

export default UserGroups;
