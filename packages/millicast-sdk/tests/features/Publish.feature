Feature: As a user I want to publish a stream without managing connections

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

  Scenario: Broadcast while a connection is in progress
    Given an instance of Publish with a connection in progress
    When I broadcast again to the stream
    Then throws a connection in progress error and only one token is requested

  Scenario: Stop broadcast while publishing
    Given an instance of Publish waiting for the publish response
    When I stop the broadcast
    Then the connection is cancelled and the WebSocket is closed
    And I can broadcast again

  Scenario: Broadcast with metadata fails after the worker is created
    Given an instance of Publish whose publish request fails
    When I broadcast a stream with metadata
    Then the connection fails and the metadata worker is terminated

  Scenario: Broadcast again with metadata to an active stream
    Given an instance of Publish already connected with metadata
    When I broadcast again to the stream with metadata
    Then the connection fails and the metadata worker is kept
