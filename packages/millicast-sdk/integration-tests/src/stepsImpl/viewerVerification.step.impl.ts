import { DataTable } from "@cucumber/cucumber";
import { runStep, runSteps, ScenarioWorld } from "cucumber-playwright-framework";
import { retryUntilFalse, retryUntilTrue } from "../support-utils/generic";

export async function verifyViewerIsLive(
  scenarioWorld: ScenarioWorld,
  actor: string,
) {
  await runStep([
    `the ${actor} switch to the "Viewer" app`,
    `the "window.millicastView.isActive()" JavaScript function result should be true`,
    `the "window.Logger.diagnose().connection" JavaScript function result should be "connected"`
  ], scenarioWorld);
}

export async function verifyViewerIsNotLive(
  scenarioWorld: ScenarioWorld,
  actor: string,
) {
  await runStep([
    `the ${actor} switch to the "Viewer" app`,
    `the "window.millicastView.isActive()" JavaScript function result should be false`,
    `the "window.Logger.diagnose().connection" JavaScript function result should be "closed"`
  ], scenarioWorld);
}

async function verifyVideoIsActive(scenarioWorld: ScenarioWorld, actor: string, playerId: string) {
  const verifyMethod = async (): Promise<boolean> => {
    return (await runStep(
      `the ${actor} executes the "TestUtil.isVideoActive('${playerId}')" JavaScript function on the page`,
      scenarioWorld
    )) as boolean
  }
  const isPlaying = await retryUntilTrue(verifyMethod)
  if (!isPlaying) {
    throw Error(`Stream is not playing - for ${playerId} playerID and isPlaying is ${isPlaying}`)
  }
}

async function verifyVideoIsNotActive(scenarioWorld: ScenarioWorld, actor: string, playerId: string) {
  const verifyMethod = async (): Promise<boolean> => {
    return (await runStep(
      `the ${actor} executes the "TestUtil.isVideoActive('${playerId}')" JavaScript function on the page`,
      scenarioWorld
    )) as boolean
  }
  const isPlaying = await retryUntilFalse(verifyMethod)
  if (isPlaying) {
    throw Error(`Stream is playing - for ${playerId} playerID and isPlaying is ${isPlaying}`)
  }
}

export async function verifyVideoPresent(scenarioWorld: ScenarioWorld, actor: string, playerId: string) {
  const verifyMethod = async (): Promise<boolean> => {
    return (await runStep(
      `the ${actor} executes the "TestUtil.isVideoPresent('${playerId}')" JavaScript function on the page`,
      scenarioWorld
    )) as boolean
  }
  const isVideoPresent = await retryUntilTrue(verifyMethod)
  if (!isVideoPresent) {
    throw Error(`Stream does not have a video - for ${playerId} playerID and isVideoPresent is ${isVideoPresent}`)
  }
}

async function verifyVideoNotPresent(scenarioWorld: ScenarioWorld, actor: string, playerId: string) {
  const verifyMethod = async (): Promise<boolean> => {
    return (await runStep(
      `the ${actor} executes the "TestUtil.isVideoPresent('${playerId}')" JavaScript function on the page`,
      scenarioWorld
    )) as boolean
  }
  const isVideoPresent = await retryUntilFalse(verifyMethod)
  if (isVideoPresent) {
    throw Error(`Stream have a video - for ${playerId} playerID and isVideoPresent is ${isVideoPresent}`)
  }
}

async function verifyAudioPresent(scenarioWorld: ScenarioWorld, actor: string, playerId: string) {
  const verifyMethod = async (): Promise<boolean> => {
    return (await runStep(
      `the ${actor} executes the "TestUtil.isAudioPresent('${playerId}')" JavaScript function on the page`,
      scenarioWorld
    )) as boolean
  }
  const isAudioPresent = await retryUntilTrue(verifyMethod)
  if (!isAudioPresent) {
    throw Error(`Stream does not has a audio - for ${playerId} playerID and isAudioPresent is ${isAudioPresent}`)
  }
}

async function verifyAudioNotPresent(scenarioWorld: ScenarioWorld, actor: string, playerId: string) {
  const verifyMethod = async (): Promise<boolean> => {
    return (await runStep(
      `the ${actor} executes the "TestUtil.isAudioPresent('${playerId}')" JavaScript function on the page`,
      scenarioWorld
    )) as boolean
  }
  const isAudioPresent = await retryUntilFalse(verifyMethod)
  if (isAudioPresent) {
    throw Error(`Stream has a audio - for ${playerId} playerID and isAudioPresent is ${isAudioPresent}`)
  }
}

export async function verifyMediaTracksEnabled(
  scenarioWorld: ScenarioWorld,
  actor: string,
) {
  await runStep(`the ${actor} switch to the "Viewer" app`, scenarioWorld);
  const videoElement = 'document.getElementsByTagName("video")[0]';
  const srcObject = `${videoElement}.srcObject`;
  const playerId = await scenarioWorld.page.evaluate(`${videoElement}.id`);

  await runSteps([
    `the "${srcObject}.active" JavaScript function result should be true`,
    `the "${srcObject}.getVideoTracks()[0].kind" JavaScript function result should be "video"`,
    `the "${srcObject}.getVideoTracks()[0].readyState" JavaScript function result should be "live"`,
    `the "${srcObject}.getAudioTracks()[0].kind" JavaScript function result should be "audio"`,
    `the "${srcObject}.getVideoTracks()[0].readyState" JavaScript function result should be "live"`,
  ], scenarioWorld);

  await verifyVideoPresent(scenarioWorld, actor, playerId);
  await verifyVideoIsActive(scenarioWorld, actor, playerId);
  await verifyAudioPresent(scenarioWorld, actor, playerId);
}

export async function verifyViewerMediaTracksDisabled(
  scenarioWorld: ScenarioWorld,
  actor: string,
  dataTable: DataTable,
) {
  const options = dataTable.rowsHash();
  const disableVideo = options.disableVideo;
  const disableAudio = options.disableAudio;
  const videoElement = 'document.getElementsByTagName("video")[0]';
  const playerId = await scenarioWorld.page.evaluate(`${videoElement}.id`);

  await runStep([
    `the ${actor} switch to the "Viewer" app`,
    `the "document.getElementsByTagName("video")[0].srcObject.active" JavaScript function result should be true`
  ], scenarioWorld);

  if (disableAudio === "true") {
    await runStep(`the "document.getElementsByTagName("video")[0].srcObject.getTracks().length" JavaScript function result should be 1`, scenarioWorld);
    await verifyAudioNotPresent(scenarioWorld, actor, playerId)
  }

  if (disableVideo === "true") {
    await runStep(`the "document.getElementsByTagName("video")[0].srcObject.getTracks().length" JavaScript function result should be 1`, scenarioWorld);
    await verifyVideoNotPresent(scenarioWorld, actor, playerId)
  }

  if (disableVideo === "false") {
    await runSteps([
      `the "document.getElementsByTagName("video")[0].srcObject.getVideoTracks()[0].kind" JavaScript function result should be "video"`,
      `the "document.getElementsByTagName("video")[0].srcObject.getVideoTracks()[0].readyState" JavaScript function result should be "live"`,
    ], scenarioWorld);
    await verifyVideoPresent(scenarioWorld, actor, playerId);
    await verifyVideoIsActive(scenarioWorld, actor, playerId);
  }

  if (disableAudio === "false") {
    await runSteps([
      `the "document.getElementsByTagName("video")[0].srcObject.getAudioTracks()[0].kind" JavaScript function result should be "audio"`,
      `the "document.getElementsByTagName("video")[0].srcObject.getAudioTracks()[0].readyState" JavaScript function result should be "live"`,
    ], scenarioWorld);
    await verifyAudioPresent(scenarioWorld, actor, playerId)
  }
}