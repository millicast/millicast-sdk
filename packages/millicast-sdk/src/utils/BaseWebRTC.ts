import { EventEmitter } from 'events'
import PeerConnection from '../PeerConnection'
import type Signaling from '../Signaling';
import { signalingEvents } from '../Signaling'
import Diagnostics from './Diagnostics'
import { type TokenGeneratorCallback } from '../types/Director.types'
import { type ILogger } from 'js-logger'
import { type ReconnectData } from '../types/BaseWebRTC.types'
import { type PublishConnectOptions } from '../types/Publish.types'
import { type ViewConnectOptions } from '../types/View.types'
import {webRTCEvents} from '../types/PeerConnection.types'



const maxReconnectionInterval = 32000
const baseInterval = 1000

/**
 * @class BaseWebRTC
 * @extends EventEmitter
 * @classdesc Base class for common actions about peer connection and reconnect mechanism for Publishers and Viewer instances.
 *
 * @constructor
 * @param {tokenGeneratorCallback} tokenGenerator - Callback function executed when a new token is needed.
 * @param {Object} loggerInstance - Logger instance from the extended classes.
 * @param {Boolean} autoReconnect - Enable auto reconnect.
 */
export default class BaseWebRTC extends EventEmitter {
  protected webRTCPeer: PeerConnection
  protected signaling: Signaling | null
  protected autoReconnect: boolean
  private reconnectionInterval: number
  private alreadyDisconnected: boolean
  private firstReconnection: boolean
  protected stopReconnection: boolean
  private isReconnecting: boolean
  protected tokenGenerator: TokenGeneratorCallback
  protected options: ViewConnectOptions | PublishConnectOptions | null
  protected readonly logger: ILogger

  constructor (tokenGenerator: TokenGeneratorCallback, loggerInstance: ILogger, autoReconnect: boolean) {
    super()
    this.logger = loggerInstance
    if (!tokenGenerator) {
      this.logger.error('Token generator is required to construct this module.')
      throw new Error('Token generator is required to construct this module.')
    }
    this.webRTCPeer = new PeerConnection()
    this.signaling = null
    this.autoReconnect = autoReconnect
    this.reconnectionInterval = baseInterval
    this.alreadyDisconnected = false
    this.firstReconnection = true
    this.stopReconnection = false
    this.isReconnecting = false
    this.tokenGenerator = tokenGenerator
    this.options = null
  }

  /**
   * Get current RTC peer connection.
   * @returns {RTCPeerConnection} Object which represents the RTCPeerConnection.
   */
  getRTCPeerConnection (): RTCPeerConnection | null {
    return this.webRTCPeer ? this.webRTCPeer.getRTCPeer() : null
  }

  /**
   * Stops connection.
   */
  stop () {
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
  isActive (): boolean {
    const rtcPeerState = this.webRTCPeer.getRTCPeerStatus()
    this.logger.info('Broadcast status: ', rtcPeerState || 'not_established')
    return rtcPeerState === 'connected'
  }

  /**
   * Sets reconnection if autoReconnect is enabled.
   */
  setReconnect () {
    this.signaling?.on('migrate', () => this.replaceConnection())
    if (this.autoReconnect) {
      this.signaling?.on(signalingEvents.connectionError, () => {
        if (this.firstReconnection || !this.alreadyDisconnected) {
          this.firstReconnection = false
          this.reconnect({ error: new Error('Signaling error: wsConnectionError') })
        }
      })

      this.webRTCPeer.on(webRTCEvents.connectionStateChange, state => {
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
  async reconnect (data?: ReconnectData) {
    try {
      this.logger.info('Attempting to reconnect...')
      if (!this.isActive() && !this.stopReconnection && !this.isReconnecting) {
        this.stop()
        /**
         * Emits with every reconnection attempt made when an active stream
         * stopped unexpectedly.
         *
         * @event BaseWebRTC#reconnect
         * @type {Object}
         * @property {Number} timeout - Next retry interval in milliseconds.
         * @property {Error} error - Error object with cause of failure. Possible errors are: <ul> <li> <code>Signaling error: wsConnectionError</code> if there was an error in the Websocket connection. <li> <code>Connection state change: RTCPeerConnectionState disconnected</code> if there was an error in the RTCPeerConnection. <li> <code>Attempting to reconnect</code> if the reconnect was trigered externally. <li> Or any internal error thrown by either <a href="Publish#connect">Publish.connect</a> or <a href="View#connect">View.connect</a> methods</ul>
         */
        this.emit('reconnect', {
          timeout: nextReconnectInterval(this.reconnectionInterval),
          error: data?.error ? data?.error : new Error('Attempting to reconnect'),
        })
        this.isReconnecting = true
        await this.connect(this.options)
        this.alreadyDisconnected = false
        this.reconnectionInterval = baseInterval
        this.firstReconnection = true
        this.isReconnecting = false
      }
    } catch (error) {
      this.isReconnecting = false
      this.reconnectionInterval = nextReconnectInterval(this.reconnectionInterval)
      this.logger.error(`Reconnection failed, retrying in ${this.reconnectionInterval}ms. `, error)
      setTimeout(() => this.reconnect({ error: error as Error }), this.reconnectionInterval)
    }
  }

  async replaceConnection (): Promise<void> {
    // Abstract method to be overridden by subclasses
  }

   
  async connect (_options: unknown): Promise<void> {
    // Abstract method to be overridden by subclasses
  }
}

const nextReconnectInterval = (interval: number) => {
  return interval < maxReconnectionInterval ? interval * 2 : interval
}
