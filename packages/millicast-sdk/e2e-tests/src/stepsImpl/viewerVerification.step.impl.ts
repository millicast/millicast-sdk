import { runStep, ScenarioWorld } from "cucumber-playwright-framework";
import {
  getDiagnose,
  waitForFunctionResult,
  waitForPropertyValue,
} from "../support-utils/utils";

export async function getViewerIsActive(scenarioWorld: ScenarioWorld) {
  const page = scenarioWorld.page;
  const result = await page.evaluate("window.millicastView.isActive()");
  console.log("ViewerIsActive() = " + result);
  return result;
}

export async function verifyViewerIsLive(
  scenarioWorld: ScenarioWorld,
  actor: string,
) {
  await runStep(`the ${actor} switch to the "Viewer" app`, scenarioWorld);
  await waitForFunctionResult(scenarioWorld, getViewerIsActive, true, 10000);
  await waitForPropertyValue(
    scenarioWorld,
    getDiagnose,
    "connection",
    "connected",
    10000,
  );
}

export async function verifyViewerIsNotLive(
  scenarioWorld: ScenarioWorld,
  actor: string,
) {
  await runStep(`the ${actor} switch to the "Viewer" app`, scenarioWorld);
  await waitForFunctionResult(scenarioWorld, getViewerIsActive, false, 10000);
  await waitForPropertyValue(
    scenarioWorld,
    getDiagnose,
    "connection",
    "closed",
    10000,
  );
}
