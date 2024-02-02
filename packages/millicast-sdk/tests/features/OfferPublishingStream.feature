Feature: As a user I want to signal Millicast Server so I can offer publishing a stream

  Scenario: Offer a SDP with no previous connection and h264 codec
    Given a local sdp and no previous connection to server
    When I offer my local sdp with h264 codec and recording option
    Then returns a filtered sdp to offer to remote peer

  Scenario: Offer a SDP with no previous connection and vp8 codec
    Given a local sdp and no previous connection to server
    When I offer my local sdp with vp8 codec
    Then returns a filtered sdp to offer to remote peer

  Scenario: Offer a SDP with no previous connection and vp9 codec
    Given a local sdp and no previous connection to server
    When I offer my local sdp with vp9 codec
    Then returns a filtered sdp to offer to remote peer

  Scenario: Offer a SDP with no previous connection and av1 codec and browser supports av1x
    Given a local sdp and no previous connection to server
    When I offer my local sdp with av1 codec
    Then returns a filtered sdp to offer to remote peer

  Scenario: Offer a SDP with no previous connection and av1 codec and browser supports av1
    Given a local sdp and no previous connection to server
    When I offer my local sdp with av1 codec
    Then returns a filtered sdp to offer to remote peer

  Scenario: Offer a SDP with no previous connection and av1 codec and browser does not have getCapabilities 
    Given a local sdp and no previous connection to server
    When I offer my local sdp with av1 codec
    Then returns a filtered sdp to offer to remote peer

  Scenario: Offer a SDP with no previous connection and options as object
    Given a local sdp and no previous connection to server
    When I offer my local sdp using options object
    Then returns a filtered sdp to offer to remote peer

  Scenario: Offer a SDP with previous connection and h264 codec
    Given a local sdp and a previous active connection to server
    When I offer my local spd with h264 codec
    Then returns a filtered sdp to offer to remote peer

  Scenario: Offer no SDP with no previous connection
    Given I have not previous connection to server
    When I offer a null sdp
    Then throws no sdp error

  Scenario: Offer no SDP with previous connection
    Given I have previous connection to server
    When I offer a null sdp
    Then throws no sdp error

  Scenario: Offer a SDP with unexistent stream name
    Given I have not previous connection to server
    When I offer my local spd and an unexistent stream name
    Then returns a filtered sdp to offer to remote peer

  Scenario: Offer SDP without stream with no previous connection
    Given I have not previous connection to server
    When I offer a sdp without stream
    Then throws no stream found error

  Scenario: Offer a SDP with invalid codec
    Given I have not previous connection to server
    When I offer a sdp with invalid codec
    Then throws no valid codec error

  Scenario: Offer a SDP with no codec
    Given I have not previous connection to server
    When I offer a sdp
    Then returns a filtered sdp to offer to remote peer

  Scenario: Offer a SDP with no previous connection and desired events
    Given a local sdp and no previous connection to server
    When I offer my local sdp and I set the events active and inactive as events that i want to get
    Then returns a filtered sdp to offer to remote peer