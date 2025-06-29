import Logger from '../Logger'
import PeerConnection from '../PeerConnection'
import Signaling from '../Signaling'
import Diagnostics from './Diagnostics'
import { TokenGeneratorCallback } from '../types/Director.types'
import { ILogger } from 'js-logger'
import { ReconnectData } from '../types/BaseWebRTC.types'
import { PublishConnectOptions } from '../types/Publisher.types'
import { ViewerConnectOptions } from '../types/Viewer.types'
import { BaseWebRTCEvents } from '../types/events';
import { TypedEventEmitter } from './TypedEventEmitter'

const maxReconnectionInterval = 32000
const baseInterval = 1000

const nextReconnectInterval = (interval: number) => {
  return interval < maxReconnectionInterval ? interval * 2 : interval
}

/**
 * Base class for common actions about peer connection and reconnect mechanism for Publisher and Viewer instances.
 */
export class BaseWebRTC<TEvents extends BaseWebRTCEvents> extends TypedEventEmitter<TEvents> {
  protected webRTCPeer: PeerConnection
  protected signaling: Signaling | null
  protected autoReconnect: boolean
  #reconnectionInterval: number
  private alreadyDisconnected: boolean
  private firstReconnection: boolean
  protected stopReconnection: boolean
  #isReconnecting: boolean
  protected tokenGenerator: TokenGeneratorCallback
  protected options: ViewerConnectOptions | PublishConnectOptions | null
  protected logger: ILogger;

  /**
   * Creates a BaseWebRTC object.
   * 
   * @param tokenGenerator Callback function executed when a new token is needed.
   * @param loggerInstance Logger instance from the extended classes.
   * @param autoReconnect Enable auto reconnect.
   */
  constructor(tokenGenerator: TokenGeneratorCallback, loggerInstance: ILogger, autoReconnect: boolean) {
    super()

    this.logger = loggerInstance ?? Logger.get('BaseWebRTC');
    this.logger.setLevel(Logger.DEBUG);
    
    if (!tokenGenerator) {
      this.logger.error('Token generator is required to construct this module.')
      throw new Error('Token generator is required to construct this module.')
    }

    this.webRTCPeer = new PeerConnection()
    this.signaling = null
    this.autoReconnect = autoReconnect
    this.#reconnectionInterval = baseInterval
    this.alreadyDisconnected = false
    this.firstReconnection = true
    this.stopReconnection = false
    this.#isReconnecting = false
    this.tokenGenerator = tokenGenerator
    this.options = null
  }

  /**
   * Get current RTC peer connection.
   * @returns {RTCPeerConnection} Object which represents the RTCPeerConnection.
   */
  getRTCPeerConnection(): RTCPeerConnection | null {
    return this.webRTCPeer ? this.webRTCPeer.getRTCPeer() : null
  }

  /**
   * Stops connection.
   */
  stop() {
    this.logger.info('Stopping')
    this.webRTCPeer.closeRTCPeer()
    this.signaling?.close()
    this.signaling = null
    this.stopReconnection = true
    this.webRTCPeer = new PeerConnection()
  }

  /**
   * Get if the current connection is active.
   * @returns {Boolean} - True if connected, false if not.
   */
  isActive(): boolean {
    const rtcPeerState = this.webRTCPeer.getRTCPeerStatus()
    this.logger.info('Broadcast status:', rtcPeerState || 'not_established')
    return rtcPeerState === 'connected'
  }

  /**
   * Sets reconnection if autoReconnect is enabled.
   * @ignore
   */
  setReconnect() {
    this.signaling?.on('migrate', () => this.replaceConnection())
    if (this.autoReconnect) {
      this.signaling?.on('wsConnectionError', () => {
        if (this.firstReconnection || !this.alreadyDisconnected) {
          this.firstReconnection = false
          this.reconnect({ error: new Error('Signaling error: wsConnectionError') })
        }
      })

      this.webRTCPeer.on('connectionStateChange', (state: string) => {
        Diagnostics.setConnectionState(state)
        if (state === 'connected') {
          Diagnostics.setConnectionTime(new Date().getTime())
        }
        if (
          (state === 'failed' || (state === 'disconnected' && this.alreadyDisconnected)) &&
          this.firstReconnection
        ) {
          this.firstReconnection = false
          this.reconnect({ error: new Error('Connection state change: RTCPeerConnectionState disconnected') })
        } else if (state === 'disconnected') {
          this.alreadyDisconnected = true
          setTimeout(
            () =>
              this.reconnect({
                error: new Error('Connection state change: RTCPeerConnectionState disconnected'),
              }),
            1500
          )
        } else {
          this.alreadyDisconnected = false
        }
      })
    }
  }

  /**
   * Reconnects to last broadcast.
   * @fires BaseWebRTC#reconnect
   * @param {ReconnectData} [data] - This object contains the error property. It may be expanded to contain more information in the future.
   * @property {String} error - The value sent in the first [reconnect event]{@link BaseWebRTC#event:reconnect} within the error key of the payload
   */
  async reconnect(data?: ReconnectData) {
    try {
      this.logger.info('Attempting to reconnect...')
      if (!this.isActive() && !this.stopReconnection && !this.#isReconnecting) {
        this.stop();

        (this as BaseWebRTC<BaseWebRTCEvents>).emit('reconnect', {
          timeout: nextReconnectInterval(this.#reconnectionInterval),
          error: data?.error ? data?.error : new Error('Attempting to reconnect'),
        })
        this.#isReconnecting = true
        await this.connect(this.options)
        this.alreadyDisconnected = false
        this.#reconnectionInterval = baseInterval
        this.firstReconnection = true
        this.#isReconnecting = false
      }
    } catch (error) {
      this.#isReconnecting = false
      this.#reconnectionInterval = nextReconnectInterval(this.#reconnectionInterval)
      this.logger.error(`Reconnection failed, retrying in ${this.#reconnectionInterval}ms. `, error)
      setTimeout(() => this.reconnect({ error: error as Error }), this.#reconnectionInterval)
    }
  }

  /** @ignore */
  async replaceConnection() {
    /* tslint:disable:no-empty */
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async connect(_options: unknown): Promise<void> {
    /* tslint:disable:no-empty */
  }
}
