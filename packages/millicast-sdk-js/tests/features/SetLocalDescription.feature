Feature: As a user I want to set my local session description so I can broadcast or view a stream

 Scenario: Get RTC Local SDP as subscriber role
    Given I do not have options
    When I want to get the RTC Local SDP
    Then returns the SDP

  Scenario: Get RTC Local SDP as publisher role with valid MediaStream
    Given I have a MediaStream with 1 audio track and 1 video track and I want support stereo
    When I want to get the RTC Local SDP
    Then returns the SDP

  Scenario: Get RTC Local SDP as publisher role with invalid MediaStream
    Given I have a MediaStream with 2 video tracks and no audio track
    When I want to get the RTC Local SDP
    Then throw invalid MediaStream error

  Scenario: Get RTC Local SDP as publisher role with valid list of tracks
    Given I have a list of tracks with 1 audio track and 1 video track
    When I want to get the RTC Local SDP
    Then returns the SDP

  Scenario: Get RTC Local SDP as publisher role with invalid list of tracks
    Given I have a list of tracks with 3 audio tracks and 1 video track
    When I want to get the RTC Local SDP
    Then throw invalid MediaStream error