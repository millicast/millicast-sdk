import { DataTable } from "@cucumber/cucumber";
import { ScenarioWorld, logger, runStep } from "cucumber-playwright-framework";
import { objectHasValidKeys } from "./utils";

export async function stepAddNewEmployee(
  scenarioWorld: ScenarioWorld,
  dataTable: DataTable
) {
  logger.debug(`Add new employee`);
  const testData = dataTable.rowsHash();

  const expectedKeys = [
    "first name",
    "middle name",
    "last name",
    "id",
  ] as const;

  if (!objectHasValidKeys(testData, expectedKeys)) {
    throw Error(
      `Invalid key name passed. Expected keys for this step are ${expectedKeys}`
    );
  }

  if ("first name" in testData) {
    await runStep(
      `the admin enters the "${testData["first name"]}" text in the "employee first name"`,
      scenarioWorld
    );
  }

  if ("middle name" in testData) {
    await runStep(
      `the admin enters the "${testData["middle name"]}" text in the "employee middle name"`,
      scenarioWorld
    );
  }

  if ("last name" in testData) {
    await runStep(
      `the admin enters the "${testData["last name"]}" text in the "employee last name"`,
      scenarioWorld
    );
  }

  if ("id" in testData) {
    await runStep(
      `the admin enters the "${testData.id}" text in the "employee id"`,
      scenarioWorld
    );
  }

  await runStep(`the admin clicks on the "save button"`, scenarioWorld);
}
