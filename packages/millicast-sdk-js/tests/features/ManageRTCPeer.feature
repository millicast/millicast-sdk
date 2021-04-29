Feature: As a user I want to manage the peer connection so I can connect to the peer

  Scenario: Get RTC peer without configuration
    Given I have no configuration
    When I get the RTC peer
    Then returns the peer
  
  Scenario: Get RTC peer again
    Given I got the peer previously
    When I get the RTC peer
    Then returns the peer

  Scenario: Get RTC peer with configuration
    Given I have configuration
    When I get the RTC peer
    Then returns the peer

  Scenario: Close existing RTC peer
    Given I have a RTC peer
    When I close the RTC peer
    Then the peer is closed and emits connectionStateChange event

  Scenario: Get RTC Ice servers with custom location
    Given I have an ICE server location
    When I want to get the RTC Ice Servers
    Then returns the ICE Servers

  Scenario: Get RTC Ice servers with default location
    Given I do not have an ICE server location
    When I want to get the RTC Ice Servers
    Then returns the ICE Servers
  
  Scenario: Get RTC Ice servers with different format
    Given I do not have an ICE server location
    When I want to get the RTC Ice Servers and server returns urls instead url
    Then returns the ICE Servers

  Scenario: Error getting RTC Ice servers
    Given I do not have an ICE server location
    When I want to get the RTC Ice Servers and server responds with error
    Then returns empty ICE Servers

  Scenario: Error sending request for get RTC Ice servers
    Given I do not have an ICE server location
    When I want to get the RTC Ice Servers and server responds with 500 error
    Then returns empty ICE Servers

  Scenario: Setting remote SDP to RTC peer
    Given I got the peer
    When I set the remote description
    Then the SDP is setted

  Scenario: Error setting remote SDP to RTC peer
    Given I got the peer
    When I set the remote description and peer returns an error
    Then throws an error

  Scenario: Get RTC Local SDP as subscriber role
    Given I do not have options
    When I want to get the RTC Local SDP
    Then returns the SDP

  Scenario: Get RTC Local SDP as publisher role with valid MediaStream
    Given I have a MediaStream with 1 audio track and 1 video track and I want support stereo
    When I want to get the RTC Local SDP
    Then returns the SDP

  Scenario: Get RTC Local SDP as publisher role with invalid MediaStream
    Given I have a MediaStream with 2 video tracks and no audio track
    When I want to get the RTC Local SDP
    Then throw invalid MediaStream error

  Scenario: Get RTC Local SDP as publisher role with valid list of tracks
    Given I have a list of tracks with 1 audio track and 1 video track
    When I want to get the RTC Local SDP
    Then returns the SDP

  Scenario: Get RTC Local SDP as publisher role with invalid list of tracks
    Given I have a list of tracks with 3 audio tracks and 1 video track
    When I want to get the RTC Local SDP
    Then throw invalid MediaStream error

  Scenario: Update bitrate with restrictions
    Given I have a peer connected
    When I want to update the bitrate to 1000 kbps
    Then the bitrate is updated

  Scenario: Update bitrate with no restrictions
    Given I have a peer connected
    When I want to update the bitrate to unlimited
    Then the bitrate is updated

  Scenario: Update bitrate with restrictions in Firefox
    Given I am using Firefox and I have a peer connected
    When I want to update the bitrate to 1000 kbps
    Then the bitrate is updated

  Scenario: Get existing RTC peer status
    Given I have a peer instanced
    When I want to get the peer connection state
    Then returns the connection state

  Scenario: Get unexisting RTC peer status
    Given I do not have a peer connected
    When I want to get the peer connection state
    Then returns no value

  Scenario: Replace track to existing peer
    Given I have a peer connected
    When I want to change current audio track
    Then the track is changed

  Scenario: Replace track to unexisting peer
    Given I do not have a peer connected
    When I want to change the audio track
    Then the track is not changed

  Scenario: Replace unexisting track to peer
    Given I have a peer connected with video track
    When I want to change the audio track
    Then the track is not changed

  Scenario: Receive new track from peer
    Given I have a peer connected
    When peer returns new track
    Then track event is fired

  Scenario: Get connecting status from peer
    Given I have a peer
    When peer starts to connect
    Then connectionStateChange event is fired

  Scenario: Get connected status from peer
    Given I have a peer
    When peer connects
    Then connectionStateChange event is fired

  Scenario: Get disconnected status from peer
    Given I have a peer connected
    When peer disconnects
    Then connectionStateChange event is fired
  
  Scenario: Get failed status from peer
    Given I have a peer connected
    When peer have a connection error
    Then connectionStateChange event is fired
