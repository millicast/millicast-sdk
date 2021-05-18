Feature: As a developer I want to publish a stream so i can ensure its working correctly

  Scenario: Broadcast h264 stream
    Given a page with broadcaster options and a page with view options
    When I broadcast a stream with h264 codec and connect to stream as viewer
    Then broadcast is active and Viewer receive video data

  Scenario: Broadcast vp8 stream
    Given a page with broadcaster options and a page with view options
    When I broadcast a stream with vp8 codec and connect to stream as viewer
    Then broadcast is active and Viewer receive video data

  Scenario: Broadcast vp9 stream
    Given a page with broadcaster options and a page with view options
    When I broadcast a stream with vp9 codec and connect to stream as viewer
    Then broadcast is active and Viewer receive video data

  Scenario: Broadcast av1 stream
    Given a page with broadcaster options and a page with view options
    When I broadcast a stream with av1 codec and connect to stream as viewer
    Then broadcast is active and Viewer receive video data