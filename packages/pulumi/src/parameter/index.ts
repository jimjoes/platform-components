import * as aws from "@pulumi/aws";
class Parameter {
  parameter: aws.ssm.Parameter;
  constructor({ name, value }: { name: string; value: string }) {
    this.parameter = new aws.ssm.Parameter(name, {
      type: "String",
      value: value,
    });
  }
}
export default Parameter;
