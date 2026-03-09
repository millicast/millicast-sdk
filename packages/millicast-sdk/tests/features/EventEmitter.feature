Feature: EventEmitter functionality
  As a developer using the SDK
  I want to use event-driven patterns
  So that I can react to SDK events

  Scenario: Register event listener with on()
    Given an instance of EventEmitter
    When I register a listener for "test" event
    Then the listener should be registered

  Scenario: Emit event to registered listeners
    Given an instance of EventEmitter
    And I register a listener for "data" event
    When I emit "data" event with payload
    Then the listener should receive the payload

  Scenario: Multiple listeners for same event
    Given an instance of EventEmitter
    And I register two listeners for "message" event
    When I emit "message" event
    Then both listeners should be called

  Scenario: Remove event listener with off()
    Given an instance of EventEmitter
    And I register a listener for "remove" event
    When I remove the listener
    And I emit "remove" event
    Then the listener should not be called

  Scenario: Emit returns false when no listeners
    Given an instance of EventEmitter
    When I emit "unknown" event
    Then emit should return false

  Scenario: Emit returns true when listeners exist
    Given an instance of EventEmitter
    And I register a listener for "exists" event
    When I emit "exists" event
    Then emit should return true

  Scenario: Chaining on() calls
    Given an instance of EventEmitter
    When I chain multiple on() calls
    Then all listeners should be registered
