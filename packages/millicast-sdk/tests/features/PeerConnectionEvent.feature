Feature: As a user I want to listen to peer connection events so I can take actions when they are fired

  Scenario: Receive new track from peer
    Given I have a peer connected
    When peer returns new track
    Then track event is fired

  Scenario: Get connecting status from peer
    Given I have a peer
    When peer starts to connect
    Then connectionStateChange event is fired

  Scenario: Get connected status from peer
    Given I have a peer
    When peer connects
    Then connectionStateChange event is fired

  Scenario: Get disconnected status from peer
    Given I have a peer connected
    When peer disconnects
    Then connectionStateChange event is fired

  Scenario: Get failed status from peer
    Given I have a peer connected
    When peer have a connection error
    Then connectionStateChange event is fired

  Scenario: Get new status from peer without connectionState
    Given I have a peer without connectionState
    When peer is instanced
    Then connectionStateChange event is fired

  Scenario: Apply degradation preference successfully
    Given I have a peer connected with video track
    When I apply maintain-resolution degradation preference
    Then degradation preference is set successfully

  Scenario: Apply degradation preference with invalid option
    Given I have a peer connected with video track
    When I apply invalid degradation preference
    Then degradation preference is not applied

  Scenario: Apply degradation preference without video track
    Given I have a peer connected without video track
    When I apply degradation preference
    Then degradation preference is not applied

  Scenario: Apply degradation preference with undefined value
    Given I have a peer connected with video track
    When I apply undefined degradation preference
    Then degradation preference is not applied

  Scenario: Apply degradation preference fails with error
    Given I have a peer connected with video track
    When I apply degradation preference and it fails
    Then error is thrown

  Scenario: Apply all valid degradation preferences
    Given I have a peer connected with video track
    When I apply each valid degradation preference
    Then all degradation preferences are applied successfully
