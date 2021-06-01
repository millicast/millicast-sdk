Feature: As a user I want to get the peer stats so I can know if the connection is working correctly

  Scenario: Get stats with two seconds interval
    Given I am connected with the peer
    When I want to get the peer stats every 2 seconds
    Then every 2 seconds returns the peer stats parsed

  Scenario: Get stats when first iteration is completed
    Given I am connected with the peer
    When I want to get the peer stats
    Then peer stats is not fired until the first report is generated

  Scenario: Get stats without codec information
    Given I am connected with the peer
    When I want to get the peer stats every 2 seconds and peer does not have codec information
    Then every 2 seconds returns the peer stats parsed

  Scenario: Get stats without codec report
    Given I am connected with the peer
    When I want to get the peer stats every 2 seconds and peer have codec id related and report does not have the report
    Then every 2 seconds returns the peer stats parsed

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

  Scenario: Get stats with characters interval
    Given I am connected with the peer
    When I want to get the peer stats with invalid interval
    Then throws invalid interval value error

  Scenario: Get stats with 0 interval
    Given I am connected with the peer
    When I want to get the peer stats every 0 seconds
    Then throws invalid interval value error

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
