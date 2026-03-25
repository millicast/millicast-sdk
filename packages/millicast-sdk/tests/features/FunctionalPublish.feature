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

  Scenario: Stats events arrive periodically
    Given a broadcaster and a viewer session
    Then both clients receive stats events from the SDK

  Scenario: Metadata works for h264
    Given a broadcaster using h264 and a viewer
    When the publisher sends a metadata payload
    Then the viewer receives the matching metadata event

  Scenario Outline: Simulcast layer generation
    Given a broadcaster with simulcast enabled and codec <Codec>
    When the stream is active
    Then the publisher reports multiple active simulcast layers

    Examples:
    | Codec |
    | h264  |
    | vp8   |
