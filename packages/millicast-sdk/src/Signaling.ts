import { EventEmitter } from 'events';
import TransactionManager from 'transaction-manager';
import Logger from './Logger';
import SdpParser from './utils/SdpParser';
import { VideoCodec } from './types/Codecs.types';
import Diagnostics from './utils/Diagnostics';
import {
  type SignalingSubscribeOptions,
  type SignalingPublishOptions,
  type ViewCmd,
  type ViewResponse,
  type PublishCmd,
  type PublishResponse,
} from './types/Signaling.types';
import { extractSupportedVideoCodecs } from './utils/RTCCodec';

const logger = Logger.get('Signaling');

export const signalingEvents = {
  connectionSuccess: 'wsConnectionSuccess',
  connectionError: 'wsConnectionError',
  connectionClose: 'wsConnectionClose',
  broadcastEvent: 'broadcastEvent',
} as const;

type BroadcastEventName =
  | 'active'
  | 'inactive'
  | 'stopped'
  | 'vad'
  | 'layers'
  | 'migrate'
  | 'viewercount'
  | 'updated'

interface SignalingOptions {
  streamName: string | null
  url: string
}

interface ConnectionSuccessEvent {
  ws: WebSocket
  tm: TransactionManager
}

// type BroadcastEvent = {
//   type: string
//   name: BroadcastEventName
//   data: Record<string, unknown>
// }

type InternalSubscribeOptions = SignalingSubscribeOptions & {
  customKeys?: Record<string, unknown>
  forceSmooth?: boolean
}

/**

 * Starts WebSocket connection and manages the messages between peers.
 * @example const millicastSignaling = new Signaling(options)
 */
export default class Signaling extends EventEmitter {
  streamName: string | null;
  wsUrl: string;
  webSocket: WebSocket | null;
  transactionManager: TransactionManager | null;
  serverId: string | null;
  clusterId: string | null;
  streamViewId: string | null;

  constructor (
    options: SignalingOptions = {
      streamName: null,
      url: 'ws://localhost:8080/',
    },
  ) {
    super();
    this.streamName = options.streamName;
    this.wsUrl = options.url;
    this.webSocket = null;
    this.transactionManager = null;
    this.serverId = null;
    this.clusterId = null;
    this.streamViewId = null;
  }

  /**

   * Starts a WebSocket connection with signaling server.
   * @example const response = await millicastSignaling.connect()
   * @returns Promise object which represents the WebSocket object of the established connection.
   * @fires Signaling#wsConnectionSuccess
   * @fires Signaling#wsConnectionError
   * @fires Signaling#wsConnectionClose
   * @fires Signaling#broadcastEvent
   */
  async connect (): Promise<WebSocket> {
    logger.info('Connecting to Signaling Server');
    if (this.transactionManager && this.webSocket?.readyState === WebSocket.OPEN) {
      logger.info('Connected to server: ', this.webSocket.url);
      logger.debug('WebSocket value: ', {
        url: this.webSocket.url,
        protocol: this.webSocket.protocol,
        readyState: this.webSocket.readyState,
        binaryType: this.webSocket.binaryType,
        extensions: this.webSocket.extensions,
      });
      this.emit(signalingEvents.connectionSuccess, {
        ws: this.webSocket,
        tm: this.transactionManager,
      } as ConnectionSuccessEvent);
      return this.webSocket;
    }

    return new Promise<WebSocket>((resolve, reject) => {
      this.webSocket = new WebSocket(this.wsUrl);
      this.transactionManager = new TransactionManager(this.webSocket);

      this.webSocket.onopen = () => {
        logger.info('WebSocket opened');
        this.transactionManager!.on('event', (evt: TransactionManager.Event) => {
          this.emit(signalingEvents.broadcastEvent, evt);
        });
        logger.info('Connected to server: ', this.webSocket!.url);
        logger.debug('WebSocket value: ', {
          url: this.webSocket!.url,
          protocol: this.webSocket!.protocol,
          readyState: this.webSocket!.readyState,
          binaryType: this.webSocket!.binaryType,
          extensions: this.webSocket!.extensions,
        });
        this.emit(signalingEvents.connectionSuccess, {
          ws: this.webSocket!,
          tm: this.transactionManager!,
        } as ConnectionSuccessEvent);
        resolve(this.webSocket!);
      };

      this.webSocket.onerror = () => {
        logger.error('WebSocket not connected: ', this.webSocket!.url);
        this.emit(signalingEvents.connectionError, this.webSocket!.url);
        reject(this.webSocket!.url);
      };

      this.webSocket.onclose = () => {
        this.webSocket = null;
        this.transactionManager = null;
        logger.info('Connection closed with Signaling Server.');
        this.emit(signalingEvents.connectionClose);
      };
    });
  }

  /**

   * Close WebSocket connection with Millicast server.
   * @example millicastSignaling.close()
   */
  close (): void {
    logger.info('Closing connection with Signaling Server.');
    this.webSocket?.close();
  }

  /**

   * Establish WebRTC connection with Millicast Server as Subscriber role.
   * @param sdp - The SDP information created by your offer.
   * @param options - Signaling Subscribe Options.
   * @example const response = await millicastSignaling.subscribe(sdp)
   * @return Promise object which represents the SDP command response.
   */
  async subscribe (
    sdp: string,
    options?: SignalingSubscribeOptions | boolean,
    pinnedSourceId: string | null = null,
    excludedSourceIds: string[] | null = null,
  ): Promise<string> {
    logger.info('Starting subscription to streamName: ', this.streamName);
    logger.debug('Subscription local description: ', sdp);

    const optionsParsed = getSubscribeOptions(
      options,
      pinnedSourceId,
      excludedSourceIds,
    ) as InternalSubscribeOptions;

    // Signaling server only recognizes 'AV1' and not 'AV1X'
    sdp = SdpParser.adaptCodecName(sdp, 'AV1X', VideoCodec.AV1);

    // default events
    const events: BroadcastEventName[] = [
      'active',
      'inactive',
      'layers',
      'viewercount',
      'vad',
      'updated',
      'migrate',
      'stopped',
    ];
    const data: ViewCmd = {
      sdp,
      streamId: this.streamName ?? undefined,
      pinnedSourceId: optionsParsed.pinnedSourceId ?? undefined,
      excludedSourceIds: optionsParsed.excludedSourceIds ?? undefined,
      events: optionsParsed.events ?? events,
    };

    if (optionsParsed.vad) {
      data.vad = true;
    }
    if (optionsParsed.forcePlayoutDelay) {
      data.forcePlayoutDelay = optionsParsed.forcePlayoutDelay;
    }
    if (optionsParsed.layer) {
      data.layer = optionsParsed.layer;
    }

    if (optionsParsed.abrConfiguration) {
      data.abr = {
        strategy: optionsParsed.abrConfiguration.strategy,
        metadata: optionsParsed.abrConfiguration.metadata,
      };
    }
    if (optionsParsed.customKeys) {
      // @ts-expect-error - customKeys is internal and not in public type definition
      data.customKeys = optionsParsed.customKeys;
    }

    if (optionsParsed.forceSmooth) {
      data.abr = {
        ...(data.abr || {}),
        // @ts-expect-error - forceSmooth is internal and not in public type definition
        forceSmooth: optionsParsed.forceSmooth,
      };
    }

    try {
      if (optionsParsed.disableVideo && optionsParsed.disableAudio) {
        throw new Error('Not attempting to connect as video and audio are disabled');
      }
      await this.connect();
      logger.info('Sending view command', data);
      const result = (await this.transactionManager!.cmd('view', data)) as ViewResponse;

      // Check if browser supports AV1X
      const AV1X = RTCRtpReceiver.getCapabilities?.('video')?.codecs?.find?.(
        codec => codec.mimeType === 'video/AV1X',
      );
      // Signaling server returns 'AV1'. If browser supports AV1X, we change it to AV1X
      result.sdp = AV1X ? SdpParser.adaptCodecName(result.sdp, VideoCodec.AV1, 'AV1X') : result.sdp;

      logger.info('Command sent, subscriberId: ', result.subscriberId);
      logger.debug('Command result: ', result);
      this.serverId = result.subscriberId;
      this.clusterId = result.clusterId;
      this.streamViewId = result.streamViewId;

      // Save for diagnostics
      Diagnostics.initStreamName(this.streamName ?? 'Unknown');
      Diagnostics.initSubscriberId(this.serverId);
      Diagnostics.initStreamViewId(result.streamViewId);
      Diagnostics.setClusterId(this.clusterId);
      return result.sdp;
    } catch (e) {
      logger.error('Error sending view command, error: ', e);
      throw e;
    }
  }

  /**

   * Establish WebRTC connection with Millicast Server as Publisher role.
   * @param sdp - The SDP information created by your offer.
   * @param options - Signaling Publish Options.
   * @example const response = await millicastSignaling.publish(sdp, {codec: 'h264'})
   * @return Promise object which represents the SDP command response.
   */
  async publish (
    sdp: string,
    options?: Partial<SignalingPublishOptions> | VideoCodec,
    record: boolean | null = null,
    sourceId: string | null = null,
  ): Promise<string> {
    const optionsParsed = getPublishOptions(options, record, sourceId);

    logger.info(`Starting publishing to streamName: ${this.streamName}, codec: ${optionsParsed.codec}`);
    logger.debug('Publishing local description: ', sdp);

    // Validate codec
    this.validateCodec(optionsParsed.codec);

    // Handle AV1/AV1X conversion for signaling server
    const processedSdp = this.handleAV1Codec(sdp, optionsParsed.codec);

    const data: PublishCmd = {
      ...optionsParsed,
      sdp: processedSdp,
    };

    this.validatePriority(optionsParsed.priority, data);

    try {
      if (optionsParsed.disableVideo && optionsParsed.disableAudio) {
        throw new Error('Not attempting to connect as video and audio are disabled');
      }

      await this.connect();
      logger.info('Sending publish command');
      const result = (await this.transactionManager!.cmd('publish', data)) as PublishResponse;

      // Convert response SDP back to AV1X if browser supports it
      result.sdp = this.handleAV1Response(result.sdp, optionsParsed.codec);

      logger.info('Command sent, publisherId: ', result.publisherId);
      logger.debug('Command result: ', result);

      this.updateServerInfo(result);
      this.updateDiagnostics(result);

      return result.sdp;
    } catch (e) {
      logger.error('Error sending publish command, error: ', e);
      throw e;
    }
  }

  private validateCodec (codec: VideoCodec): void {
    const videoCodecs = Object.values(VideoCodec);
    if (!videoCodecs.includes(codec)) {
      logger.error(`Invalid codec ${codec}. Possible values are: `, videoCodecs);
      throw new Error(`Invalid codec ${codec}. Possible values are: ${videoCodecs}`);
    }

    const supportedVideoCodecs = extractSupportedVideoCodecs(RTCRtpSender.getCapabilities?.('video'));

    if (supportedVideoCodecs.length > 0 && !supportedVideoCodecs.includes(codec)) {
      logger.error(`Unsupported codec ${codec}. Possible values are: `, supportedVideoCodecs);
      throw new Error(`Unsupported codec ${codec}. Possible values are: ${supportedVideoCodecs}`);
    }
  }

  private handleAV1Codec (sdp: string, codec: VideoCodec): string {
    // Signaling server only recognizes 'AV1' and not 'AV1X'
    if (codec === VideoCodec.AV1) {
      return SdpParser.adaptCodecName(sdp, 'AV1X', VideoCodec.AV1);
    }
    return sdp;
  }

  private handleAV1Response (sdp: string, codec: VideoCodec): string {
    if (codec === VideoCodec.AV1) {
      // If browser supports AV1X, we change from AV1 to AV1X
      const supportsAV1X = RTCRtpSender.getCapabilities?.('video')?.codecs?.some(
        codec => codec.mimeType === 'video/AV1X',
      );
      return supportsAV1X ? SdpParser.adaptCodecName(sdp, VideoCodec.AV1, 'AV1X') : sdp;
    }
    return sdp;
  }

  private validatePriority (priority: number | undefined, data: PublishCmd): void {
    if (priority !== undefined) {
      if (Number.isInteger(priority) && priority >= -2147483648 && priority <= 2147483647) {
        data.priority = priority;
      } else {
        throw new Error(
          'Invalid value for priority option. It should be a decimal integer between the range [-2^31, +2^31 - 1]',
        );
      }
    }
  }

  private updateServerInfo (result: PublishResponse): void {
    this.serverId = result.publisherId;
    this.clusterId = result.clusterId;
  }

  private updateDiagnostics (result: PublishResponse): void {
    Diagnostics.initStreamName(this.streamName ?? 'Not defined');
    Diagnostics.initSubscriberId(this.serverId ?? 'unknown');
    Diagnostics.initFeedId(result.feedId ?? 'unknown');
    Diagnostics.setClusterId(this.clusterId ?? 'unknown');
  }

  /**

   * Send command to the server.
   * @param cmd - Command name.
   * @param data - Command parameters.
   * @return Promise object which represents the command response.
   */
  async cmd (cmd: string, data?: Record<string, unknown>): Promise<unknown> {
    logger.info(`Sending cmd: ${cmd}`);
    return this.transactionManager!.cmd(cmd, data);
  }
}

const getSubscribeOptions = (
  options?: SignalingSubscribeOptions | boolean,
  legacyPinnedSourceId?: string | null,
  legacyExcludedSourceIds?: string[] | null,
): SignalingSubscribeOptions => {
  let parsedOptions = typeof options === 'object' ? options : ({} as SignalingSubscribeOptions);
  if (Object.keys(parsedOptions).length === 0) {
    parsedOptions = {
      vad: options as boolean | undefined,
      pinnedSourceId: legacyPinnedSourceId,
      excludedSourceIds: legacyExcludedSourceIds,
    };
  }
  return parsedOptions;
};

const getPublishOptions = (
  options?: Partial<SignalingPublishOptions> | VideoCodec,
  legacyRecord?: boolean | null,
  legacySourceId?: string | null,
): SignalingPublishOptions => {
  let parsedOptions = typeof options === 'object' ? options : ({} as Partial<SignalingPublishOptions>);
  if (Object.keys(parsedOptions).length === 0) {
    const defaultCodec = VideoCodec.H264;
    parsedOptions = {
      codec: (options as VideoCodec) ?? defaultCodec,
      record: legacyRecord,
      sourceId: legacySourceId,
    };
  }
  return { codec: VideoCodec.H264, ...parsedOptions };
};
