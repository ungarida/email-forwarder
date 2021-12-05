import * as sst from "@serverless-stack/resources";
import * as s3 from "@aws-cdk/aws-s3"
import * as ses from "@aws-cdk/aws-ses"
import * as sesActions from '@aws-cdk/aws-ses-actions'


const BUCKET_NAME = process.env.BUCKET_NAME || 'email-forwarder-bucket'
const RECIPIENTS = process.env.RECIPIENTS || ''

export default class EmailForwarderStack extends sst.Stack {
  constructor(scope: sst.App, id: string, props?: sst.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, 'IncomingEmailBucket', {
      bucketName: BUCKET_NAME,
    })

    const lambda = new sst.Function(this, "EmailForwardingLambda", {
      handler: "src/lambda.handler",
      timeout: 10,
      environment: {
        BUCKET_NAME,
      }
    });
    bucket.grantRead(lambda)

    new ses.ReceiptRuleSet(this, "EmailForwarderRuleSet", {
      rules: [
        {
          recipients: RECIPIENTS.split(','),
          actions: [
            new sesActions.S3({
              bucket,
            }),
            new sesActions.Lambda({
              function: lambda,
            }),
          ],
        },
      ]
    });
  }
}
