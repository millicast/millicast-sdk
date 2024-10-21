import { Given } from "@cucumber/cucumber";
import { ScenarioWorld } from "cucumber-playwright-framework";
import {
  openPublisherApp,
  openViewerApp,
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
