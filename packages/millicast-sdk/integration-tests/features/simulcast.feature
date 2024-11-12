
Feature: Simulcast Feature

    Scenario: Publisher connects with codec <codec>, simulcast true and viewer select layers
        Given the "publisher1" opens "Publisher" app
        When the "publisher1" starts the stream with the specified options
            | codec     | <codec> |
            | simulcast | true    |
        And the "publisher1" stream should be LIVE

        When the "viewer1" opens "Viewer" app and is ready to be connected
        And the "viewer1" connects to the published stream with the specified options
            | events | layers,active |
        Then the "viewer1" connected stream should be LIVE

        When the "viewer1" selects simulcast layer with encodingId "0"
        Then the "viewer1" verifies video resolution for layer "0"

        When the "viewer1" selects simulcast layer with encodingId "1"
        Then the "viewer1" verifies video resolution for layer "1"

        When the "viewer1" selects simulcast layer with encodingId "2"
        Then the "viewer1" verifies video resolution for layer "2"

        Examples:
            | codec |
            | h264  |
            | vp8   |
