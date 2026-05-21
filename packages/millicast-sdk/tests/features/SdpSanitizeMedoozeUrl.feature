Feature: As a user I want to sanitize medooze URLs from SDP so that firewalls do not flag the signaling traffic

  Scenario: Replace single https://medooze occurrence
    Given an SDP containing a single https://medooze identifier
    When I sanitize the SDP
    Then the SDP contains optiview instead of https://medooze

  Scenario: Replace multiple https://medooze occurrences
    Given an SDP containing multiple https://medooze identifiers
    When I sanitize the SDP
    Then the SDP contains optiview instead of https://medooze

  Scenario: SDP without https://medooze is unchanged
    Given an SDP without any https://medooze identifier
    When I sanitize the SDP
    Then the SDP is unchanged
