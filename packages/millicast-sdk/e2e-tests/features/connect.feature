Feature: Connect Feature
  # Test Automation using the "NO CODE" approach.
  # This feature file uses the generic steps defined in the core framework (cucumber-playwright-framework).
  # Users don't have to write a single line of code to use the generic steps.
  # Core Framework: https://www.npmjs.com/package/cucumber-playwright-framework

  Scenario: Viewer Connects To Stream Before Publisher, <codec>
    Given the viewer1 is on the "viewerPage" page of the "millicast-viewer-demo" app
    And the publisher1 is on the "publisherPage" page of the "millicast-publisher-demo" app
    When the publisher1 connects to stream with codec "<codec>"
    And the publisher1 verify if connected
    When the viewer1 switch to the "millicast-viewer-demo" app
    Then the viewer1 verify if connected

    Examples:
      | codec  |
      | 'h264' |
      | 'av1'  |
      | 'vp8'  |
      | 'vp9'  |


  Scenario: Publisher Connects To Stream Before Viewer, <codec>
    Given the publisher1 is on the "publisherPage" page of the "millicast-publisher-demo" app
    When the publisher1 connects to stream with codec "<codec>"
    And the publisher1 verify if connected
    And the viewer1 is on the "viewerPage" page of the "millicast-viewer-demo" app
    Then the viewer1 verify if connected

    Examples:
      | codec  |
      | 'h264' |
      | 'av1'  |
      | 'vp8'  |
      | 'vp9'  |


  # Doesn't work, custom steps are not found in runStep()
  # Scenario: Viewer Reconnects During The Stream
  #   Given the publisher1 is connected and stream is live
  #   Given the viewer1 is connected and stream is live


  Scenario: Viewer Reconnects During The Stream
    Given the publisher1 is on the "publisherPage" page of the "millicast-publisher-demo" app
    Then the publisher1 connects to stream with codec "'h264'"
    And the publisher1 verify if connected
    And the viewer1 is on the "viewerPage" page of the "millicast-viewer-demo" app
    Then the viewer1 verify if connected
    And the viewer1 stops connection
    And the viewer1 verify if not connected
    Then the viewer1 connects to stream
    Then the viewer1 verify if connected


  Scenario: Publisher Reconnects During The Stream
    Given the publisher1 is on the "publisherPage" page of the "millicast-publisher-demo" app
    Then the publisher1 connects to stream with codec "'h264'"
    And the publisher1 verify if connected
    And the viewer1 is on the "viewerPage" page of the "millicast-viewer-demo" app
    Then the viewer1 verify if connected
    And the publisher1 switch to the "millicast-publisher-demo" app
    And the publisher1 stops connection
    And the publisher1 verify if not connected
    When the publisher1 connects to stream with codec "'h264'"
    And the publisher1 verify if connected
    When the viewer1 switch to the "millicast-viewer-demo" app
    Then the viewer1 verify if connected



# # Scenario: Publisher Connects with videoOnly
# # Scenario: Publisher Connects with audioOnly
# # Scenario: Publisher Connects with simulcast: true
# #   Then viewer1 verify if all layers are available
# # Scenario: Publisher Connects with sourceId defined
# # Scenario: Publisher Connects with recording enabled

