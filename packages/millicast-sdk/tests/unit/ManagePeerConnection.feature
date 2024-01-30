Feature: As a user I want to manage the peer connection so I can initialize a WebRTC connection

  Scenario: Get RTC peer without configuration
    Given I have no configuration
    When I get the RTC peer
    Then returns the peer

  Scenario: Get RTC peer without instance previously
    Given I have no configuration
    When I get the RTC peer without instance first
    Then returns null

  Scenario: Get RTC peer with configuration
    Given I have configuration
    When I get the RTC peer
    Then returns the peer

  Scenario: Close existing RTC peer
    Given I have a RTC peer
    When I close the RTC peer
    Then the peer is closed and emits connectionStateChange event