Feature: As a user I want to configure layer selection when viewing a stream

  Scenario: Connect with specific layer selection
    Given an instance of View with token generator
    When I connect with layer encodingId h and spatialLayerId 1 and temporalLayerId 2
    Then the signaling subscribe is called with the layer configuration

  Scenario: Connect with max layer constraints
    Given an instance of View with token generator
    When I connect with layer maxSpatialLayerId 2 and maxTemporalLayerId 3
    Then the signaling subscribe is called with max layer constraints

  Scenario: Connect with pinnedSourceId
    Given an instance of View with token generator
    When I connect with pinnedSourceId set to source-123
    Then the signaling subscribe is called with pinnedSourceId source-123

  Scenario: Connect with excludedSourceIds
    Given an instance of View with token generator
    When I connect with excludedSourceIds containing source-a and source-b
    Then the signaling subscribe is called with excludedSourceIds array

  Scenario: Connect with forcePlayoutDelay
    Given an instance of View with token generator
    When I connect with forcePlayoutDelay min 50 and max 200
    Then the signaling subscribe is called with forcePlayoutDelay configuration

  Scenario: Connect with disableVideo
    Given an instance of View with token generator
    When I connect with disableVideo set to true
    Then the signaling subscribe is called with disableVideo true

  Scenario: Connect with disableAudio
    Given an instance of View with token generator
    When I connect with disableAudio set to true
    Then the signaling subscribe is called with disableAudio true

