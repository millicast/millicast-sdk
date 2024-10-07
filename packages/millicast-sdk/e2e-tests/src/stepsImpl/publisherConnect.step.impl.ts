// import assert from "assert";
import { ScenarioWorld, logger, runStep } from "cucumber-playwright-framework";

export async function publisherConnect(
  scenarioWorld: ScenarioWorld,
  codec: string
) {
  logger.debug(`publisherConnect function was called`);
  const testData = scenarioWorld.testConfig.testdata;
  // await runStep(
  //   [
  //     `the publisher1 runs the "window.millicastPublish.connect({codec:${codec}})" JavaScript function on the page`,
  //   ],
  //   scenarioWorld
  // );

  scenarioWorld.page.evaluate(`window.millicastPublish.connect({codec:${codec}})`)

};
