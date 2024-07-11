"""
Web SDK test suite with simulcast related tests. Publisher should be a browser client
"""

import pytest

from pytest import Config

from dlbio_commsqa_core.classes.container import (
    ContainerJavascriptPublisher,
    ContainerJavascriptSubscriber,
    ContainerWhipPublisher,
)
from dlbio_commsqa_core.events import MillicastBroadcastEvent
from dlbio_commsqa_pytest_plugin.distutils.version import LooseVersion
from dlbio_commsqa_pytest_plugin.utils import use_whip_publisher
from dlbio_commsqa_tests.utils.redundant_ingest import get_resolution_from_event


@pytest.mark.parametrize(
    "used_clients",
    (
        pytest.param("pub_whip_sub_js", marks=(use_whip_publisher,)),
        pytest.param("pub_js_sub_js"),
    ),
)
@pytest.mark.parametrize("video_codec", ("vp8", "h264"))
def test_select_simulcast_layer(
    pub: ContainerWhipPublisher | ContainerJavascriptPublisher,
    sub: ContainerJavascriptSubscriber,
    pytestconfig: Config,
    video_codec: str,
    used_clients: str,  # pylint: disable=unused-argument
):
    """
    Steps:

    #. Instantiate Publish() and View() as publisher and subscriber
    #. Connect publisher and subscriber to stream
    #. Verify if publisher and subscriber are connected to stream
    #. Check how many layers subscriber has to choose from
       Iteration throught all layers:
    #. Select layer and verify resolution

    """
    if not isinstance(pub, (ContainerJavascriptPublisher, ContainerWhipPublisher)):
        pytest.skip("Test requires hosted or javascript publisher")

    if not isinstance(sub, ContainerJavascriptSubscriber):
        pytest.skip("Test requires hosted or javascript publisher")

    if not pub.is_chrome() and LooseVersion(pub.sdk_version_used) <= "0.1.44":
        pytest.skip(
            "Only publisher with Chrome can publish stream with simulcast"
            "on the SDK version lower or equal 0.1.44"
        )
    if not pub.is_chromium():
        pytest.skip("Only publisher with Chromium can publish stream with simulcast")

    with (
        pub.start_stream(
            token=pytestconfig.option.rts_publish_token,
            stream_name=pytestconfig.option.rts_stream_name,
            options={
                "codec": video_codec,
                "simulcast": True,
            },
        ),
        sub.start_viewing(
            account_id=pytestconfig.option.rts_account_id,
            stream_name=pytestconfig.option.rts_stream_name,
        ) as subscriber,
    ):
        sub.zapp.wait_for_condition(subscriber.isActive, timeout=30)
        sub.zapp.wait_for_multiple_events(
            (
                MillicastBroadcastEvent(
                    {
                        "name": "active",
                        "data": {
                            "streamId": pytestconfig.option.rts_stream_id,
                        },
                    },
                    subscriber.library_key,
                ),
                MillicastBroadcastEvent(
                    {"name": "viewercount", "data": {"viewercount": 1}},
                    subscriber.library_key,
                ),
            )
        )
        sub.collect_connection_data(subscriber)

        simulcast_event = sub.zapp.wait_for_event(
            MillicastBroadcastEvent,
            delegate=lambda simulcast_event: simulcast_event["data"]["medias"]["0"][
                "layers"
            ],
        )

        layers = simulcast_event["data"]["medias"]["0"]["layers"]

        for layer in layers:
            subscriber.select(layer)
            resolution = get_resolution_from_event(layer["encodingId"], simulcast_event)
            sub.zapp.wait_for_condition(
                lambda res=resolution: sub.test_utilities.getResolution() == res,
                timeout=15,
            )


@pytest.mark.parametrize(
    "used_clients",
    (
        pytest.param("pub_whip_sub_js", marks=(use_whip_publisher,)),
        pytest.param("pub_js_sub_js"),
    ),
)
@pytest.mark.parametrize("video_codec", ("vp8", "h264"))
def test_reconnect_with_selected_layer(
    pub: ContainerJavascriptPublisher | ContainerWhipPublisher,
    sub: ContainerJavascriptSubscriber,
    pytestconfig: Config,
    video_codec: str,
    used_clients: str,  # pylint: disable=unused-argument
):
    """
    Steps:

    #. Instantiate Publish() and View() as publisher and subscriber
    #. Connect publisher and subscriber to stream
    #. Verify if publisher and subscriber are connected to stream
    #. Check how many layers subscriber has to choose from
       Iteration throught all layers:
    #. Connect with selected layer and verify resolution

    """
    if not isinstance(pub, (ContainerJavascriptPublisher, ContainerWhipPublisher)):
        pytest.skip("Test requires hosted or javascript publisher")

    if not isinstance(sub, ContainerJavascriptSubscriber):
        pytest.skip("Test requires hosted or javascript publisher")

    if not pub.is_chrome() and LooseVersion(pub.sdk_version_used) <= "0.1.44":
        pytest.skip(
            "Only publisher with Chrome can publish stream with simulcast"
            "on the SDK version lower or equal 0.1.44"
        )
    if not pub.is_chromium():
        pytest.skip("Only publisher with Chromium can publish stream with simulcast")

    with (
        pub.start_stream(
            token=pytestconfig.option.rts_publish_token,
            stream_name=pytestconfig.option.rts_stream_name,
            options={
                "codec": video_codec,
                "simulcast": True,
            },
        ),
        sub.start_viewing(
            account_id=pytestconfig.option.rts_account_id,
            stream_name=pytestconfig.option.rts_stream_name,
        ) as subscriber,
    ):
        sub.zapp.wait_for_condition(subscriber.isActive, timeout=30)
        sub.zapp.wait_for_multiple_events(
            (
                MillicastBroadcastEvent(
                    {
                        "name": "active",
                        "data": {
                            "streamId": pytestconfig.option.rts_stream_id,
                        },
                    },
                    subscriber.library_key,
                ),
                MillicastBroadcastEvent(
                    {"name": "viewercount", "data": {"viewercount": 1}},
                    subscriber.library_key,
                ),
            )
        )

        sub.collect_connection_data(subscriber)

        simulcast_event = sub.zapp.wait_for_event(
            MillicastBroadcastEvent,
            delegate=lambda simulcast_event: simulcast_event["data"]["medias"]["0"][
                "layers"
            ],
        )

        layers = simulcast_event["data"]["medias"]["0"]["layers"]

        for layer in layers:
            subscriber.stop()

            subscriber.connect({"layer": layer})
            sub.zapp.wait_for_condition(subscriber.isActive, timeout=30)
            sub.collect_connection_data(subscriber)

            resolution = get_resolution_from_event(layer["encodingId"], simulcast_event)
            sub.zapp.wait_for_condition(
                lambda res=resolution: sub.test_utilities.getResolution() == res,
                timeout=15,
            )
