Feature: As a user I want to configure ABR strategies when viewing a stream

  Scenario: Connect with quality ABR strategy
    Given an instance of View with token generator
    When I connect with abrConfiguration strategy set to quality
    Then the signaling subscribe is called with abr strategy quality

  Scenario: Connect with bandwidth ABR strategy
    Given an instance of View with token generator
    When I connect with abrConfiguration strategy set to bandwidth
    Then the signaling subscribe is called with abr strategy bandwidth

  Scenario: Connect with performance ABR strategy
    Given an instance of View with token generator
    When I connect with abrConfiguration strategy set to performance
    Then the signaling subscribe is called with abr strategy performance

  Scenario: Connect with ABR strategy and initial bitrate
    Given an instance of View with token generator
    When I connect with abrConfiguration strategy quality and bitrate 2000000
    Then the signaling subscribe is called with abr strategy quality and metadata bitrate 2000000

  Scenario: Connect with ABR strategy and zero bitrate
    Given an instance of View with token generator
    When I connect with abrConfiguration strategy bandwidth and bitrate 0
    Then the signaling subscribe is called with abr strategy bandwidth and metadata bitrate 0

  Scenario: Connect with invalid negative bitrate
    Given an instance of View with token generator
    When I connect with abrConfiguration with negative bitrate -1000
    Then throws an error with message containing Invalid bitrate

  Scenario: Connect without ABR configuration
    Given an instance of View with token generator
    When I connect without abrConfiguration
    Then the signaling subscribe is called without abr configuration

  Scenario: Connect with forceSmooth enabled
    Given an instance of View with token generator
    When I connect with forceSmooth enabled
    Then the signaling subscribe is called with forceSmooth in abr

  Scenario: Connect with ABR strategy and forceSmooth combined
    Given an instance of View with token generator
    When I connect with abrConfiguration strategy quality and forceSmooth enabled
    Then the signaling subscribe is called with abr strategy quality and forceSmooth
