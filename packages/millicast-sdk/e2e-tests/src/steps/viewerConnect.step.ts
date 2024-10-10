import { Given, Then } from "@cucumber/cucumber";
import { ScenarioWorld } from "cucumber-playwright-framework";
import {
  viewerConnect,
  viewerStop,
  viewerConnectAndVerifyStream,
} from "../stepsImpl/viewerConnect.step.impl";

Then(
    "the viewer1 connects to stream",
    function (this: ScenarioWorld) {
      viewerConnect(this);
    }
  );

Then(
  "the viewer1 stops connection",
  function (this: ScenarioWorld) {
    viewerStop(this);
  }
);

// Doesn't work, steps in runStep aren't called !
Given(
  "the viewer1 is connected and stream is live",
  function (this: ScenarioWorld) {
    viewerConnectAndVerifyStream(this);
  }
);