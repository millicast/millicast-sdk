Feature: As a user I want to get ICE server so I can configure a peer connection correctly

  Scenario: Get RTC Ice servers with custom location
    Given I have an ICE server location
    When I want to get the RTC Ice Servers
    Then returns the ICE Servers

  Scenario: Get RTC Ice servers with default location
    Given I do not have an ICE server location
    When I want to get the RTC Ice Servers
    Then returns the ICE Servers

  Scenario: Get RTC Ice servers with different format
    Given I do not have an ICE server location
    When I want to get the RTC Ice Servers and server returns urls instead url
    Then returns the ICE Servers

  Scenario: Error getting RTC Ice servers
    Given I do not have an ICE server location
    When I want to get the RTC Ice Servers and server responds with error
    Then returns empty ICE Servers

  Scenario: Error sending request for get RTC Ice servers
    Given I do not have an ICE server location
    When I want to get the RTC Ice Servers and server responds with 500 error
    Then returns empty ICE Servers
