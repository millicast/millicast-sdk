import { ILogger } from 'js-logger'
import TransactionManager from 'transaction-manager'
import Logger from './Logger'
import SdpParser from './utils/SdpParser'
import { PeerConnection } from './PeerConnection'
import Diagnostics from './utils/Diagnostics'
import {
  PublishCmd,
  SignalingOptions,
  SignalingPublishOptions,
  SignalingSubscribeOptions,
  ViewCmd,
  ViewResponse,
} from './types/Signaling.types'
import { ICodecs } from './types/PeerConnection.types'
import { VideoCodec } from './types/Codecs.types'
import { TypedEventEmitter } from './utils/TypedEventEmitter'
import { ActiveEventPayload, InactiveEventPayload, LayersEventPayload, SignalingEvents } from './types/events'

/**
 * Starts WebSocket connection and manages the messages between peers.
 */
export class Signaling extends TypedEventEmitter<SignalingEvents> {
  #logger: ILogger;
  #streamName: string | null;
  #wsUrl: string;
  #transactionManager: TransactionManager | null = null;
  #serverId: string | null = null;
  #clusterId: string | null = null;
  #streamViewId: string | null = null;

  public webSocket: WebSocket | null = null;

  /**
   * Creates a Signaling object.
   * @param options Options for the signaling object.
   */
  constructor(
    options: SignalingOptions = {
      streamName: null,
      url: 'ws://localhost:8080/',
    }
  ) {
    super()

    this.#logger = Logger.get('Signaling');
    this.#logger.setLevel(Logger.DEBUG);

    this.#streamName = options.streamName;
    this.#wsUrl = options.url;
  }

  /**
   * Starts a WebSocket connection with signaling server.
   * 
   * @returns A {@link !Promise Promise} whose fulfillment handler receives a [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) object of the established connection.
   * 
   * @example const response = await signaling.connect();
   */
  public async connect(): Promise<WebSocket> {
    this.#logger.info('Connecting to Signaling Server')
    if (this.#transactionManager && this.webSocket?.readyState === WebSocket.OPEN) {
      this.#logger.info('Connected to server: ', this.webSocket.url);
      this.#logger.debug('WebSocket value: ', {
        url: this.webSocket.url,
        protocol: this.webSocket.protocol,
        readyState: this.webSocket.readyState,
        binaryType: this.webSocket.binaryType,
        extensions: this.webSocket.extensions,
      });

      this.emit('wsConnectionSuccess', { ws: this.webSocket, tm: this.#transactionManager });
      return this.webSocket;
    }

    return new Promise((resolve, reject) => {
      this.webSocket = new WebSocket(this.#wsUrl);
      this.#transactionManager = new TransactionManager(this.webSocket);

      this.webSocket.onopen = () => {
        this.#logger.info('WebSocket opened')
        this.#transactionManager &&
          this.#transactionManager.on('event', (evt: TransactionManager.Event) => {
            const data: any = evt.data;
            switch (evt.name) {
              case 'active':
                const activePayload: ActiveEventPayload = {
                  streamId: data.streamId,
                  sourceId: data.sourceId,
                  tracks: data.tracks,
                  encryption: data.encryption,
                };
                this.emit('active', activePayload);
                return;
              case 'inactive':
                const inactivePayload: InactiveEventPayload = {
                  streamId: data.streamId,
                  sourceId: data.sourceId,
                };
                this.emit('inactive', inactivePayload);
                return;
              case 'viewercount':
                this.emit('viewercount', data.viewerCount);
                return;
              case 'migrate':
                this.emit('migrate');
                return;
              case 'updated':
                this.emit('updated');
                return;
              case 'stopped':
                this.emit('stopped');
                return;
              case 'vad':
                this.emit('vad');
                return;
              case 'layers':
                const layersPayload = data as LayersEventPayload;
                this.emit('layers', layersPayload);
                return;
              default:
                break
            }
            this.#logger.info('The following event was not properly understood', evt);
          });

        if (this.webSocket) {
          this.#logger.info('Connected to server: ', this.webSocket.url)
          this.#logger.debug('WebSocket value: ', {
            url: this.webSocket.url,
            protocol: this.webSocket.protocol,
            readyState: this.webSocket.readyState,
            binaryType: this.webSocket.binaryType,
            extensions: this.webSocket.extensions,
          })
          this.emit('wsConnectionSuccess', { ws: this.webSocket, tm: this.#transactionManager })
          resolve(this.webSocket)
        }
      };

      this.webSocket.onerror = () => {
        if (this.webSocket) {
          this.#logger.error('WebSocket not connected:', this.webSocket.url)
          this.emit('wsConnectionError', this.webSocket.url)
          reject({url: this.webSocket.url})
        }
      };

      this.webSocket.onclose = () => {
        this.webSocket = null
        this.#transactionManager = null
        this.#logger.info('Connection closed with Signaling Server.')
        this.emit('wsConnectionClose')
      };
    });
  }

  /**
   * Closes the WebSocket connection with the server.
   * 
   * @example signaling.close();
   */
  public close() {
    this.#logger.info('Closing connection with Signaling Server.');
    this.webSocket?.close();
  }

  /**
   * Establishes a WebRTC connection with the Server as Subscriber role.
   * 
   * @param sdp The SDP information created by your offer.
   * @param options Signaling Subscribe Options.
   * 
   * @returns A {@link !Promise Promise} whose fulfillment handler receives a string which represents the SDP command response.
   * 
   * @example const response = await signaling.subscribe(sdp);
   */
  public async subscribe(sdp: string = '', options: SignalingSubscribeOptions = {}): Promise<string> {
    this.#logger.info('Starting subscription to streamName: ', this.#streamName)
    this.#logger.debug('Subcription local description: ', sdp)

    // Signaling server only recognizes 'AV1' and not 'AV1X'
    sdp = SdpParser.adaptCodecName(sdp, 'AV1X', VideoCodec.AV1)

    let data: ViewCmd = {
      sdp,
    }

    if (options.pinnedSourceId) {
      data.pinnedSourceId = options.pinnedSourceId
    }

    if (options.excludedSourceIds) {
      data.excludedSourceIds = options.excludedSourceIds
    }

    if (options.vad) {
      data.vad = true
    }
    if (Array.isArray(options.events)) {
      data.events = options.events
    }
    if (options.forcePlayoutDelay) {
      data.forcePlayoutDelay = options.forcePlayoutDelay
    }
    if (options.layer) {
      data.layer = options.layer
    }
    if(options.forceSmooth){ 
      data.forceSmooth = options.forceSmooth
    }

    try {
      if (options.disableVideo && options.disableAudio) {
        throw new Error('Not attempting to connect as video and audio are disabled')
      }
      await this.connect()
      if (this.#transactionManager) {
        this.#logger.info('Sending view command')
        const result = (await this.#transactionManager.cmd('view', data)) as ViewResponse

        // Check if browser supports AV1X
        const AV1X = RTCRtpReceiver.getCapabilities?.('video')?.codecs?.find?.(
          (codec) => codec.mimeType === 'video/AV1X'
        )
        // Signaling server returns 'AV1'. If browser supports AV1X, we change it to AV1X
        result.sdp = AV1X ? SdpParser.adaptCodecName(result.sdp, VideoCodec.AV1, 'AV1X') : result.sdp

        this.#logger.info('Command sent, subscriberId:', result.subscriberId);
        this.#logger.debug('Command result:', result);

        this.#serverId = result.subscriberId
        this.#clusterId = result.clusterId
        this.#streamViewId = result.streamViewId

        // Save for diagnostics
        Diagnostics.initStreamName(this.#streamName || '');
        Diagnostics.initSubscriberId(this.#serverId || '');
        Diagnostics.initStreamViewId(this.#streamViewId);
        Diagnostics.setClusterId(this.#clusterId || '');

        return result.sdp;
      } else {
        return '';
      }
    } catch (e) {
      this.#logger.error('Error sending view command, error: ', e)
      throw e
    }
  }

  /**
   * Establishes a WebRTC connection with the Server as Publisher role.
   * 
   * @param sdp The SDP information created by your offer.
   * @param options Signaling Publish Options.
   * 
   * @returns A {@link !Promise Promise} whose fulfillment handler receives a string which represents the SDP command response.
   * 
   * @example const response = await signaling.publish(sdp, {codec: 'h264'});
   */
  async publish(sdp: string = '', options: SignalingPublishOptions = { codec: VideoCodec.H264 }): Promise<string> {
    this.#logger.info(`Starting publishing to streamName: ${this.#streamName}, codec: ${options.codec}`)
    this.#logger.debug('Publishing local description: ', sdp)
    const supportedVideoCodecs =
      PeerConnection.getCapabilities?.('video')?.codecs?.map((cdc: ICodecs) => cdc.codec) ?? []

    const videoCodecs = Object.values(VideoCodec)
    if (videoCodecs.indexOf(options.codec) === -1) {
      this.#logger.error(`Invalid codec ${options.codec}. Possible values are: `, videoCodecs)
      throw new Error(`Invalid codec ${options.codec}. Possible values are: ${videoCodecs}`)
    }

    if (supportedVideoCodecs.length > 0 && supportedVideoCodecs.indexOf(options.codec) === -1) {
      this.#logger.error(`Unsupported codec ${options.codec}. Possible values are: `, supportedVideoCodecs)
      throw new Error(`Unsupported codec ${options.codec}. Possible values are: ${supportedVideoCodecs}`)
    }

    // Signaling server only recognizes 'AV1' and not 'AV1X'
    if (options.codec === VideoCodec.AV1) {
      sdp = SdpParser.adaptCodecName(sdp, 'AV1X', VideoCodec.AV1)
    }

    const data: PublishCmd = {
      sdp,
      codec: options.codec,
      sourceId: options.sourceId,
    }

    if (options.priority) {
      if (
        Number.isInteger(options.priority) &&
        options.priority >= -2147483648 &&
        options.priority <= 2147483647
      ) {
        data.priority = options.priority
      } else {
        throw new Error(
          'Invalid value for priority option. It should be a decimal integer between the range [-2^31, +2^31 - 1]'
        )
      }
    }

    if (options.record !== null) {
      data.record = options.record
    }
    if (Array.isArray(options.events)) {
      data.events = options.events
    }
    try {
      if (options.disableVideo && options.disableAudio) {
        throw new Error('Not attempting to connect as video and audio are disabled')
      }
      await this.connect()
      if (this.#transactionManager) {
        this.#logger.info('Sending publish command')
        const result = (await this.#transactionManager.cmd('publish', data)) as {
          sdp: string
          publisherId: string
          clusterId: string
          feedId: string
        }

        if (options.codec === VideoCodec.AV1) {
          // If browser supports AV1X, we change from AV1 to AV1X
          const AV1X = RTCRtpSender.getCapabilities?.('video')?.codecs?.find?.(
            (codec) => codec.mimeType === 'video/AV1X'
          )
          result.sdp = AV1X ? SdpParser.adaptCodecName(result.sdp, VideoCodec.AV1, 'AV1X') : result.sdp
        }

        this.#logger.info('Command sent, publisherId: ', result.publisherId)
        this.#logger.debug('Command result: ', result)
        this.#serverId = result.publisherId
        this.#clusterId = result.clusterId

        // Save for diagnostics
        Diagnostics.initStreamName(this.#streamName || '')
        Diagnostics.initSubscriberId(this.#serverId || '')
        Diagnostics.initFeedId(result.feedId)
        Diagnostics.setClusterId(this.#clusterId || '')
        return result.sdp
      } else {
        return ''
      }
    } catch (e) {
      this.#logger.error('Error sending publish command, error: ', e)
      throw e
    }
  }

  /**
   * Sends a command to the server.
   * 
   * @param cmd Name of the command to sent.
   * @param data Command parameters.
   * 
   * @returns A {@link !Promise Promise} whose fulfillment handler receives an object which represents the response to the command sent.
   */
  async cmd(cmd: string, data?: object): Promise<object> {
    this.#logger.info(`Sending cmd: ${cmd}`)

    return this.#transactionManager?.cmd(cmd, data) as object
  }
}
