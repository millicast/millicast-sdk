import { ScenarioWorld, logger, runStep } from "cucumber-playwright-framework";
import { verifyViewerIsLive, verifyViewerIsNotLive } from "./viewerVerification.step.impl";
import { viewerStop } from "./viewerConnect.step.impl";
import { collectWsEvents } from "../support-utils/events";

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
  
  const jsFile = 'packages/millicast-sdk/integration-tests/src/support-utils/TestUtil.js'
  await runStep(`the ${actor} adds the "${jsFile}" JavaScript file to the page`, scenarioWorld);

  collectWsEvents(scenarioWorld, actor)
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
  
  const jsFile = 'packages/millicast-sdk/integration-tests/src/support-utils/TestUtil.js'
  await runStep(`the ${actor} adds the "${jsFile}" JavaScript file to the page`, scenarioWorld);
}

export async function openViewerAppAndDisconnect(
  scenarioWorld: ScenarioWorld,
  actor: string,
) {
  logger.debug(`Open the Viewer App and disconnect Viewer`);

  await openViewerApp(scenarioWorld, actor)
  await verifyViewerIsLive(scenarioWorld, actor);
  await viewerStop(scenarioWorld, actor);
  await verifyViewerIsNotLive(scenarioWorld, actor);
}