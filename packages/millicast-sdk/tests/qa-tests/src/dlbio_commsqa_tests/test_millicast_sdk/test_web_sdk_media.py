"""
Web SDK test suite with AV-related tests. Publisher should be a browser client
"""

import pytest

from _pytest.config import Config

import gti_pytest_advanced_parametrization as aparam

from dlb_pbj.exceptions import JavascriptException
from dlb_zapp.api import TimeoutException
from dlbio_commsqa_core.classes.container.container_javascript_publisher import (
    ContainerJavascriptPublisher,
)
from dlbio_commsqa_core.classes.container.container_javascript_subscriber import (
    ContainerJavascriptSubscriber,
)
from dlbio_commsqa_core.events import MillicastBroadcastEvent, MillicastTrackEvent


@aparam.combinations(
    video_codec=["vp8", "vp9", "h264", "h265", "av1"],
    simulcast=[True, False],
)
@aparam.exclude(
    video_codec=["av1", "vp9", "h265"],
    simulcast=[True],
)
def test_connect_with_various_codecs(
    pub: ContainerJavascriptPublisher,
    sub: ContainerJavascriptSubscriber,
    pytestconfig: Config,
    video_codec: str,
    simulcast: bool,
):
    """
    Steps:

    #. Connect publisher and subscriber to stream
    #. Verify events on subscriber's side
    #. Check if media are present on subscriber's side
    """
    if not isinstance(pub, ContainerJavascriptPublisher):
        pytest.skip(
            "Test only supports browsers with automation test page as publisher"
        )
    if not isinstance(sub, ContainerJavascriptSubscriber):
        pytest.skip(
            "Test only supports browsers with automation test page as subscriber"
        )

    if video_codec == "h265" and not pub.is_safari():
        pytest.skip("Only Safari supports h265 codec.")

    if video_codec == "av1" and any(
        (
            pub.is_firefox(),
            sub.is_firefox(),
            pub.is_safari(),
            sub.is_safari(),
        )
    ):
        pytest.skip("AV1 is not supported in Firefox and Safari")

    try:

        with (
            pub.start_stream(
                token=pytestconfig.option.rts_publish_token,
                stream_name=pytestconfig.option.rts_stream_name,
                options={
                    "codec": video_codec,
                    "simulcast": simulcast,
                },
            ) as publisher,
            sub.start_viewing(
                account_id=pytestconfig.option.rts_account_id,
                stream_name=pytestconfig.option.rts_stream_name,
            ) as subscriber,
        ):
            pub.zapp.wait_for_condition(publisher.isActive, timeout=15)
            pub.collect_connection_data(publisher)

            sub.zapp.wait_for_condition(subscriber.isActive, timeout=30)

            sub.zapp.wait_for_multiple_events(
                (
                    MillicastTrackEvent(
                        {
                            "track": {"kind": "video"},
                            "transceiver": {"mid": "0"},
                            "type": "track",
                        },
                        subscriber.library_key,
                    ),
                    MillicastTrackEvent(
                        {
                            "track": {"kind": "audio"},
                            "transceiver": {"mid": "1"},
                            "type": "track",
                        },
                        subscriber.library_key,
                    ),
                    MillicastBroadcastEvent(
                        {
                            "name": "active",
                            "data": {
                                "streamId": pytestconfig.option.rts_stream_id,
                            },
                        },
                        subscriber.library_key,
                    ),
                )
            )

            sub.collect_connection_data(subscriber)
            sub.zapp.wait_for_condition(sub.test_utilities.isVideoActive, timeout=30)
            sub.zapp.wait_for_condition(sub.test_utilities.isAudioPresent, timeout=30)
    except JavascriptException:
        if pub.is_safari() and video_codec == "h265":
            pytest.xfail("https://jira.dolby.net/jira/browse/DIOS-3367")
        raise


@pytest.mark.parametrize("pub_disable_audio", (True, False))
@pytest.mark.parametrize("sub_disable_audio", (True, False))
def test_connect_with_disable_audio(
    pub: ContainerJavascriptPublisher,
    sub: ContainerJavascriptSubscriber,
    pytestconfig: Config,
    pub_disable_audio: bool,
    sub_disable_audio: bool,
):
    """
    Steps:

    #. Connect publisher and subscriber to stream, with disableAudio parametrized
    #. Verify video track event on subscriber's side
    #. Check if sub doesn't receive audio if pub or sub connects with disableAudio: True
    """
    if not isinstance(pub, ContainerJavascriptPublisher):
        pytest.skip(
            "Test only supports browsers with automation test page as publisher"
        )
    if not isinstance(sub, ContainerJavascriptSubscriber):
        pytest.skip(
            "Test only supports browsers with automation test page as subscriber"
        )

    with (
        pub.start_stream(
            token=pytestconfig.option.rts_publish_token,
            stream_name=pytestconfig.option.rts_stream_name,
            options={
                "disableAudio": pub_disable_audio,
                "codec": "h264",
            },
        ) as publisher,
        sub.start_viewing(
            account_id=pytestconfig.option.rts_account_id,
            stream_name=pytestconfig.option.rts_stream_name,
            options={"disableAudio": sub_disable_audio},
        ) as subscriber,
    ):

        pub.zapp.wait_for_condition(publisher.isActive, timeout=15)
        pub.collect_connection_data(publisher)

        sub.zapp.wait_for_condition(subscriber.isActive, timeout=30)

        # if only sub_disable_audio: True - sub gets only 1 MediaTrackEvent (video)
        bad_events = []

        if sub_disable_audio:
            bad_events.append(
                MillicastTrackEvent(
                    {
                        "track": {"kind": "audio"},
                        "type": "track",
                    }
                )
            )

        sub.zapp.wait_for_event(
            MillicastTrackEvent(
                {
                    "track": {"kind": "video"},
                    "type": "track",
                },
                subscriber.library_key,
            ),
            bad_events=bad_events,
        )
        sub.collect_connection_data(subscriber)

        if pub_disable_audio or sub_disable_audio:
            try:
                sub.zapp.wait_for_condition(
                    sub.test_utilities.isVideoActive, timeout=30
                )
            except TimeoutException:
                if pub.is_firefox() and pub_disable_audio:
                    pytest.xfail(
                        "Known bug: https://jira.dolby.net/jira/browse/DIOS-2998"
                    )
                raise

            assert not sub.test_utilities.isAudioPresent()


@pytest.mark.parametrize("pub_disable_video", (True, False))
@pytest.mark.parametrize("sub_disable_video", (True, False))
def test_connect_with_disable_video(
    pub: ContainerJavascriptPublisher,
    sub: ContainerJavascriptSubscriber,
    pytestconfig: Config,
    pub_disable_video: bool,
    sub_disable_video: bool,
):
    """
    Steps:

    #. Connect publisher and subscriber to stream, with disableVideo parametrized
    #. Verify audio track event on subscriber's side
    #. Check if sub doesn't receive video if pub or sub connects with disableVideo: True
    """
    if not isinstance(pub, ContainerJavascriptPublisher):
        pytest.skip(
            "Test only supports browsers with automation test page as publisher"
        )
    if not isinstance(sub, ContainerJavascriptSubscriber):
        pytest.skip(
            "Test only supports browsers with automation test page as subscriber"
        )

    with (
        pub.start_stream(
            token=pytestconfig.option.rts_publish_token,
            stream_name=pytestconfig.option.rts_stream_name,
            options={
                "disableVideo": pub_disable_video,
                "codec": "h264",
            },
        ) as publisher,
        sub.start_viewing(
            account_id=pytestconfig.option.rts_account_id,
            stream_name=pytestconfig.option.rts_stream_name,
            options={"disableVideo": sub_disable_video},
        ) as subscriber,
    ):

        pub.zapp.wait_for_condition(publisher.isActive, timeout=15)
        pub.collect_connection_data(publisher)

        sub.zapp.wait_for_condition(subscriber.isActive, timeout=30)

        # if only sub_disable_video: True - sub gets 1 MediaTrackEvent (audio)
        bad_events = []

        if sub_disable_video:
            bad_events.append(
                MillicastTrackEvent(
                    {
                        "track": {"kind": "video"},
                        "type": "track",
                    }
                )
            )

        sub.zapp.wait_for_event(
            MillicastTrackEvent(
                {
                    "track": {"kind": "audio"},
                    "type": "track",
                },
                subscriber.library_key,
            ),
            bad_events=bad_events,
        )

        sub.collect_connection_data(subscriber)
        if pub_disable_video or sub_disable_video:
            sub.zapp.wait_for_condition(sub.test_utilities.isAudioPresent, timeout=30)
            assert sub.test_utilities.isVideoPresent() is None
