Feature: As a developer I want to publish a stream so i can ensure its working correctly

  Scenario Outline: Broadcasting stream
    Given a page with view options and a page with broadcaster options and codec <Codec>
    When I broadcast a stream and connect to stream as viewer
    Then broadcast is active and Viewer receive video data

    Examples:
    | Codec |
    | h264  |
    | vp8   |
    | vp9   |
    | av1   |
