import { Then} from "@cucumber/cucumber";
import { ScenarioWorld } from "cucumber-playwright-framework";
import {
  verifyViewerIsLive,
  verifyViewerIsNotLive,
} from "../stepsImpl/viewerVerification.step.impl";

Then(
    "the viewer1 verify if connected",
    async function (this: ScenarioWorld) {
      await verifyViewerIsLive(this);
    }
  );

Then(
  "the viewer1 verify if not connected",
  async function (this: ScenarioWorld) {
    await verifyViewerIsNotLive(this);
  }
);