Feature: As a user I want to get the peer so I can use it

  Scenario: Get existing RTC peer
    Given I have a BaseWebRTC instanced and existing peer
    When I want to get the peer
    Then returns the peer

  Scenario: Get no existing RTC peer
    Given I have a BaseWebRTC instanced and no existing peer
    When I want to get the peer
    Then returns null
