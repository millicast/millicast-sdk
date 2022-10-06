Feature: As a user I want to set multiopus in my SDP so I can offer surround to my peer

  Scenario: Set multiopus in Chrome and multichannel media stream
    Given I have a sdp and I am using Chrome
    When I want to set multiopus with multichannel media stream
    Then returns the sdp with multiopus updated

  Scenario: Set multiopus in Chrome and monochannel media stream
    Given I have a sdp and I am using Chrome
    When I want to set multiopus with monochannel media stream
    Then returns the sdp without multiopus
  
  Scenario: Set multiopus in Chrome and no media stream
    Given I have a sdp and I am using Chrome
    When I want to set multiopus with no media stream
    Then returns the sdp with multiopus updated

  Scenario: Set multiopus again in Chrome
    Given I have a sdp with multiopus I am using Chrome
    When I want to set multiopus
    Then returns the same sdp

  Scenario: Set multiopus in iOS Chrome
    Given I have a sdp and I am using iOS Chrome
    When I want to set multiopus
    Then returns the sdp with multiopus updated

  Scenario: Set multiopus in Firefox
    Given I have a sdp and I am using Firefox
    When I want to set multiopus
    Then returns the sdp without multiopus