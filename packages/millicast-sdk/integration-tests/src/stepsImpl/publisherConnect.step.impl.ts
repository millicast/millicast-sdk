import { ScenarioWorld, logger, runStep } from "cucumber-playwright-framework";
import { expect } from '@playwright/test';
import { DataTable } from "@cucumber/cucumber";
import { verifyPublisherIsLive } from "./publisherVerification.step.impl";
import { parseData } from "../support-utils/utils";
import { openPublisherApp } from "./appLaunch.step.impl";

export async function publisherConnectWithOptions(
  scenarioWorld: ScenarioWorld,
  actor: string,
  dataTable: DataTable,
) {
  logger.debug(`publisherConnectWithOptions function was called`);
  const options = dataTable.rowsHash();
  const optionsStr = JSON.stringify(parseData(options));

  await runStep([
      `the ${actor} switch to the "Publisher" app`,
      `the ${actor} waits for "cam device" text to be "fake_device_0"`,
      `the ${actor} waits for "miclist button" text to be "Fake Default Audio Input "`,
      `the ${actor} executes the "window.millicastPublish.connect(${optionsStr})" JavaScript function on the page`,
    ], scenarioWorld);
}

export async function publisherConnectWithOptionsExpectFail(
  scenarioWorld: ScenarioWorld,
  actor: string,
  dataTable: DataTable,
) {
  logger.debug(`publisherConnectWithOptions function was called`);
  const options = dataTable.rowsHash();
  const optionsStr = JSON.stringify(parseData(options));

  try{
    await runStep([
      `the ${actor} switch to the "Publisher" app`,
      `the ${actor} waits for "cam device" text to be "fake_device_0"`,
      `the ${actor} waits for "miclist button" text to be "Fake Default Audio Input "`,
      `the ${actor} executes the "window.millicastPublish.connect(${optionsStr})" JavaScript function on the page`,
    ], scenarioWorld);
  } catch (e) {
    if(
      options.disableVideo === 'true' && options.disableAudio === 'true'
    ){expect((e as Error).message).toContain("Not attempting to connect as video and audio are disabled")}
}}

export async function publisherStop(
  scenarioWorld: ScenarioWorld,
  actor: string,
) {
  logger.debug(`publisherStop function was called`);

  await runStep([
      `the ${actor} switch to the "Publisher" app`,
      `the ${actor} executes the "window.millicastPublish.stop()" JavaScript function on the page`,
    ],scenarioWorld);
}

export async function publisherConnectAndVerifyStream(
  scenarioWorld: ScenarioWorld,
  actor: string,
) {
  logger.debug(`publisherConnectAndVerifyStream function was called`);

  await openPublisherApp(scenarioWorld, actor);
  await publisherConnectWithOptions(
    scenarioWorld,
    actor,
    new DataTable([["codec", "h264"]]),
  );
  await verifyPublisherIsLive(scenarioWorld, actor);
}
