import { Given, Then } from "@cucumber/cucumber";
import { ScenarioWorld } from "cucumber-playwright-framework";
import { 
  publisherConnect, 
  publisherStop, 
  publisherConnectAndVerifyStream 
} from "../stepsImpl/publisherConnect.step.impl";


Then(
    "the publisher1 connects to stream with codec {string}",
    async function (this: ScenarioWorld, codec) {
      await publisherConnect(this, codec);
    }
  );
  
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
