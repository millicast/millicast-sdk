Feature: As a developer i want to run Jest with Puppeteer so i can test it

  Scenario: Load example page with Puppeteer
    Given i have a browser opened
    When i open a new page and go to the example web
    Then the web page title says "MillicastJest"

  Scenario: Millicast SDK loaded
    Given i have a browser opened and an example page with the Millicast SDK
    When i ask the "millicast" module
    Then returns an instance of "millicast"