import { ScenarioWorld, logger, runStep } from "cucumber-playwright-framework";
import { getLayersFromEvent } from "../support-utils/events";

export async function viewerSelectLayer(
  scenarioWorld: ScenarioWorld,
  actor: string,
  encodingId: string,
) {
  logger.debug(`viewerSelectLayer function was called`);

  const layers = await getLayersFromEvent(scenarioWorld, actor)
  console.log("AVAILABLE_LAYERS",layers)
  await runStep([
      `the ${actor} switch to the "Viewer" app`,
      `the ${actor} executes the "window.millicastView.select({encodingId:"${encodingId}"})" JavaScript function on the page`,
    ], scenarioWorld);
}
