Feature: As a user I want to get browser audio/video capabilities so I can choose the codec to start broadcasting

  Scenario: Browser supports more codecs than Millicast
    Given my browser supprots H264, H265
    When I get video capabilities
    Then returns H264 in codecs property
  
  Scenario: Browser supports all codecs of Millicast
    Given my browser supprots H264, H265, VP8, VP9 and AV1
    When I get video capabilities
    Then returns all codecs except H265

  Scenario: Browser supports SVC for VP9
    Given my browser supprots VP9 with scalability modes
    When I get video capabilities
    Then returns VP9 with all scalability modes available

  Scenario: Browser supports SVC for VP9 repeated layers
    Given my browser supprots VP9 with scalability modes repeated
    When I get video capabilities
    Then returns VP9 with all scalability modes available
  
  Scenario: Get audio capabilities
    Given my browser audio capabilities
    When I get audio capabilities
    Then returns same capabilities as browser
  
  Scenario: Get capabilities from inexistent kind
    When I get data capabilities
    Then returns null