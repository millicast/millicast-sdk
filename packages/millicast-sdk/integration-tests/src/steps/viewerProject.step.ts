import { When } from "@cucumber/cucumber";
import { ScenarioWorld } from "cucumber-playwright-framework";
import { viewerProject } from "../stepsImpl/viewerProject.step.impl";

When(
  /^the "([^"]*)" projects sourceId "([^"]*)"$/,
  async function (this: ScenarioWorld, actor: string, sourceId: string) {
    await viewerProject(this, actor, sourceId);
  },
);