# Feature: Add Employee - Basic Steps
#   As a company admin
#   I want to add new Employee in the system

#   # Test Automation using the "NO CODE" approach.
#   # This feature file uses the generic steps defined in the core framework (cucumber-playwright-framework).
#   # Users don't have to write a single line of code to use the generic steps.
#   # Core Framework: https://www.npmjs.com/package/cucumber-playwright-framework

#   Background: Admin Login
#     Given the admin is on the "login" page of the "Orange-HRM" app
#     And the admin enters the "Admin" text in the "username"
#     And the admin enters the "admin123" text in the "password"
#     And the admin clicks on the "login button"
#     And the admin should be navigated to the "home" page

#   Scenario: Add employee
#     Given the admin clicks on the "pim"
#     And the admin should be navigated to the "pim" page
#     And the admin clicks on the "add employee"
#     And the admin should be navigated to the "add-employee" page
#     When the admin enters the "Vishal" text in the "employee first name"
#     And the admin enters the "Krish" text in the "employee middle name"
#     And the admin enters the "Khar" text in the "employee last name"
#     And the admin clicks on the "save button"
#     Then the admin should be navigated to the "employee-details" page
