Feature: As a user I want to publish/subscribe to a Millicast Stream so I can get a connection path

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

  Scenario: Subscribe to an existing unrestricted stream, valid accountId and no token
    Given I have an existing stream name, accountId and no token
    When I request a connection path to Director API
    Then I get the subscriber connection path

  Scenario: Subscribe to an existing restricted stream and valid token
    Given I have an existing stream name and valid token
    When I request a connection path to Director API
    Then I get the subscriber connection path

  Scenario: Subscribe to an existing unrestricted stream, invalid accountId and no token
    Given I have an existing stream name, invalid accountId and no token
    When I request a connection path to Director API
    Then throws an error with "stream not found" message