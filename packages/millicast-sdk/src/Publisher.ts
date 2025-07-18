import jwtDecode from 'jwt-decode';
import reemit from 're-emitter';
import { atob } from 'js-base64';
import Logger from './Logger';
import { BaseWebRTC } from './utils/BaseWebRTC';
import { Signaling } from './Signaling';
import { DOLBY_SDK_TIMESTAMP_UUID } from './utils/Codecs';
import PeerConnection, { ConnectionType } from './PeerConnection';
import * as Urls from './urls';
import FetchError from './utils/FetchError';
import { supportsInsertableStreams, supportsRTCRtpScriptTransform } from './utils/StreamTransform';
import TransformWorker from './workers/TransformWorker.worker.ts?worker&inline';
import { PublisherOptions, PublishConnectOptions } from './types/Publisher.types';
import { DecodedJWT, MillicastDirectorResponse, ReconnectData } from './types/BaseWebRTC.types';
import { SignalingPublishOptions } from './types/Signaling.types';
import { VideoCodec } from './types/Codecs.types';
import { isNotDefined, validatePublishConnectOptions } from './utils/Validators';
import { PublisherEvents, SEIUserUnregisteredData } from './types/events';
import Diagnostics from './utils/Diagnostics';

const connectOptions: PublishConnectOptions = {
  sourceId: null,
  mediaStream: null,
  bandwidth: 0,
  metadata: false,
  disableVideo: false,
  disableAudio: false,
  codec: VideoCodec.H264,
  simulcast: false,
  scalabilityMode: null,
  peerConfig: {
    autoInitStats: true,
    statsIntervalMs: 1000,
  },
};

/**
 * This object manages the connection to the platform to publish a stream.
 *
 * Before you can broadcast, you will need a [MediaStream](https://developer.mozilla.org/en-US/docs/Web/API/Media_Streams_API) object
 * which has at most one audio track and at most one video track. This will be used for stream the contained tracks.
 *
 * @example
 * import { Viewer, PublisherOptions } from '@millicast/sdk';
 *
 * const streamName = "My Stream Name";
 * const publishToken = "PUBLISH_TOKEN";
 * const options: PublisherOptions = {
 *  streamName,
 *  publishToken,
 * };
 *
 * // Create a new publisher
 * const publisher = new Publisher(options);
 *
 * // Get a media stream
 * const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
 *
 * // Start the connection
 * const connecOptions = {
 *  mediaStream
 * };
 * await publisher.connect(connecOptions);
 */
export class Publisher extends BaseWebRTC<PublisherEvents> {
  #recordingAvailable: boolean = false;
  private worker: Worker | null = null;
  private streamName = '';
  private stopReemitingWebRTCPeerInstanceEvents: (() => void) | null = null;
  private stopReemitingSignalingInstanceEvents: (() => void) | null = null;
  #options: PublisherOptions;
  protected override options: PublishConnectOptions = connectOptions;

  /**
   * Creates a Publisher object.
   *
   * @param options Options for the publisher.
   */
  constructor(options: PublisherOptions) {
    const logger = Logger.get('Publisher');

    if (isNotDefined(options.streamName)) {
      logger.error('The Stream Name is missing.');
      throw new Error('The Stream Name is missing.');
    }

    if (isNotDefined(options.publishToken)) {
      logger.error('The Publish Token is missing.');
      throw new Error('The Publish Token is missing.');
    }

    super(logger, options.autoReconnect ?? true);

    this.#options = options;
  }

  /**
   * Starts broadcast to an existing stream name.
   *
   * In the example, `getYourMediaStream` and `getYourPublisherConnection` is your own implementation.
   * @param options - General broadcast options.@returns {Promise<void>} Promise object which resolves when the broadcast started successfully.
   *
   * @example
   * import { Viewer, PublisherOptions } from '@millicast/sdk';
   *
   * const streamName = "My Stream Name";
   * const publishToken = "PUBLISH_TOKEN";
   * const options: PublisherOptions = {
   *  streamName,
   *  publishToken,
   * };
   *
   * // Create a new publisher
   * const publisher = new Publisher(options);
   *
   * // Get a media stream
   * const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
   *
   * // Start the connection
   * const connecOptions = {
   *  mediaStream
   * };
   * await publisher.connect(connecOptions);
   */
  override async connect(options: PublishConnectOptions = connectOptions): Promise<void> {
    const { error, value } = validatePublishConnectOptions(options);

    if (error) this.logger.warn(error, value);

    this.options = {
      ...connectOptions,
      ...options,
      peerConfig: { ...connectOptions.peerConfig, ...options.peerConfig },
      setSDPToPeer: false,
    };

    this.options.metadata =
      this.options.metadata && this.options.codec === VideoCodec.H264 && !this.options.disableVideo;

    await this.initConnection({ migrate: false });
  }

  /**
   * Restart publishing the stream.
   *
   * @param data Data object.
   */
  override async reconnect(data?: ReconnectData) {
    this.options.mediaStream = this.webRTCPeer?.getTracks() ?? this.options.mediaStream;
    super.reconnect(data);
  }

  /** @ignore */
  override async replaceConnection() {
    this.logger.info('Migrating current connection');
    this.options.mediaStream = this.webRTCPeer?.getTracks() ?? this.options.mediaStream;
    await this.initConnection({ migrate: true });
  }

  /**
   * Initialize recording in an active stream and change the current record option.
   */
  public async startRecording(): Promise<void> {
    if (this.#recordingAvailable) {
      this.options.record = true;
      await this.signaling?.cmd('record');
      this.logger.info('Broadcaster start recording');
    } else {
      this.logger.error('Record not available');
    }
  }

  /**
   * Stops the recording in the active stream and change the current record option.
   */
  public async stopRecording(): Promise<void> {
    if (this.#recordingAvailable) {
      this.options.record = false;
      await this.signaling?.cmd('unrecord');
      this.logger.info('Broadcaster stop recording');
    } else {
      this.logger.error('Unrecord not available');
    }
  }

  /**
   * Stops the publication of the stream.
   */
  public override stop() {
    super.stop();
    this.worker?.terminate();
    this.worker = null;
  }

  private async initConnection(data: { migrate: boolean }) {
    this.logger.debug('Broadcast option values: ', this.options);
    this.stopReconnection = false;
    let promises;
    if (!this.options.mediaStream) {
      this.logger.error('Error while broadcasting. MediaStream required');
      throw new Error('MediaStream required');
    }
    if (!data.migrate && this.isActive()) {
      this.logger.warn('Broadcast currently working');
      throw new Error('Broadcast currently working');
    }
    let publisherData: MillicastDirectorResponse;
    try {
      publisherData = await this.getConnectionData();
      if (this.options.peerConfig) {
        //  Set the iceServers from the publish data into the peerConfig
        this.options.peerConfig.iceServers = publisherData?.iceServers;
        this.options.peerConfig.encodedInsertableStreams = this.options.metadata;
      }
    } catch (error) {
      this.logger.error('Error generating token.');
      if (error instanceof FetchError) {
        if (error.status === 401 || !this.autoReconnect) {
          // should not reconnect
          this.stopReconnection = true;
        } else {
          // should reconnect with exponential back off if autoReconnect is true
          this.reconnect();
        }
      }
      throw error;
    }
    if (!publisherData) {
      this.logger.error('Error while broadcasting. Publisher data required');
      throw new Error('Publisher data required');
    }
    const decodedJWT = jwtDecode(publisherData.jwt) as DecodedJWT;
    this.streamName = decodedJWT['millicast'].streamName;
    this.#recordingAvailable = decodedJWT[atob('bWlsbGljYXN0')].record;
    if (this.options.record && !this.#recordingAvailable) {
      this.logger.error('Error while broadcasting. Record option detected but recording is not available');
      throw new Error('Record option detected but recording is not available');
    }

    const signalingInstance = new Signaling({
      streamName: this.streamName,
      url: `${publisherData.urls[0]}?token=${publisherData.jwt}`,
    });
    const webRTCPeerInstance = data.migrate ? new PeerConnection() : this.webRTCPeer;

    await webRTCPeerInstance.createRTCPeer(this.options.peerConfig, ConnectionType.Publisher);

    // Stop emiting events from the previous instances
    this.stopReemitingWebRTCPeerInstanceEvents?.();
    this.stopReemitingSignalingInstanceEvents?.();
    // And start emitting from the new ones
    this.stopReemitingWebRTCPeerInstanceEvents = reemit(webRTCPeerInstance, this, ['connectionStateChange']);
    this.stopReemitingSignalingInstanceEvents = reemit(signalingInstance, this, [
      'active',
      'inactive',
      'viewercount',
    ]);

    const getLocalSDPPromise = webRTCPeerInstance.getRTCLocalSDP(this.options as SignalingPublishOptions);
    const signalingConnectPromise = signalingInstance.connect();
    promises = await Promise.all([getLocalSDPPromise, signalingConnectPromise]);
    const localSdp = promises[0];

    if (this.options.metadata) {
      if (!this.worker) {
        this.worker = new TransformWorker();
      }

      const senders = this.getRTCPeerConnection()?.getSenders();

      senders?.forEach((sender: RTCRtpSender) => {
        if (supportsRTCRtpScriptTransform && this.worker) {
          sender.transform = new RTCRtpScriptTransform(this.worker, {
            name: 'senderTransform',
            codec: this.options.codec,
          });
        } else if (supportsInsertableStreams) {
          // @ts-expect-error supportsInserableStream checks if createEncodedStreams is defined
          const { readable, writable } = sender.createEncodedStreams();
          this.worker?.postMessage(
            {
              action: 'insertable-streams-sender',
              codec: this.options.codec,
              readable,
              writable,
            },
            [readable, writable]
          );
        }
      });
    }

    let oldSignaling = this.signaling;
    this.signaling = signalingInstance;

    const publishPromise = this.signaling.publish(localSdp, this.options as SignalingPublishOptions);
    const setLocalDescriptionPromise = webRTCPeerInstance.peer?.setLocalDescription(
      webRTCPeerInstance.sessionDescription
    );
    promises = await Promise.all([publishPromise, setLocalDescriptionPromise]);
    let remoteSdp = promises[0];

    if (!this.options.disableVideo && this.options.bandwidth && this.options.bandwidth > 0) {
      remoteSdp = webRTCPeerInstance.updateBandwidthRestriction(remoteSdp, this.options.bandwidth);
    }

    await webRTCPeerInstance.setRTCRemoteSDP(remoteSdp);

    this.logger.info('Broadcasting to streamName:', this.streamName);

    let oldWebRTCPeer: PeerConnection | null = this.webRTCPeer;
    this.webRTCPeer = webRTCPeerInstance;
    this.setReconnect();

    if (data.migrate) {
      this.webRTCPeer.on('connectionStateChange', (state) => {
        if (['connected', 'disconnected', 'failed', 'closed'].includes(state)) {
          oldSignaling?.close?.();
          oldWebRTCPeer?.closeRTCPeer?.();
          oldSignaling = oldWebRTCPeer = null;
        }
      });
    }
  }

  /**
   * Sends SEI user unregistered data as part of the frame being streamed. Only available for H.264 codec.
   * @param message The data to be sent as SEI user unregistered data.
   * @param uuid String with UUID format as hex digit (XXXX-XX-XX-XX-XXXXXX). Default is `"d40e38ea-d419-4c62-94ed-20ac37b4e4fa"`.
   */
  public sendMetadata(message: SEIUserUnregisteredData, uuid: string = DOLBY_SDK_TIMESTAMP_UUID) {
    if (this.options?.metadata && this.worker) {
      this.worker.postMessage({
        action: 'metadata-sei-user-data-unregistered',
        uuid,
        payload: message,
      });
    } else {
      let warningMessage = 'Could not send metadata due to:';
      if (this.options) {
        if (!this.options.metadata) {
          warningMessage += '\n- Metadata option is not enabled.';
          if (this.options.codec !== VideoCodec.H264) {
            warningMessage += '\n- Incompatible codec. Only H264 available.';
          }
          if (this.options.disableVideo) {
            warningMessage += '\n- Video disabled.';
          }
        } else if (!this.worker) {
          warningMessage += '\n- Stream not being published.';
        }
      } else {
        warningMessage += '\n- Stream not being published.';
      }
      this.logger.warn(warningMessage);
    }
  }

  /**
   * Gets the publisher connection data.
   *
   * @param options Millicast options.
   *
   * @returns A {@link !Promise Promise} whose fulfillment handler receives a {@link MillicastDirectorResponse} object which represents the result of getting the publishing connection path.
   */
  private async getConnectionData(): Promise<MillicastDirectorResponse> {
    this.logger.info('Getting publisher connection path for stream name: ', this.#options.streamName);
    const payload = {
      streamName: this.#options.streamName,
      streamType: 'WebRtc',
    };
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.#options.publishToken}`,
    };
    const url = `${Urls.getEndpoint()}/api/director/publish`;
    try {
      const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(payload) });
      let data = await response.json();
      if (data.status === 'fail') {
        const error = new FetchError(data.data.message, response.status);
        throw error;
      }
      data = this.parseIncomingDirectorResponse(data);
      this.logger.debug('Getting publisher response: ', data);
      Diagnostics.initAccountId(data.data.streamAccountId);

      return data.data;
    } catch (e) {
      this.logger.error('Error while getting publisher connection path. ', e);
      throw e;
    }
  }
}
