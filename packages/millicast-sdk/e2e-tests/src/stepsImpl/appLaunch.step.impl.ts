import { ScenarioWorld, logger, runStep } from "cucumber-playwright-framework";

export async function stepOpenOrangeHRMApp(
  scenarioWorld: ScenarioWorld,
  pageName: string
) {
  logger.debug(`Open the Orange HRM app and login`);
  const testData = scenarioWorld.testConfig.testdata;

  await runStep(
    [
      `the admin is on the "login" page of the "Orange-HRM" app`,
      `the admin enters the "${testData.username}" text in the "username"`,
      `the admin enters the "${testData.password}" text in the "password"`,
      `the admin clicks on the "login button"`,
      `the admin should be navigated to the "${pageName}" page`,
    ],
    scenarioWorld
  );
}

export async function stepNavigateToPage(
  scenarioWorld: ScenarioWorld,
  pageName: string
) {
  logger.debug(`Navigate to ${pageName} page`);

  switch (pageName) {
    case "add-employee":
      await navigateToAddEmployee(scenarioWorld);
      break;
    default:
      throw new Error(`Invalid page name ${pageName} passed`);
  }
}

async function navigateToAddEmployee(scenarioWorld: ScenarioWorld) {
  await runStep(
    [
      `the "sidebar" should be displayed`,
      `the admin clicks on the "pim"`,
      `the admin should be navigated to the "pim" page`,
      `the admin clicks on the "add employee"`,
      `the admin should be navigated to the "add-employee" page`,
    ],
    scenarioWorld
  );
}
