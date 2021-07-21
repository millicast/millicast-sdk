Feature: As a user I want to publish to a Millicast Stream so I can get a connection path

  Scenario: Publish with an existing stream name and valid token
    Given I have a valid token and an existing stream name
    When I request a connection path to Director API
    Then I get the publish connection path

  Scenario: Publish with an unexisting stream name and valid token
    Given I have a valid token and an unexisting stream name
    When I request a connection path to Director API
    Then throws an error with "invalid stream name" message

  Scenario: Publish with an existing stream name and invalid token
    Given I have an invalid token and an existing stream name
    When I request a connection path to Director API
    Then throws an error with "invalid token" message

  Scenario: Publish with an existing stream name and valid token using other API Endpoint
    Given I have a valid token and an existing stream name
    When I request a connection path to Director API
    Then I get the publish connection path

  Scenario: Publish with an existing stream name, valid token and options as object
    Given I have a valid token and an existing stream name
    When I request a connection path to Director API using options object
    Then I get the publish connection path