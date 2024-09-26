import { Given } from "@cucumber/cucumber";
import { ScenarioWorld } from "cucumber-playwright-framework";
import {
  stepOpenOrangeHRMApp,
  stepNavigateToPage,
} from "../stepsImpl/appLaunch.step.impl";

Given(
  /^the (?:.*) is on the "([^"]*)" page$/,
  async function (this: ScenarioWorld, pageName: string) {
    await stepOpenOrangeHRMApp(this, pageName);
  }
);

Given(
  /^the (?:.*) navigates to "([^"]*)" page$/,
  async function (this: ScenarioWorld, pageName: string) {
    await stepNavigateToPage(this, pageName);
  }
);
