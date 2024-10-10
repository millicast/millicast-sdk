import { Then} from "@cucumber/cucumber";
import { ScenarioWorld } from "cucumber-playwright-framework";
import {
  verifyViewerIsLive,
  verifyViewerIsNotLive,
} from "../stepsImpl/viewerVerification.step.impl";

Then(
    "viewer1 verify if connected",
    function (this: ScenarioWorld) {
      verifyViewerIsLive(this);
    }
  );

Then(
  "viewer1 verify if not connected",
  function (this: ScenarioWorld) {
    verifyViewerIsNotLive(this);
  }
);