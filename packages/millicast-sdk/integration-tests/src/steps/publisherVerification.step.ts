import { Then } from "@cucumber/cucumber";
import { ScenarioWorld } from "cucumber-playwright-framework";
import {
  verifyPublisherIsLive,
  verifyPublisherIsNotLive,
} from "../stepsImpl/publisherVerification.step.impl";


Then(
  /^the "([^"]*)" stream should be LIVE$/,
  async function (this: ScenarioWorld, actor: string) {
    await verifyPublisherIsLive(this, actor);
  },
);

Then(
  /^the "([^"]*)" stream should be NOT LIVE$/,
  async function (this: ScenarioWorld, actor: string) {
    await verifyPublisherIsNotLive(this, actor);
  },
);
