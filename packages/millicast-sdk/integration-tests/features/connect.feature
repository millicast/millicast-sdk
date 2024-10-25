
Feature: Connect Feature

  Scenario: Viewer connects to stream before Publisher with <codec> codec
    Given the "viewer1" opens "Viewer" app
    And the "publisher1" opens "Publisher" app
    When the "publisher1" starts the stream with the specified options
      | codec | <codec> |
    Then the "publisher1" stream should be LIVE
    And the "Logger.diagnose().subscriberId" JavaScript function result should match "^[0-9a-f]{32}$"
    And the "Logger.diagnose()" JavaScript function json result should be
      """
      {
        "version": "1.0.0",
        "subscriberId[?]match": "^[0-9a-f]{32}$",
        "connectionDurationMs[?]match": "^\\d+$",
        "feedId[?]defined": "",
        "stats[?]defined": [],
        "history[?]defined": []
      }
      """
    And the "viewer1" connected stream should be LIVE
    And the "viewer1" should be able to view media tracks for the connected stream

    Examples:
      | codec |
      | h264  |
      | av1   |
      | vp8   |
      | vp9   |

  Scenario: Publisher connects to stream before Viewer with <codec> codec
    Given the "publisher1" opens "Publisher" app
    When the "publisher1" starts the stream with the specified options
      | codec | <codec> |
    Then the "publisher1" stream should be LIVE

    When the "viewer1" opens "Viewer" app
    Then the "viewer1" connected stream should be LIVE
    And the "viewer1" should be able to view media tracks for the connected stream

    Examples:
      | codec |
      | h264  |
      | av1   |
      | vp8   |
      | vp9   |

  Scenario: Viewer reconnects during the stream
    Given the "publisher1" opens "Publisher" app
    When the "publisher1" starts the stream with the specified options
      | codec | h264 |
    Then the "publisher1" stream should be LIVE

    When the "viewer1" opens "Viewer" app
    Then the "viewer1" connected stream should be LIVE

    When the "viewer1" disconnects from the published stream
    Then the "viewer1" connected stream should be NOT LIVE

    When the "viewer1" connects to the published stream
    Then the "viewer1" connected stream should be LIVE
    Then the "viewer1" should be able to view media tracks for the connected stream

  Scenario: Publisher reconnects during the stream
    Given the "publisher1" opens "Publisher" app
    When the "publisher1" starts the stream with the specified options
      | codec | h264 |
    Then the "publisher1" stream should be LIVE

    When the "viewer1" opens "Viewer" app
    Then the "viewer1" connected stream should be LIVE

    When the "publisher1" stops the published stream
    Then the "publisher1" stream should be NOT LIVE

    When the "publisher1" starts the stream with the specified options
      | codec | h264 |
    Then the "publisher1" stream should be LIVE
    And the "viewer1" connected stream should be LIVE
    And the "viewer1" should be able to view media tracks for the connected stream

  Scenario: Publisher connects with disableVideo as <disableVideo> and disableAudio as <disableAudio> - Expected Fail: DIOS-7279
    Given the "publisher1" opens "Publisher" app
    When the "publisher1" starts the stream with the specified options
      | disableVideo | <disableVideo> |
      | disableAudio | <disableAudio> |
    And the "viewer1" opens "Viewer" app
    Then the "viewer1" connected stream should be LIVE
    And the "viewer1" should be able to view below AV state for the connected stream
      | disableVideo | <disableVideo> |
      | disableAudio | <disableAudio> |

    Examples:
      | disableVideo | disableAudio |
      | false        | false        |
      | true         | false        |
      | false        | true         |
  @only
  Scenario: Publisher tries to connect with disableVideo as true and disableAudio as true
    Given the "publisher1" opens "Publisher" app
    When the "publisher1" starts the stream with the specified options and expect to fail
      | disableVideo | true |
      | disableAudio | true |


  Scenario: Viewer Connects With disableVideo as <disableVideo> and disableAudio as <disableAudio>
    Given the "publisher1" opens "Publisher" app
    When the "publisher1" starts the stream with the specified options
      | codec | h264 |
    And the "publisher1" stream should be LIVE
    Then the "viewer1" opens "Viewer" app
    And the "viewer1" disconnects from the published stream
    And the "viewer1" connects to the published stream with the specified options
      | disableVideo | <disableVideo> |
      | disableAudio | <disableAudio> |
    Then the "viewer1" connected stream should be LIVE
    And the "viewer1" should be able to view below AV state for the connected stream
      | disableVideo | <disableVideo> |
      | disableAudio | <disableAudio> |

    Examples:
      | disableVideo | disableAudio |
      | false        | false        |
      | true         | false        |
      | false        | true         |
