import * as aws from "@pulumi/aws";
import CreateAuthChallenge from "./createAuthChallenge";
import DefineAuthChallenge from "./defineAuthChallenge";
import VerifyAuthChallengeResponse from "./verifyAuthChallengeResponse";
import PreTokenGeneration from "../cognito/preTokenGeneration";
import PostConfirmation from "../cognito/postConfirmation";
import SES from "./ses";
const DEBUG = String(process.env.DEBUG);

class CognitoPasswordless {
  userPoolClient: aws.cognito.UserPoolClient;
  userPool: aws.cognito.UserPool;
  rootDomain: string;

  constructor({
    protectedEnvironment = false,
    table,
    zone,
  }: {
    protectedEnvironment: boolean;
    table: aws.dynamodb.Table;
    zone: aws.route53.Zone;
  }) {
    this.rootDomain =
      String(process.env.WEBINY_ENV) !== "prod"
        ? String(process.env.WEBINY_ENV) + "." + String(process.env.ROOT_DOMAIN)
        : String(process.env.ROOT_DOMAIN);

    const ses = new SES({
      rootDomain: this.rootDomain,
      zone: zone,
    });

    const preTokenGeneration = new PreTokenGeneration({
      env: {
        REGION: process.env.AWS_REGION,
        DEBUG,
        PLATFORM_TABLE_NAME: table.name,
      },
      table: table,
    });

    const createAuthChallenge = new CreateAuthChallenge({
      env: {
        REGION: process.env.AWS_REGION,
        ROOT_DOMAIN: this.rootDomain,
        DEBUG,
      },
      sesIdentity: ses.domainIdentity,
      fromEmailIdentity: ses.fromEmailIdentity,
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

    const postConfirmation = new PostConfirmation({
      table,
      env: {
        REGION: process.env.AWS_REGION,
        DEBUG,
        PLATFORM_TABLE_NAME: table.name,
      },
    });

    this.userPool = new aws.cognito.UserPool(
      process.env.WEBINY_ENV + "-platform-api-user-pool",
      {
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
        emailConfiguration: {
          emailSendingAccount: "DEVELOPER",
          fromEmailAddress: "noreply@" + this.rootDomain,
          sourceArn: ses.fromEmailIdentity.arn,
        },
        lambdaConfig: {
          postConfirmation: postConfirmation.function.arn,
          preTokenGeneration: preTokenGeneration.function.arn,
          createAuthChallenge: createAuthChallenge.function.arn,
          defineAuthChallenge: defineAuthChallenge.function.arn,
          verifyAuthChallengeResponse: verifyAuthChallengeResponse.function.arn,
        },
        mfaConfiguration: "OFF",
        userPoolAddOns: {
          advancedSecurityMode: "OFF" /* required */,
        },
        aliasAttributes: ["email"],
        verificationMessageTemplate: {
          defaultEmailOption: "CONFIRM_WITH_LINK",
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
      "platform-api-user-pool-client",
      {
        userPoolId: this.userPool.id,
        explicitAuthFlows: ["CUSTOM_AUTH_FLOW_ONLY"],
        supportedIdentityProviders: ["COGNITO"],
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

export default CognitoPasswordless;
