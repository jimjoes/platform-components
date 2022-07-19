import * as aws from "@pulumi/aws";

interface Route {
  name: string;
  path: string;
  method: string;
  function: aws.lambda.Function;
  oauthScope?: string[];
}

class ApiGateway {
  api: aws.apigatewayv2.Api;
  defaultStage: aws.apigatewayv2.Stage;
  constructor({
    routes,
    allowedOrigins,
    userPoolClient,
  }: {
    routes: Route[];
    allowedOrigins: string[];
    userPoolClient: aws.cognito.UserPoolClient;
  }) {
    this.api = new aws.apigatewayv2.Api("api-gateway", {
      protocolType: "HTTP",
      description: "Main API gateway",
      // TODO: Fix the cors configuration
      // corsConfiguration: {
      //   allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      //   allowHeaders: [
      //     "Origin",
      //     "X-Requested-With",
      //     "Content-Type",
      //     "Accept",
      //     "Authorization",
      //   ],
      //   allowOrigins: allowedOrigins,
      // },
    });

    this.defaultStage = new aws.apigatewayv2.Stage("default", {
      apiId: this.api.id,
      autoDeploy: true,
    });

    const authorizer = new aws.apigatewayv2.Authorizer(
      `${process.env.WEBINY_ENV}-authorizer`,
      {
        apiId: this.api.id,
        authorizerType: "JWT",
        identitySources: [`$request.header.Authorization`],
        jwtConfiguration: {
          audiences: [userPoolClient.id],
          issuer: `https://${this.api.apiEndpoint}`,
        },
      }
    );

    for (let i = 0; i < routes.length; i++) {
      const route = routes[i];
      const integration = new aws.apigatewayv2.Integration(route.name, {
        description: "CRUD Integration",
        apiId: this.api.id,
        integrationType: "AWS_PROXY",
        integrationMethod: route.method,
        integrationUri: route.function.arn,
        passthroughBehavior: "WHEN_NO_MATCH",
      });

      // TODO: This block will be used for custom integrations where the api handles error mapping.
      // const ok = new aws.apigatewayv2.IntegrationResponse("200-ok", {
      //   apiId: this.api.id,
      //   integrationId: integration.id,
      //   integrationResponseKey: "/200/",
      //   templateSelectionExpression: "",
      // });
      // const clientError = new aws.apigatewayv2.IntegrationResponse(
      //   "400-client-error",
      //   {
      //     apiId: this.api.id,
      //     integrationId: integration.id,
      //     integrationResponseKey: "/400/",
      //     templateSelectionExpression: "^Missing.*",
      //     responseTemplates: {
      //       message: `$input.json("$.errorMessage")`,
      //     },
      //   }
      // );
      // const serverError = new aws.apigatewayv2.IntegrationResponse(
      //   "500-server-error",
      //   {
      //     apiId: this.api.id,
      //     integrationId: integration.id,
      //     integrationResponseKey: "/500/",
      //     templateSelectionExpression: "^(?!Missing).*",
      //     responseTemplates: {
      //       message: "Internal Server Error",
      //     },
      //   }
      // );

      const routeConfig: any = {
        apiId: this.api.id,
        routeKey: `${route.method} ${route.path}`,
        target: integration.id.apply((value) => `integrations/${value}`),
      };

      if (route.oauthScope) {
        routeConfig.authorizationType = "JWT";
        routeConfig.authorizerId = authorizer.id;
        routeConfig.authorizationScopes = route.oauthScope;
      }

      new aws.apigatewayv2.Route(route.name, routeConfig);

      new aws.lambda.Permission(`allow-${route.name}`, {
        action: "lambda:InvokeFunction",
        function: route.function.arn,
        principal: "apigateway.amazonaws.com",

        sourceArn: this.api.executionArn.apply(
          (arn) => `${arn}/*/*${route.path}`
        ),
      });
    }
  }
}

export default ApiGateway;
