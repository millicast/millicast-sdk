import { ScenarioWorld } from "cucumber-playwright-framework";
import { verifyDiagnoseConnected } from "./utils"
import { expect } from '@playwright/test';

export async function verifyViewerIsActive(
  scenarioWorld: ScenarioWorld,
) {
  const page = scenarioWorld.page;
  const result = await page.evaluate("window.millicastView.isActive()");
  console.log('ViewerIsActive() = '+result);
  return result
};

export function verifyViewerIsLive(
  scenarioWorld: ScenarioWorld,
) {
  expect.poll( () => {
  return verifyViewerIsActive(scenarioWorld);
  }, {
    timeout: 5000,
  }).toBe(true);

  expect.poll( () => {
    return verifyDiagnoseConnected(scenarioWorld);
    }, {
      timeout: 5000
    }).toBe('connected');
}

export function verifyViewerIsNotLive(
  scenarioWorld: ScenarioWorld,
) {
  expect.poll( () => {
  return verifyViewerIsActive(scenarioWorld);
  }, {
    timeout: 5000,
  }).toBe(false);

  expect.poll( () => {
    return verifyDiagnoseConnected(scenarioWorld);
    }, {
      timeout: 5000
    }).toBe('closed');
}