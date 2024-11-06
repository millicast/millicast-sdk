
Feature: Simulcast Feature
    @only
    Scenario: Publisher connects with simulcast and viewer subscribes to layers event
        Given the "publisher1" opens "Publisher" app
        When the "publisher1" starts the stream with the specified options
            | codec     | h264 |
            | simulcast | true |
        And the "publisher1" stream should be LIVE

        When the "viewer1" opens "Viewer" app and is ready to be connected
        And the "viewer1" connects to the published stream with the specified options
            | events | layers,active |
        Then the "viewer1" connected stream should be LIVE

        When the "viewer1" selects simulcast layer with encodingId "l"
        Then the "viewer1" verifies video resolution for layer "l"

        When the "viewer1" selects simulcast layer with encodingId "m"
        Then the "viewer1" verifies video resolution for layer "m"

        When the "viewer1" selects simulcast layer with encodingId "h"
        Then the "viewer1" verifies video resolution for layer "h"
