Feature: As a user I want to manage the peer connection so I can connect to the peer

  Scenario: Get RTC peer without configuration
    Given I have no configuration
    When I get the RTC peer
    Then returns the peer
  
  Scenario: Get RTC peer again
    Given I got the peer previously
    When I get the RTC peer
    Then returns the peer

  Scenario: Get RTC peer with configuration
    Given I have configuration
    When I get the RTC peer
    Then returns the peer

  Scenario: Close existing RTC peer
    Given I have a RTC peer
    When I close the RTC peer
    Then the peer is closed and emits peerClosed event

  Scenario: Error closing existing RTC peer
    Given I have a RTC peer
    When I close the RTC peer
    Then throws an error

  Scenario: Get RTC Ice servers with custom location
    Given I have an ICE server location
    When I want to get the RTC Ice Servers
    Then returns the ICE Servers

  Scenario: Get RTC Ice servers with default location
    Given I do not have an ICE server location
    When I want to get the RTC Ice Servers
    Then returns the ICE Servers

  Scenario: Error getting RTC Ice servers
    Given I do not have an ICE server location
    When I want to get the RTC Ice Servers and server respond with error
    Then returns empty ICE Servers

  Scenario: Setting remote SDP to RTC peer
    Given I got the peer
    When I set the remote description
    Then the SDP is setted

  Scenario: Error setting remote SDP to RTC peer
    Given I got the peer
    When I set the remote description and peer returns an error
    Then throws an error

#getRTCLocalSDP