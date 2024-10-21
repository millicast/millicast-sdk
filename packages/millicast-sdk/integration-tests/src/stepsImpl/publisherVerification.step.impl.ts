import { runStep, ScenarioWorld } from "cucumber-playwright-framework";

export async function verifyPublisherIsLive(
  scenarioWorld: ScenarioWorld,
  actor: string,
) {
  await runStep([
    `the ${actor} switch to the "Publisher" app`,
    `the "window.millicastPublish.isActive()" JavaScript function result should be true`,
    `the "window.Logger.diagnose().connection" JavaScript function result should be "connected"`
  ], scenarioWorld);
}

export async function verifyPublisherIsNotLive(
  scenarioWorld: ScenarioWorld,
  actor: string,
) {
  await runStep([
    `the ${actor} switch to the "Publisher" app`,
    `the "window.millicastPublish.isActive()" JavaScript function result should be false`,
    `the "window.Logger.diagnose().connection" JavaScript function result should be "closed"`
  ], scenarioWorld);
}
