Feature: As a developer I want to test ABR strategies to ensure viewers receive optimal quality

  Scenario Outline: Viewer connects with ABR strategy
    Given a broadcaster streaming with h264 codec
    And a viewer page ready to connect
    When the viewer connects with abrConfiguration strategy <Strategy>
    Then the viewer receives video data
    And the connection is stable

    Examples:
    | Strategy    |
    | quality     |
    | bandwidth   |
    | performance |

  Scenario: Viewer connects with ABR strategy and initial bitrate
    Given a broadcaster streaming with h264 codec
    And a viewer page ready to connect
    When the viewer connects with abrConfiguration strategy quality and bitrate 1500000
    Then the viewer receives video data
    And the connection is stable

  Scenario: Viewer layer switching with ABR
    Given a broadcaster streaming with h264 codec and simulcast enabled
    And a viewer connected with abrConfiguration strategy bandwidth
    When the viewer requests a specific layer
    Then the viewer receives the requested layer quality
