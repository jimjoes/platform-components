import * as aws from "@pulumi/aws";
class Route53 {
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
                .then(zone => zone.zoneId);
        this.record = new aws.route53.Record(domainDescriptor.domain, {
            name: domainDescriptor.subDomain,
            zoneId,
            type: "A",
            aliases: [
                {
                    name: distribution.domainName,
                    zoneId: distribution.hostedZoneId,
                    evaluateTargetHealth: true
                }
            ]
        });
    }
}
export default Route53;
