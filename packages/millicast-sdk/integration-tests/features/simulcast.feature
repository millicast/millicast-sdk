
# Feature: Simulcast Feature

#     Scenario: Publisher connects with simulcast and viewer subscribes to layers event
#         Given the "publisher1" opens "Publisher" app
#         When the "publisher1" starts the stream with the specified options
#             | codec     | h264 |
#             | simulcast | true |
#         And the "publisher1" stream should be LIVE

#         When the "viewer1" opens "Viewer" app
#         Then the "viewer1" connected stream should be LIVE
#         When the "viewer1" disconnects from the published stream
#         Then the "viewer1" connected stream should be NOT LIVE
#         And the "viewer1" connects to the published stream with the specified options
#             | events | layers,active |
#         Then the "viewer1" connected stream should be LIVE

# When the "viewer1" selects simulcast layer with encodingId "0"
# Then the "viewer1" should receive video with resolution "320"x"180"

# When the "viewer1" selects simulcast layer with encodingId "1"
# Then the "viewer1" should receive video with resolution "640"x"360"

# When the "viewer1" selects simulcast layer with encodingId "2"
# Then the "viewer1" should receive video with resolution "1280"x"720"
