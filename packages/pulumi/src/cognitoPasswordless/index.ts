import * as aws from "@pulumi/aws";
import CreateAuthChallenge from "./createAuthChallenge";
import DefineAuthChallenge from "./defineAuthChallenge";
import VerifyAuthChallengeResponse from "./verifyAuthChallengeResponse";
import SES from "./ses";
import policies from "./policies";
const DEBUG = String(process.env.DEBUG);

class CognitoPasswordless {
  userPoolClient: aws.cognito.UserPoolClient;
  userPool: aws.cognito.UserPool;
  constructor() {
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
    this.userPool = new aws.cognito.UserPool("platform-api-user-pool", {
      passwordPolicy: {
        minimumLength: 12,
        requireLowercase: true,
        requireNumbers: true,
        requireSymbols: true,
        requireUppercase: true,
        temporaryPasswordValidityDays: 7,
      },
      adminCreateUserConfig: {
        allowAdminCreateUserOnly: false,
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
          required: false,
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
          required: false,
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
      "platform-api-user-pool-client",
      {
        userPoolId: this.userPool.id,
        explicitAuthFlows: ["CUSTOM_AUTH_FLOW_ONLY"],
      }
    );

    new aws.lambda.Permission("DefineAuthChallengeInvocationPermission", {
      action: "lambda:InvokeFunction",
      function: defineAuthChallenge.function.name,
      principal: "cognito-idp.amazonaws.com",
      sourceArn: this.userPool.arn,
    });
    new aws.lambda.Permission("CreateAuthChallengeInvocationPermission", {
      action: "lambda:InvokeFunction",
      function: createAuthChallenge.function.name,
      principal: "cognito-idp.amazonaws.com",
      sourceArn: this.userPool.arn,
    });

    new aws.lambda.Permission(
      "VerifyAuthChallengeResponseInvocationPermission",
      {
        action: "lambda:InvokeFunction",
        function: verifyAuthChallengeResponse.function.name,
        principal: "cognito-idp.amazonaws.com",
        sourceArn: this.userPool.arn,
      }
    );

    const ses = new SES({ rootDomain: String(process.env.ROOT_DOMAIN) });

    const cognitoPolicy = policies.getCreateAuthChallengePolicy({
      sesDomainIdentity: ses.domainIdentity,
    });

    new aws.iam.RolePolicyAttachment(
      "create-challenge-lambda-role-createAuthChallengeLambdaPolicy",
      {
        role: createAuthChallenge.role,
        policyArn: cognitoPolicy.arn.apply((arn: any) => arn),
      }
    );
  }
}

export default CognitoPasswordless;
