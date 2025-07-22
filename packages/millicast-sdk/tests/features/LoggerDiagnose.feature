Feature: As a user I want to get relevant information of the connection to the server

  Scenario: Get information with failed connection
    Given connection has failed
    When I call Logger diagnose function
    Then console logs an information object

  Scenario: Get information while viewing a stream 
    Given connection to a stream
    When I call Logger diagnose function
    Then console logs an information object

  Scenario: Get information while viewing a stream with stats
    Given connection to a stream and stats enabled
    When I call Logger diagnose function
    Then console logs an information object with stats attribute not empty
  
  Scenario: Get information in another browser
    Given I am in Firefox and start a connection to a stream
    When I call Logger diagnose function
    Then console logs an information object with Firefox's userAgent

  Scenario: Get information while publishing a stream 
    Given a stream being published
    When I call Logger diagnose function
    Then console logs an information object

  Scenario: Get information while failing to publish a stream
    Given a stream cannot be published
    When I call Logger diagnose function
    Then console logs an information object
