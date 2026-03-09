Feature: As a user I want to publish with different video codecs

  Scenario: Publish with H264 codec
    Given an instance of Publish with token generator
    When I broadcast with codec h264
    Then the signaling publish is called with codec h264

  Scenario: Publish with VP8 codec
    Given an instance of Publish with token generator
    When I broadcast with codec vp8
    Then the signaling publish is called with codec vp8

  Scenario: Publish with VP9 codec
    Given an instance of Publish with token generator
    When I broadcast with codec vp9
    Then the signaling publish is called with codec vp9

  Scenario: Publish with AV1 codec
    Given an instance of Publish with token generator
    When I broadcast with codec av1
    Then the signaling publish is called with codec av1

  Scenario: Publish with simulcast enabled for H264
    Given an instance of Publish with token generator
    When I broadcast with codec h264 and simulcast enabled
    Then the signaling publish is called with codec h264 and simulcast

  Scenario: Publish with simulcast enabled for VP8
    Given an instance of Publish with token generator
    When I broadcast with codec vp8 and simulcast enabled
    Then the signaling publish is called with codec vp8 and simulcast

  Scenario: Publish with scalabilityMode
    Given an instance of Publish with token generator
    When I broadcast with codec h264 and scalabilityMode L3T3
    Then the signaling publish is called with scalabilityMode L3T3

  Scenario: Publish with bandwidth restriction
    Given an instance of Publish with token generator
    When I broadcast with bandwidth set to 2000
    Then the signaling publish is called with bandwidth 2000

  Scenario: Publish with priority option
    Given an instance of Publish with token generator
    When I broadcast with priority set to 10
    Then the signaling publish is called with priority 10

  Scenario: Publish with sourceId for multisource
    Given an instance of Publish with token generator
    When I broadcast with sourceId set to camera-1
    Then the signaling publish is called with sourceId camera-1
