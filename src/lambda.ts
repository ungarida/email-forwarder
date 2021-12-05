import { Context, SESEvent } from 'aws-lambda'
import * as AWS from 'aws-sdk'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const forwarder = require('aws-lambda-ses-forwarder')

const BUCKET_NAME = process.env.BUCKET_NAME as string
const FORWARD_MAPPING_SSM_KEY = process.env.FORWARD_MAPPING_SSM_KEY as string

const ssm = new AWS.SSM()

// store the email mapping outside of the handler function to not load it every time the Lambda function is invoked
let forwardMapping: unknown = null

export const handler = async (event: SESEvent, context: Context): Promise<void> => {
  await loadEmailMappingFromSsm()
  if (forwardMapping) {
    const config = {
      fromEmail: event.Records[0].ses.mail.source,
      emailBucket: BUCKET_NAME,
      emailKeyPrefix: '',
      forwardMapping,
    };
    return new Promise((resolve, reject) => {
      forwarder.handler(
        event,
        context,
        (error: unknown) => {
          if (error) {
            reject()
          } else {
            resolve()
          }
        },
        { config },
      )
    })
  }
  }

async function loadEmailMappingFromSsm() {
  if (!forwardMapping) {
    const ssmValue = await ssm
      .getParameter({
        Name: FORWARD_MAPPING_SSM_KEY
      })
      .promise()

    if (ssmValue.Parameter?.Value) {
      forwardMapping = JSON.parse(ssmValue.Parameter.Value)
      console.log('emailMapping', ssmValue.Parameter.Value)
    } else {
      console.error('email mapping not found', FORWARD_MAPPING_SSM_KEY)
    }
  }
}