Feature: As a user I want to publish a stream without managing connections

  Scenario: Instance publisher without streamName
    Given no stream name
    When I instance a Publish
    Then throws an error

  Scenario: Instance publisher without tokenGenerator
    Given no token generator
    When I instance a Publish
    Then throws an error

  Scenario: Broadcast stream
    Given an instance of Publish with connection path
    When I broadcast a stream with media stream
    Then peer connection state is connected

  Scenario: Broadcast stream default options
    Given an instance of Publish
    When I broadcast a stream without options
    Then throws an error

  Scenario: Broadcast with invalid codec
    Given an instance of Publish
    When I broadcast with unsupported codec
    Then throws an error

  Scenario: Broadcast with non-default codec
    Given an instance of Publish
    When I broadcast a stream with H265 codec
    Then peer connection state is connected    
    
  Scenario: Broadcast without connection path
    Given I want to broadcast
    When I instance a Publish with token generator without connection path
    Then throws an error
  
  Scenario: Broadcast without mediaStream
    Given an instance of Publish
    When I broadcast a stream without a mediaStream
    Then throws an error

  Scenario: Broadcast to active publisher
    Given an instance of Publish already connected
    When I broadcast again to the stream
    Then throws an error

  Scenario: Broadcast stream with bandwidth restriction
    Given an instance of Publish
    When I broadcast a stream with bandwidth restriction
    Then peer connection state is connected

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

  Scenario: Broadcast to stream with invalid token generator
    Given an instance of Publish with invalid token generator
    When I broadcast a stream
    Then throws token generator error

  Scenario: Broadcast to stream with record option but no record available from token
    Given an instance of Publish with valid token generator with no recording available
    When I broadcast a stream
    Then throws an error