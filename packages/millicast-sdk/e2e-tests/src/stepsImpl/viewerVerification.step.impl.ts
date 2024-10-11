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

export async function verifyViewerIsLive(
  scenarioWorld: ScenarioWorld,
) {
  await expect.poll( async () => {
  return await verifyViewerIsActive(scenarioWorld);
  }, {
    timeout: 10000,
  }).toBe(true);

  await expect.poll( async () => {
    return await verifyDiagnoseConnected(scenarioWorld);
    }, {
      timeout: 10000
    }).toBe('connected');
}

export async function verifyViewerIsNotLive(
  scenarioWorld: ScenarioWorld,
) {
  await expect.poll( async () => {
  return verifyViewerIsActive(scenarioWorld);
  }, {
    timeout: 10000,
  }).toBe(false);

  await expect.poll( async () => {
    return verifyDiagnoseConnected(scenarioWorld);
    }, {
      timeout: 10000
    }).toBe('closed');
}