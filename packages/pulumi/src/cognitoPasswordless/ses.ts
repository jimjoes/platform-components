import * as aws from "@pulumi/aws";
import pulumi from "@pulumi/aws";

interface SESParams {
  rootDomain: string;
}

class SES {
  domainIdentity: aws.ses.DomainIdentity;
  domainDkim: aws.ses.DomainDkim;
  dkimRecords: aws.route53.Record[];
  emailIdentity: aws.ses.EmailIdentity;

  constructor({ rootDomain }: SESParams) {
    this.domainIdentity = new aws.ses.DomainIdentity(
      "platform-domain-id",
      { domain: "contact." + rootDomain },
      {
        protect: true,
      }
    );
    this.domainDkim = new aws.ses.DomainDkim(
      "domain-dkim",
      { domain: "contact." + rootDomain },
      {
        protect: true,
      }
    );

    this.emailIdentity = new aws.ses.EmailIdentity("email-from-identity", {
      email: "noreply@" + String(process.env.ROOT_DOMAIN),
    });

    this.dkimRecords = [];
    const dkimRecordCount = 3;

    for (let i = 0; i < dkimRecordCount; i++) {
      const token = this.domainDkim.dkimTokens[i].apply(
        (t) => `${t}.dkim.amazonses.com`
      );
      const name = this.domainDkim.dkimTokens[i].apply(
        (t) => `${t}._domainkey.${process.env.ROOT_DOMAIN}`
      );

      const dkimRecord = new aws.route53.Record(
        `${process.env.ROOT_DOMAIN}-dkim-record-${i + 1}-of-${dkimRecordCount}`,
        {
          zoneId: String(process.env.ROOT_ZONE_ID),
          name,
          type: "CNAME",
          ttl: 3600,
          records: [token],
        }
      );

      this.dkimRecords.push(dkimRecord);
    }

    const mailFromDomain = new aws.ses.MailFrom(`ses-mail-from`, {
      domain: "contact." + rootDomain,
      mailFromDomain: `bounce.${"contact." + rootDomain}`,
    });

    // MAIL FROM MX record
    new aws.route53.Record(`ses-mail-from-mx-record`, {
      zoneId: String(process.env.ROOT_ZONE_ID),
      name: mailFromDomain.mailFromDomain,
      type: "MX",
      ttl: 3600,
      records: [
        `10 feedback-smtp.${String(process.env.AWS_REGION)}.amazonses.com`,
      ],
    });

    new aws.route53.Record(`ses-spf-mx-record`, {
      name: "contact." + rootDomain,
      type: "TXT",
      ttl: 3600,
      zoneId: String(process.env.ROOT_ZONE_ID),
      // Allow email from amazonses.com and the stack's FQDN (ex. stack
      records: [`v=spf1 include:amazonses.com mail -all`],
    });
  }
}

export default SES;
