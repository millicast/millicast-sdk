Feature: As a user I want to subscribe to a Millicast Stream so I can get a connection path

  Scenario: Subscribe to an existing unrestricted stream, valid accountId and no token
    Given I have an existing stream name, accountId and no token
    When I request a connection path to Director API
    Then I get the subscriber connection path

  Scenario: Subscribe to an existing unrestricted stream, invalid accountId and no token
    Given I have an existing stream name, invalid accountId and no token
    When I request a connection path to Director API
    Then throws an error with "stream not found" message

  Scenario: Subscribe to an existing stream using other API Endpoint
    Given I have an existing stream name, accountId and no token
    When I request a connection path to Director API
    Then I get the subscriber connection path

  Scenario: Subscribe to an existing unrestricted stream, valid accountId, no token and options as object
    Given I have an existing stream name, accountId and no token
    When I request a connection path to Director API using options object
    Then I get the subscriber connection path

  Scenario: Subscribe to an existing stream, valid accountId, no token and custom live websocket domain
    Given I have an existing stream name, accountId and no token
    When I set a custom live websocket domain and I request a connection path to Director API
    Then I get the subscriber connection path
