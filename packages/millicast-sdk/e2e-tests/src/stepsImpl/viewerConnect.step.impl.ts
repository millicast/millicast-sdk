import { ScenarioWorld, logger, runStep } from "cucumber-playwright-framework";

export async function viewerConnect(
  scenarioWorld: ScenarioWorld,
) {
  logger.debug(`viewerConnect function was called`);
  scenarioWorld.page.evaluate(`window.millicastView.connect()`)
};
