import * as aws from "@pulumi/aws";

interface SESParams {
    rootDomain: string;
}

class SES {
    domainIdentity: aws.ses.DomainIdentity;
    domainDkim: aws.ses.DomainDkim;

    constructor({ rootDomain }: SESParams) {
        this.domainIdentity = new aws.ses.DomainIdentity(
            "platform-domain-id",
            { domain: rootDomain },
            {
                protect: true
            }
        );
        this.domainDkim = new aws.ses.DomainDkim(
            "domain-dkim",
            { domain: rootDomain },
            {
                protect: true
            }
        );
    }
}

export default SES;
