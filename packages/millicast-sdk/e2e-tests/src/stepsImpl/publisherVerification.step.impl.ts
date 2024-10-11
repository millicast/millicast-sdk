import { ScenarioWorld } from "cucumber-playwright-framework";
import { verifyDiagnoseConnected } from "./utils"
import { expect } from '@playwright/test';

export async function verifyPublisherIsActive(
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
  await expect.poll( async () => {
  return await verifyPublisherIsActive(scenarioWorld);
  }, {
    timeout: 10000,
  }).toBe(true);
  
  await expect.poll( async () => {
    return await verifyDiagnoseConnected(scenarioWorld);
    }, {
      timeout: 10000
    }).toBe('connected');
}

export async function verifyPublisherIsNotLive(
  scenarioWorld: ScenarioWorld,
) {
  await expect.poll( async () => {
  return await verifyPublisherIsActive(scenarioWorld);
  }, {
  timeout: 10000,
  }).toBe(false);
  
  await expect.poll( async () => {
  return await verifyDiagnoseConnected(scenarioWorld);
  }, {
    timeout: 10000
  }).toBe('closed');
}
