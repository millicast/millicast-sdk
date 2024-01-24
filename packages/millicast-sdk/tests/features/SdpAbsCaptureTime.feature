Feature: As a user I want to mungle my SDP for adding the absolute capture time header extension so I can offer what I need to my peer

  Scenario: Set abs-capture-time
    Given a local sdp without the header extension
    When I want to add header extension
    Then returns the sdp with the header extension