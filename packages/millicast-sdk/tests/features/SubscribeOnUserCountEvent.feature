Feature: As a user I want to subscribe to onUserCount event so I can see how many viewers are watching the stream

  Scenario: Creating new StreamEvents
    Given I want to create a new StreamEvents instance
    When I init a new StreamEvents instance
    Then the connection handshake is completed

  Scenario: Error creating new StreamEvents
    Given I want to create a new StreamEvents instance
    When I init handshake and server responds with error
    Then throws connection timeout error

  Scenario: Subscribe to onUserCount event
    Given an instanced StreamEvents and existing accountId and streamName
    When I subscribe to onUserCount event
    Then callback with count result is executed

  Scenario: Subscribe to two onUserCount events
    Given an instanced StreamEvents and existing accountId and two streamNames
    When I subscribe to onUserCount event for both streamNames
    Then both callbacks with their count results is executed

  Scenario: Receive ping from user count event
    Given I am subscribed to onUserCount with valid accountId and streamName
    When server sends ping data
    Then callback is not executed

  Scenario: Receive other target from server
    Given I am subscribed to onUserCount with valid accountId and streamName
    When server sends other target
    Then callback is not executed

  Scenario: Receive user count from different streamId
    Given I am subscribed to onUserCount with valid accountId and streamName
    When server sends user count from other streamName
    Then callback is not executed

  Scenario: Subscribe to onUserCountEvent with unexisting accountId and streamName
    Given an instanced StreamEvents and unexisting accountId and streamName
    When I subscribe to onUserCount event
    Then callback is not executed

  Scenario: Subscribe to onUserCount without init StreamEvents instance
    Given a StreamEvents instance without init and existing accountId and streamName
    When I subscribe to onUserCount event
    Then throw a not initialized error

  Scenario: Error getting view count from onUserCount event  
    Given an already subscribed StreamEvents instance
    When an error is returned by server
    Then callback with error result is executed

  Scenario: Receive user count error from different streamId
    Given I am subscribed to onUserCount with valid accountId and streamName
    When server sends error from other streamName
    Then callback is not executed

  Scenario: Close existing server connection
    Given I am connected to server
    When I want to close connection
    Then the connection closes

  Scenario: Close unexisting server connection
    Given I am disconnected from server
    When I want to close connection
    Then the connection remains closed

  Scenario: Force connection to server
    Given I am connected to server
    When I want to reconnect
    Then reconnection is ignored

  Scenario: Subscribe to onUserCount event with object param
    Given an instanced StreamEvents and existing accountId and streamName
    When I subscribe to onUserCount event passing params as an object
    Then callback with count result is executed