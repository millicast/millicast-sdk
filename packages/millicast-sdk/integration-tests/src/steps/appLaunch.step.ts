import { Given } from "@cucumber/cucumber";
import { ScenarioWorld } from "cucumber-playwright-framework";
import {
  openPublisherApp,
  openViewerApp,
  openViewerAppAndDisconnect,
} from "../stepsImpl/appLaunch.step.impl";

Given(
  /^the "([^"]*)" opens "Viewer" app$/,
  async function (this: ScenarioWorld, actor: string) {
    await openViewerApp(this, actor);
  },
);

Given(
  /^the "([^"]*)" opens "Publisher" app$/,
  async function (this: ScenarioWorld, actor: string) {
    await openPublisherApp(this, actor);
  },
);

Given(
  /^the "([^"]*)" opens "Viewer" app and is ready to be connected$/,
  async function (this: ScenarioWorld, actor: string) {
    await openViewerAppAndDisconnect(this, actor);
  },
);