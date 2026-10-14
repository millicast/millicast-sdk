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

  Scenario: Migration records its start and allocates another peer connection id
    Given a capture session
    When the viewer migrates to a new peer connection
    Then both peer connections and the migrate-start event belong to the same session

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

  Scenario: Storage persistence does not block connection
    Given navigator persistence never resolves
    When the viewer connects with capture enabled
    Then playback setup completes without waiting for persistence

  Scenario: Capture startup failure does not block connection
    Given capture session creation will fail
    When the viewer connects with capture enabled
    Then playback setup completes without a capture session

  Scenario: IndexedDB open timeout falls back to memory
    Given an IndexedDB open request that never completes
    When the open timeout expires and the request succeeds late
    Then the store uses memory and closes the late database

  Scenario: Capture writes succeed when the session is used through a reactive proxy
    Given a capture session wrapped in a reactive proxy
    When its identity and event are updated and flushed
    Then the session and event are stored without stats being dropped

  Scenario: An unserializable record does not block later writes
    Given a capture session for resilient writes
    When a circular event and later records are flushed
    Then the bad record is marked and later writes are stored
