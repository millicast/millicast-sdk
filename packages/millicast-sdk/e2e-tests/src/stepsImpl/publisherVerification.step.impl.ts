import { ScenarioWorld } from "cucumber-playwright-framework";
import { verifyDiagnoseConnected } from "./utils"
import { expect } from '@playwright/test';


export async function verifyPublisherIsActive(
  scenarioWorld: ScenarioWorld,
) {
  const page = scenarioWorld.page;
  const result = await page.evaluate("window.millicastPublish.isActive()");
  console.log('verifyPubIsActive() = '+result);
  return result
};

export function verifyPublisherState(
  scenarioWorld: ScenarioWorld,
) {
  expect.poll( () => {
  return verifyPublisherIsActive(scenarioWorld);
  }, {
  timeout: 5000,
  }).toBe(true);
  
  expect.poll( () => {
  return verifyDiagnoseConnected(scenarioWorld);
  }, {
    timeout: 5000
  }).toBe('connected');
}
