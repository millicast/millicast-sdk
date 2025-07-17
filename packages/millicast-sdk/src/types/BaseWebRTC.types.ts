export type Media = 'audio' | 'video';

/** List of server events to subscribe to as a viewer. */
export type ViewerServerEvent = 'active' | 'inactive' | 'updated' | 'layers' | 'vad' | 'viewercount';

/** List of server events to subscribe to as a publisher. */
export type PublisherServerEvent = 'active' | 'inactive' | 'viewercount';

export type DecodedJWT = {
  [key: string]: {
    streamName: string;
    record: boolean;
  };
};

export type ReconnectData = {
  error: Error;
};

/**
 * Response from the Director API.
 * @hidden
 */
export type MillicastDirectorResponse = {
  /** WebSocket available URLs. */
  urls: Array<string>;
  /** Access token for signaling initialization. */
  jwt: string;
  /** Object which represents a list of Ice servers. */
  iceServers: Array<RTCIceServer>;
  /** Description of the DRM profile. */
  drmObject?: DRMProfile;
  /** Subscriber token. */
  subscriberToken?: string;
};

/**
 * DRM profile from director API which includes the URLs of license servers
 * @hidden
 */
export interface DRMProfile {
  playReadyUrl?: string;
  widevineUrl?: string;
  fairPlayUrl?: string;
  fairPlayCertUrl?: string;
}
