import * as aws from "@pulumi/aws";
import PreTokenGeneration from "./cognitoPreTokenGeneration";
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

    this.userPool = new aws.cognito.UserPool(
      process.env.WEBINY_ENV + "-api-user-pool",
      {
        passwordPolicy: {
          minimumLength: 12,
          requireLowercase: true,
          requireNumbers: true,
          requireSymbols: true,
          requireUppercase: true,
          temporaryPasswordValidityDays: 7,
        },
        aliasAttributes: ["email"],
        adminCreateUserConfig: {
          allowAdminCreateUserOnly: true,
        },
        autoVerifiedAttributes: ["email"],
        emailConfiguration: {
          emailSendingAccount: "COGNITO_DEFAULT",
        },
        lambdaConfig: {
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
            name: "custom:tenantId",
            developerOnlyAttribute: false,
            mutable: false,
            stringAttributeConstraints: {
              maxLength: "1024",
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
      }
    );

    new aws.lambda.Permission("PreTokenGenerationInvocationPermission", {
      action: "lambda:InvokeFunction",
      function: preTokenGeneration.function.name,
      principal: "cognito-idp.amazonaws.com",
      sourceArn: this.userPool.arn,
    });
  }
}

export default Cognito;
