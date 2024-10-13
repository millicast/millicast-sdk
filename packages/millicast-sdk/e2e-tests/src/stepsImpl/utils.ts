import { ScenarioWorld, runStep } from "cucumber-playwright-framework";
import { expect } from '@playwright/test';


export async function waitForFunctionResult(
  scenarioWorld: ScenarioWorld,
  funcToCall: Function,
  expectedResult: string|boolean,
  timeout: number,
) {
  await expect.poll( async () => {
  return await funcToCall(scenarioWorld);
  }, {
    timeout: timeout,
  }).toBe(expectedResult);
}

export async function waitForCondition(
  actualValue: string|Object,
  expectedResult: string|boolean,
  timeout: number,
) {
  await expect.poll( async () => {
  return actualValue;
  }, {
    timeout: timeout,
  }).toBe(expectedResult);
}

export async function getDiagnoseConnection(
  scenarioWorld: ScenarioWorld,
) {
  const page = scenarioWorld.page;
  const result = await page.evaluate("window.Logger.diagnose().connection");
  console.log('diagnose().connection = '+result);
  return result
};

// todo: make it getMediaStream and return mediaStream dict
export async function verifyMediaStreamActive(
  scenarioWorld: ScenarioWorld,
) {
  const page = scenarioWorld.page;
  const mediaStream = {
    active: await page.evaluate('document.getElementsByTagName("video")[0].srcObject.active'),
    id: await page.evaluate('document.getElementsByTagName("video")[0].srcObject.id')
  };
  expect(mediaStream.active).toBe(true);
};

// todo: make it getVideoTrack and return videoTrack dict
export async function verifyVideoTrackLive(
  scenarioWorld: ScenarioWorld,
) {
  const page = scenarioWorld.page;
  const videoTrack = {
    kind: await page.evaluate('document.getElementsByTagName("video")[0].srcObject.getVideoTracks()[0].kind'),
    readyState: await page.evaluate('document.getElementsByTagName("video")[0].srcObject.getVideoTracks()[0].readyState')
  };
  expect(videoTrack.kind).toBe('video');
  expect(videoTrack.readyState).toBe('live');
};

// todo: make it getAudioTrack return audioTrack dict
export async function verifyAudioTrackLive(
  scenarioWorld: ScenarioWorld,
) {
  const page = scenarioWorld.page;
  const audioTrack = {
    kind: await page.evaluate('document.getElementsByTagName("video")[0].srcObject.getAudioTracks()[0].kind'),
    readyState: await page.evaluate('document.getElementsByTagName("video")[0].srcObject.getAudioTracks()[0].readyState')
  };
  expect(audioTrack.kind).toBe('audio');
  expect(audioTrack.readyState).toBe('live');
};

export async function verifyMediaTracksEnabled(
  scenarioWorld: ScenarioWorld,
) {
  // todo: make it wait for condition instead of seconds
  await runStep('the host waits for "3" seconds', scenarioWorld);
  await verifyMediaStreamActive(scenarioWorld);
  await verifyVideoTrackLive(scenarioWorld);
  await verifyAudioTrackLive(scenarioWorld);
}