Feature: As a user I want to set multiopus in my SDP so I can offer surround to my peer

  Scenario: Set multiopus in Chrome
    Given I have a sdp and I am using Chrome
    When I want to set multiopus
    Then returns the sdp with multiopus updated

  Scenario: Set multiopus in iOS Chrome
    Given I have a sdp and I am using iOS Chrome
    When I want to set multiopus
    Then returns the sdp without multiopus

  Scenario: Set multiopus in Firefox
    Given I have a sdp and I am using Firefox
    When I want to set multiopus
    Then returns the sdp without multiopus