import EventEmitter from 'events'
import PeerConnection, { webRTCEvents } from '../PeerConnection'
import { signalingEvents } from '../Signaling'
import Diagnostics from './Diagnostics'
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
 * @param {String} streamName - Deprecated: Millicast existing stream name. Use tokenGenerator instead.
 * @param {tokenGeneratorCallback} tokenGenerator - Callback function executed when a new token is needed.
 * @param {Object} loggerInstance - Logger instance from the extended classes.
 * @param {Boolean} autoReconnect - Enable auto reconnect.
 */
export default class BaseWebRTC extends EventEmitter {
  constructor (streamName, tokenGenerator, loggerInstance, autoReconnect) {
    super()
    logger = loggerInstance
    if (!tokenGenerator) {
      logger.error('Token generator is required to construct this module.')
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
    this.connectAttempt = null
  }

  /**
  * Get current RTC peer connection.
  * @returns {RTCPeerConnection} Object which represents the RTCPeerConnection.
  */
  getRTCPeerConnection () {
    return this.webRTCPeer ? this.webRTCPeer.getRTCPeer() : null
  }

  /**
   * Stops connection. A connection attempt still in progress is cancelled and its `connect()` rejects with an `AbortError`.
   */
  stop () {
    logger.info('Stopping')
    this.cancelConnectAttempt()
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
   * Returns true if a connection attempt is in progress, from the `connect()` call until the peer connection is established.
   * @returns {Boolean} - True if connecting, false if not.
   */
  isConnecting () {
    return this.connectAttempt !== null || ['new', 'connecting'].includes(this.webRTCPeer.getRTCPeerStatus())
  }

  /**
   * Runs a connection attempt that can be cancelled by `stop()`. Rejects if another attempt is in progress.
   * @param {String} inProgressMessage - Error message used when another attempt is in progress.
   * @param {Function} connectFn - Async function performing the attempt, receives the attempt object.
   */
  async runConnectAttempt (inProgressMessage, connectFn) {
    if (this.isConnecting()) {
      logger.warn(inProgressMessage)
      throw new Error(inProgressMessage)
    }
    const attempt = { cancelled: false, signaling: null, webRTCPeer: null, worker: null }
    const cancellation = new Promise((resolve, reject) => {
      attempt.cancel = () => {
        attempt.cancelled = true
        reject(createAbortError())
      }
    })
    cancellation.catch(() => {})
    this.connectAttempt = attempt
    const connection = connectFn(attempt)
    connection.catch(() => {})
    try {
      await Promise.race([connection, cancellation])
    } catch (error) {
      this.releaseConnectAttempt(attempt)
      throw attempt.cancelled ? createAbortError() : error
    } finally {
      this.endConnectAttempt(attempt)
    }
  }

  /**
   * Throws an `AbortError` if the connection attempt has been cancelled.
   * @param {Object} [attempt] - Connection attempt, none when migrating.
   */
  throwIfConnectAttemptCancelled (attempt) {
    if (attempt?.cancelled) {
      throw createAbortError()
    }
  }

  endConnectAttempt (attempt) {
    if (this.connectAttempt === attempt) {
      this.connectAttempt = null
    }
  }

  cancelConnectAttempt () {
    const attempt = this.connectAttempt
    if (attempt) {
      logger.info('Cancelling connection attempt in progress')
      this.connectAttempt = null
      attempt.cancel()
      attempt.signaling?.close()
    }
  }

  releaseConnectAttempt (attempt) {
    if (attempt.signaling) {
      attempt.signaling.close()
      if (this.signaling === attempt.signaling) {
        this.signaling = null
      }
    }
    if (attempt.webRTCPeer?.getRTCPeer()) {
      attempt.webRTCPeer.closeRTCPeer()
    }
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
        Diagnostics.setConnectionState(state)
        if (state === 'connected') {
          Diagnostics.setConnectionTime(new Date())
        }
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
   * @param {Object} [data] - This object contains the error property. It may be expanded to contain more information in the future.
   * @property {String} error - The value sent in the first [reconnect event]{@link BaseWebRTC#event:reconnect} within the error key of the payload
   */
  async reconnect (data) {
    try {
      logger.info('Attempting to reconnect...')
      if (!this.isActive() && !this.stopReconnection && !this.isReconnecting && !this.connectAttempt) {
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
      logger.error(`Reconnection failed, retrying in ${this.reconnectionInterval}ms. `, error)
      setTimeout(() => this.reconnect({ error }), this.reconnectionInterval)
    }
  }
}

const createAbortError = () => {
  const error = new Error('Connection attempt cancelled by stop()')
  error.name = 'AbortError'
  return error
}

const nextReconnectInterval = (interval) => {
  return interval < maxReconnectionInterval ? interval * 2 : interval
}
