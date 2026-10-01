Feature: As a viewer I want unusable ICE candidate pairs to be detected and repaired only when a better pair exists

  Scenario: Demote remote candidates in the SDP answer
    Given a remote sdp with an IPv4 and an IPv6 host candidate
    When I demote the IPv6 candidate
    Then the IPv6 candidate has priority 1 and the IPv4 candidate keeps its priority

  Scenario: Demote no candidates
    Given a remote sdp with an IPv4 and an IPv6 host candidate
    When I demote no candidates
    Then the sdp is unchanged

  Scenario: Bad selected pair with a better alternative during startup
    Given a repair monitor connected 3 seconds ago
    When stats report the selected host pair with 9 seconds RTT and a relay pair with 300 ms RTT
    Then a repair is decided with the selected remote candidate demoted and relay only

  Scenario: Bad selected pair without alternative
    Given a repair monitor connected 3 seconds ago
    When stats report the selected host pair with 9 seconds RTT and no other pair with responses
    Then no repair is decided

  Scenario: Alternative is not better
    Given a repair monitor connected 3 seconds ago
    When stats report the selected host pair with 9 seconds RTT and a relay pair with 6 seconds RTT
    Then no repair is decided

  Scenario: Dead candidates are demoted together with the selected one
    Given a repair monitor connected 3 seconds ago
    When stats report the selected host pair with 9 seconds RTT, a relay pair with 300 ms RTT and a dead IPv4 pair
    Then a repair is decided demoting the selected and the dead remote candidates

  Scenario: Steady state needs consecutive bad reports
    Given a repair monitor connected 60 seconds ago
    When stats report the selected host pair with 2 seconds RTT and a relay pair with 300 ms RTT twice
    Then no repair is decided
    When stats report the selected host pair with 2 seconds RTT and a relay pair with 300 ms RTT once more
    Then a repair is decided with the selected remote candidate demoted and relay only

  Scenario: Cooldown and attempts limit repairs
    Given a repair monitor connected 3 seconds ago
    When a repair was started 5 seconds ago
    And stats report the selected host pair with 9 seconds RTT and a relay pair with 300 ms RTT
    Then no repair is decided

  Scenario: Failed repair clears demotions
    Given a repair monitor connected 3 seconds ago
    When a repair was started 5 seconds ago
    And the repair fails
    Then no candidates are demoted and relay only is off

  Scenario: Monitoring continues after a failed repair
    Given a repair monitor connected 3 seconds ago
    When a repair was started 40 seconds ago
    And the repair fails
    And stats report the selected host pair with 9 seconds RTT and a relay pair with 300 ms RTT
    Then a repair is decided with the selected remote candidate demoted and relay only

  Scenario: Relay only follows the latest repair decision
    Given a repair monitor connected 3 seconds ago
    When a repair was started 5 seconds ago
    And a repair towards a direct alternative is started
    Then relay only is off

  Scenario: Disabled monitor never repairs
    Given a disabled repair monitor connected 3 seconds ago
    When stats report the selected host pair with 9 seconds RTT and a relay pair with 300 ms RTT
    Then no repair is decided
