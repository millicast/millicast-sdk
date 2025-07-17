Feature: As a developer I want to manage signaling to Millicast Server so I can manage connection

  Scenario: Connect to existing server with no errors
    Given I have no previous connection to server
    When I want to connect to server
    Then returns the WebSocket connection and fires a connectionSuccess event

  Scenario: Connect again to existing server with no errors
    Given I have a previous connection to server
    When I want to connect to server
    Then returns the WebSocket connection and fires a connectionSuccess event

  Scenario: Connect to existing server with network errors
    Given I have no previous connection to server
    When I want to connect to no responding server
    Then fires a connectionError event

  Scenario: Receive active event from server
    Given I am connected to server
    When the server send an active event
    Then fires an active event

  Scenario: Receive inactive event from server
    Given I am connected to server
    When the server send an inactive event
    Then fires an inactive event

  Scenario: Receive viewercount event from server
    Given I am connected to server
    When the server send an viewercount event
    Then fires an viewercount event

  Scenario: Receive migrate event from server
    Given I am connected to server
    When the server send an migrate event
    Then fires an migrate event

  Scenario: Receive updated event from server
    Given I am connected to server
    When the server send an updated event
    Then fires an updated event

  Scenario: Receive stopped event from server
    Given I am connected to server
    When the server send an stopped event
    Then fires an stopped event

  Scenario: Receive vad event from server
    Given I am connected to server
    When the server send an vad event
    Then fires an vad event

  Scenario: Receive layers event from server
    Given I am connected to server
    When the server send an layers event
    Then fires an layers event

  Scenario: Close existing server connection
    Given I am connected to server
    When I want to close connection
    Then the connection closes

  Scenario: Close unexisting server connection
    Given I am not connected to server
    When I want to close connection
    Then websocket is not intitialized