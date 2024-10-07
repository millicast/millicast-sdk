import { Then} from "@cucumber/cucumber";
import { ScenarioWorld } from "cucumber-playwright-framework";
import {
  verifySubState,
} from "../stepsImpl/viewerVerification.step.impl";

Then(
    "viewer1 verify if connected",
    function (this: ScenarioWorld) {
      verifySubState(this);
    }
  );