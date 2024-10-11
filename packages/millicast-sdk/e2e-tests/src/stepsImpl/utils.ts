import { ScenarioWorld } from "cucumber-playwright-framework";

export async function verifyDiagnoseConnected(
  scenarioWorld: ScenarioWorld,
) {
  const page = scenarioWorld.page;
  const result = await page.evaluate("window.Logger.diagnose().connection");
  console.log('diagnose().connection = '+result);
  return result
};

