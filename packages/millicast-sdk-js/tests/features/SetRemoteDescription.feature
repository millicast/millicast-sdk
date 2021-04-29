Feature: As a user I want to set remote session description so I can start broadcasting or viewing a stream

  Scenario: Setting remote SDP to RTC peer
    Given I got the peer
    When I set the remote description
    Then the SDP is setted

  Scenario: Error setting remote SDP to RTC peer
    Given I got the peer
    When I set the remote description and peer returns an error
    Then throws an error