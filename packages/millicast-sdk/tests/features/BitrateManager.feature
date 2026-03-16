Feature: As a user I want to manage bitrate via RTCRtpSender parameters

  Scenario: Update video bitrate on a single video sender
    Given a peer connection with 1 video sender
    When I update the video bitrate to 2000000
    Then the video sender parameters are updated with the bitrate

  Scenario: Update video bitrate with simulcast encodings
    Given a peer connection with 1 video sender with 3 simulcast encodings
    When I update the video bitrate to 3000000
    Then the simulcast encodings are distributed across layers

