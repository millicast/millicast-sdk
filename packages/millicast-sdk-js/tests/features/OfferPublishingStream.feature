Feature: As a user I want to signal Millicast Server so I can offer publishing a stream

  Scenario: Offer a SDP with no previous connection
    Given a local sdp and no previous connection to server
    When I offer my local sdp
    Then returns a filtered sdp to offer to remote peer

  Scenario: Offer a SDP with previous connection
    Given a local sdp and a previous active connection to server
    When I offer my local spd
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