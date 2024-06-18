Feature: As a user I want to change max bitrate of a stream so I can adapt my stream to users with lower bandwidth

  Scenario: Update bitrate with restrictions
    Given I have a peer connected
    When I want to update the bitrate to 1000 kbps
    Then the bitrate is updated

  Scenario: Update bitrate with no restrictions
    Given I have a peer connected
    When I want to update the bitrate to unlimited
    Then the bitrate is updated

  Scenario: Update bitrate with restrictions in Firefox
    Given I am using Firefox and I have a peer connected
    When I want to update the bitrate to 1000 kbps
    Then the bitrate is updated

  Scenario: Update bitrate with no existing peer
    Given I do not have a peer connected
    When I want to update the bitrate to 1000 kbps
    Then throw no existing peer error

  Scenario: Check update bitrate throws exception when in Viewer mode
    Given I have a peer connected as a viewer
    When I want to update the bitrate to 1000 kbps
    Then I get an exception