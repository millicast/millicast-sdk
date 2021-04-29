Feature: As a user I want to remove specific SDP lines so I can set the remote description in correct format to my peer

  Scenario: Remove existing line
    Given a local sdp
    When I want to remove an existing sdp line
    Then returns the sdp without the line

  Scenario: Remove unexisting line
    Given a local sdp
    When I want to remove an unexisting sdp line
    Then returns the sdp