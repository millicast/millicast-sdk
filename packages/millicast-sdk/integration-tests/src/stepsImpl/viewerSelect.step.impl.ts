import { ScenarioWorld, logger, runStep } from "cucumber-playwright-framework";
import { getListOfActorsEvents, waitForEventLayers } from "../support-utils/events";

export async function viewerSelectLayer(
  scenarioWorld: ScenarioWorld,
  actor: string,
  encodingId: string,
) {
  logger.debug(`viewerSelectLayer function was called`);

  await getListOfActorsEvents(scenarioWorld,actor)
  await waitForEventLayers(scenarioWorld,actor)

  await runStep([
      `the ${actor} switch to the "Viewer" app`,
      `the ${actor} executes the "window.millicastView.select({encodingId:"${encodingId}"})" JavaScript function on the page`,
    ], scenarioWorld);
}
