import { Then} from "@cucumber/cucumber";
import { ScenarioWorld } from "cucumber-playwright-framework";
import {
  publisherConnect,
} from "../stepsImpl/publisherConnect.step.impl";

Then(
    "the publisher1 connects to stream with codec {string}",
    function (this: ScenarioWorld, codec) {
      publisherConnect(this, codec);
    }
  );
