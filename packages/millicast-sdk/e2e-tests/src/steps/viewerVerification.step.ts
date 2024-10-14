import { Then} from "@cucumber/cucumber";
import { ScenarioWorld } from "cucumber-playwright-framework";
import {
  verifyViewerIsLive,
  verifyViewerIsNotLive,
} from "../stepsImpl/viewerVerification.step.impl";
import { verifyMediaTracksEnabled, verifyViewerMediaTracksDisabled } from "../stepsImpl/utils"

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

Then(
  "the viewer1 verify media tracks enabled",
  async function (this: ScenarioWorld) {
    await verifyMediaTracksEnabled(this);
  } 
);

Then(
  "the viewer1 verify video disabled {string} and audio disabled {string}",
  async function (this: ScenarioWorld, videoDisabled: string, audioDisabled: string) {
    await verifyViewerMediaTracksDisabled(this, videoDisabled, audioDisabled)
  } 
);