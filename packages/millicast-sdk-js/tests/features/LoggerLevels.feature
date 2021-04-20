Feature: As a user I want to log messages in different levels so I can group messages by type

  Scenario: Set global level to INFO
    Given global level is OFF
    When I set global level to INFO
    Then new level is INFO

  Scenario: Set global level to INFO with named logger
    Given global level is OFF and I have a named logger
    When I set global level to INFO
    Then global and named logger level are at INFO
  
  Scenario: Set level of named logger
    Given global level is OFF and I have a named logger
    When I set named logger level to INFO
    Then global level is OFF and named logger level is INFO

  Scenario: Get named logger already created
    Given I have a named logger
    When I get a named logger with same name
    Then returns the same named logger
  
  Scenario: Log message at logger level
    Given global level is INFO
    When I log a message at INFO
    Then a message is logged in console