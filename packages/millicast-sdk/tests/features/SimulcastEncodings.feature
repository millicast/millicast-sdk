Feature: As a user I want optimized simulcast encodings based on video resolution

  Scenario: Get simulcast encodings for 1080p resolution
    Given a video resolution of 1920x1080
    When I get optimized simulcast encodings
    Then returns 3 encoding layers with high at 6 Mbps

  Scenario: Get simulcast encodings for 720p resolution
    Given a video resolution of 1280x720
    When I get optimized simulcast encodings
    Then returns 3 encoding layers with high at 2 Mbps

  Scenario: Get simulcast encodings for 480p resolution
    Given a video resolution of 640x480
    When I get optimized simulcast encodings
    Then returns 2 encoding layers with high at 600 Kbps

  Scenario: Get simulcast encodings for low resolution
    Given a video resolution of 320x240
    When I get optimized simulcast encodings
    Then returns 1 encoding layer with high at 300 Kbps
