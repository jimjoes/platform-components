import * as aws from "@pulumi/aws";

export class Route53HostedZone {
  zone: aws.route53.Zone;
  certificate: aws.acm.Certificate;
  domainName: string;
  constructor(rootDomain: string, hostname?: string) {
    if (hostname) {
      this.domainName = hostname + "." + rootDomain;
    } else {
      this.domainName = rootDomain;
    }
    this.zone = new aws.route53.Zone(hostname + "-hosted-zone", {
      name: this.domainName,
    });
    this.certificate = new aws.acm.Certificate("cert", {
      domainName: this.domainName,
      validationMethod: "DNS",
    });
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

class Route53ARecord {
  record: aws.route53.Record;
  constructor(
    domainDescriptor: any,
    distribution: aws.cloudfront.Distribution,
    hostedZoneId?: string
  ) {
    const zoneId =
      hostedZoneId ||
      aws.route53
        .getZone({ name: domainDescriptor.parentDomain }, { async: true })
        .then((zone: any) => zone.zoneId);
    this.record = new aws.route53.Record(domainDescriptor.domain, {
      name: domainDescriptor.subDomain,
      zoneId,
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
