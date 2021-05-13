Feature: As a user I want to reconnect to my broadcast so i can stream without manual reconnections

  Scenario: Reconnection when peer has an error
    Given an instance of Publish with reconnection enabled
    When peer has an error
    Then reconnection is called
  
  Scenario: No reconnection when peer has not an error
    Given an instance of Publish with reconnection enabled
    When peer change status to connected
    Then reconnection is not called

  Scenario: Reconnection when signaling has an error
    Given an instance of Publish with reconnection enabled
    When signaling has an error
    Then reconnection is called

  Scenario: No reconnect when signaling has an error and reconnection is already being executed
    Given an instance of Publish with reconnection enabled
    When reconnect was called and signaling has an error
    Then reconnection is not called

  Scenario: Reconnection disabled when peer has an error
    Given an instance of Publish with reconnection disabled
    When peer has an error
    Then reconnection is not called

  Scenario: Reconnection when peer has a disconnection
    Given an instance of Publish with reconnection enabled
    When peer has a disconnection
    Then waits and call reconnection

  Scenario: Reconnection interval when peer has an error
    Given an instance of Publish with reconnection enabled and peer with error
    When reconnection is called and fails
    Then reconnection is called again in increments of 2 seconds until 32 seconds

  Scenario: Reconnection when peer has recover from error
    Given an instance of Publish with reconnection enabled
    When reconnection is called and peer is currently connected
    Then reconnection is not called again

  Scenario: Reconnection and peer has recover from error
    Given an instance of Publish with reconnection enabled
    When reconnection is called and peer is inactive
    Then peer reconnects and reconnection is not called again