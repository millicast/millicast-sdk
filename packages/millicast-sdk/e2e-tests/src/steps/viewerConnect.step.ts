import { DataTable, Given, Then } from "@cucumber/cucumber";
import { ScenarioWorld } from "cucumber-playwright-framework";
import {
  viewerConnect,
  viewerStop,
  viewerConnectAndVerifyStream,
  viewerConnectWithOptions,
} from "../stepsImpl/viewerConnect.step.impl";

Then(
  /^the "([^"]*)" connects to the published stream$/,
  async function (this: ScenarioWorld, actor: string) {
    await viewerConnect(this, actor);
  },
);

Then(
  /^the "([^"]*)" disconnects from the published stream$/,
  async function (this: ScenarioWorld, actor: string) {
    await viewerStop(this, actor);
  },
);

Given(
  /^the "([^"]*)" connects to the published stream and should be LIVE$/,
  async function (this: ScenarioWorld, actor: string) {
    await viewerConnectAndVerifyStream(this, actor);
  },
);

Given(
  /^the "([^"]*)" connects to the published stream with the specified options$/,
  async function (this: ScenarioWorld, actor: string, dataTable: DataTable) {
    await viewerConnectWithOptions(this, actor, dataTable);
  },
);
