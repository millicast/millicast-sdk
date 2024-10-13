import { ScenarioWorld } from "cucumber-playwright-framework";
import { getDiagnoseConnection, waitForFunctionResult } from "./utils"

export async function getPublisherIsActive(
  scenarioWorld: ScenarioWorld,
) {
  const page = scenarioWorld.page;
  const result = await page.evaluate("window.millicastPublish.isActive()");
  console.log('PublisherIsActive() = '+result);
  return result
};

export async function verifyPublisherIsLive(
  scenarioWorld: ScenarioWorld,
) {
  await waitForFunctionResult(scenarioWorld, getPublisherIsActive, true, 10000)
  await waitForFunctionResult(scenarioWorld, getDiagnoseConnection, 'connected', 10000)
}

export async function verifyPublisherIsNotLive(
  scenarioWorld: ScenarioWorld,
) {
  await waitForFunctionResult(scenarioWorld, getPublisherIsActive, false, 10000)
  await waitForFunctionResult(scenarioWorld, getDiagnoseConnection, 'closed', 10000)
}
