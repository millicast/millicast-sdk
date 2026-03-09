Feature: Reconnection edge cases
  As a developer using the SDK
  I want robust reconnection handling
  So that streams recover from various failure scenarios

  Scenario: Publisher reconnection with token refresh
    Given an instance of Publish with reconnection enabled
    When the connection fails due to signaling error
    Then reconnect should be triggered

  Scenario: Publisher reconnection triggered by signaling error
    Given an instance of Publish with reconnection enabled
    When signaling emits connection error
    Then reconnect should be called

  Scenario: Publisher reconnection during stop
    Given an instance of Publish that is reconnecting
    When stop is called during reconnection
    Then reconnection should be cancelled

  Scenario: Viewer reconnection during stop
    Given an instance of View that is reconnecting
    When stop is called during reconnection
    Then reconnection should be cancelled
