import * as aws from "@pulumi/aws";

class ApiGateway {
  api: aws.apigatewayv2.Api;
  defaultStage: aws.apigatewayv2.Stage;
  constructor({
    routes,
    allowedOrigins,
  }: {
    routes: Array<any>;
    allowedOrigins: string[];
  }) {
    this.api = new aws.apigatewayv2.Api("api-gateway", {
      protocolType: "HTTP",
      description: "Main API gateway",
      corsConfiguration: {
        allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowHeaders: [
          "Origin",
          "X-Requested-With",
          "Content-Type",
          "Accept",
          "Authorization",
        ],
        allowOrigins: allowedOrigins,
      },
    });

    this.defaultStage = new aws.apigatewayv2.Stage("default", {
      apiId: this.api.id,
      autoDeploy: true,
    });

    for (let i = 0; i < routes.length; i++) {
      const route = routes[i];
      const integration = new aws.apigatewayv2.Integration(route.name, {
        description: "CRUD Integration",
        apiId: this.api.id,
        integrationType: "AWS_PROXY",
        integrationMethod: route.method,
        integrationUri: route.function.arn,
        passthroughBehavior: "WHEN_NO_MATCH",
        requestParameters: {
          "overwrite:header.User-Agent": `$context.identity.userAgent`,
          "overwrite:header.X-Real-Ip": `$context.identity.sourceIp`,
        },
      });
      const ok = new aws.apigatewayv2.IntegrationResponse("200-ok", {
        apiId: this.api.id,
        integrationId: integration.id,
        integrationResponseKey: "/200/",
        templateSelectionExpression: "",
      });
      const clientError = new aws.apigatewayv2.IntegrationResponse(
        "400-client-error",
        {
          apiId: this.api.id,
          integrationId: integration.id,
          integrationResponseKey: "/400/",
          templateSelectionExpression: "^Missing.*",
          responseTemplates: {
            message: `$input.json("$.errorMessage")`,
          },
        }
      );
      const serverError = new aws.apigatewayv2.IntegrationResponse(
        "500-server-error",
        {
          apiId: this.api.id,
          integrationId: integration.id,
          integrationResponseKey: "/500/",
          templateSelectionExpression: "^(?!Missing).*",
          responseTemplates: {
            message: "Internal Server Error",
          },
        }
      );

      new aws.apigatewayv2.Route(route.name, {
        apiId: this.api.id,
        routeKey: `${route.method} ${route.path}`,
        target: integration.id.apply((value) => `integrations/${value}`),
      });

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
