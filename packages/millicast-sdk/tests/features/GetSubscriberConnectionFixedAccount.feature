Feature: As a user I want to subscribe to a Millicast Stream with a static account ID so I can get a connection path

  Scenario: Subscribe to an existing stream, static accountId and no token
    Given I have an existing stream name, no token and a static account ID configured
    When I set a custom live websocket domain and I request a connection path to Director API
    Then I get the subscriber connection path