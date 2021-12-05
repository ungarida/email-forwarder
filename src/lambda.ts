import { Context, SESEvent } from 'aws-lambda'
import { S3 } from '@aws-sdk/client-s3'

const BUCKET_NAME = process.env.BUCKET_NAME

export const handler = async (event: SESEvent, context: Context): Promise<void> => {
  console.log('EVENT', event)
  console.log('CONTEXT', context)
  const record = event.Records[0].ses
  const messageId = record.mail.messageId
  const message = await readMessageFromS3(messageId)
  console.log('MESSAGE', message)

}

async function readMessageFromS3(messageId: string): Promise<Buffer> {
  try {
    const { Body: data } = await new S3({
      region: 'eu-west-1'
    }).getObject({
        Bucket: BUCKET_NAME,
        Key: messageId,
      })

    if (!(data instanceof Buffer))
      throw new Error(
        `Unexpected type of the S3 bucket object body: '${typeof data}'. Expected Buffer`
      )
    return data
  } catch (e) {
    throw new Error(
      `Could not fetch message ID ${messageId} from S3 bucket: ${e}`
    )
  }
}
