Feature: As a user I want to get browser audio/video capabilities so I can choose the codec to start broadcasting

  Scenario: Browser supports more codecs than Millicast
    Given my browser supports H264, H265, red and rtx
    When I get video capabilities
    Then returns H264 and H265 in codecs property
  
  Scenario: Browser supports all codecs of Millicast
    Given my browser supports H264, H265, VP8, VP9 and AV1
    When I get video capabilities
    Then returns all codecs

  Scenario: Browser supports SVC for VP9
    Given my browser supports VP9 with scalability modes
    When I get video capabilities
    Then returns VP9 with all scalability modes available

  Scenario: Browser supports SVC for VP9 repeated layers
    Given my browser supports VP9 with scalability modes repeated
    When I get video capabilities
    Then returns VP9 with all scalability modes available

  Scenario: Get video capabilities in Firefox
    Given I am in Firefeox
    When I get video capabilities
    Then returns H264, VP8 and VP9 codecs
  
  Scenario: Get audio capabilities in Chrome
    Given my browser audio capabilities
    When I get audio capabilities
    Then returns opus and multiopus codecs

  Scenario: Get audio capabilities in iOS Chrome
    Given my browser audio capabilities
    When I get audio capabilities
    Then returns opus codec

  Scenario: Get audio capabilities in Firefox
    Given my browser audio capabilities
    When I get audio capabilities
    Then returns opus codec
  
  Scenario: Get capabilities from inexistent kind in Chrome
    Given I am in Chrome
    When I get data capabilities
    Then returns null

  Scenario: Get capabilities from inexistent kind in Firefox
    Given I am in Firefox
    When I get data capabilities
    Then returns null