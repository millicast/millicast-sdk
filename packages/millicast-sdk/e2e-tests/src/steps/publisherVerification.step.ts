import { Then} from "@cucumber/cucumber";
import { ScenarioWorld } from "cucumber-playwright-framework";
import {
  verifyPublisherState,
} from "../stepsImpl/publisherVerification.step.impl";

Then(
    "publisher1 verify if connected",
    function (this: ScenarioWorld) {
      verifyPublisherState(this);
    }
  );