import { SdpOptions, MillicastCapability, PeerConnectionConfig } from './types/PeerConnection.types';
import { default as PeerConnectionStats } from './PeerConnectionStats';
import { default as EventEmitter } from 'events';

export declare const ConnectionType: {
    Publisher: 'Publisher';
    Viewer: 'Viewer';
};
export declare const webRTCEvents: {
    track: string;
    connectionStateChange: string;
};
/**
 * @class PeerConnection
 * @extends EventEmitter
 * @classdesc Manages WebRTC connection and SDP information between peers.
 * @example const peerConnection = new PeerConnection()
 * @constructor
 */
export default class PeerConnection extends EventEmitter {
    mode: 'Publisher' | 'Viewer' | null;
    sessionDescription: RTCSessionDescriptionInit | null;
    peer: RTCPeerConnection | null;
    peerConnectionStats: PeerConnectionStats | null;
    transceiverMap: Map<RTCRtpTransceiver, (value: RTCRtpTransceiver | PromiseLike<RTCRtpTransceiver>) => void>;
    constructor();
    /**
     * Instance new RTCPeerConnection.
     * @param {RTCConfiguration} config - Peer configuration.
     * @param {Boolean} [config.autoInitStats = true] - True to initialize statistics monitoring of the RTCPeerConnection accessed via Logger.get(), false to opt-out.
     * @param {Number} [config.statsIntervalMs = 1000] - The default interval at which the SDK will return WebRTC stats to the consuming application.
     * @param {"Publisher" | "Viewer"} [mode = "Viewer"] - Type of connection that is trying to be created, either 'Viewer' or 'Publisher'.
     */
    createRTCPeer(config?: PeerConnectionConfig, mode?: 'Publisher' | 'Viewer'): Promise<void>;
    /**
     * Get current RTC peer connection.
     * @returns {RTCPeerConnection} Object which represents the RTCPeerConnection.
     */
    getRTCPeer(): RTCPeerConnection | null;
    /**
     * Close RTC peer connection.
     * @fires PeerConnection#connectionStateChange
     */
    closeRTCPeer(): Promise<void>;
    /**
     * Set SDP information to remote peer.
     * @param {String} sdp - New SDP to be set in the remote peer.
     * @returns {Promise<void>} Promise object which resolves when SDP information was successfully set.
     */
    setRTCRemoteSDP(sdp: string): Promise<void>;
    /**
     * Get the SDP modified depending the options. Optionally set the SDP information to local peer.
     * @param {Object} options
     * @param {Boolean} options.stereo - True to modify SDP for support stereo. Otherwise False.
     * @param {Boolean} options.dtx - True to modify SDP for supporting dtx in opus. Otherwise False.*
     * @param {MediaStream|Array<MediaStreamTrack>} options.mediaStream - MediaStream to offer in a stream. This object must have
     * 1 audio track and 1 video track, or at least one of them. Alternative you can provide both tracks in an array.
     * @param {VideoCodec} options.codec - Selected codec for support simulcast.
     * @param {Boolean} options.simulcast - True to modify SDP for support simulcast. **Only available in Chromium based browsers and with H.264 or VP8 video codecs.**
     * @param {String} options.scalabilityMode - Selected scalability mode. You can get the available capabilities using <a href="PeerConnection#.getCapabilities">PeerConnection.getCapabilities</a> method.
     * **Only available in Google Chrome.**
     * @param {Boolean} options.absCaptureTime - True to modify SDP for supporting absolute capture time header extension. Otherwise False.
     * @param {Boolean} options.dependencyDescriptor - True to modify SDP for supporting aom dependency descriptor header extension. Otherwise False.
     * @param {Boolean} options.disableAudio - True to not support audio.
     * @param {Boolean} options.disableVideo - True to not support video.
     * @param {Boolean} options.setSDPToPeer - True to set the SDP to local peer.
     * @returns {Promise<String>} Promise object which represents the SDP information of the created offer.
     */
    getRTCLocalSDP(options?: SdpOptions): Promise<string | undefined>;
    /**
     * Add remote receiving track.
     * @param {String} media - Media kind ('audio' | 'video').
     * @param {Array<MediaStream>} streams - Streams the track will belong to.
     * @return {Promise<RTCRtpTransceiver>} Promise that will be resolved when the RTCRtpTransceiver is assigned an mid value.
     */
    addRemoteTrack(media: string, streams: Array<MediaStream>): Promise<RTCRtpTransceiver>;
    /**
     * Update remote SDP information to restrict bandwidth.
     * @param {String} sdp - Remote SDP.
     * @param {Number} bitrate - New bitrate value in kbps or 0 unlimited bitrate.
     * @return {String} Updated SDP information with new bandwidth restriction.
     */
    updateBandwidthRestriction(sdp?: string, bitrate?: number): string;
    /**
     * Set SDP information to remote peer with bandwidth restriction.
     * @param {Number} bitrate - New bitrate value in kbps or 0 unlimited bitrate.
     * @returns {Promise<void>} Promise object which resolves when bitrate was successfully updated.
     */
    updateBitrate(bitrate?: number): Promise<void>;
    /**
     * Get peer connection state.
     * @returns {RTCPeerConnectionState?} Promise object which represents the peer connection state.
     */
    getRTCPeerStatus(): RTCPeerConnectionState | null;
    /**
     * Replace current audio or video track that is being broadcasted.
     * @param {MediaStreamTrack} mediaStreamTrack - New audio or video track to replace the current one.
     */
    replaceTrack(mediaStreamTrack: MediaStreamTrack): void;
    /**
     * @typedef {Object} MillicastCapability
     * @property {Array<Object>} codecs
     * @property {String} codecs.codec - Audio or video codec name.
     * @property {String} codecs.mimeType - Audio or video codec mime type.
     * @property {Array<String>} [codecs.scalabilityModes] - In case of SVC support, a list of scalability modes supported.
     * @property {Number} [codecs.channels] - Only for audio, the number of audio channels supported.
     * @property {Array<RTCRtpHeaderExtensionCapability>} headerExtensions - An array specifying the URI of the header extension, as described in RFC 5285.
     */
    /**
     * Gets user's browser media capabilities compared with Millicast Media Server support.
     *
     * @param {"audio"|"video"} kind - Type of media for which you wish to get sender capabilities.
     * @returns {MillicastCapability} Object with all capabilities supported by user's browser and Millicast Media Server.
     */
    static getCapabilities(kind: 'audio' | 'video'): MillicastCapability | null;
    /**
     * Get sender tracks
     * @returns {Array<MediaStreamTrack>} An array with all tracks in sender peer.
     */
    getTracks(): (MediaStreamTrack | null)[];
    /**
     * Initialize the statistics monitoring of the RTCPeerConnection.
     *
     * It will be emitted every second.
     * @fires PeerConnection#stats
     * @example peerConnection.initStats()
     * @example
     * import Publish from '@millicast/sdk'
     *
     * //Initialize and connect your Publisher
     * const millicastPublish = new Publish(tokenGenerator)
     * await millicastPublish.connect(options)
     *
     * //Initialize get stats
     * millicastPublish.webRTCPeer.initStats()
     *
     * //Capture new stats from event every second
     * millicastPublish.webRTCPeer.on('stats', (stats) => {
     *   console.log('Stats from event: ', stats)
     * })
     * @example
     * import View from '@millicast/sdk'
     *
     * //Initialize and connect your Viewer
     * const millicastView = new View(tokenGenerator)
     * await millicastView.connect()
     *
     * //Initialize get stats
     * millicastView.webRTCPeer.initStats()
     *
     * //Capture new stats from event every second
     * millicastView.webRTCPeer.on('stats', (stats) => {
     *   console.log('Stats from event: ', stats)
     * })
     */
    initStats(options: PeerConnectionConfig): void;
    /**
     * Stops the monitoring of RTCPeerConnection statistics.
     * @example peerConnection.stopStats()
     */
    stopStats(): void;
}
