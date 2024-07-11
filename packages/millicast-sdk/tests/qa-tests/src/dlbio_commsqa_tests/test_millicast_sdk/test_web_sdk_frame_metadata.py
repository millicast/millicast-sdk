"""
Web SDK test suite with frame metadata tests
"""

# pylint: disable=too-many-arguments
from datetime import datetime

import pytest

from _pytest.config import Config

from dlbio_commsqa_core.classes.container.container_javascript_publisher import (
    ContainerJavascriptPublisher,
)
from dlbio_commsqa_core.classes.container.container_javascript_subscriber import (
    ContainerJavascriptSubscriber,
)
from dlbio_commsqa_core.events import (
    MillicastBroadcastEvent,
    MillicastMetadataEvent,
    MillicastTrackEvent,
)


@pytest.mark.parametrize("simulcast", (True, False))
def test_sending_metadata(
    pub: ContainerJavascriptPublisher,
    sub: ContainerJavascriptSubscriber,
    pytestconfig: Config,
    simulcast: bool,
):
    """
    Basic test to verify content of sent In-Band User-Defined Metadata.
    Steps:

    #. Start publishing stream from webSDK client - metadata works only with h264 now
        TODO: Add tests for hosted publisher when will use WebSDK >= 0.1.46
    #. Start watching the stream, codec: h264 needs to be passed for Safari
    #. Verify stream is being published and received
    #. In loop send metadata with different object types. Verify metadata content on Viewer

        .. note::
            - uuid in frame metadata content is a value hardcoded in webSDK:
                6e9cfd2a-5907-49ff-b363-8978a6e8340e - default for 0.1.46
                d40e38ea-d419-4c62-94ed-20ac37b4e4fa - default from 0.2.0 it's
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
                "codec": "h264",
                "simulcast": simulcast,
                "metadata": True,
            },
        ) as publisher,
        sub.start_viewing(
            account_id=pytestconfig.option.rts_account_id,
            stream_name=pytestconfig.option.rts_stream_name,
            options={
                "metadata": True,
                "codec": "h264",
            },
        ) as subscriber,
    ):
        pub.zapp.wait_for_condition(publisher.isActive, timeout=15)
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
            ),
        )

        messages = [
            "string message",
            123.0,
            None,
            {"key_1": "value_1"},
            [1, "yes", None],
        ]

        default_uuids = {"0.1.46": "6e9cfd2a-5907-49ff-b363-8978a6e8340e"}
        expected_uuid = default_uuids.get(
            pub.sdk_version_used, "d40e38ea-d419-4c62-94ed-20ac37b4e4fa"
        )

        for message in messages:
            pub.publisher.sendMetadata(message)

            # sendMetadata call completion time in milliseconds
            send_time_utc_msec: int = round(datetime.utcnow().timestamp() * 1000)

            event = sub.zapp.wait_for_event(
                MillicastMetadataEvent(
                    {
                        "uuid": expected_uuid,
                        "unregistered": message,
                        "mid": "0",
                    }
                )
            )

            # automatic timecode is added in sdk 0.2.0 with default UUID only
            if pub.sdk_version_used >= "0.2.0":
                metadata_timecode: str = event.value["timecode"]
                metadata_timecode_dt_obj = datetime.strptime(
                    metadata_timecode, "%Y-%m-%dT%H:%M:%S.%fZ"
                )
                metadata_timecode_utc_msec: int = round(
                    metadata_timecode_dt_obj.timestamp() * 1000
                )

                assert abs(metadata_timecode_utc_msec - send_time_utc_msec) <= 500
            else:
                assert "timecode" not in event.value.keys()


@pytest.mark.parametrize(
    "codec, disable_video, metadata",
    (("vp8", False, True), ("h264", True, True), ("h264", False, False)),
)
def test_no_metadata_sent_without_precondition(
    pub: ContainerJavascriptPublisher,
    sub: ContainerJavascriptSubscriber,
    pytestconfig: Config,
    codec: str,
    disable_video: bool,
    metadata: bool,
):
    """
    Frame Metadata should not be sent in case:
     - other video codec than H264 in use
     - no video being streamed
     - pub/sub connects with metadata = False

    Steps:

    #. Start publishing stream from webSDK client
        TODO: Add tests for hosted publisher when will use WebSDK >= 0.1.46
    #. Start watching the stream
    #. Verify stream is being published and received
    #. Verify if MillicastMetadataEvent doesn't come if any precondition is missing
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
                "codec": codec,
                "disableVideo": disable_video,
                "metadata": metadata,
            },
        ) as publisher,
        sub.start_viewing(
            account_id=pytestconfig.option.rts_account_id,
            stream_name=pytestconfig.option.rts_stream_name,
            options={"metadata": metadata, "codec": codec},
        ) as subscriber,
    ):
        pub.zapp.wait_for_condition(publisher.isActive, timeout=15)
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
            ),
        )

        pub.publisher.sendMetadata("sample data to test")
        if disable_video or metadata is False or codec != "h264":
            sub.zapp.wait_for_bad_event(MillicastMetadataEvent)
        else:
            sub.zapp.wait_for_event(MillicastMetadataEvent)


@pytest.mark.parametrize("simulcast", (True, False))
@pytest.mark.parametrize("uuid", ("valid-uuid", "invalid-uuid"))
def test_send_metadata_with_custom_uuid(
    pub: ContainerJavascriptPublisher,
    sub: ContainerJavascriptSubscriber,
    pytestconfig: Config,
    simulcast: bool,
    uuid: str,
):
    """
    Basic test to verify content of sent In-Band User-Defined Metadata.
    Steps:

    #. Start publishing stream from webSDK client - metadata works only with h264 now
        TODO: Add tests for hosted publisher when will use WebSDK >= 0.1.46
    #. Start watching the stream, codec: h264 needs to be passed for Safari
    #. Verify stream is being published and received
    #. Send metadata with uuid parametrized for valid and invalid value
    #. Verify metadata content on Viewer

        .. note::
            - if custom uuid is invalid it will use default value:
                d40e38ea-d419-4c62-94ed-20ac37b4e4fa
            - no automatic timecode added with custom UUID
    """
    if not isinstance(pub, ContainerJavascriptPublisher):
        pytest.skip(
            "Test only supports browsers with automation test page as publisher"
        )
    if not isinstance(sub, ContainerJavascriptSubscriber):
        pytest.skip(
            "Test only supports browsers with automation test page as subscriber"
        )

    if pub.sdk_version_used < "0.2.0":
        pytest.skip("Custom uuid in metadata works only with sdk >= 0.2.0")

    with (
        pub.start_stream(
            token=pytestconfig.option.rts_publish_token,
            stream_name=pytestconfig.option.rts_stream_name,
            options={
                "codec": "h264",
                "simulcast": simulcast,
                "metadata": True,
            },
        ) as publisher,
        sub.start_viewing(
            account_id=pytestconfig.option.rts_account_id,
            stream_name=pytestconfig.option.rts_stream_name,
            options={
                "metadata": True,
                "codec": "h264",
            },
        ) as subscriber,
    ):
        pub.zapp.wait_for_condition(publisher.isActive, timeout=15)
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
            ),
        )

        uuid_dict = {
            "valid-uuid": "11111111-2222-3333-4444-555555555555",
            "invalid-uuid": "d40e38ea-d419-4c62-94ed-20ac37b4e4fa",
        }

        pub.publisher.sendMetadata("sample data", uuid_dict.get(uuid))

        event = sub.zapp.wait_for_event(
            MillicastMetadataEvent(
                {
                    "uuid": uuid_dict.get(uuid),
                    "unregistered": "sample data",
                    "mid": "0",
                }
            )
        )

        if uuid == "invalid-uuid":
            assert event.value["timecode"]
        else:
            assert "timecode" not in event.value.keys()
