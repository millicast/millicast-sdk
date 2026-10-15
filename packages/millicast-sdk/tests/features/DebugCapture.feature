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

  Scenario: Pagehide ends an active capture session
    Given an active capture session
    When pagehide fires without persisted storage
    Then the stored session and export show a pagehide end reason

  Scenario: Persisted pageshow resumes a capture session
    Given an active capture session
    When pagehide and persisted pageshow fire
    Then the session is reopened and later events are stored

  Scenario: Visibility change does not end a capture session
    Given an active capture session
    When the document becomes hidden
    Then the capture session remains open

  Scenario: Stop records the capture end reason
    Given an active capture session
    When the capture session is stopped
    Then the stored session and session list show a stop end reason

  Scenario: Never-closed capture exports its last record time
    Given a capture session that was never closed
    When its capture export is built
    Then the export uses the last record time and not-closed end reason

  Scenario: Pagehide tail saves an in-flight chunk and buffered records
    Given a capture session with a pending chunk write
    When pagehide fires while the chunk is in flight
    Then the local tail contains both chunks and the pagehide end metadata

  Scenario: Reload merges the pagehide tail into IndexedDB
    Given a capture session with a pagehide tail
    When a new store merges the tail after reload
    Then the merged session and export contain the pagehide data

  Scenario: Tail merge deduplicates sequences and retains failed writes
    Given a tail whose sequence already exists in IndexedDB
    When the tail is merged more than once
    Then only one chunk per sequence remains and failed writes keep their key

  Scenario: Oversized tails omit stats but preserve events and metadata
    Given a capture session with a large stats record
    When pagehide saves its tail
    Then stats are omitted and the tail remains under the size limit

  Scenario: Export orders chunks by sequence
    Given chunks were stored out of sequence order
    When the capture export is built
    Then exported events follow chunk sequence order

  Scenario: Current connection export excludes stale connection records
    Given a capture session with two connection attempts
    When the current connection export is built
    Then only the current connection data and stats are exported

  Scenario: Single attempt connection export preserves the full session
    Given a capture session with one connection attempt
    When session and connection exports are built
    Then both exports contain the same records

  Scenario: Failed current attempt has no stream view id
    Given a capture session whose latest attempt failed
    When the failed connection export is built and downloaded
    Then the export has no stream view id and the filenames use null

  Scenario: Download uses UTC current connection filenames
    Given a capture session with two connection attempts for download
    When client stats are downloaded at fixed UTC times
    Then the downloads identify the current connection with exact UTC names

  Scenario: Get capture defaults to the full session
    Given a capture session with two connection attempts for the API
    When the default and connection captures are built
    Then the default capture contains both connections

  Scenario: Signaling capture records the view result
    Given a signaling instance with debug capture enabled
    When it receives a view result
    Then the view result is recorded for the connection

  Scenario: Failed Director request keeps the configured capture identity
    Given a viewer with capture identity and a failed Director request
    When it connects and downloads client stats
    Then the filenames use the caller identity and null view id

  Scenario: Download excludes records after its cutoff
    Given a capture session with records before and after download time
    When client stats are downloaded at the cutoff
    Then the download omits later records and retains valid stats

  Scenario: WebRTC dump includes user agent brands
    Given navigator user agent data with browser brands
    When the WebRTC dump is built
    Then it contains plain copies of the brand data

  Scenario: WebRTC dump has empty user agent data when unavailable
    Given navigator user agent data is unavailable
    When the WebRTC dump is built
    Then UserAgentData is an empty array
