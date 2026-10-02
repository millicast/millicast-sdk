Feature: As a user I want to subscribe to a stream without managing connections

  Scenario: Instance viewer without tokenGenerator
    Given no token generator
    When I instance a View
    Then throws an error

  Scenario: Subscribe to stream
    Given an instance of View
    When I subscribe to a stream with a connection path
    Then peer connection state is connected

  Scenario: Connect subscriber without connection path
    Given I want to subscribe
    When I instance a View with a token generator without connection path
    Then throws an error
  
  Scenario: Connect subscriber already connected
    Given an instance of View already connected
    When I connect again to the stream
    Then throws an error

  Scenario: Stop subscription
    Given I am subscribed to a stream
    When I stop the subscription
    Then peer connection and WebSocket are null

  Scenario: Stop inactive subscription
    Given I am not connected to a stream
    When I stop the subscription
    Then peer connection and WebSocket are null

  Scenario: Check status of active subscription
    Given I am subscribed to a stream
    When I check if subscription is active
    Then returns true

  Scenario: Check status of inactive subscription
    Given I am not subscribed to a stream
    When I check if subscription is active
    Then returns false

  Scenario: Subscribe to stream with invalid token generator
    Given an instance of View with invalid token generator
    When I subscribe to a stream
    Then throws token generator error

  Scenario: Connect subscriber while a connection is in progress
    Given an instance of View with a connection in progress
    When I connect again to the stream
    Then throws a connection in progress error and only one token is requested

  Scenario: Connect subscriber while the peer connection is still connecting
    Given an instance of View whose peer connection is still connecting
    When I connect again to the stream
    Then throws a connection in progress error

  Scenario: Stop subscription while requesting a token
    Given an instance of View waiting for a token
    When I stop the subscription
    Then the connection is cancelled without creating a signaling connection
    And I can connect again

  Scenario: Stop subscription while subscribing
    Given an instance of View waiting for the subscribe response
    When I stop the subscription
    Then the connection is cancelled and the WebSocket is closed
    And I can connect again
