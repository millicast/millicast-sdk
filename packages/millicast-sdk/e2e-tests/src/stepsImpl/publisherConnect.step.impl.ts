import { ScenarioWorld, logger, runSteps, runStep } from "cucumber-playwright-framework";
import { expect } from '@playwright/test';



export async function publisherConnect(
  scenarioWorld: ScenarioWorld,
  codec: string,
) {
  logger.debug(`publisherConnect function was called`);
  var camDeviceLocator = await scenarioWorld.page.getByRole('button', { name: 'fake_device_0' });
  await expect(camDeviceLocator).toBeVisible();
  await runStep(`the host executes the "window.millicastPublish.connect({codec:${codec}})" JavaScript function on the page`, scenarioWorld);
}

export async function publisherStop(
  scenarioWorld: ScenarioWorld,
) {
  logger.debug(`publisherStop function was called`);
  await runStep(`the host executes the "window.millicastPublish.stop()" JavaScript function on the page`, scenarioWorld)
};

//doesn't work - custom steps are not found
export async function publisherConnectAndVerifyStream(
  scenarioWorld: ScenarioWorld,
) {
  logger.debug(`publisherConnectAndVerifyStream function was called`);

  await runStep(
    [
      `the publisher1 is on the "publisherPage" page of the "millicast-publisher-demo" app`,
      `the publisher1 connects to stream with codec "h264"`,
      `publisher1 verify if connected`,
    ],
    scenarioWorld
  )
};
