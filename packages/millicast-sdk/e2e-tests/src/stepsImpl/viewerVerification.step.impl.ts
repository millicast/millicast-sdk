import { ScenarioWorld } from "cucumber-playwright-framework";
import { getDiagnoseConnection, waitForFunctionResult } from "./utils"

export async function getViewerIsActive(
  scenarioWorld: ScenarioWorld,
) {
  const page = scenarioWorld.page;
  const result = await page.evaluate("window.millicastView.isActive()");
  console.log('ViewerIsActive() = '+result);
  return result
};

export async function verifyViewerIsLive(
  scenarioWorld: ScenarioWorld,
) {
  await waitForFunctionResult(scenarioWorld, getViewerIsActive, true, 10000)
  await waitForFunctionResult(scenarioWorld, getDiagnoseConnection, 'connected', 10000)
}

export async function verifyViewerIsNotLive(
  scenarioWorld: ScenarioWorld,
) {
  await waitForFunctionResult(scenarioWorld, getViewerIsActive, false, 10000)
  await waitForFunctionResult(scenarioWorld, getDiagnoseConnection, 'closed', 10000)
}