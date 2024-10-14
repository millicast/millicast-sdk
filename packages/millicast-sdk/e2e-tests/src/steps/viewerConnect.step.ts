import { Given, Then } from "@cucumber/cucumber";
import { ScenarioWorld } from "cucumber-playwright-framework";
import {
  viewerConnect,
  viewerStop,
  viewerConnectAndVerifyStream,
  viewerConnectWithOptions
} from "../stepsImpl/viewerConnect.step.impl";

Then(
    "the viewer1 connects to stream",
    async function (this: ScenarioWorld) {
      await viewerConnect(this);
    }
  );

Then(
  "the viewer1 stops connection",
  async function (this: ScenarioWorld) {
    await viewerStop(this);
  }
);

// Doesn't work, steps in runStep aren't called !
Given(
  "the viewer1 is connected and stream is live",
  async function (this: ScenarioWorld) {
    await viewerConnectAndVerifyStream(this);
  }
);

Given('the viewer1 connects to stream with options', 
  async function (this:ScenarioWorld, dataTable) {
  const options = dataTable.rowsHash();
  await viewerConnectWithOptions(this, options);
});