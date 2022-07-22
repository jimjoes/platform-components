import * as aws from "@pulumi/aws";
import PreTokenGeneration from "./preTokenGeneration";
import PostConfirmation from "./postConfirmation";

const DEBUG = String(process.env.DEBUG);

class Cognito {
  userPoolClient: aws.cognito.UserPoolClient;
  userPool: aws.cognito.UserPool;
  constructor({
    protectedEnvironment,
    table,
  }: {
    protectedEnvironment: boolean;
    table: aws.dynamodb.Table;
  }) {
    const preTokenGeneration = new PreTokenGeneration({
      env: {
        REGION: process.env.AWS_REGION,
        DEBUG,
        PLATFORM_TABLE_NAME: table.name,
      },
      table: table,
    });

    const postConfirmation = new PostConfirmation({
      table,
      env: {
        REGION: process.env.AWS_REGION,
        DEBUG,
        PLATFORM_TABLE_NAME: table.name,
      },
    });

    this.userPool = new aws.cognito.UserPool(
      process.env.WEBINY_ENV + "-api-user-pool",
      {
        passwordPolicy: {
          minimumLength: 6,
          requireLowercase: false,
          requireNumbers: false,
          requireSymbols: false,
          requireUppercase: false,
          temporaryPasswordValidityDays: 7,
        },
        aliasAttributes: ["email"],
        adminCreateUserConfig: {
          allowAdminCreateUserOnly: false,
        },
        autoVerifiedAttributes: ["email"],
        emailConfiguration: {
          emailSendingAccount: "COGNITO_DEFAULT",
        },
        lambdaConfig: {
          postConfirmation: postConfirmation.function.arn,
          preTokenGeneration: preTokenGeneration.function.arn,
        },
        mfaConfiguration: "OFF",
        userPoolAddOns: {
          advancedSecurityMode: "OFF" /* required */,
        },
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
          {
            attributeDataType: "String",
            name: "tenant_id",
            developerOnlyAttribute: false,
            mutable: false,
            stringAttributeConstraints: {
              maxLength: "2048",
              minLength: "0",
            },
          },
        ],
      },
      { protect: protectedEnvironment }
    );

    this.userPoolClient = new aws.cognito.UserPoolClient(
      "api-user-pool-client",
      {
        userPoolId: this.userPool.id,
        explicitAuthFlows: ["ALLOW_USER_SRP_AUTH", "ALLOW_REFRESH_TOKEN_AUTH"],
        supportedIdentityProviders: ["COGNITO"],
      }
    );

    new aws.lambda.Permission("PreTokenGenerationInvocationPermission", {
      action: "lambda:InvokeFunction",
      function: preTokenGeneration.function.name,
      principal: "cognito-idp.amazonaws.com",
      sourceArn: this.userPool.arn,
    });

    new aws.lambda.Permission("PostConfirmationInvocationPermission", {
      action: "lambda:InvokeFunction",
      function: postConfirmation.function.name,
      principal: "cognito-idp.amazonaws.com",
      sourceArn: this.userPool.arn,
    });
  }
}

export default Cognito;
