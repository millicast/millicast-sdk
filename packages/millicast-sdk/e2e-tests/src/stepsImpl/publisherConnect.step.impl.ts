import { ScenarioWorld, logger, runSteps } from "cucumber-playwright-framework";

export function publisherConnect(
  scenarioWorld: ScenarioWorld,
  codec: string,
) {
  logger.debug(`publisherConnect function was called`);
  scenarioWorld.page.evaluate(`window.millicastPublish.connect({codec:${codec}})`)  
}

export async function publisherStop(
  scenarioWorld: ScenarioWorld,
) {
  logger.debug(`publisherStop function was called`);
  scenarioWorld.page.evaluate(`window.millicastPublish.stop()`)
};

// Doesn't work, steps in runStep aren't called !
export async function publisherConnectAndVerifyStream(
  scenarioWorld: ScenarioWorld,
) {
  logger.debug(`publisherConnectAndVerifyStream function was called`);

  await runSteps(
    [
      `the publisher1 is on the "publisherPage" page of the "millicast-publisher-demo" app`,
      `the publisher1 waits for "5" seconds`,
      `the publisher1 connects to stream with codec "h264"`,
      `publisher1 verify if connected`,
      `the publisher1 waits for "5" seconds`,
    ],
    scenarioWorld
  )
};
