import { ScenarioWorld } from "cucumber-playwright-framework";
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

export async function waitForPropertyValue(
  scenarioWorld: ScenarioWorld,
  funcReturningObj: Function,
  propName: string,
  expectedValue: string|number|boolean,
  timeout: number,
) {
  await expect.poll( async () => {
      return await funcReturningObj(scenarioWorld);
    }, {
    timeout: timeout,
  }).toHaveProperty(`${propName}`, expectedValue);
}

export async function getDiagnose(
  scenarioWorld: ScenarioWorld,
) {
  const page = scenarioWorld.page;
  const diagnose = {
    connection: await page.evaluate('window.Logger.diagnose().connection'),
  };
  return diagnose;
};

export async function getMediaStream(
  scenarioWorld: ScenarioWorld,
) {
  const page = scenarioWorld.page;
  const mediaStream = {
    active: await page.evaluate('document.getElementsByTagName("video")[0].srcObject.active'),
    id: await page.evaluate('document.getElementsByTagName("video")[0].srcObject.id')
  };
  return mediaStream;
};

export async function getVideoTrack(
  scenarioWorld: ScenarioWorld,
) {
  const page = scenarioWorld.page;
  const videoTrack = {
    kind: await page.evaluate('document.getElementsByTagName("video")[0].srcObject.getVideoTracks()[0].kind'),
    readyState: await page.evaluate('document.getElementsByTagName("video")[0].srcObject.getVideoTracks()[0].readyState')
  };
  return videoTrack;
};

export async function getAudioTrack(
  scenarioWorld: ScenarioWorld,
) {
  const page = scenarioWorld.page;
  const audioTrack = {
    kind: await page.evaluate('document.getElementsByTagName("video")[0].srcObject.getAudioTracks()[0].kind'),
    readyState: await page.evaluate('document.getElementsByTagName("video")[0].srcObject.getAudioTracks()[0].readyState')
  };
return audioTrack;
};

export async function verifyMediaTracksEnabled(
  scenarioWorld: ScenarioWorld,
) {
  await waitForPropertyValue(scenarioWorld, getMediaStream, 'active', true, 5000)
  await waitForPropertyValue(scenarioWorld, getVideoTrack, 'kind', 'video', 5000)
  await waitForPropertyValue(scenarioWorld, getVideoTrack, 'readyState', 'live', 5000)
  await waitForPropertyValue(scenarioWorld, getAudioTrack, 'kind', 'audio', 5000)
  await waitForPropertyValue(scenarioWorld, getAudioTrack, 'readyState', 'live', 5000)
}