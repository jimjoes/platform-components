import * as aws from "@pulumi/aws";

export class Route53HostedZone {
  zone: aws.route53.Zone;
  certificate: aws.acm.Certificate;
  domainName: string;
  constructor({
    rootDomain,
    subDomain,
  }: {
    rootDomain: string;
    subDomain?: string;
  }) {
    if (subDomain) {
      this.domainName = subDomain + "." + rootDomain;
    } else {
      this.domainName = rootDomain;
    }
    this.zone = new aws.route53.Zone(this.domainName + "-hosted-zone", {
      name: this.domainName,
    });

    const useast1 = new aws.Provider("useast1", { region: "us-east-1" });

    this.certificate = new aws.acm.Certificate(
      "cert",
      {
        domainName: this.domainName,
        subjectAlternativeNames: ["*." + this.domainName],
        validationMethod: "DNS",
      },
      { provider: useast1 }
    );

    const certificateValidationDomain = new aws.route53.Record(
      `${this.domainName}-validation`,
      {
        name: this.certificate.domainValidationOptions[0].resourceRecordName,
        zoneId: this.zone.id,
        type: this.certificate.domainValidationOptions[0].resourceRecordType,
        records: [
          this.certificate.domainValidationOptions[0].resourceRecordValue,
        ],
        ttl: 600,
      }
    );
    new aws.acm.CertificateValidation(
      "certificateValidation",
      {
        certificateArn: this.certificate.arn,
        validationRecordFqdns: [certificateValidationDomain.fqdn],
      },
      { provider: useast1 }
    );
  }
}

export class Route53MxRecord {
  record: aws.route53.Record;
  constructor({
    rootDomain,
    subDomain,
    zone,
  }: {
    rootDomain: string;
    subDomain?: string;
    zone: aws.route53.Zone;
  }) {
    const recordConfig = {
      zoneId: zone.id,
      allowOverwrite: true,
      name: subDomain ? subDomain + "." + rootDomain : rootDomain,
      ttl: 300,
      type: "MX",
      records: [
        `1 aspmx.l.google.com`,
        `5 alt1.aspmx.l.google.com`,
        `5 alt2.aspmx.l.google.com`,
        `10 alt3.aspmx.l.google.com`,
        `10 alt4.aspmx.l.google.com`,
      ],
    };

    this.record = new aws.route53.Record(
      subDomain ? subDomain + "mx-record" : "mx-record",
      recordConfig
    );
  }
}

export class Route53NsRecord {
  record: aws.route53.Record;
  constructor({
    subDomain,
    rootDomain,
    rootZone,
    zone,
  }: {
    subDomain: string;
    rootDomain: string;
    rootZone: aws.route53.Zone;
    zone: aws.route53.Zone;
  }) {
    this.record = new aws.route53.Record(subDomain + "-ns-record", {
      zoneId: rootZone.id,
      allowOverwrite: true,
      name: subDomain + "." + rootDomain,
      ttl: 172800,
      type: "NS",
      records: zone.nameServers,
    });
  }
}

class Route53ARecord {
  record: aws.route53.Record;
  constructor({
    domainDescriptor,
    distribution,
    zone,
  }: {
    domainDescriptor: any;
    distribution: aws.cloudfront.Distribution;
    zone: aws.route53.Zone;
  }) {
    this.record = new aws.route53.Record(domainDescriptor.domain, {
      name: domainDescriptor.domainParts.slice(-1)[0],
      zoneId: zone.id,
      type: "A",
      aliases: [
        {
          name: distribution.domainName,
          zoneId: distribution.hostedZoneId,
          evaluateTargetHealth: true,
        },
      ],
    });
  }
}
export default Route53ARecord;
