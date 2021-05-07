Feature: As a user I want to subscribe to a stream without managing connections

  Scenario: Instance viewer without streamName
    Given no stream name
    When I instance a MillicastViewer
    Then throws an error

  Scenario: Subscribe to stream
    Given an instance of MillicastViewer
    When I subscribe to a stream with a connection path
    Then peer connection state is connected

  Scenario: Connect subscriber without connection path
    Given an instance of MillicastViewer
    When I connect to stream without a connection path
    Then throws an error
  
  Scenario: Connect subscriber already connected
    Given an instance of MillicastViewer already connected
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