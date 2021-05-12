import EventEmitter from 'events'
import MillicastWebRTC, { webRTCEvents } from '../MillicastWebRTC'
import { signalingEvents } from '../MillicastSignaling'
let logger

/**
 * Callback invoke when a new connection path is needed.
 *
 * @callback tokenGeneratorCallback
 * @returns {Promise<MillicastDirectorResponse>} Promise object which represents the result of getting the new connection path.
 *
 * You can use your own token generator or use the <a href='MillicastDirector'>MillicastDirector available methods</a>.
 */

/**
 * @class BaseImplementator
 * @extends EventEmitter
 * @classdesc Base class for Publisher and Viewer witch manage common actions.
 *
 * @constructor
 * @param {String} streamName - Millicast existing stream name.
 * @param {tokenGeneratorCallback} tokenGenerator - Callback function executed when a new token is needed.
 * @param {Object} loggerInstance - Logger instance from the extended classes.
 * @param {Boolean} autoReconnect - Enable auto reconnect.
 */
export default class BaseImplementator extends EventEmitter {
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
    this.webRTCPeer = new MillicastWebRTC()
    this.millicastSignaling = null
    this.streamName = streamName
    this.autoReconnect = autoReconnect
    this.reconnectionInterval = 1000
    this.alreadyDisconnected = false
    this.firstReconnection = true
    this.tokenGenerator = tokenGenerator
  }

  /**
   * Stops connection.
   */
  stop () {
    logger.info('Stopping')
    this.webRTCPeer.closeRTCPeer()
    this.millicastSignaling?.close()
    this.millicastSignaling = null
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
    if (this.autoReconnect) {
      this.millicastSignaling.on(signalingEvents.connectionError, () => {
        if (this.firstReconnection || !this.alreadyDisconnected) {
          this.firstReconnection = false
          this.reconnect()
        }
      })

      this.webRTCPeer.on(webRTCEvents.connectionStateChange, (state) => {
        if ((state === 'failed' || (state === 'disconnected' && this.alreadyDisconnected)) && this.firstReconnection) {
          this.firstReconnection = false
          this.reconnect()
        } else if (state === 'disconnected') {
          this.alreadyDisconnected = true
          setTimeout(() => this.reconnect(), 1500)
        } else {
          this.alreadyDisconnected = false
        }
      })
    }
  }
}
