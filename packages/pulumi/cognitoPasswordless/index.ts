import * as aws from "@pulumi/aws";
import CreateAuthChallenge from "./createAuthChallenge";
import DefineAuthChallenge from "./defineAuthChallenge";
import VerifyAuthChallengeResponse from "./verifyAuthChallengeResponse";
import UserGroups from "./userGroups";

const DEBUG = String(process.env.DEBUG);

class CognitoPasswordless {
  userPoolClient: aws.cognito.UserPoolClient;
  userPool: aws.cognito.UserPool;
  groups: UserGroups;
  constructor({
    api,
    defaultStage,
  }: {
    api: aws.apigatewayv2.Api;
    defaultStage: aws.apigatewayv2.Stage;
  }) {
    const createAuthChallenge = new CreateAuthChallenge({
      env: {
        REGION: process.env.AWS_REGION,
        DEBUG,
      },
    });
    const defineAuthChallenge = new DefineAuthChallenge({
      env: {
        REGION: process.env.AWS_REGION,
        DEBUG,
      },
    });
    const verifyAuthChallengeResponse = new VerifyAuthChallengeResponse({
      env: {
        REGION: process.env.AWS_REGION,
        DEBUG,
      },
    });
    this.userPool = new aws.cognito.UserPool("api-user-pool", {
      passwordPolicy: {
        minimumLength: 12,
        requireLowercase: true,
        requireNumbers: true,
        requireSymbols: true,
        requireUppercase: true,
        temporaryPasswordValidityDays: 7,
      },
      adminCreateUserConfig: {
        allowAdminCreateUserOnly: true,
      },
      autoVerifiedAttributes: ["email"],
      emailConfiguration: {
        emailSendingAccount: "COGNITO_DEFAULT",
      },
      lambdaConfig: {
        createAuthChallenge: createAuthChallenge.function.arn,
        defineAuthChallenge: defineAuthChallenge.function.arn,
        verifyAuthChallengeResponse: verifyAuthChallengeResponse.function.arn,
      },
      mfaConfiguration: "OFF",
      userPoolAddOns: {
        advancedSecurityMode: "OFF" /* required */,
      },
      usernameAttributes: ["email"],
      verificationMessageTemplate: {
        defaultEmailOption: "CONFIRM_WITH_CODE",
      },
      schemas: [
        {
          attributeDataType: "String",
          name: "email",
          required: true,
          developerOnlyAttribute: false,
          mutable: true,
          stringAttributeConstraints: {
            maxLength: "2048",
            minLength: "0",
          },
        },
        {
          attributeDataType: "String",
          name: "family_name",
          required: true,
          developerOnlyAttribute: false,
          mutable: true,
          stringAttributeConstraints: {
            maxLength: "2048",
            minLength: "0",
          },
        },
        {
          attributeDataType: "String",
          name: "given_name",
          required: true,
          developerOnlyAttribute: false,
          mutable: true,
          stringAttributeConstraints: {
            maxLength: "2048",
            minLength: "0",
          },
        },
      ],
    });

    this.userPoolClient = new aws.cognito.UserPoolClient(
      "api-user-pool-client",
      {
        userPoolId: this.userPool.id,
      }
    );

    this.groups = new UserGroups({
      userPool: this.userPool,
      api: api,
      defaultStage: defaultStage,
    });
  }
}

export default CognitoPasswordless;
