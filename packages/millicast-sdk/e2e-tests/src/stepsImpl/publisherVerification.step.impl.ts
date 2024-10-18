import { runStep, ScenarioWorld } from "cucumber-playwright-framework";
import {
  getDiagnose,
  waitForFunctionResult,
  waitForPropertyValue,
} from "../support-utils/utils";

export async function getPublisherIsActive(scenarioWorld: ScenarioWorld) {
  const page = scenarioWorld.page;
  const result = await page.evaluate("window.millicastPublish.isActive()");
  console.log("PublisherIsActive() = " + result);
  return result;
}

export async function verifyPublisherIsLive(
  scenarioWorld: ScenarioWorld,
  actor: string,
) {
  await runStep(`the ${actor} switch to the "Publisher" app`, scenarioWorld);
  await waitForFunctionResult(scenarioWorld, getPublisherIsActive, true, 10000);
  await waitForPropertyValue(
    scenarioWorld,
    getDiagnose,
    "connection",
    "connected",
    10000,
  );
}

export async function verifyPublisherIsNotLive(
  scenarioWorld: ScenarioWorld,
  actor: string,
) {
  await runStep(`the ${actor} switch to the "Publisher" app`, scenarioWorld);
  await waitForFunctionResult(
    scenarioWorld,
    getPublisherIsActive,
    false,
    10000,
  );
  await waitForPropertyValue(
    scenarioWorld,
    getDiagnose,
    "connection",
    "closed",
    10000,
  );
}
