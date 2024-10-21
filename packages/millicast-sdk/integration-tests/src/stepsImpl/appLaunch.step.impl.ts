import { ScenarioWorld, logger, runStep } from "cucumber-playwright-framework";

export async function openViewerApp(
  scenarioWorld: ScenarioWorld,
  actor: string,
) {
  logger.debug(`Open the Viewer App`);

  await runStep(
    [
      `the ${actor} is on the "viewer" page of the "Viewer" app`,
      `the ${actor} should be navigated to the "viewer" page`,
    ],
    scenarioWorld,
  );
}

export async function openPublisherApp(
  scenarioWorld: ScenarioWorld,
  actor: string,
) {
  logger.debug(`Open the Publisher App`);

  await runStep(
    [
      `the ${actor} is on the "publisher" page of the "Publisher" app`,
      `the ${actor} should be navigated to the "publisher" page`,
    ],
    scenarioWorld,
  );
}
