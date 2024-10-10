import { Then} from "@cucumber/cucumber";
import { ScenarioWorld } from "cucumber-playwright-framework";
import {
  verifyPublisherIsLive,
  verifyPublisherIsNotLive,
} from "../stepsImpl/publisherVerification.step.impl";

Then(
    "publisher1 verify if connected",
    function (this: ScenarioWorld) {
      verifyPublisherIsLive(this);
    }
  );

Then(
  "publisher1 verify if not connected",
  function (this: ScenarioWorld) {
    verifyPublisherIsNotLive(this);
  }
);