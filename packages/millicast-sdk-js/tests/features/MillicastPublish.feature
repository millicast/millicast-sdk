Feature: As a user I want to publish a stream without managing connections

  Scenario: Instance publisher without streamName
    Given no stream name
    When I instance a MillicastPublish
    Then throws an error

  Scenario: Broadcast without connection path
    Given an instance of MillicastPublish
    When I broadcast a stream without a connection path
    Then throws an error
  
  Scenario: Broadcast without mediaStream
    Given an instance of MillicastPublish
    When I broadcast a stream without a mediaStream
    Then throws an error

  Scenario: Broadcast to active publisher
    Given an instance of MillicastPublish already connected
    When I broadcast again to the stream
    Then throws an error

  Scenario: Stop publish
    Given I am publishing a stream
    When I stop the publish
    Then peer connection and WebSocket are null

  Scenario: Stop inactive publish
    Given I am not publishing a stream
    When I stop the publish
    Then peer connection and WebSocket are null

  Scenario: Check status of active publish
    Given I am publishing a stream
    When I check if publish is active
    Then returns true

  Scenario: Check status of inactive publish
    Given I am not publishing a stream
    When I check if publish is active
    Then returns false