import EventEmitter from 'events'
import PeerConnection, { webRTCEvents } from '../PeerConnection'
import { signalingEvents } from '../Signaling'
let logger
const maxReconnectionInterval = 32000
const baseInterval = 1000

/**
 * @typedef {Object} MillicastDirectorResponse
 * @property {Array<String>} urls - WebSocket available URLs.
 * @property {String} jwt - Access token for signaling initialization.
 * @property {Array<RTCIceServer>} iceServers - Object which represents a list of Ice servers.
 */

/**
 * Callback invoke when a new connection path is needed.
 *
 * @callback tokenGeneratorCallback
 * @returns {Promise<MillicastDirectorResponse>} Promise object which represents the result of getting the new connection path.
 *
 * You can use your own token generator or use the <a href='Director'>Director available methods</a>.
 */

/**
 * @class BaseWebRTC
 * @extends EventEmitter
 * @classdesc Base class for common actions about peer connection and reconnect mechanism for Publishers and Viewer instances.
 *
 * @constructor
 * @param {String} streamName - Millicast existing stream name.
 * @param {tokenGeneratorCallback} tokenGenerator - Callback function executed when a new token is needed.
 * @param {Object} loggerInstance - Logger instance from the extended classes.
 * @param {Boolean} autoReconnect - Enable auto reconnect.
 */
export default class BaseWebRTC extends EventEmitter {
  constructor (streamName, tokenGenerator, loggerInstance, autoReconnect) {
    super()
    logger = loggerInstance
    if (!streamName) {
      logger.error('Stream Name is required to construct this module.')
      throw new Error('Stream Name is required to construct this module.')
    }
    if (!tokenGenerator) {
      logger.error('Token generator is required to construct this module.')
      throw new Error('Token generator is required to construct this module.')
    }
    this.webRTCPeer = new PeerConnection()
    this.signaling = null
    this.streamName = streamName
    this.autoReconnect = autoReconnect
    this.reconnectionInterval = baseInterval
    this.alreadyDisconnected = false
    this.firstReconnection = true
    this.stopReconnection = false
    this.tokenGenerator = tokenGenerator
    this.options = null
  }

  /**
  * Get current RTC peer connection.
  * @returns {RTCPeerConnection} Object which represents the RTCPeerConnection.
  */
  getRTCPeerConnection () {
    return this.webRTCPeer ? this.webRTCPeer.getRTCPeer() : null
  }

  /**
   * Stops connection.
   */
  stop () {
    logger.info('Stopping')
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
  isActive () {
    const rtcPeerState = this.webRTCPeer.getRTCPeerStatus()
    logger.info('Broadcast status: ', rtcPeerState || 'not_established')
    return rtcPeerState === 'connected'
  }

  /**
   * Sets reconnection if autoReconnect is enabled.
   */
  setReconnect () {
    this.signaling.on('migrate', () => this.replaceConnection())
    if (this.autoReconnect) {
      this.signaling.on(signalingEvents.connectionError, () => {
        if (this.firstReconnection || !this.alreadyDisconnected) {
          this.firstReconnection = false
          this.reconnect({ error: new Error('Signaling error: wsConnectionError') })
        }
      })

      this.webRTCPeer.on(webRTCEvents.connectionStateChange, (state) => {
        if ((state === 'failed' || (state === 'disconnected' && this.alreadyDisconnected)) && this.firstReconnection) {
          this.firstReconnection = false
          this.reconnect({ error: new Error('Connection state change: RTCPeerConnectionState disconnected') })
        } else if (state === 'disconnected') {
          this.alreadyDisconnected = true
          setTimeout(() => this.reconnect({ error: new Error('Connection state change: RTCPeerConnectionState disconnected') }), 1500)
        } else {
          this.alreadyDisconnected = false
        }
      })
    }
  }

  /**
   * Reconnects to last broadcast.
   * @fires BaseWebRTC#reconnect
   */
  async reconnect (data) {
    try {
      if (!this.isActive() && !this.stopReconnection) {
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
        this.emit('reconnect', { timeout: (nextReconnectInterval(this.reconnectionInterval)), error: data?.error ? data?.error : new Error('Attempting to reconnect') })
        await this.connect(this.options)
        this.alreadyDisconnected = false
        this.reconnectionInterval = baseInterval
        this.firstReconnection = true
      }
    } catch (error) {
      this.reconnectionInterval = nextReconnectInterval(this.reconnectionInterval)
      logger.error(`Reconnection failed, retrying in ${this.reconnectionInterval}ms. `, error)
      setTimeout(() => this.reconnect({ error }), this.reconnectionInterval)
    }
  }
}

const nextReconnectInterval = (interval) => {
  return interval < maxReconnectionInterval ? interval * 2 : interval
}
