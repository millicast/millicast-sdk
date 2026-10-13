import Logger from '../Logger'
import { version } from '../../package.json' with { type: 'json' }
import CaptureStore from './CaptureStore'
import { redactDeep, redactMessage, redactSecret, redactUrl } from './Redact'

const FLUSH_INTERVAL_MS = 5000
const SLOW_STATS_INTERVAL_MS = 5000
const STORAGE_LOW_RATIO = 0.9
const STATS_GAP_FACTOR = 3
const KEEP_SESSIONS_DAYS = 7
const REDACT_SECRETS = true
const REDACT_KEEP_LAST_CHARS = 6
const DB_NAME = 'millicast-debug-capture'
const DB_VERSION = 1

const logger = Logger.get('DebugCapture')
const redact = value => REDACT_SECRETS ? redactDeep(value, REDACT_KEEP_LAST_CHARS) : value
const toPlain = value => {
  if (value == null || typeof value !== 'object') return value
  if (typeof value.toJSON === 'function') return value.toJSON()
  if (Array.isArray(value)) return value.map(toPlain)
  return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, toPlain(child)]))
}
const toStoredDescription = value => {
  if (value && typeof value === 'object' && 'type' in value && 'sdp' in value) {
    return { type: value.type, sdp: value.sdp }
  }
  return toPlain(value)
}
const errorValue = error => ({ name: error?.name || 'Error', message: error?.message || String(error) })
const makeId = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`

export default class CaptureSession {
  constructor (options = {}) {
    const startTime = Date.now()
    this.id = makeId()
    this.startTime = startTime
    this.endTime = null
    this.streamName = options.streamName || ''
    this.accountId = options.accountId || ''
    this.pageUrl = REDACT_SECRETS ? redactUrl(globalThis.location?.href || '') : (globalThis.location?.href || '')
    this.userAgent = globalThis.navigator?.userAgent || ''
    this.meta = {
      id: this.id,
      startTime,
      endTime: null,
      sdkVersion: version,
      userAgent: this.userAgent,
      pageUrl: this.pageUrl,
      streamName: this.streamName,
      accountId: this.accountId,
      storageMode: 'indexeddb'
    }
    this.store = options.store || new CaptureStore(DB_NAME, DB_VERSION)
    this.buffer = []
    this.seq = 0
    this.flushChain = Promise.resolve()
    this.timer = null
    this.active = true
    this.connCounter = 0
    this.connStats = new Map()
    this.cleanup = []
    this.flushCount = 0
    this.storageLow = false
    this.storageLowRecorded = false
    this.connectionCount = 0
    this.onReconnect = data => this.recordEvent(null, 'reconnect', { error: data?.error?.message || String(data?.error || '') })
    options.view?.on?.('reconnect', this.onReconnect)
    if (options.view?.off) this.cleanup.push(() => options.view.off('reconnect', this.onReconnect))
  }

  async start () {
    await this.store.open()
    this.meta.storageMode = this.store.mode
    await this._deleteExpiredSessions()
    await this.store.putSession(this.meta)
    if (this.store.mode === 'memory') {
      this.recordEvent(null, 'storage-unavailable', { mode: 'memory' })
      logger.warn('Debug capture is using in-memory storage because IndexedDB is unavailable')
    }
    try {
      const persisted = await globalThis.navigator?.storage?.persist?.()
      this.recordEvent(null, 'storage-persist', Boolean(persisted))
    } catch {
      this.recordEvent(null, 'storage-persist', false)
    }
    this._installPageListeners()
    this.timer = setInterval(() => this.flush(), FLUSH_INTERVAL_MS)
    return this
  }

  nextConnId () {
    return `pc-${++this.connCounter}`
  }

  recordEvent (connId, name, value = null) {
    this.record({ kind: 'event', connId, name, value })
  }

  recordHttp (entry) {
    this.record({ kind: 'http', entry })
  }

  record (record) {
    if (!this.active) return
    const value = { time: Date.now(), ...record }
    if (value.kind === 'http') value.entry = redactHttpEntry(value.entry)
    if (value.kind === 'ws') value.data = REDACT_SECRETS ? redactMessage(value.data, REDACT_KEEP_LAST_CHARS) : value.data
    if (value.kind === 'resource' && value.entry?.name) {
      value.entry = { ...value.entry, name: REDACT_SECRETS ? redactUrl(value.entry.name, REDACT_KEEP_LAST_CHARS) : value.entry.name }
    }
    if (value.kind === 'event') value.value = redactEventValue(value.value)
    this.buffer.push(value)
  }

  recordStats (connId, report, statsIntervalMs = 1000) {
    if (!this.active || !report) return
    const state = this.connStats.get(connId) || { previous: null, samples: 0, lastKept: null, forceFull: true }
    state.samples++
    const every = this.storageLow ? Math.max(1, Math.ceil(SLOW_STATS_INTERVAL_MS / statsIntervalMs)) : 1
    if (state.samples % every !== 0) {
      this.connStats.set(connId, state)
      return
    }

    const time = Date.now()
    const effectiveInterval = this.storageLow ? SLOW_STATS_INTERVAL_MS : statsIntervalMs
    if (state.lastKept !== null && time - state.lastKept > STATS_GAP_FACTOR * effectiveInterval) {
      this.recordEvent(connId, 'stats-gap', { from: state.lastKept, to: time })
    }
    const reports = {}
    if (report && typeof report.forEach === 'function') {
      report.forEach(stat => {
        if (stat?.id) reports[stat.id] = redact(toPlain(stat))
      })
    } else if (typeof report === 'object') {
      Object.assign(reports, redact(toPlain(report)))
    }

    let statRecord
    if (!state.previous || state.forceFull) {
      statRecord = { time, kind: 'stats', connId, full: true, reports }
      state.forceFull = false
    } else {
      const changed = {}
      const added = {}
      const removed = Object.keys(state.previous).filter(id => !(id in reports))
      for (const [id, stat] of Object.entries(reports)) {
        if (!state.previous[id]) {
          added[id] = stat
          continue
        }
        const delta = {}
        for (const [field, fieldValue] of Object.entries(stat)) {
          const prior = state.previous[id][field]
          const equal = fieldValue === prior || (fieldValue && typeof fieldValue === 'object' && prior && typeof prior === 'object' && JSON.stringify(fieldValue) === JSON.stringify(prior))
          if (!equal) delta[field] = fieldValue
        }
        if (Object.keys(delta).length) changed[id] = delta
      }
      statRecord = { time, kind: 'stats', connId, changed, added, removed }
    }
    state.previous = reports
    state.lastKept = time
    this.connStats.set(connId, state)
    this.buffer.push(statRecord)
  }

  attachPeer (connId, peerInstance, peerConfig = {}) {
    const peer = peerInstance?.peer
    if (!peer) return
    this.connectionCount++
    this.recordEvent(connId, 'rtcConfiguration', peerConfig)

    const on = (name, value) => {
      const item = value?.candidate && typeof value.candidate.toJSON === 'function'
        ? value.candidate.toJSON()
        : toPlain(value)
      this.recordEvent(connId, name, item)
      if (name === 'connectionstatechange' && ['failed', 'closed'].includes(peer.connectionState)) this.flush()
    }
    const listeners = {
      icecandidate: event => on('icecandidate', event.candidate ? event.candidate.toJSON?.() || event.candidate : null),
      icecandidateerror: event => on('icecandidateerror', {
        address: event.address,
        port: event.port,
        url: event.url,
        errorCode: event.errorCode,
        errorText: event.errorText
      }),
      iceconnectionstatechange: () => on('iceconnectionstatechange', peer.iceConnectionState),
      connectionstatechange: () => on('connectionstatechange', peer.connectionState),
      icegatheringstatechange: () => on('icegatheringstatechange', peer.iceGatheringState),
      signalingstatechange: () => on('signalingstatechange', peer.signalingState),
      track: event => on('track', {
        kind: event.track?.kind,
        trackId: event.track?.id,
        mid: event.transceiver?.mid,
        streamIds: (event.streams || []).map(stream => stream.id)
      }),
      negotiationneeded: () => on('negotiationneeded', null)
    }
    for (const [name, listener] of Object.entries(listeners)) {
      if (peer.addEventListener) {
        peer.addEventListener(name, listener)
        this.cleanup.push(() => peer.removeEventListener?.(name, listener))
      }
    }

    for (const method of ['createOffer', 'createAnswer', 'setLocalDescription', 'setRemoteDescription', 'addIceCandidate', 'addTransceiver', 'close']) {
      if (typeof peer[method] !== 'function') continue
      const original = peer[method]
      const session = this
      peer[method] = function (...args) {
        session.recordEvent(connId, method, args.map(toStoredDescription))
        let result
        try {
          result = original.apply(this, args)
        } catch (error) {
          session.recordEvent(connId, `${method}OnFailure`, errorValue(error))
          throw error
        }
        if (result && typeof result.then === 'function') {
          result.then(
            value => session.recordEvent(connId, `${method}OnSuccess`, toStoredDescription(value)),
            error => session.recordEvent(connId, `${method}OnFailure`, errorValue(error))
          )
        } else {
          session.recordEvent(connId, `${method}OnSuccess`, toStoredDescription(result))
        }
        return result
      }
      this.cleanup.push(() => { peer[method] = original })
    }

    const intervalMs = peerConfig.statsIntervalMs || 1000
    if (!peerInstance.peerConnectionStats) {
      peerInstance.initStats?.({ autoInitStats: true, statsIntervalMs: intervalMs })
    }
    const stats = peerInstance.peerConnectionStats
    if (stats?.on) {
      const handler = rawStats => this.recordStats(connId, rawStats, intervalMs)
      stats.on('rawStats', handler)
      this.cleanup.push(() => stats.off?.('rawStats', handler) || stats.removeListener?.('rawStats', handler))
    }
  }

  attachWebSocket (connId, socket) {
    this.recordEvent(connId, 'ws-created', { url: REDACT_SECRETS ? redactUrl(socket.url || '', REDACT_KEEP_LAST_CHARS) : socket.url })
    const listeners = {
      open: () => this.recordEvent(connId, 'ws-open', null),
      close: event => this.recordEvent(connId, 'ws-close', { code: event.code, reason: event.reason, wasClean: event.wasClean }),
      error: () => this.recordEvent(connId, 'ws-error', null),
      message: event => this.record({ kind: 'ws', connId, dir: 'receive', data: typeof event.data === 'string' ? event.data : String(event.data) })
    }
    for (const [name, listener] of Object.entries(listeners)) {
      socket.addEventListener?.(name, listener)
      this.cleanup.push(() => socket.removeEventListener?.(name, listener))
    }
    if (typeof socket.send === 'function') {
      const original = socket.send
      const session = this
      socket.send = function (data, ...args) {
        session.record({ kind: 'ws', connId, dir: 'send', data: typeof data === 'string' ? data : String(data) })
        return original.call(this, data, ...args)
      }
      this.cleanup.push(() => { socket.send = original })
    }
  }

  async flush () {
    if (!this.active && this.buffer.length === 0) return this.flushChain
    const operation = this.flushChain.then(async () => {
      if (this.buffer.length === 0) return
      const records = this.buffer
      this.buffer = []
      const chunk = { sessionId: this.id, seq: ++this.seq, records }
      try {
        await this.store.appendChunk(chunk)
        this.flushCount++
        if (this.flushCount % 6 === 0) await this._checkStoragePressure()
      } catch (error) {
        const nonStats = records.filter(record => record.kind !== 'stats')
        const stats = records.filter(record => record.kind === 'stats')
        for (const state of this.connStats.values()) state.forceFull = true
        this.buffer = [...nonStats, ...this.buffer]
        const dropped = {
          from: records[0]?.time,
          to: records[records.length - 1]?.time,
          count: stats.length,
          error: error?.message || String(error)
        }
        if (this.active) this.recordEvent(null, 'stats-dropped', dropped)
        else this.buffer.push({ time: Date.now(), kind: 'event', connId: null, name: 'stats-dropped', value: dropped })
        this._setStorageLow()
      }
    })
    this.flushChain = operation.catch(error => logger.warn('Debug capture flush failed', error))
    return operation
  }

  async end () {
    if (!this.active) return
    this.recordEvent(null, 'stop', null)
    clearInterval(this.timer)
    this.timer = null
    this.active = false
    for (const remove of this.cleanup.splice(0)) {
      try { remove() } catch (error) { logger.debug(error) }
    }
    await this.flush()
    this.endTime = Date.now()
    this.meta.endTime = this.endTime
    await this.store.putSession(this.meta)
  }

  async updateIdentity (streamName, accountId) {
    if (streamName) this.meta.streamName = this.streamName = streamName
    if (accountId) this.meta.accountId = this.accountId = accountId
    await this.store.putSession(this.meta)
  }

  _installPageListeners () {
    const add = (target, event, listener) => {
      target?.addEventListener?.(event, listener)
      this.cleanup.push(() => target?.removeEventListener?.(event, listener))
    }
    add(globalThis, 'pagehide', () => { this.recordEvent(null, 'pagehide', null); this.flush() })
    add(globalThis, 'pageshow', () => this.recordEvent(null, 'pageshow', null))
    add(globalThis, 'online', () => this.recordEvent(null, 'online', null))
    add(globalThis, 'offline', () => this.recordEvent(null, 'offline', null))
    add(globalThis.document, 'visibilitychange', () => {
      this.recordEvent(null, 'visibilitychange', globalThis.document.visibilityState)
      if (globalThis.document.visibilityState === 'hidden') this.flush()
    })
    add(globalThis.document, 'freeze', () => this.recordEvent(null, 'freeze', null))
    add(globalThis.document, 'resume', () => this.recordEvent(null, 'resume', null))
    if (typeof globalThis.PerformanceObserver === 'function') {
      try {
        const observer = new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            if (entry.name.startsWith('blob:') || entry.name.startsWith('data:')) continue
            const plain = entry.toJSON?.() || { ...entry }
            this.record({ kind: 'resource', entry: plain })
          }
        })
        observer.observe({ type: 'resource', buffered: true })
        this.cleanup.push(() => observer.disconnect())
      } catch (error) { logger.debug(error) }
    }
  }

  async _checkStoragePressure () {
    try {
      const estimate = await globalThis.navigator?.storage?.estimate?.()
      if (estimate?.quota && estimate.usage / estimate.quota > STORAGE_LOW_RATIO) this._setStorageLow()
    } catch (error) { logger.debug(error) }
  }

  _setStorageLow () {
    this.storageLow = true
    if (!this.storageLowRecorded) {
      this.storageLowRecorded = true
      if (this.active) this.recordEvent(null, 'storage-low', null)
      else this.buffer.push({ time: Date.now(), kind: 'event', connId: null, name: 'storage-low', value: null })
    }
  }

  async _deleteExpiredSessions () {
    const cutoff = Date.now() - KEEP_SESSIONS_DAYS * 24 * 60 * 60 * 1000
    const sessions = await this.store.listSessions()
    for (const session of sessions) {
      if (session.endTime !== null && session.endTime < cutoff) await this.store.deleteSession(session.id)
    }
  }
}

const redactHttpEntry = entry => {
  const copy = redact(entry)
  if (copy?.request?.url && REDACT_SECRETS) copy.request.url = redactUrl(copy.request.url, REDACT_KEEP_LAST_CHARS)
  for (const location of [copy?.request, copy?.response]) {
    if (typeof location?.body === 'string' && REDACT_SECRETS) {
      try {
        location.body = JSON.stringify(redactDeep(JSON.parse(location.body), REDACT_KEEP_LAST_CHARS))
      } catch (error) { logger.debug(error) }
    }
  }
  return copy
}

const redactEventValue = (value, key = '', parentKey = '') => {
  if (!REDACT_SECRETS) return value
  if (typeof value === 'string') {
    return /url/i.test(key) ? redactUrl(value, REDACT_KEEP_LAST_CHARS) : value
  }
  if (Array.isArray(value)) return value.map(item => redactEventValue(item, key, key))
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(Object.entries(value).map(([childKey, child]) => [
    childKey,
    (/token|jwt|credential|password|secret|authorization/i.test(childKey) ||
      (childKey === 'username' && parentKey === 'iceServers')) && typeof child === 'string'
      ? redactSecret(child, REDACT_KEEP_LAST_CHARS)
      : redactEventValue(child, childKey, key)
  ]))
}
