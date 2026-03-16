export type Media = 'audio' | 'video'

export type ViewServerEvent = 'active' | 'inactive' | 'updated' | 'layers' | 'vad' | 'viewercount' | 'migrate'| 'stopped'

export type PublishServerEvent = 'active' | 'inactive' | 'viewercount'

export type DecodedJWT = Record<string, {
    streamName: string
    record: boolean
  }>;

/**
 * @deprecated Use ReconnectEvent from Events.types.ts instead
 */
export interface ReconnectData {
  error: Error
}

// Re-export event types for convenience
export type { ReconnectEvent, BaseWebRTCEvents } from './Events.types'
