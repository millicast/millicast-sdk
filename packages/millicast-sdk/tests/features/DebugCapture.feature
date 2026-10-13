Feature: Viewer debug capture
  Scenario: Capture is opt-in
    Given a viewer with capture disabled
    When it connects to a stream
    Then no capture database is opened by the viewer and the session list is empty

  Scenario: Capture records connection setup and network requests
    Given a viewer with capture enabled
    When it connects and records peer, websocket, and Director activity
    Then its configuration and connection events are saved with secrets redacted

  Scenario: Stats use deltas and export full series
    Given a capture session
    When three raw stats reports are recorded
    Then the stored deltas rebuild all three WebRTC stats samples

  Scenario: Flush on interval and failed connection state
    Given a capture session with fake timers
    When a peer fails and the session is stopped
    Then records are flushed and the session is ended

  Scenario: Storage pressure slows stats but retains events
    Given storage pressure has been detected
    When ten stats samples and a lifecycle event are recorded
    Then stats are sampled more slowly and lifecycle events remain

  Scenario: Failed writes retain events and reset stats deltas
    Given a capture store that fails one write
    When a stats chunk fails and a later sample arrives
    Then dropped stats are reported and the next stats sample is full

  Scenario: In-memory store remains readable
    Given IndexedDB is unavailable
    When a capture is written to memory
    Then the capture API can still build its export

  Scenario: Reconnection allocates another peer connection id
    Given a capture session
    When a migrated peer is created
    Then both peer connections belong to the same session

  Scenario: Secrets are redacted from captured values
    Given secret values in strings and objects
    When the redaction helpers are used
    Then secrets and sensitive URL parameters are hidden

  Scenario: HAR combines HTTP websocket and resource entries
    Given HTTP, websocket, and resource records
    When a HAR export is built
    Then it contains sorted HAR 1.2 network entries

  Scenario: New sessions prune only old ended sessions
    Given one old ended session and one unfinished session
    When a new capture session starts
    Then only the old ended session and its chunks are deleted
