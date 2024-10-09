import { ScenarioWorld, logger, runStep } from "cucumber-playwright-framework";

export function publisherConnect(
  scenarioWorld: ScenarioWorld,
  codec: string,
) {
  logger.debug(`publisherConnect function was called`);
  scenarioWorld.page.evaluate(`window.millicastPublish.connect({codec:${codec}})`)
};
