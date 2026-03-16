export interface MillicastDirectorResponse {
  /**
   * - WebSocket available URLs.
   */
  urls: string[]
  /**
   * - Access token for signaling initialization.
   */
  jwt: string
  /**
   * - Object which represents a list of Ice servers.
   */
  iceServers: RTCIceServer[]
}

export interface DirectorPublisherOptions {
  /**
   * - Millicast Publishing Token.
   */
  token: string
  /**
   * - Millicast Stream Name.
   */
  streamName: string
  /**
   * - Millicast Stream Type.
   */
  streamType?: 'WebRtc' | 'Rtmp'
}
export interface DirectorSubscriberOptions {
  /**
   * - Millicast publisher Stream Name.
   */
  streamName: string
  /**
   * - Millicast Account ID.
   */
  streamAccountId: string
  /**
   * - Token to subscribe to secure streams. If you are subscribing to an unsecure stream, you can omit this param.
   */
  subscriberToken?: string | null
}

export interface DirectorResponse {
  urls: string[]
  jwt: string
  iceServers: RTCIceServer[]
  drmObject?: DRMProfile
  subscriberToken?: string
}

/**
 * DRM profile from director API which includes the URLs of license servers
 */
export interface DRMProfile {
  playReadyUrl?: string
  widevineUrl?: string
  fairPlayUrl?: string
  fairPlayCertUrl?: string
}

export type TokenGeneratorCallback = () => Promise<DirectorResponse>

export interface DRMObject {
  fairPlayCertUrl: string // URL of the FairPlay certificate server
  fairPlayUrl: string // URL of the FairPlay license server
  widevineUrl: string // URL of the Widevine license server
}


