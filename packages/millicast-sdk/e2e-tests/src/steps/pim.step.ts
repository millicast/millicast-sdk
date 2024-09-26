import { DataTable, When } from "@cucumber/cucumber";
import { ScenarioWorld } from "cucumber-playwright-framework";
import { stepAddNewEmployee } from "../stepsImpl/pim.step.impl";

When(
  /^the (?:.*) adds the new employee with following details$/,
  async function (this: ScenarioWorld, dataTable: DataTable) {
    await stepAddNewEmployee(this, dataTable);
  }
);
