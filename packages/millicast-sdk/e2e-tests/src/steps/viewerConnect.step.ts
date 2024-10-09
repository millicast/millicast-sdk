import { Then} from "@cucumber/cucumber";
import { ScenarioWorld } from "cucumber-playwright-framework";
import {
  viewerConnect,
} from "../stepsImpl/viewerConnect.step.impl";

Then(
    "the viewer1 connects to stream",
    function (this: ScenarioWorld) {
      viewerConnect(this);
    }
  );
