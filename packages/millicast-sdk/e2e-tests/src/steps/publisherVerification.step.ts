import { Then } from "@cucumber/cucumber";
import { ScenarioWorld } from "cucumber-playwright-framework";
import {
  verifyPublisherIsLive,
  verifyPublisherIsNotLive,
} from "../stepsImpl/publisherVerification.step.impl";


Then(
    "the publisher1 verify if connected",
    async function (this: ScenarioWorld) {
      await verifyPublisherIsLive(this);
    }
  );

Then(
  "the publisher1 verify if not connected",
  async function (this: ScenarioWorld) {
    await verifyPublisherIsNotLive(this);
  }
);
