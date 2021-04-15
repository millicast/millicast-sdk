Feature: As a user i want to publish/subscribe to a Millicast Stream so i can get a connection path

  Scenario: Publish with existing stream and valid token
    Given i have a valid token and a existing stream name
    When i get the publish connection path
    Then returns the connection path

  Scenario: Publish with unexisting stream and valid token
    Given i have a valid token and a unexisting stream name
    When i get the publish connection path
    Then throw an error saying invalid stream name

  Scenario: Publish with existing stream and invalid token
    Given i have a invalid token and a existing stream name
    When i get the publish connection path
    Then throw an error saying invalid token

  Scenario: Subscribe to an existing unrestricted stream, valid accountId and no token
    Given i have a existing stream name, accountId and no token
    When i get the subscriber connection path
    Then returns the connection path

  Scenario: Subscribe to an existing restricted stream and valid token
    Given i have a existing stream name and valid token
    When i get the subscriber connection path
    Then returns the connection path
  
  Scenario: Subscribe to an existing unrestricted stream, invalid accountId and no token
    Given i have a existing stream name, invalid accountId and no token
    When i get the subscriber connection path
    Then throw an error saying stream not found