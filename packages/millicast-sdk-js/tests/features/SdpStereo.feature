Feature: As a user I want to parse my SDP for set stereo so I can offer what I need to my peer

  Scenario: Set stereo
    Given a local sdp without stereo
    When I want to set stereo
    Then returns the sdp with stereo support