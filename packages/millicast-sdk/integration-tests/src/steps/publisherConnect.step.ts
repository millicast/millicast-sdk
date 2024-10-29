import { DataTable, Given, Then } from "@cucumber/cucumber";
import { ScenarioWorld } from "cucumber-playwright-framework";
import {
  publisherStop,
  publisherConnectAndVerifyStream,
  publisherConnectWithOptions,
  publisherConnectWithOptionsExpectFail,
} from "../stepsImpl/publisherConnect.step.impl";


Given(
  /^the "([^"]*)" starts the stream with the specified options$/,
  async function (this: ScenarioWorld, actor: string, dataTable: DataTable) {
    await publisherConnectWithOptions(this, actor, dataTable);
  },
);

Given(
  /^the "([^"]*)" starts the stream with the specified options and expect to fail with error "([^"]*)"$/,
  async function (this: ScenarioWorld, actor: string, message: string, dataTable: DataTable) {
    await publisherConnectWithOptionsExpectFail(this, actor, message, dataTable);
  },
);

Then(
  /^the "([^"]*)" stops the published stream$/,
  async function (this: ScenarioWorld, actor: string) {
    await publisherStop(this, actor);
  },
);

Given(
  /^the "([^"]*)" starts the stream and should be LIVE$/,
  async function (this: ScenarioWorld, actor: string) {
    await publisherConnectAndVerifyStream(this, actor);
  },
);