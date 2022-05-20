import * as aws from "@pulumi/aws";
class Secret {
  parameter: aws.ssm.Parameter;
  constructor({ name, value }: { name: string; value: string }) {
    this.parameter = new aws.ssm.Parameter(name, {
      type: "SecureString",
      value: value,
    });
  }
}
export default Secret;
