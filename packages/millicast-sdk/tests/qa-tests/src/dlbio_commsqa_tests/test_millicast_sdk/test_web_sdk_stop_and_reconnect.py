"""
Web SDK test suite with reconnect related tests. Publisher should be a browser client
"""

# pylint: disable=logging-fstring-interpolation
import logging

import pytest

from _pytest.config import Config

from dlbio_commsqa_core.classes.container.container_javascript_publisher import (
    ContainerJavascriptPublisher,
)
from dlbio_commsqa_core.classes.container.container_javascript_subscriber import (
    ContainerJavascriptSubscriber,
)
from dlbio_commsqa_core.events import MillicastBroadcastEvent

logger = logging.getLogger(__name__)


def test_subscriber_stop_and_reconnect(
    pub: ContainerJavascriptPublisher,
    sub: ContainerJavascriptSubscriber,
    pytestconfig: Config,
):
    """
    Steps:

    #. Instantiate Publish() and View() as publisher and subscriber
    #. Connect publisher and subscriber to stream
    #. Verify if publisher and subscriber are connected to stream

    Repeat two times:

    #. Stop connection on subscriber's site
    #. Check if media aren't present on subscriber's site
    #. Connect subscriber to stream
    #. Verify if publisher is connected properly
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
        ) as publisher,
        sub.start_viewing(
            account_id=pytestconfig.option.rts_account_id,
            stream_name=pytestconfig.option.rts_stream_name,
        ) as subscriber,
    ):
        pub.zapp.wait_for_condition(publisher.isActive, timeout=15)
        pub.collect_connection_data(publisher)

        sub.wait_until_receiving_stream()
        sub.zapp.wait_for_event(
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

        sub.collect_connection_data(subscriber)
        sub.wait_for_video_active()
        sub.wait_for_audio_present()

        for iteration in range(2):
            logger.info(f"Reconnect attempt number {iteration + 1}")

            subscriber.stop()
            assert not sub.test_utilities.isAudioPresent()
            assert not sub.test_utilities.isVideoActive()

            subscriber.connect()

            sub.wait_until_receiving_stream()
            sub.zapp.wait_for_event(
                MillicastBroadcastEvent(
                    {
                        "name": "active",
                        "data": {"streamId": pytestconfig.option.rts_stream_id},
                    },
                    subscriber.library_key,
                ),
            )

            sub.collect_connection_data(subscriber)
            sub.wait_for_video_active()
            sub.wait_for_audio_present()


def test_publisher_stop_and_reconnect(
    pub: ContainerJavascriptPublisher,
    sub: ContainerJavascriptSubscriber,
    pytestconfig: Config,
):
    """
    Steps:

    #. Instantiate Publish() and View() as publisher and subscriber
    #. Connect publisher and subscriber to stream
    #. Verify if publisher and subscriber are connected to stream

    Repeat two times:

    #. Stop connection and reconnect on publisher
    #. Verify if publisher is connected properly
    #. Check if media are present on subscriber's site
    """

    if not isinstance(pub, ContainerJavascriptPublisher):
        pytest.skip(
            "Test only supports browsers with automation test page as publisher"
        )
    if not isinstance(sub, ContainerJavascriptSubscriber):
        pytest.skip(
            "Test only supports browsers with automation test page as subscriber"
        )

    camera_stream = pub.test_utilities.getCameraStream()  # used twice
    with (
        pub.start_stream(
            token=pytestconfig.option.rts_publish_token,
            stream_name=pytestconfig.option.rts_stream_name,
            options={"mediaStream": camera_stream},
        ) as publisher,
        sub.start_viewing(
            account_id=pytestconfig.option.rts_account_id,
            stream_name=pytestconfig.option.rts_stream_name,
        ) as subscriber,
    ):
        pub.zapp.wait_for_condition(publisher.isActive, timeout=15)
        pub.collect_connection_data(publisher)

        sub.wait_until_receiving_stream()
        sub.zapp.wait_for_event(
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

        sub.collect_connection_data(subscriber)
        sub.wait_for_video_active()
        sub.wait_for_audio_present()

        for iteration in range(2):
            logger.info(f"Reconnect attempt number {iteration + 1}")

            publisher.stop()

            publisher.connect({"mediaStream": camera_stream})
            pub.zapp.wait_for_condition(publisher.isActive, timeout=15)

            sub.zapp.wait_for_event(
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

            pub.collect_connection_data(publisher)
            sub.collect_connection_data(subscriber)
            sub.wait_for_video_active()
            sub.wait_for_audio_present()
