Feature: Connect Feature

  @only
  Scenario: Viewer Connects To Stream Before Publisher with <codec> codec
    Given the "viewer1" opens "Viewer" app
    And the "publisher1" opens "Publisher" app
    When the "publisher1" starts the stream with the specified options
      | codec | <codec> |
    Then the "publisher1" stream should be LIVE
    And the "viewer1" connected stream should be LIVE
    And the "viewer1" should be able to view media tracks for the connected stream

    Examples:
      | codec |
      | h264  |
      | av1   |
      | vp8   |
      | vp9   |

  @only
  Scenario: Publisher Connects To Stream Before Viewer with <codec> codec
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


  @only
  Scenario: Viewer Reconnects During The Stream
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


  Scenario: Publisher Reconnects During The Stream
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


  Scenario: EXPECTED FAIL - Publisher Connects With disableVideo: <disableVideo>, disableAudio: <disableAudio>
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


  Scenario: Viewer Connects With disableVideo: <disableVideo>, disableAudio: <disableAudio>
    Given the "publisher1" opens "Publisher" app
    When the "publisher1" starts the stream with the specified options
      | codec | h264 |
    And the "publisher1" stream should be LIVE
    And the viewer1 is on the "viewerPage" page of the "Viewer" app
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


# Doesn't work, custom steps are not found in runStep()
Scenario: Viewer Reconnects During The Stream
  Given the "publisher1" starts the stream and should be LIVE
  Given the "viewer1" connects to the published stream and should be LIVE

# Scenario: Publisher Connects with simulcast: true
#   Then viewer1 verify if all layers are available
# Scenario: Publisher Connects with sourceId defined
# Scenario: Publisher Connects with recording enabled