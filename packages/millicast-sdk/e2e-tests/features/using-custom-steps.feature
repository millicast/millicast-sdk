# Feature: Add Employee - Custom Steps
#   As a company admin
#   I want to add new Employee in the system

#   # Test Automation using the "LOW CODE" approach. This is the recommended way to automate the test scenarios.
#   # This feature file uses the custom application/business-based behavior steps which should be defined under the src/steps and src/stepsImpl directories.
#   # User can use the generic steps within the custom application/business steps using the runStep or runSteps method.
#   # await runStep(steps: string|string[], scenarioWorld: scenarioWorld) --> Execute the generic steps serially
#   # await runSteps(steps: string[], scenarioWorld: scenarioWorld) --> Execute the generic steps parallely

#   Background: Admin Login
#     Given the admin is on the "home" page

#   Scenario: Add employee
#     Given the admin navigates to "add-employee" page
#     When the admin adds the new employee with following details
#       | first name    | Vish  |
#       | middle name   | Krish |
#       | last name     | Khar  |
#     Then the admin should be navigated to the "employee-details" page

