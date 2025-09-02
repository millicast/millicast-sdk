export type MillicastDirectorResponse = {
    /**
     * - WebSocket available URLs.
     */
    urls: Array<string>;
    /**
     * - Access token for signaling initialization.
     */
    jwt: string;
    /**
     * - Object which represents a list of Ice servers.
     */
    iceServers: Array<RTCIceServer>;
};
export type DirectorPublisherOptions = {
    /**
     * - Millicast Publishing Token.
     */
    token: string;
    /**
     * - Millicast Stream Name.
     */
    streamName: string;
    /**
     * - Millicast Stream Type.
     */
    streamType?: 'WebRtc' | 'Rtmp';
};
export type DirectorSubscriberOptions = {
    /**
     * - Millicast publisher Stream Name.
     */
    streamName: string;
    /**
     * - Millicast Account ID.
     */
    streamAccountId: string;
    /**
     * - Token to subscribe to secure streams. If you are subscribing to an unsecure stream, you can omit this param.
     */
    subscriberToken?: string;
};
export type DirectorResponse = {
    urls: string[];
    jwt: string;
    iceServers: RTCIceServer[];
    drmObject?: DRMProfile;
    subscriberToken?: string;
};
/**
 * DRM profile from director API which includes the URLs of license servers
 */
export interface DRMProfile {
    playReadyUrl?: string;
    widevineUrl?: string;
    fairPlayUrl?: string;
    fairPlayCertUrl?: string;
}
export type TokenGeneratorCallback = () => Promise<DirectorResponse>;
