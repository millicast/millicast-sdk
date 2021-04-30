Feature: As a user I want to parse my SDP for set bitrate so I can offer the bitrate that I need to my peer

  Scenario: Update bitrate with restrictions
    Given a local sdp
    When I want to update the bitrate to 1000 kbps
    Then returns the sdp with the bitrate updated

  Scenario: Update bitrate with no restrictions
    Given a local sdp with bitrate setted in 1000 kbps
    When I want to update the bitrate to unlimited
    Then returns the sdp with the bitrate updated

  Scenario: Update bitrate with restrictions in Firefox
    Given I am using Firefox and a local sdp
    When I want to update the bitrate to 1000 kbps
    Then returns the sdp with the bitrate updated