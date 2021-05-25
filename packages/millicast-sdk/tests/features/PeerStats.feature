Feature: As a user I want to get the peer stats so I can know if the connection is working correctly

  Scenario: Get stats with default interval
    Given I am connected with the peer
    When I want to get the peer stats
    Then every 1 second returns the peer stats parsed

  Scenario: Get stats when first iteration is completed
    Given I am connected with the peer
    When I want to get the peer stats
    Then peer stats is not fired until the first report is generated

  Scenario: Get stats with custom interval
    Given I am connected with the peer
    When I want to get the peer stats every 4 seconds
    Then every 4 seconds returns the peer stats parsed

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
