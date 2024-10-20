import { ScenarioWorld, logger, runStep } from "cucumber-playwright-framework";
import { verifyViewerIsLive } from "./viewerVerification.step.impl";
import { DataTable } from "@cucumber/cucumber";
import { parseData } from "../support-utils/utils";
import { openViewerApp } from "./appLaunch.step.impl";

export async function viewerConnect(
  scenarioWorld: ScenarioWorld,
  actor: string,
) {
  logger.debug(`viewerConnect function was called`);

  await runStep([
      `the ${actor} switch to the "Viewer" app`,
      `the ${actor} executes the "window.millicastView.connect()" JavaScript function on the page`,
    ], scenarioWorld);
}

export async function viewerStop(scenarioWorld: ScenarioWorld, actor: string) {
  logger.debug(`viewerStop function was called`);

  await runStep([
      `the ${actor} switch to the "Viewer" app`,
      `the ${actor} executes the "window.millicastView.stop()" JavaScript function on the page`,
    ],scenarioWorld);
}

export async function viewerConnectAndVerifyStream(
  scenarioWorld: ScenarioWorld,
  actor: string,
) {
  logger.debug(`viewerConnectAndVerifyStream function was called`);

  await openViewerApp(scenarioWorld, actor);
  await viewerConnect(scenarioWorld, actor);
  await verifyViewerIsLive(scenarioWorld, actor);
}

export async function viewerConnectWithOptions(
  scenarioWorld: ScenarioWorld,
  actor: string,
  dataTable: DataTable,
) {
  logger.debug(`viewerConnectWithOptions function was called`);

  const options = dataTable.rowsHash();
  const optionsStr = JSON.stringify(parseData(options));

  await runStep(
    [
      `the ${actor} switch to the "Viewer" app`,
      `the ${actor} executes the "window.millicastView.connect(${optionsStr})" JavaScript function on the page`,
    ],
    scenarioWorld,
  );
}
