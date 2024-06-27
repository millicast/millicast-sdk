Feature: As a user I want to set simulcast in my SDP so I can offer simulcast to my peer

  Scenario: Set simulcast in Chrome and h264 codec
    Given I am using Chrome, h264 codec and valid sdp
    When I want to set simulcast
    Then returns the sdp with simulcast updated

  Scenario: Set simulcast in Firefox and h264 codec
    Given I am using Firefox, h264 codec and valid sdp
    When I want to set simulcast
    Then returns the sdp without simulcast

  Scenario: Set simulcast in Chrome and vp9 codec
    Given I am using Chrome, vp9 codec and valid sdp
    When I want to set simulcast
    Then returns the sdp without simulcast
  
  Scenario: Set simulcast in Chrome, h264 codec and no video in sdp
    Given I am using Chrome, h264 codec and no video in sdp
    When I want to set simulcast
    Then throws an error