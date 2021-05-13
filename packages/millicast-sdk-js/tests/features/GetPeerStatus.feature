Feature: As a user I want to get the status so I can know the peer status

  Scenario: Get existing RTC peer status
    Given I have a peer instanced
    When I want to get the peer connection state
    Then returns the connection state

  Scenario: Get unexisting RTC peer status
    Given I do not have a peer connected
    When I want to get the peer connection state
    Then returns no value

  Scenario: Get existing RTC peer status without connectionState
    Given I have a peer instanced without connectionState
    When I want to get the peer connection state
    Then returns the connection state