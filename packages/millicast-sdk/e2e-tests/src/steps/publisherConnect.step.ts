import { Given, Then } from "@cucumber/cucumber";
import { ScenarioWorld } from "cucumber-playwright-framework";
import { 
  publisherConnect, 
  publisherStop, 
  publisherConnectAndVerifyStream 
} from "../stepsImpl/publisherConnect.step.impl";


Then(
    "the publisher1 connects to stream with codec {string}",
    function (this: ScenarioWorld, codec) {
      publisherConnect(this, codec);
    }
  );
  
Then(
  "the publisher1 stops connection",
  function (this: ScenarioWorld) {
    publisherStop(this);
  }
);

// Doesn't work, steps in runStep aren't called !
Given(
  "the publisher1 is connected and stream is live",
  function (this: ScenarioWorld) {
    publisherConnectAndVerifyStream(this);
  }
);
