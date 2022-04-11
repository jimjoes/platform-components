import * as aws from "@pulumi/aws";
class Parameters {
    parameter: aws.ssm.Parameter;
    constructor() {
        this.parameter = new aws.ssm.Parameter("webiny-cms-api-secret", {
            type: "SecureString",
            value: String(process.env.WEBINY_API_SECRET)
        });
    }
}
export default Parameters;
