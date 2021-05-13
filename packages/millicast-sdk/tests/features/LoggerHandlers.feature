Feature: As a user I want to set a custom handler so I can resend logs to my own monitor system
  
  Scenario: Gets messages from same level
    Given I set a custom handler at INFO level
    When I log a message at INFO level
    Then I receive this message in handler
  
  Scenario: Gets messages from lower level
    Given I set a custom handler at INFO level
    When I log a message at DEBUG level
    Then custom handler does not receive any message
  
  Scenario: Gets messages from higher level
    Given I set a custom handler at INFO level
    When I log a message at ERROR level
    Then I receive this message in handler
  
  Scenario: Multiple handlers
    Given I set a custom handler at INFO level and other at ERROR level
    When I log a message at ERROR level
    Then both handlers receive this message
