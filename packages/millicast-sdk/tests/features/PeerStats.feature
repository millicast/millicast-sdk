Feature: As a user I want to get the peer stats so I can know if the connection is working correctly

  Scenario: Get stats
    Given I am connected with the peer
    When I want to get the peer stats
    Then each second returns the peer stats parsed

  Scenario: Get stats without codec information
    Given I am connected with the peer
    When I want to get the peer stats and peer does not have codec information
    Then each second returns the peer stats parsed

  Scenario: Get stats without codec report
    Given I am connected with the peer
    When I want to get the peer stats and peer have codec id related and report does not have the report
    Then each second returns the peer stats parsed

  Scenario: Stop get stats
    Given I am getting stats
    When I want to stop get stats
    Then no new peer stats is received

  Scenario: Get stats when it is already initiated
    Given I am getting stats
    When I want to get stats
    Then the get stats is not initialized again

  Scenario: Get stats with no existing peer
    Given I do not have peer connected
    When I want to get stats
    Then the get stats is not initialized

  Scenario: Calculate inbound bitrate with no existing previous stats
    Given I have new inbound raw stats and no existing previous stats
    When I want to parse the stats
    Then returns the parsed stats with 0 bitrate

  Scenario: Calculate inbound bitrate with previous stats and existing related report
    Given I have new inbound raw stats with 12000 bytes received and existing previous stats and related report with 10000 bytes received
    When I want to parse the stats
    Then returns the parsed stats with 16000 bitrate

  Scenario: Calculate inbound bitrate with previous stats and unexisting related report
    Given I have new inbound raw stats with 12000 bytes received and existing previous stats with unexisting related report
    When I want to parse the stats
    Then returns the parsed stats with 0 bitrate

  Scenario: Calculate outbound bitrate with no existing previous stats
    Given I have new outbound raw stats and no existing previous stats
    When I want to parse the stats
    Then returns the parsed stats with 0 bitrate

  Scenario: Calculate outbound bitrate with previous stats and existing related report
    Given I have new outbound raw stats with 12000 bytes sent and existing previous stats and related report with 10000 bytes sent
    When I want to parse the stats
    Then returns the parsed stats with 16000 bitrate

  Scenario: Calculate outbound bitrate with previous stats and unexisting related report
    Given I have new outbound raw stats with 12000 bytes sent and existing previous stats with unexisting related report
    When I want to parse the stats
    Then returns the parsed stats with 0 bitrate
