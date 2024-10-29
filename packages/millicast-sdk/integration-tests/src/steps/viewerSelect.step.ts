import { When } from "@cucumber/cucumber";
import { ScenarioWorld } from "cucumber-playwright-framework";
import {
  viewerSelectLayer,
} from "../stepsImpl/viewerSelect.step.impl";

When(
  /^the "([^"]*)" selects simulcast layer with encodingId "([^"]*)"$/,
  async function (this: ScenarioWorld, actor: string, encodingId: string) {
    await viewerSelectLayer(this, actor, encodingId);
  },
);