Feature: As a user I want to set my local session description so I can broadcast or view a stream

 Scenario: Get RTC Local SDP as subscriber role
    Given I do not have options
    When I want to get the RTC Local SDP
    Then returns the SDP

 Scenario: Get RTC Local SDP without video as subscriber role
    Given I want local SDP without video
    When I want to get the RTC Local SDP
    Then returns the SDP

 Scenario: Get RTC Local SDP without audio as subscriber role
    Given I want local SDP without audio
    When I want to get the RTC Local SDP
    Then returns the SDP

  Scenario: Get RTC Local SDP as publisher role with valid MediaStream
    Given I have a MediaStream with 1 audio track and 1 video track and I want support stereo
    When I want to get the RTC Local SDP
    Then returns the SDP

  Scenario: Get RTC Local SDP as publisher role without video
    Given I have a MediaStream with 1 audio track and 1 video track
    When I want to get the RTC Local SDP without video
    Then returns the SDP

  Scenario: Get RTC Local SDP as publisher role without audio
    Given I have a MediaStream with 1 audio track and 1 video track
    When I want to get the RTC Local SDP without audio
    Then returns the SDP

  Scenario: Get RTC Local SDP as publisher role with simulcast and valid MediaStream
    Given I have a MediaStream with 1 audio track and 1 video track and I want support simulcast
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

  Scenario: Get RTC Local SDP with scalability mode, valid MediaStream and using Chrome
    Given I am using Chrome and I have a MediaStream with 1 audio track and 1 video track and I want to support L1T3 mode
    When I want to get the RTC Local SDP
    Then returns the SDP with scalability mode

  Scenario: Get RTC Local SDP with scalability mode, valid MediaStream and using Firefox
    Given I am using Firefox and I have a MediaStream with 1 audio track and 1 video track and I want to support L1T3 mode
    When I want to get the RTC Local SDP
    Then returns the SDP without scalability mode