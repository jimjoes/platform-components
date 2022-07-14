import * as aws from "@pulumi/aws";

interface SESParams {
  rootDomain: string;
  zone: aws.route53.Zone;
}

class SES {
  domainIdentity: aws.ses.DomainIdentity;
  domainDkim: aws.ses.DomainDkim;
  dkimRecords: aws.route53.Record[];
  fromEmailIdentity: aws.ses.EmailIdentity;
  toEmailIdentity: aws.ses.EmailIdentity;

  constructor({ rootDomain, zone }: SESParams) {
    this.domainIdentity = new aws.ses.DomainIdentity("platform-domain-id", {
      domain: rootDomain,
    });
    this.domainDkim = new aws.ses.DomainDkim("platform-domain-dkim", {
      domain: rootDomain,
    });

    this.fromEmailIdentity = new aws.ses.EmailIdentity("email-from-identity", {
      email: "noreply@" + rootDomain,
    });

    this.toEmailIdentity = new aws.ses.EmailIdentity("test-email-to-identity", {
      email: "tech@" + rootDomain,
    });

    this.dkimRecords = [];

    const dkimRecordCount = 3;

    for (let i = 0; i < dkimRecordCount; i++) {
      const token = this.domainDkim.dkimTokens[i].apply(
        (t) => `${t}.dkim.amazonses.com`
      );
      const name = this.domainDkim.dkimTokens[i].apply(
        (t) => `${t}._domainkey.${rootDomain}`
      );

      const dkimRecord = new aws.route53.Record(
        `${rootDomain}-dkim-record-${i + 1}-of-${dkimRecordCount}`,
        {
          zoneId: zone.id,
          name,
          type: "CNAME",
          ttl: 3600,
          records: [token],
        }
      );

      this.dkimRecords.push(dkimRecord);
    }

    const mailFromDomain = new aws.ses.MailFrom(`ses-mail-from`, {
      domain: this.domainIdentity.domain,
      mailFromDomain: `bounce.${rootDomain}`,
    });

    // MAIL FROM MX record
    new aws.route53.Record(`ses-mail-from-mx-record`, {
      zoneId: zone.id,
      name: mailFromDomain.mailFromDomain,
      type: "MX",
      ttl: 3600,
      records: [
        `10 feedback-smtp.${String(process.env.AWS_REGION)}.amazonses.com`,
      ],
    });

    // DOMAIN MX record
    new aws.route53.Record(`domain-mx-record`, {
      zoneId: zone.id,
      name: rootDomain,
      type: "MX",
      ttl: 300,
      records: [
        "10	ALT4.ASPMX.L.GOOGLE.COM.",
        "10	ALT3.ASPMX.L.GOOGLE.COM.",
        "5	ALT2.ASPMX.L.GOOGLE.COM.",
        "5	ALT1.ASPMX.L.GOOGLE.COM.",
        "1	ASPMX.L.GOOGLE.COM.",
      ],
    });

    new aws.route53.Record(`ses-spf-mx-record`, {
      name: mailFromDomain.mailFromDomain,
      type: "TXT",
      ttl: 3600,
      zoneId: zone.id,
      // Allow email from amazonses.com and the stack's FQDN (ex. stack
      records: [`v=spf1 include:amazonses.com -all`],
    });
  }
}

export default SES;
