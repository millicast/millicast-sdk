import { ScenarioWorld, logger, runSteps } from "cucumber-playwright-framework";

export async function viewerConnect(
  scenarioWorld: ScenarioWorld,
) {
  logger.debug(`viewerConnect function was called`);
  await scenarioWorld.page.evaluate(`window.millicastView.connect()`)
};

export async function viewerStop(
  scenarioWorld: ScenarioWorld,
) {
  logger.debug(`viewerStop function was called`);
  await scenarioWorld.page.evaluate(`window.millicastView.stop()`)
};

// Doesn't work, steps in runStep aren't called !
export async function viewerConnectAndVerifyStream(
  scenarioWorld: ScenarioWorld,
) {
  logger.debug(`viewerConnectAndVerifyStream function was called`);
  await runSteps(
    [
      `the viewer1 is on the "viewerPage" page of the "millicast-viewer-demo" app`,
      `viewer1 verify if connected`,
    ],
    scenarioWorld
  )
};