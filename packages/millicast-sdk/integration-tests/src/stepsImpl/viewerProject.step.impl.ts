import { ScenarioWorld, logger, runStep } from "cucumber-playwright-framework";

export async function viewerProject(
  scenarioWorld: ScenarioWorld,
  actor: string,
  sourceId: string,
) {
  logger.debug(`viewerProject function was called`);

  await runStep([
      `the ${actor} switch to the "Viewer" app`,
      `the ${actor} executes the "window.millicastView.project('${sourceId}', [{'media': 'video'} , {'media': 'audio'}])" JavaScript function on the page`,
    ], scenarioWorld);
}
