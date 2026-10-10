Feature: As a user I want to change a media track so I can change one of them while I'm broadcasting

  Scenario: Replace track to existing peer
    Given I have a peer connected
    When I want to change current audio track
    Then the track is changed

  Scenario: Replace track to unexisting peer
    Given I do not have a peer connected
    When I want to change the audio track
    Then the track is not changed

  Scenario: Replace unexisting track to peer
    Given I have a peer connected with video track
    When I want to change the audio track
    Then the track is not changed

  Scenario: Replace track keeps the content hint of the track it replaces
    Given I have a peer connected with a hinted video track
    When I want to change current video track
    Then the new track keeps the content hint

  Scenario: Replace track does not override an explicit content hint
    Given I have a peer connected with a hinted video track
    When I want to change current video track for one that is hinted for motion
    Then the new track keeps its own content hint
