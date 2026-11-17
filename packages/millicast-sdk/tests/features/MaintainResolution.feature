Feature: As a broadcaster I want to keep a constant resolution so downstream consumers never see a mid-stream resolution change

  Scenario: Broadcast with maintainResolution enabled
    Given an instance of Publish with connection path
    When I broadcast a stream with maintainResolution enabled
    Then the video track is hinted for detail
    And the video sender prefers to maintain resolution

  Scenario: Broadcast without maintainResolution
    Given an instance of Publish with connection path
    When I broadcast a stream with media stream
    Then the video track has no content hint
    And the video sender has no degradation preference

  Scenario: Broadcast with maintainResolution enabled and an unsupported browser
    Given an instance of Publish with connection path
    And a browser that ignores the degradation preference
    When I broadcast a stream with maintainResolution enabled
    Then the broadcast is still connected
    And the video track is hinted for detail
