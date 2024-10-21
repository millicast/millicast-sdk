import { DataTable } from "@cucumber/cucumber";
import { runStep, runSteps, ScenarioWorld } from "cucumber-playwright-framework";

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


export async function verifyMediaTracksEnabled(
  scenarioWorld: ScenarioWorld,
  actor: string,
) {
  await runStep(`the ${actor} switch to the "Viewer" app`, scenarioWorld);

  const srcObject = 'document.getElementsByTagName("video")[0].srcObject'
  await runSteps([
    `the "${srcObject}.active" JavaScript function result should be true`,
    `the "${srcObject}.getVideoTracks()[0].kind" JavaScript function result should be "video"`,
    `the "${srcObject}.getVideoTracks()[0].readyState" JavaScript function result should be "live"`,
    `the "${srcObject}.getAudioTracks()[0].kind" JavaScript function result should be "audio"`,
    `the "${srcObject}.getVideoTracks()[0].readyState" JavaScript function result should be "live"`,
  ], scenarioWorld);

}

export async function verifyViewerMediaTracksDisabled(
  scenarioWorld: ScenarioWorld,
  actor: string,
  dataTable: DataTable,
) {
  const options = dataTable.rowsHash();
  const disableVideo = options.disableVideo;
  const disableAudio = options.disableAudio;

  await runStep([
    `the ${actor} switch to the "Viewer" app`,
    `the "document.getElementsByTagName("video")[0].srcObject.active" JavaScript function result should be true`
  ], scenarioWorld);

  if (disableVideo === "true" || disableAudio === "true") {
    await runStep(`the "document.getElementsByTagName("video")[0].srcObject.getTracks().length" JavaScript function result should be 1`, scenarioWorld);
  }

  if (disableVideo === "false") {
    await runSteps([
      `the "document.getElementsByTagName("video")[0].srcObject.getVideoTracks()[0].kind" JavaScript function result should be "video"`,
      `the "document.getElementsByTagName("video")[0].srcObject.getVideoTracks()[0].readyState" JavaScript function result should be "live"`,
    ], scenarioWorld);
  }
  
  if (disableAudio === "false") {
    await runSteps([
      `the "document.getElementsByTagName("video")[0].srcObject.getAudioTracks()[0].kind" JavaScript function result should be "audio"`,
      `the "document.getElementsByTagName("video")[0].srcObject.getAudioTracks()[0].readyState" JavaScript function result should be "live"`,
    ], scenarioWorld);  
  }
}
