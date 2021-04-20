Feature: As a user I want to get log history of my session so I can get details from my current session

  Scenario: Get history with logger turned OFF
    Given I set logger level at OFF
    When I log a message at INFO level
    Then I get this message from history

  Scenario: Get history when log 5 messages
    Given I have no previous logs and history max size is 5
    When I log 5 messages at INFO level
    Then I get those messages from history

  Scenario: Get history when log more than 5 messages
    Given I have no previous logs and history max size is 5
    When I log 6 messages at INFO level
    Then I get the last 5 messages from history

  Scenario: Disable history with no previous logs
    Given I have no previous logs and history max size is 0
    When I log a message at INFO level
    Then log history is empty

  Scenario: Disable history with previous logs
    Given I have one previous log message and history max size is 5
    When I set history max size to 0 and I log a message at INFO level
    Then log history is empty

  Scenario: Change max size after logs some messages
    Given I have 5 previous log messages and history max size is 5
    When I set history max size to 6 and I log a message at ERROR level
    Then I get all log messages from history

  Scenario: Get current max history size
    Given history max size is 5
    When I get current history max size
    Then returns 5
