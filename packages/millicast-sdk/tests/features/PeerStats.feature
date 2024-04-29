Feature: PeerConnectionStats

  Scenario: Initializes stats collection by default
    Given a PeerConnectionStats instance is created
    When no arguments are provided to the constructor
    Then the stats collection should be initialized

  Scenario: Does not initialize stats collection when disabled
    Given a PeerConnectionStats instance is created
    When the autoInitStats option is set to false
    Then the stats collection should not be initialized

  Scenario: Stops stats collection
    Given a PeerConnectionStats instance with a running collection
    When the stop method is called
    Then the stats collection should be stopped

  Scenario: Emits stats event when stats are received
    Given a PeerConnectionStats instance
    When the collection receives stats
    Then the "stats" event should be emitted with the received stats
