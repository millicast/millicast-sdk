
Feature: Multi-source feature

    Scenario: Publisher streams with specified sourceId and Viewer projects media
        Given the "publisher1" opens "Publisher" app
        When the "publisher1" starts the stream with the specified options
            | codec    | h264 |
            | sourceId | CAM1 |
        And the "publisher1" stream should be LIVE

        When the "viewer1" opens "Viewer" app
        And the "viewer1" connected stream should be LIVE
        And the "viewer1" projects sourceId "CAM1"

        Then the "viewer1" should be able to view media tracks for the connected stream

    Scenario: Two Publishers Connect With Different Source ID, Viewer Can Project Each Source
        Given the "publisher1" opens "Publisher" app
        When the "publisher1" starts the stream with the specified options
            | codec    | h264 |
        And the "publisher1" stream should be LIVE

        And the "publisher2" opens "Publisher" app
        When the "publisher2" starts the stream with the specified options
            | codec    | h264 |
            | sourceId | CAM1 |
        And the "publisher2" stream should be LIVE

        When the "viewer1" opens "Viewer" app
        And the "viewer1" connected stream should be LIVE
        And the "viewer1" projects sourceId "CAM1"

        Then the "viewer1" should be able to view media tracks for the connected stream

