// import assert from "assert";
import { ScenarioWorld , runStep } from "cucumber-playwright-framework";
import { expect } from '@playwright/test';

export async function verifyPubIsActive(
  scenarioWorld: ScenarioWorld,
) {
  const page = scenarioWorld.page;
  const result = await page.evaluate("window.millicastPublish.isActive()");
  return result
};

export function verifyPubState(
  scenarioWorld: ScenarioWorld,
) {
  expect.poll( () => {
    const result = verifyPubIsActive(scenarioWorld);
    return result;
  }, {
    // Poll for 10 seconds; defaults to 5 seconds. Pass 0 to disable timeout.
    timeout: 10000,
  }).toBe(true);
}
