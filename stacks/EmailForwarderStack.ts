import * as sst from '@serverless-stack/resources'
import * as iam from '@aws-cdk/aws-iam'
import * as s3 from '@aws-cdk/aws-s3'
import * as ses from '@aws-cdk/aws-ses'
import * as sesActions from '@aws-cdk/aws-ses-actions'


const BUCKET_NAME = process.env.BUCKET_NAME as string
const FORWARD_MAPPING_SSM_KEY = process.env.FORWARD_MAPPING_SSM_KEY as string
const RECIPIENTS = process.env.RECIPIENTS as string

export default class EmailForwarderStack extends sst.Stack {
  constructor(scope: sst.App, id: string, props?: sst.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, 'IncomingEmailBucket', {
      bucketName: BUCKET_NAME,
    })

    const lambda = new sst.Function(this, 'EmailForwardingLambda', {
      handler: 'src/lambda.handler',
      timeout: 10,
      environment: {
        BUCKET_NAME,
        FORWARD_MAPPING_SSM_KEY
      }
    })
    lambda.attachPermissions([
      new iam.PolicyStatement({
        actions: ['ses:sendRawEmail'],
        effect: iam.Effect.ALLOW,
        resources: ['*'],
      }),
      new iam.PolicyStatement({
        actions: ['ssm:GetParameter'],
        effect: iam.Effect.ALLOW,
        resources: ['*'],
      }),
     ]);
    bucket.grantRead(lambda)
    bucket.grantWrite(lambda)
    new ses.ReceiptRuleSet(this, 'EmailForwarderRuleSet', {
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
    })
  }
}
