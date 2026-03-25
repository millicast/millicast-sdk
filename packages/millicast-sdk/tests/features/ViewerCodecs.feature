Feature: Viewer codec selection
  As a viewer using the SDK
  I want to connect with different codec preferences
  So that I can optimize playback for my use case

  Scenario: View stream with default codec
    Given a browser with Millicast SDK loaded
    When I create a View instance
    Then the View instance should be created successfully

  Scenario: View stream with H264 codec preference
    Given a browser with Millicast SDK loaded
    When I create a View instance with codec h264
    Then the View instance should have codec option set

  Scenario: View stream with VP8 codec preference
    Given a browser with Millicast SDK loaded
    When I create a View instance with codec vp8
    Then the View instance should have codec option set

  Scenario: View stream with VP9 codec preference
    Given a browser with Millicast SDK loaded
    When I create a View instance with codec vp9
    Then the View instance should have codec option set
