import { DataTable, Then } from "@cucumber/cucumber";
import { ScenarioWorld } from "cucumber-playwright-framework";
import {
  verifyViewerIsLive,
  verifyViewerIsNotLive,
  verifyMediaTracksEnabled,
  verifyViewerMediaTracksDisabled,
  verifyViwerVideoResolutionForLayer,
} from "../stepsImpl/viewerVerification.step.impl";


Then(
  /^the "([^"]*)" connected stream should be LIVE$/,
  async function (this: ScenarioWorld, actor: string) {
    await verifyViewerIsLive(this, actor);
  },
);

Then(
  /^the "([^"]*)" connected stream should be NOT LIVE$/,
  async function (this: ScenarioWorld, actor: string) {
    await verifyViewerIsNotLive(this, actor);
  },
);

Then(
  /^the "([^"]*)" should be able to view media tracks for the connected stream$/,
  async function (this: ScenarioWorld, actor: string) {
    await verifyMediaTracksEnabled(this, actor);
  },
);

Then(
  /^the "([^"]*)" should be able to view below AV state for the connected stream$/,
  async function (this: ScenarioWorld, actor: string, dataTable: DataTable) {
    await verifyViewerMediaTracksDisabled(this, actor, dataTable);
  },
);

Then(
  /^the "([^"]*)" verifies video resolution for layer "([^"]*)"$/,
  async function (this: ScenarioWorld, actor: string, encodingId: string) {
    await verifyViwerVideoResolutionForLayer(this, actor, encodingId);
  },
);
