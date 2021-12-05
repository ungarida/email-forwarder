import { expect, haveResource } from "@aws-cdk/assert";
import * as sst from "@serverless-stack/resources";
import EmailForwarderStack from "../stacks/EmailForwarderStack";

test("Test Stack", () => {
  const app = new sst.App();
  // WHEN
  const stack = new EmailForwarderStack(app, "email-forwarder-test-stack");
  // THEN
  expect(stack).to(haveResource("AWS::Lambda::Function"));
});
