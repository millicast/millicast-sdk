import reemit from 're-emitter'
import jwtDecode from 'jwt-decode'
import Logger from './Logger'
import { BaseWebRTC } from './utils/BaseWebRTC'
import { Signaling } from './Signaling'
import PeerConnection from './PeerConnection'
import { hexToUint8Array } from './utils/StringUtils'
import { swapPropertyValues } from './utils/ObjectUtils'
import FetchError from './utils/FetchError'
import { supportsInsertableStreams, supportsRTCRtpScriptTransform } from './utils/StreamTransform'
import {
  rtcDrmConfigure,
  rtcDrmOnTrack,
  rtcDrmEnvironments,
  rtcDrmFeedFrame,
  DrmConfig,
} from './drm/rtc-drm-transform.min.js'
import TransformWorker from './workers/TransformWorker.worker.ts?worker&inline'
import SdpParser from './utils/SdpParser'
import {
  ViewerConnectOptions,
  LayerInfo,
  ViewProjectSourceMapping,
  DRMOptions,
  ViewerOptions,
} from './types/Viewer.types.js'
import { DecodedJWT, DRMProfile, Media, MillicastDirectorResponse } from './types/BaseWebRTC.types'
import { VideoCodec } from './types/Codecs.types'
import * as Urls from './urls'
import { ActiveEventPayload, InactiveEventPayload, MetadataEventPayload, SEIUserUnregisteredData, ViewerEvents } from './types/events'
import { isNotDefined } from './utils/Validators'
import Diagnostics from './utils/Diagnostics'

const defaultConnectOptions: ViewerConnectOptions = {
  metadata: false,
  enableDRM: false,
  disableVideo: false,
  disableAudio: false,
  peerConfig: {
    autoInitStats: true,
    statsIntervalMs: 1000,
  },
}

// TODO type DRMOptions
// export interface DRMOptions {
//   merchant: string,
//   sessionId: string,
//   environment: rtcDrmEnvironments.Staging,
//   customTransform: this.options.metadata,
//   videoElement: HTMLVideoElement,
//   audioElement: HTMLAudioElement,
//   video: {
//     codec: 'h264',
//     encryption: 'cbcs',
//     keyId: hexToUint8Array(options.videoEncryptionParams.keyId),
//     iv: hexToUint8Array(options.videoEncryptionParams.iv),
//   },
//   audio: { codec: 'opus', encryption: 'clear' },
//   onFetch: this.onRtcDrmFetch.bind(this),
// }

/**
 * This object manages the connection to the platform to subscribe and receive streams.
 * 
 * @example
 * How to connect to a stream:
 * ```typescript
 * import { ViewerConnectOptions, Viewer, ViewerOptions } from '@millicast/sdk';
 *
 * const streamName = 'My Millicast Stream Name';
 * const accountId = 'Millicast Publisher account Id';
 * 
 * const options: ViewerOptions = {
 *  streamName,
 *  streamAccountId,
 * };
 *
 * // Create a new viewer
 * const viewer = new Viewer(options);
 *
 * // Listen to the track event to receive the streams from the publisher.
 * viewer.on('track', (event) => {
 *   addStreamToYourVideoTag(event.streams[0]);
 * });
 *
 * // Connect to the stream
 * const connectOptions: ViewerConnectOptions = {};
 * await viewer.connect(connectOptions);
 * ```
 * 
 * @example
 * How to connect to a secure stream:
 * ```typescript
 * import { ViewerConnectOptions, Viewer, ViewerOptions } from '@millicast/sdk';
 *
 * const streamName = 'My Millicast Stream Name';
 * const accountId = 'Millicast Publisher account Id';
 * const subscriberToken = '176949b9e57de248d37edcff1689a84a047370ddc3f0dd960939ad1021e0b744';
 * 
 * const options: ViewerOptions = {
 *  streamName,
 *  accountId,
 *  subscriberToken,
 * };
 *
 * // Create a new viewer
 * const viewer = new Viewer(options);
 *
 * // Listen to the track event to receive the streams from the publisher.
 * viewer.on('track', (event) => {
 *   addStreamToYourVideoTag(event.streams[0]);
 * });
 *
 * // Connect to the stream
 * const connectOptions: ViewerConnectOptions = {};
 * await viewer.connect(connectOptions);
 */
export class Viewer extends BaseWebRTC<ViewerEvents> {
  // States what payload type is associated with each codec from the SDP answer.
  private payloadTypeCodec: { [key: number]: string } = {}
  // Follows the media id values of each transceiver's track from the 'track' events.
  private tracksMidValues: { [key: string]: MediaStreamTrack } = {}
  // mapping media ID of RTCRtcTransceiver to DRM Options
  private drmOptionsMap: Map<string, DrmConfig> | null = null
  private streamName = ''
  private DRMProfile: DRMProfile | null = null
  private worker: Worker | null = null
  private subscriberToken: string | null = null
  private isMainStreamActive = false
  private eventQueue: RTCTrackEvent[] = []
  private stopReemitingWebRTCPeerInstanceEvents: (() => void) | null = null
  private stopReemitingSignalingInstanceEvents: (() => void) | null = null
  #options: ViewerOptions;
  protected override options: ViewerConnectOptions | null = null;

  /**
   * Creates a Viewer object.
   * @param options Options for the viewer.
   */
  constructor(options: ViewerOptions) {
    const logger = Logger.get('Viewer');

    if (isNotDefined(options.streamName)) {
      logger.error('The Stream Name is missing.');
      throw new Error('The Stream Name is missing.');
    }

    if (isNotDefined(options.streamAccountId)) {
      logger.error('The Stream Account ID is missing.');
      throw new Error('The Stream Account ID is missing.');
    }

    super(logger, options.autoReconnect ?? true);

    this.#options = options;
  }

  /**
   * Connects to a stream as a subscriber.
   *
   * In the example, `addStreamToYourVideoTag` and `getYourSubscriberConnectionPath` is your own implementation.
   * 
   * @param options General subscriber options.
   * 
   * @returns Promise object which resolves when the connection was successfully established.
   * 
   * @example
   * import { Viewer, ViewerOptions } from '@millicast/sdk';
   *
   * const streamName = "My Millicast Stream Name";
   * const accountId = "Millicast Publisher account Id";
   * const options: ViewerOptions = {
   *  streamName,
   *  streamAccountId,
   * };
   *
   * // Create a new viewer
   * const viewer = new Viewer(options);
   *
   * // Listen to the track event to receive the streams from the publisher.
   * viewer.on('track', (event) => {
   *   addStreamToYourVideoTag(event.streams[0]);
   * });
   *
   * viewer.on('error', (error) => {
   *   console.error('Error from Millicast SDK', error);
   * });
   *
   * try {
   *  const options = {};
   *  await viewer.connect(options);
   * } catch (e) {
   *  console.error('Connection failed', e);
   * }
   */
  override async connect(options: ViewerConnectOptions = defaultConnectOptions): Promise<void> {
    this.options = {
      ...defaultConnectOptions,
      ...options,
      peerConfig: { ...defaultConnectOptions.peerConfig, ...options.peerConfig },
      setSDPToPeer: false,
    }
    this.eventQueue.length = 0
    await this.initConnection({ migrate: false })
  }

  /**
   * Selects the simulcast encoding layer and svc layers for the main video track
   * @param layer leave empty for automatic layer selection based on bandwidth estimation.
   */
  async select(layer?: LayerInfo): Promise<void> {
    this.logger.debug('Viewer select layer values: ', layer);
    await this.signaling?.cmd('select', { layer });
    this.logger.info('Connected to streamName: ', this.streamName);
  }

  /**
   * Add remote receiving track.
   * @param {String} media - Media kind ('audio' | 'video').
   * @param {Array<MediaStream>} streams - Streams the track will belong to.
   * @return {Promise<RTCRtpTransceiver>} Promise that will be resolved when the RTCRtpTransceiver is assigned an mid value.
   */
  async addRemoteTrack(media: Media, streams: Array<MediaStream>): Promise<RTCRtpTransceiver> {
    this.logger.info('Viewer adding remote track', media)
    const transceiver = await this.webRTCPeer.addRemoteTrack(media, streams)
    for (const stream of streams) {
      stream.addTrack(transceiver.receiver.track)
    }
    return transceiver
  }

  /**
   * Start projecting source in selected media ids.
   * 
   * @param sourceId Selected source id.
   * @param mapping Mapping of the source track ids to the receiver mids.
   */
  async project(sourceId: string, mapping: ViewProjectSourceMapping[]): Promise<void> {
    for (const map of mapping) {
      if (!map.trackId && !map.media) {
        this.logger.error('Error in projection mapping, trackId or mediaId must be set');
        throw new Error('Error in projection mapping, trackId or mediaId must be set');
      }
      const peer = this.webRTCPeer.getRTCPeer();
      // Check we have the mediaId in the transceivers
      if (
        map.mediaId &&
        !peer?.getTransceivers().find((t: RTCRtpTransceiver) => t.mid === map.mediaId?.toString())
      ) {
        this.logger.error(`Error in projection mapping, ${map.mediaId} mid not found in local transceivers`)
        throw new Error(`Error in projection mapping, ${map.mediaId} mid not found in local transceivers`)
      }
    }

    this.logger.debug('Viewer project source: layer mappings: ', sourceId, mapping);
    await this.signaling?.cmd('project', { sourceId, mapping });
    this.logger.info('Projection done');
  }

  /**
   * Stop projecting attached source in selected media ids.
   * 
   * @param mediaIds mid value of the receivers that are going to be detached.
   */
  async unproject(mediaIds: Array<string>): Promise<void> {
    this.logger.debug('Viewer unproject mediaIds: ', mediaIds);
    await this.signaling?.cmd('unproject', { mediaIds });
    this.logger.info('Unprojection done');
  }

  /** Close the connection. */
  override stop(): void {
    super.stop()
    this.drmOptionsMap?.clear()
    this.DRMProfile = null
    this.worker?.terminate()
    this.worker = null
    this.payloadTypeCodec = {}
    this.tracksMidValues = {}
    this.eventQueue.length = 0
  }






  private async initConnection(data: { migrate: boolean }) {
    this.logger.debug('Viewer connect options values: ', this.options)
    this.stopReconnection = false
    let promises

    if (!data.migrate && this.isActive()) {
      this.logger.warn('Viewer currently subscribed')
      throw new Error('Viewer currently subscribed')
    }

    let subscriberData: MillicastDirectorResponse;

    try {
      subscriberData = await this.getConnectionData()
      // Set the iceServers from the subscribe data into the peerConfig
      if (this.options?.peerConfig) {
        this.options.peerConfig.iceServers = subscriberData?.iceServers
        // We should not set the encodedInsertableStreams if the DRM and the frame metadata are not enabled
        this.options.peerConfig.encodedInsertableStreams =
          supportsInsertableStreams && (this.options.enableDRM || this.options.metadata)
      }
    } catch (error) {
      // TODO: handle DRM error when DRM is enabled but no subscribe token is provided
      this.logger.error('Error generating token.')
      if (error instanceof FetchError) {
        if (error.status === 401 || !this.autoReconnect) {
          // should not reconnect
          this.stopReconnection = true
        } else {
          // should reconnect with exponential back off if autoReconnect is true
          this.reconnect()
        }
      }
      throw error
    }

    if (!subscriberData) {
      this.logger.error('Error while subscribing. Subscriber data required');
      throw new Error('Subscriber data required');
    }

    const decodedJWT = jwtDecode(subscriberData.jwt) as DecodedJWT
    this.streamName = decodedJWT['millicast'].streamName
    const signalingInstance = new Signaling({
      streamName: this.streamName,
      url: `${subscriberData.urls[0]}?token=${subscriberData.jwt}`,
    })

    if (subscriberData.drmObject) {
      // cache the DRM license server URLs
      this.DRMProfile = subscriberData.drmObject
    }
    if (subscriberData.subscriberToken) {
      this.subscriberToken = subscriberData.subscriberToken
    }
    const webRTCPeerInstance = data.migrate ? new PeerConnection() : this.webRTCPeer

    await webRTCPeerInstance.createRTCPeer(this.options?.peerConfig)
    // Stop emiting events from the previous instances
    this.stopReemitingWebRTCPeerInstanceEvents?.();
    this.stopReemitingSignalingInstanceEvents?.();
    // And start emitting from the new ones
    this.stopReemitingWebRTCPeerInstanceEvents = reemit(
      webRTCPeerInstance,
      this,
      [ 'connectionStateChange' ]
    );
    this.stopReemitingSignalingInstanceEvents = reemit(
      signalingInstance,
      this,
      [ 'viewercount', 'migrate', 'updated' ]
    );

    if (this.options?.metadata) {
      if (!this.worker) {
        this.worker = new TransformWorker()
      }
      this.worker.onmessage = (message) => {
        if (message.data.event === 'metadata') {
          const decoder = new TextDecoder()
          const metadata: MetadataEventPayload = message.data.metadata
          metadata.mid = message.data.mid
          metadata.track = this.tracksMidValues[message.data.mid]
          if (message.data.metadata.uuid) {
            const uuid = message.data.metadata.uuid as Uint8Array
            metadata.uuid = uuid.reduce(
              (str: string, byte: number) => str + byte.toString(16).padStart(2, '0'),
              ''
            )
            metadata.uuid = metadata.uuid.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5')
          }
          if (message.data.metadata.timecode) {
            metadata.timecode = new Date(decoder.decode(message.data.metadata.timecode))
          }
          if (message.data.metadata.unregistered) {
            const content = decoder.decode(message.data.metadata.unregistered)
            try {
              const json: SEIUserUnregisteredData = JSON.parse(content)
              metadata.unregistered = json
            } catch (e) {
              // was not a JSON, just return the raw bytes (i.e. do nothing)
              this.logger.info('The content could not be converted to JSON, returning raw bytes instead')
            }
          
          }
          // Emits when metadata have been extracted from the stream.
          this.emit('metadata', metadata);
        }
      }
    }

    webRTCPeerInstance.on('track', (trackEvent: RTCTrackEvent) => {
      if (!this.isMainStreamActive) {
        this.eventQueue.push(trackEvent)
        return
      }
      this.onTrackEvent(trackEvent)
    });

    signalingInstance.on('active', (obj: ActiveEventPayload) => {
      this.emit('active', obj);
      this.isMainStreamActive = true;
      while (this.eventQueue.length > 0) {
        this.onTrackEvent(this.eventQueue.shift() as RTCTrackEvent);
      }
    });

    signalingInstance.on('inactive', (obj: InactiveEventPayload) => {
      this.emit('inactive', obj);
      this.isMainStreamActive = false;
    });

    const options = { ...(this.options as ViewerConnectOptions), stereo: true };
    const getLocalSDPPromise = webRTCPeerInstance.getRTCLocalSDP(options);
    const signalingConnectPromise = signalingInstance.connect();

    promises = await Promise.all([getLocalSDPPromise, signalingConnectPromise])

    const localSdp = promises[0]
    let oldSignaling = this.signaling
    this.signaling = signalingInstance

    const subscribePromise = this.signaling.subscribe(localSdp, {
      ...this.options,
      vad: !!this.options?.multiplexedAudioTracks,
    } as ViewerConnectOptions);
    const setLocalDescriptionPromise = webRTCPeerInstance.peer?.setLocalDescription(
      webRTCPeerInstance.sessionDescription as RTCSessionDescriptionInit
    )
    promises = await Promise.all([subscribePromise, setLocalDescriptionPromise])
    const sdpSubscriber = promises[0]

    this.payloadTypeCodec = SdpParser.getCodecPayloadType(sdpSubscriber)

    await webRTCPeerInstance.setRTCRemoteSDP(sdpSubscriber)

    this.logger.info('Connected to streamName: ', this.streamName)

    let oldWebRTCPeer: PeerConnection | null = this.webRTCPeer
    this.webRTCPeer = webRTCPeerInstance
    this.setReconnect()

    if (data.migrate) {
      this.webRTCPeer.on('connectionStateChange', (state: string) => {
        if (state === 'connected') {
          setTimeout(() => {
            oldSignaling?.close?.()
            oldWebRTCPeer?.closeRTCPeer?.()
            oldSignaling = oldWebRTCPeer = null
            this.logger.info('Current connection migrated')
          }, 1000)
        } else if (['disconnected', 'failed', 'closed'].includes(state)) {
          oldSignaling?.close?.()
          oldWebRTCPeer?.closeRTCPeer?.()
          oldSignaling = oldWebRTCPeer = null
        }
      })
    }
  }

  onTrackEvent(trackEvent: RTCTrackEvent) {
    this.tracksMidValues[trackEvent.transceiver?.mid as string] = trackEvent.track
    if (this.isDRMOn) {
      const mediaId = trackEvent.transceiver.mid
      if (mediaId) {
        const drmOptions = this.getDRMConfiguration(mediaId)
        if (drmOptions) {
          try {
            rtcDrmOnTrack(trackEvent, drmOptions)
          } catch (error) {
            this.logger.error('Failed to apply DRM on media Id:', mediaId, 'error is: ', error)
            this.emit('error', new Error('Failed to apply DRM on media Id: ' + mediaId + ' error is: ' + error))
          }
          if (!this.worker) {
            this.worker = new TransformWorker()
          }
          this.worker.addEventListener('message', (message) => {
            if (message.data.event === 'complete') {
              // feed the frame to DRM processing worker
              rtcDrmFeedFrame(message.data.frame, null, drmOptions)
            }
          })
        } else {
          this.logger.warn('drmConfig not defined in track event')
        }
      } else {
        this.logger.warn('mediaId not defined in track event')
      }
    }
    if (this.options?.metadata) {
      if (supportsRTCRtpScriptTransform && this.worker) {
        trackEvent.receiver.transform = new RTCRtpScriptTransform(this.worker, {
          name: 'receiverTransform',
          payloadTypeCodec: { ...this.payloadTypeCodec },
          codec: this.options.metadata && VideoCodec.H264,
          mid: trackEvent.transceiver?.mid,
        })
      } else if (supportsInsertableStreams) {
        // @ts-expect-error supportsInserableStream checks if createEncodedStreams is defined
        const { readable, writable } = trackEvent.receiver.createEncodedStreams()
        this.worker?.postMessage(
          {
            action: 'insertable-streams-receiver',
            payloadTypeCodec: { ...this.payloadTypeCodec },
            codec: this.options.metadata && VideoCodec.H264,
            mid: trackEvent.transceiver?.mid,
            readable,
            writable,
          },
          [readable, writable]
        )
      }
    }
    this.emit('track', trackEvent)
  }

  /** @ignore */
  override async replaceConnection(): Promise<void> {
    this.logger.info('Migrating current connection')
    await this.initConnection({ migrate: true })
  }











  getDRMConfiguration(mediaId: string) {
    return this.drmOptionsMap ? this.drmOptionsMap.get(mediaId) : null
  }

  async onRtcDrmFetch(url: string, opts: RequestInit) {
    opts.headers = (opts.headers as Headers) || new Headers()
    if (!opts.headers) {
      opts.headers = new Headers()
    }
    // our server doesn't support x-dt-custom-data
    if (opts.headers.get('x-dt-custom-data')) {
      opts.headers.delete('x-dt-custom-data')
    }
    if (this.subscriberToken) {
      opts.headers.append('Authorization', `Bearer ${this.subscriberToken}`)
    } else {
      this.logger.warn('onRtcDrmFetch: no subscriberToken')
    }
    return fetch(url, opts)
  }

  /**
   * @typedef {Object} EncryptionParameters
   * @property {String} keyId 16-byte KeyID, in lowercase hexadecimal without separators
   * @property {String} iv 16-byte initialization vector, in lowercase hexadecimal without separators
   * /

  /**
   * @typedef {Object} DRMOptions - the options for DRM playback
   * @property {HTMLVideoElement} videoElement - the video HTML element
   * @property {EncryptionParameters} videoEncryptionParams - the video encryption parameters
   * @property {String} videoMid - the video media ID of RTCRtpTransceiver
   * @property {HTMLAudioElement} audioElement - the audio HTML audioElement
   * @property {EncryptionParameters} [audioEncryptionParams] - the audio encryption parameters
   * @property {String} [audioMid] - the audio media ID of RTCRtpTransceiver
   * @property {Number} [mediaBufferMs] - average target latency in milliseconds
   */

  /**
   * Configure DRM protected stream.
   * When there are {@link EncryptionParameters} in the payload of 'active' broadcast event, this method should be called
   * @param {DRMOptions} options - the options for DRM playback
   */
  configureDRM(options: DRMOptions) {
    if (!options) {
      throw new Error('Required DRM options is not provided')
    }
    if (!this.drmOptionsMap) {
      // map transceiver's mediaId to its DRM options
      this.drmOptionsMap = new Map()
    }
    const drmOptions: DrmConfig = {
      merchant: 'dolby',
      environment: rtcDrmEnvironments.Production,
      customTransform: this.options?.metadata,
      videoElement: options.videoElement,
      audioElement: options.audioElement,
      video: {
        codec: 'h264',
        encryption: 'cbcs',
        keyId: hexToUint8Array(options.videoEncryptionParams.keyId),
        iv: hexToUint8Array(options.videoEncryptionParams.iv),
      },
      audio: { codec: 'opus', encryption: 'clear' },
      onFetch: this.onRtcDrmFetch.bind(this),
    }
    if (options.mediaBufferMs) {
      drmOptions.mediaBufferMs = options.mediaBufferMs
    }
    if (this.DRMProfile) {
      if (this.DRMProfile.playReadyUrl) {
        drmOptions.prLicenseUrl = this.DRMProfile.playReadyUrl
      }
      if (this.DRMProfile.widevineUrl) {
        drmOptions.wvLicenseUrl = this.DRMProfile.widevineUrl
      }
      if (this.DRMProfile.fairPlayUrl) {
        drmOptions.fpsLicenseUrl = this.DRMProfile.fairPlayUrl
      }
      if (this.DRMProfile.fairPlayCertUrl) {
        drmOptions.fpsCertificateUrl = this.DRMProfile.fairPlayCertUrl
      }
    }
    try {
      rtcDrmConfigure(drmOptions)
      this.drmOptionsMap.set(options.videoMid, drmOptions)
      if (options.audioMid) {
        this.drmOptionsMap.set(options.audioMid, drmOptions)
      }
      drmOptions.videoElement.addEventListener('rtcdrmerror', (event: unknown) => {
        const rtcDrmErrorEvent = event as { detail: { message: string } }
        this.logger.error(
          'DRM error: ',
          rtcDrmErrorEvent.detail.message,
          'in video element:',
          drmOptions.videoElement.id
        )
        this.emit('error', new Error(rtcDrmErrorEvent.detail.message))
      })
    } catch (error) {
      this.logger.error('Failed to configure DRM with options:', options, 'error is:', error)
    }
  }

  /**
   * Remove DRM configuration for a mediaId
   * @param {String} mediaId
   */
  removeDRMConfiguration(mediaId: string) {
    this.drmOptionsMap?.delete(mediaId)
  }

  /**
   * Checks if there are any DRM protected tracks.
   */
  public get isDRMOn() {
    return !!this.drmOptionsMap && this.drmOptionsMap.size > 0
  }

  /**
   * Exchange the DRM configuration between two transceivers
   * Both of the transceivers should be used for DRM protected streams
   * @param {String} targetMediaId
   * @param {String} sourceMediaId
   */
  exchangeDRMConfiguration(targetMediaId: string, sourceMediaId: string) {
    const targetDRMOptions = this.getDRMConfiguration(targetMediaId)
    const sourceDRMOptions = this.getDRMConfiguration(sourceMediaId)
    if (targetDRMOptions === null || !sourceDRMOptions?.video) {
      throw new Error('No DRM configuration found for ' + targetMediaId)
    }
    if (sourceDRMOptions === null || !targetDRMOptions?.video) {
      throw new Error('No DRM configuration found for ' + sourceMediaId)
    }
    swapPropertyValues(targetDRMOptions.video, sourceDRMOptions.video, 'keyId')
    swapPropertyValues(targetDRMOptions.video, sourceDRMOptions.video, 'iv')
    try {
      rtcDrmConfigure(targetDRMOptions)
    } catch (error) {
      this.logger.error('Failed to configure DRM with options:', targetDRMOptions, 'error is:', error)
    }
    try {
      rtcDrmConfigure(sourceDRMOptions)
    } catch (error) {
      this.logger.error('Failed to configure DRM with options:', sourceDRMOptions, 'error is:', error)
    }
  }

  /**
   * Get subscriber connection data.
   * 
   * @param options Millicast options.
   * 
   * @returns A {@link !Promise Promise} whose fulfillment handler receives a {@link MillicastDirectorResponse} object which represents the result of getting the subscribe connection data.
   */
  private async getConnectionData(): Promise<MillicastDirectorResponse> {
    Diagnostics.initAccountId(this.#options.streamAccountId);
    this.logger.info(`Getting subscriber connection data for stream name: ${this.#options.streamName} and account id: ${this.#options.streamAccountId}`);

    const payload = {
      streamAccountId: this.#options.streamAccountId,
      streamName: this.#options.streamName,
    };

    const subscriberToken = this.#options.subscriberToken;
    let headers: { 'Content-Type': string; Authorization?: string } = { 'Content-Type': 'application/json' };
    if (subscriberToken) {
      headers = { ...headers, Authorization: `Bearer ${subscriberToken}` };
    }
    const url = `${Urls.getEndpoint()}/api/director/subscribe`;
    try {
      const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(payload) });
      let data = await response.json();

      if (data.status === 'fail') {
        throw new FetchError(data.data.message, response.status);
      }

      data = this.parseIncomingDirectorResponse(data);
      this.logger.debug('Getting subscriber response:', data);
      if (this.#options.subscriberToken) {
        data.data.subscriberToken = this.#options.subscriberToken;
      }
      
      return data.data;
    } catch (e) {
      this.logger.error('Error while getting subscriber connection path.', e);
      throw e;
    }
  }
}
