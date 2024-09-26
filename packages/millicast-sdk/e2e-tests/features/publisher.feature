Feature: Add Employee - Basic Steps
  As a company admin
  I want to add new Employee in the system
  # Test Automation using the "NO CODE" approach.
  # This feature file uses the generic steps defined in the core framework (cucumber-playwright-framework).
  # Users don't have to write a single line of code to use the generic steps.
  # Core Framework: https://www.npmjs.com/package/cucumber-playwright-framework

  @only
  Scenario: Publisher Start App
    Given the publisher1 is on the "publisher" page of the "millicast-publisher-demo" app
    And the viewer1 is on the "viewer" page of the "millicast-viewer-demo" app
    When the publisher1 switch to the "millicast-publisher-demo" app
    And the publisher1 clicks on the "publish button"
    And the publisher1 waits for "15" seconds
    And the publisher1 runs the "window.millicastPublish.connect()" JavaScript function on the page