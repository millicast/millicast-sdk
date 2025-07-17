import { AudioCodec, VideoCodec } from './Codecs.types';

/** PeerConnection configuration. */
export interface PeerConnectionConfig extends RTCConfiguration {
  /**
   * - whether stats collection should be auto initialized. Defaults to `true`
   */
  autoInitStats?: boolean;

  /**
   * The interval, in milliseconds, at which we poll stats. Defaults to 1s (1000ms)
   */
  statsIntervalMs?: number;
  /**
   * encoded insertable streams
   */
  encodedInsertableStreams?: boolean;
}

export interface SdpOptions {
  stereo?: boolean;
  dtx?: boolean;
  mediaStream?: MediaStream | Array<MediaStreamTrack>;
  codec?: VideoCodec;
  simulcast?: boolean;
  scalabilityMode?: string | null;
  absCaptureTime?: boolean;
  dependencyDescriptor?: boolean;
  disableAudio?: boolean;
  disableVideo?: boolean;
  setSDPToPeer?: boolean;
  multiplexedAudioTracks?: number;
}

export interface ICodecs {
  /** Audio or video codec name. */
  codec?: VideoCodec | AudioCodec;
  /** Audio or video codec mime type. */
  mimeType?: string;
  /** In case of SVC support, a list of scalability modes supported. */
  scalabilityModes?: Array<string>;
  /** Only for audio, the number of audio channels supported. */
  channels?: number;
}

export interface MillicastCapability {
  codecs: ICodecs[];
  /** An array specifying the URI of the header extension, as described in RFC 5285. */
  headerExtensions: Array<RTCRtpHeaderExtensionCapability>;
}
