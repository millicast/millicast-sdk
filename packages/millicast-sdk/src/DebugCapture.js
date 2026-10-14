import CaptureSession from './utils/CaptureSession'
import CaptureStore from './utils/CaptureStore'
import { buildCapture } from './utils/CaptureExport'

/**
 * @typedef {Object} DebugCaptureSessionInfo
 * @property {string} id
 * @property {number} startTime
 * @property {number|null} endTime
 * @property {string|null} endReason
 * @property {string} streamName
 * @property {string} accountId
 * @property {boolean} active
 */

const activeSessions = new Map()
const store = new CaptureStore()
let currentHttpCapture = null

/**
 * Sets the synchronous capture context used by Director.getSubscriber.
 * @param {CaptureSession|null} session
 * @returns {void}
 */
export const setCurrentHttpCapture = session => { currentHttpCapture = session }

/**
 * Gets the synchronous capture context used by Director.getSubscriber.
 * @returns {CaptureSession|null}
 */
export const getCurrentHttpCapture = () => currentHttpCapture

/**
 * Starts and registers a viewer-side debug capture session.
 * @param {Object} options
 * @returns {Promise<CaptureSession>}
 */
export const createCaptureSession = async options => {
  const session = new CaptureSession({ ...options, store: options.store || store })
  await session.start()
  activeSessions.set(session.id, session)
  return session
}

/**
 * Removes a completed session from the active-session registry.
 * @param {string} id
 * @returns {void}
 */
export const unregisterCaptureSession = id => {
  if (!activeSessions.get(id)?.buffer.length) activeSessions.delete(id)
}

const getRecords = async (sessionId, captureSession) => {
  if (captureSession?.active) await captureSession.flush()
  const chunks = await (captureSession?.store || store).listChunks(sessionId)
  return [...chunks.flatMap(chunk => chunk.records || []), ...(captureSession?.buffer || [])]
}

const getStoredSession = async sessionId => {
  const captureSession = activeSessions.get(sessionId)
  const session = captureSession ? captureSession.meta : await (captureSession?.store || store).getSession(sessionId)
  if (!session) return null
  return { session, captureSession }
}

const DebugCapture = {
  /**
   * Lists stored capture sessions, newest first.
   * @returns {Promise<Array<DebugCaptureSessionInfo>>}
   */
  async listSessions () {
    const sessions = new Map((await store.listSessions()).map(session => [session.id, session]))
    for (const session of activeSessions.values()) sessions.set(session.id, session.meta)
    return [...sessions.values()]
      .sort((a, b) => b.startTime - a.startTime)
      .map(({ id, startTime, endTime, endReason, streamName, accountId }) => ({
        id,
        startTime,
        endTime: endTime ?? null,
        endReason: endReason ?? null,
        streamName,
        accountId,
        active: Boolean(activeSessions.get(id)?.active)
      }))
  },

  /**
   * Builds WebRTC-internals-style and HAR exports for a stored session.
   * @param {string} [sessionId]
   * @returns {Promise<{sessionId:string,webrtcDump:Object,har:Object}|null>}
   */
  async getCapture (sessionId) {
    let id = sessionId
    if (!id) {
      const [newest] = await this.listSessions()
      if (!newest) return null
      id = newest.id
    }
    const found = await getStoredSession(id)
    if (!found) return null
    const records = await getRecords(id, found.captureSession)
    return buildCapture(found.session, records)
  },

  /**
   * Downloads WebRTC-internals-style JSON and HAR JSON files for a session.
   * @param {string} [sessionId]
   * @returns {Promise<void>}
   */
  async download (sessionId) {
    const capture = await this.getCapture(sessionId)
    if (!capture) return
    const meta = (await getStoredSession(capture.sessionId)).session
    const safeName = String(meta.streamName || 'stream').replace(/[^a-z0-9_-]+/gi, '-')
    const date = new Date(meta.startTime)
    const pad = value => String(value).padStart(2, '0')
    const timestamp = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
    downloadJson(capture.webrtcDump, `client-stats-${safeName}-${timestamp}-webrtc-dump.json`)
    downloadJson(capture.har, `client-stats-${safeName}-${timestamp}-network.har`)
  },

  /**
   * Deletes a capture session and its stored chunks.
   * @param {string} id
   * @returns {Promise<void>}
   */
  async deleteSession (id) {
    const active = activeSessions.get(id)
    if (active) {
      await active.end()
      activeSessions.delete(id)
    }
    await (active?.store || store).deleteSession(id)
  },

  /**
   * Deletes all stored capture sessions.
   * @returns {Promise<void>}
   */
  async clear () {
    const stores = new Set([store])
    for (const session of activeSessions.values()) {
      stores.add(session.store)
      await session.end()
    }
    activeSessions.clear()
    await Promise.all([...stores].map(sessionStore => sessionStore.clear()))
  }
}

export default DebugCapture

const downloadJson = (value, filename) => {
  const blob = new Blob([JSON.stringify(value)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.style.display = 'none'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
