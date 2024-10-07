Feature: Basic Steps
  As a company admin
  I want to add new Employee in the system
  # Test Automation using the "NO CODE" approach.
  # This feature file uses the generic steps defined in the core framework (cucumber-playwright-framework).
  # Users don't have to write a single line of code to use the generic steps.
  # Core Framework: https://www.npmjs.com/package/cucumber-playwright-framework

  Scenario: Viewer Connects To Stream Before Publisher
    Given the viewer1 is on the "viewerPage" page of the "millicast-viewer-demo" app
    And the publisher1 is on the "publisherPage" page of the "millicast-publisher-demo" app
    And the publisher1 waits for "5" seconds
    When the publisher1 connects to stream with codec "<codec>"
    And publisher1 verify if connected
    And the publisher1 waits for "5" seconds
    When the viewer1 switch to the "millicast-viewer-demo" app
    Then viewer1 verify if connected
    And the viewer1 waits for "5" seconds

    Examples:
      | codec  |
      | 'h264' |
      | 'av1'  |
      | 'vp8'  |
      | 'vp9'  |

  Scenario: Publisher Connects To Stream Before Viewer
    Given the publisher1 is on the "publisherPage" page of the "millicast-publisher-demo" app
    And the publisher1 waits for "5" seconds
    When the publisher1 connects to stream with codec "<codec>"
    And publisher1 verify if connected
    And the viewer1 waits for "5" seconds
    And the viewer1 is on the "viewerPage" page of the "millicast-viewer-demo" app
    Then viewer1 verify if connected
    And the viewer1 waits for "3" seconds

    Examples:
      | codec  |
      | 'h264' |
      | 'av1'  |
      | 'vp8'  |
      | 'vp9'  |


# Scenario: Publisher Reconnects During The Stream
#   Given the publisher1 is on the "publisherPage" page of the "millicast-publisher-demo" app
#   And the publisher1 waits for "5" seconds
#   When the publisher1 connects to stream with codec "<codec>"
#   And publisher1 verify if connected
#   And the publisher1 waits for "5" seconds
#   And the viewer1 is on the "viewer" page of the "millicast-viewer-demo" app
#   And the publisher1 switch to the "millicast-publisher-demo" app
#   And the publisher1 runs the "window.millicastPublish.stop()" JavaScript function on the page
#   And the publisher1 waits for "3" seconds
#   And the publisher1 runs the "window.millicastPublish.connect()" JavaScript function on the page

# Scenario: Viewer Reconnects During The Stream
#   Given the publisher1 is on the "publisher" page of the "millicast-publisher-demo" app
#   And the publisher1 waits for "3" seconds
#   And the publisher1 runs the "window.millicastPublish.connect()" JavaScript function on the page
#   And the publisher1 waits for "3" seconds
#   And the viewer1 is on the "viewer" page of the "millicast-viewer-demo" app
#   And the viewer1 waits for "3" seconds
#   And the viewer1 runs the "window.millicastView.stop()" JavaScript function on the page
#   And the viewer1 waits for "3" seconds
#   And the viewer1 runs the "window.millicastView.connect()" JavaScript function on the page