Feature: As a user I want to load the UMD build through an AMD-aware bundler or loader so I can use the SDK from webpack or RequireJS

  Scenario: Load the UMD build where an AMD define is available
    Given an environment with CommonJS module and an AMD define like webpack
    When I load the UMD build
    Then the SDK exports a working Logger
    And no bundled dependency registers itself with the AMD define

  Scenario: Load the debug UMD build where an AMD define is available
    Given an environment with CommonJS module and an AMD define like webpack
    When I load the debug UMD build
    Then the SDK exports a working Logger
    And no bundled dependency registers itself with the AMD define

  Scenario: Load the UMD build with an AMD-only loader
    Given an environment with only an AMD define like RequireJS
    When I load the UMD build
    Then the SDK registers itself once with the AMD define
    And the SDK exports a working Logger

  Scenario: Load the debug UMD build with an AMD-only loader
    Given an environment with only an AMD define like RequireJS
    When I load the debug UMD build
    Then the SDK registers itself once with the AMD define
    And the SDK exports a working Logger
