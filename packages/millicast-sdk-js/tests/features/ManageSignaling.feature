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

  Scenario: Receive broadcast events from server
    Given I am connected to server
    When the server send a broadcast event
    Then fires a broadcastEvent event

  Scenario: Close existing server connection
    Given I am connected to server
    When I want to close connection
    Then the connection closes and fires a connectionClose event

  Scenario: Close unexisting server connection
    Given I am not connected to server
    When I want to close connection
    Then websocket is not intitialized