import { Given, Then } from "@cucumber/cucumber";
import { ScenarioWorld } from "cucumber-playwright-framework";
import { 
  publisherStop, 
  publisherConnectAndVerifyStream,
  publisherConnectWithOptions
} from "../stepsImpl/publisherConnect.step.impl";


Given('the publisher1 connects to stream with options', 
  async function (this:ScenarioWorld, dataTable) {
  const options = dataTable.rowsHash();
  await publisherConnectWithOptions(this, options);
});

Then(
  "the publisher1 stops connection",
  async function (this: ScenarioWorld) {
    await publisherStop(this);
  }
);

Given(
  "the publisher1 is connected and stream is live",
  async function (this: ScenarioWorld) {
    await publisherConnectAndVerifyStream(this);
  }
);
