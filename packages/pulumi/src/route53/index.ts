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
    new aws.acm.CertificateValidation("certificateValidation", {
      certificateArn: this.certificate.arn,
      validationRecordFqdns: [certificateValidationDomain.fqdn],
    });
  }
}

export class Route53NsRecord {
  record: aws.route53.Record;
  constructor({
    subDomain,
    rootDomain,
    rootZoneId,
    zone,
  }: {
    subDomain: string;
    rootDomain: string;
    rootZoneId: string;
    zone: aws.route53.Zone;
  }) {
    this.record = new aws.route53.Record(subDomain + "-ns-record", {
      zoneId: rootZoneId,
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
      name: domainDescriptor.subDomain,
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
