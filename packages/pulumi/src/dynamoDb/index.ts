import * as aws from "@pulumi/aws";

class DynamoDB {
  table: aws.dynamodb.Table;
  constructor({ name, gsiCount = 0 }: { name: string; gsiCount: number }) {
    let attributes = [
      { name: "PK", type: "S" },
      { name: "SK", type: "S" },
    ];
    let globalSecondaryIndexes = [];
    for (let i = 0; i < gsiCount; i++) {
      attributes.push(
        { name: `GSI${i + 1}_PK`, type: "S" },
        { name: `GSI${i + 1}_SK`, type: "S" }
      );
      globalSecondaryIndexes.push({
        name: `GSI${i + 1}`,
        hashKey: `GSI${i + 1}_PK`,
        rangeKey: `GSI${i + 1}_SK`,
        projectionType: "ALL",
      });
    }

    let params: any = {
      attributes: attributes,
      billingMode: "PAY_PER_REQUEST",
      hashKey: "PK",
      rangeKey: "SK",
    };

    if (globalSecondaryIndexes.length > 0) {
      params.globalSecondaryIndexes = globalSecondaryIndexes;
    }

    this.table = new aws.dynamodb.Table(name, params);
  }
}

export default DynamoDB;
