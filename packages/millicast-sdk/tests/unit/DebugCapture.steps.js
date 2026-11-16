import 'fake-indexeddb/auto'
import { loadFeature, defineFeature } from 'jest-cucumber'
import { runInThisContext } from 'node:vm'
import DebugCapture, { createCaptureSession, setCurrentHttpCapture, unregisterCaptureSession } from '../../src/DebugCapture'
import CaptureSession, { TAIL_MAX_BYTES } from '../../src/utils/CaptureSession'
import CaptureStore, { CAPTURE_TAIL_KEY_PREFIX } from '../../src/utils/CaptureStore'
import { buildCapture } from '../../src/utils/CaptureExport'
import { redactDeep, redactMessage, redactSecret, redactUrl } from '../../src/utils/Redact'
import Director from '../../src/Director'
import View from '../../src/View'
import Signaling from '../../src/Signaling'
import MockRTCPeerConnection from './__mocks__/MockRTCPeerConnection'
import './__mocks__/MockBrowser'
import './__mocks__/Fetch'

if (typeof globalThis.structuredClone !== 'function') {
  globalThis.structuredClone = value => JSON.parse(JSON.stringify(value))
}

const feature = loadFeature('../features/DebugCapture.feature', { loadRelativePath: true, errors: true })

jest.mock('../../src/Signaling')
jest.mock('../../src/DebugCapture', () => {
  const actual = jest.requireActual('../../src/DebugCapture')
  return {
    __esModule: true,
    ...actual,
    createCaptureSession: jest.fn(actual.createCaptureSession)
  }
})
jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn(() => ({ millicast: { streamName: 'capture-stream' } }))
}))
jest.mock('../../src/workers/TransformWorker.worker.js', () => jest.fn(() => ({
  postMessage: jest.fn(),
  terminate: jest.fn()
})))
jest.mock('../../src/drm/rtc-drm-transform.js', () => ({
  rtcDrmConfigure: jest.fn(),
  rtcDrmOnTrack: jest.fn(),
  rtcDrmEnvironments: jest.fn(),
  rtcDrmFeedFrame: jest.fn()
}))

const report = (framesDecoded, timestamp) => new Map([[
  'inbound-1',
  { id: 'inbound-1', type: 'inbound-rtp', timestamp, framesDecoded, kind: 'video' }
]])

const makeReactiveProxy = (value, cache = new WeakMap()) => {
  if (!value || typeof value !== 'object') return value
  const type = Object.prototype.toString.call(value)
  if (type !== '[object Object]' && type !== '[object Array]') return value
  if (cache.has(value)) return cache.get(value)
  const proxy = new Proxy(value, {
    get (target, key, receiver) {
      return makeReactiveProxy(Reflect.get(target, key, receiver), cache)
    }
  })
  cache.set(value, proxy)
  return proxy
}

const nativeStructuredClone = runInThisContext('structuredClone')
const cloneIndexedDbWrites = () => {
  for (const method of ['put', 'add']) {
    const original = IDBObjectStore.prototype[method]
    jest.spyOn(IDBObjectStore.prototype, method).mockImplementation(function (value, ...args) {
      nativeStructuredClone(value)
      return original.call(this, value, ...args)
    })
  }
}

const trackSessionWrites = store => {
  const writes = []
  const putSession = store.putSession.bind(store)
  jest.spyOn(store, 'putSession').mockImplementation(session => {
    const write = putSession(session)
    writes.push(write)
    return write
  })
  return async () => Promise.all(writes.splice(0))
}

const dispatchPageEvent = (name, persisted) => {
  const event = new Event(name)
  Object.defineProperty(event, 'persisted', { value: persisted })
  globalThis.dispatchEvent(event)
}

const setVisibilityState = state => {
  const original = Object.getOwnPropertyDescriptor(document, 'visibilityState')
  Object.defineProperty(document, 'visibilityState', { configurable: true, value: state })
  return () => {
    if (original) Object.defineProperty(document, 'visibilityState', original)
    else delete document.visibilityState
  }
}

const httpRecord = (time, id) => ({
  time,
  kind: 'http',
  entry: {
    startedDateTime: new Date(time).toISOString(),
    time: 10,
    request: { method: 'POST', url: `https://director.test/subscribe/${id}`, headers: {}, postData: '{}' },
    response: { status: 200, headers: {}, body: JSON.stringify({ id }) }
  }
})

const statsRecord = (time, connId, framesDecoded, full = false) => ({
  time,
  kind: 'stats',
  connId,
  ...(full
    ? {
        full: true,
        reports: {
          'inbound-1': {
            id: 'inbound-1',
            type: 'inbound-rtp',
            timestamp: time,
            framesDecoded,
            kind: 'video'
          }
        }
      }
    : { changed: { 'inbound-1': { timestamp: time, framesDecoded } }, added: {}, removed: [] })
})

const createSessionWithRecords = async (name, records, options = {}) => {
  const session = await createCaptureSession({
    store: new CaptureStore(name),
    streamName: options.streamName || 'multiview',
    accountId: options.accountId || 'k9Mwad'
  })
  session.meta.startTime = options.startTime || 1000
  session.buffer = records
  return session
}

const twoAttemptRecords = () => [
  { time: 1000, kind: 'event', connId: null, name: 'connect-start', value: { migrate: false } },
  httpRecord(1100, 'director-1'),
  { time: 1200, kind: 'event', connId: 'pc-1', name: 'ws-created', value: { url: 'wss://signal.test/one' } },
  { time: 1250, kind: 'ws', connId: 'pc-1', dir: 'send', data: '{"cmd":"view-1"}' },
  statsRecord(1300, 'pc-1', 10, true),
  { time: 1400, kind: 'event', connId: 'pc-1', name: 'view-result', value: { streamViewId: 'A' } },
  { time: 2000, kind: 'event', connId: null, name: 'connect-start', value: { migrate: false } },
  httpRecord(2100, 'director-2'),
  { time: 2200, kind: 'event', connId: 'pc-2', name: 'ws-created', value: { url: 'wss://signal.test/two' } },
  statsRecord(2300, 'pc-2', 30, true),
  statsRecord(2400, 'pc-2', 31),
  { time: 2500, kind: 'event', connId: 'pc-2', name: 'view-result', value: { streamViewId: 'B' } },
  { time: 2600, kind: 'event', connId: 'pc-1', name: 'ws-close', value: null },
  { time: 2700, kind: 'event', connId: null, name: 'visibilitychange', value: { hidden: true } }
]

const installDownloadCapture = () => {
  const downloads = []
  const blobs = []
  const revoked = []
  const originalCreateElement = document.createElement.bind(document)
  const createElement = jest.spyOn(document, 'createElement').mockImplementation(tagName => {
    const element = originalCreateElement(tagName)
    if (tagName === 'a') element.click = () => downloads.push(element.download)
    return element
  })
  const createObjectUrl = URL.createObjectURL
  const revokeObjectUrl = URL.revokeObjectURL
  URL.createObjectURL = blob => {
    blobs.push(blob)
    return 'blob:debug-capture'
  }
  URL.revokeObjectURL = url => revoked.push(url)
  return {
    downloads,
    blobs,
    revoked,
    restore: () => {
      createElement.mockRestore()
      if (createObjectUrl) URL.createObjectURL = createObjectUrl
      else delete URL.createObjectURL
      if (revokeObjectUrl) URL.revokeObjectURL = revokeObjectUrl
      else delete URL.revokeObjectURL
    }
  }
}

const readJsonBlob = blob => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => {
    try {
      resolve(JSON.parse(reader.result))
    } catch (error) {
      reject(error)
    }
  }
  reader.onerror = () => reject(reader.error)
  reader.readAsText(blob)
})

const setNavigatorUserAgentData = value => {
  const original = Object.getOwnPropertyDescriptor(navigator, 'userAgentData')
  Object.defineProperty(navigator, 'userAgentData', { configurable: true, value })
  return () => {
    if (original) Object.defineProperty(navigator, 'userAgentData', original)
    else delete navigator.userAgentData
  }
}

defineFeature(feature, test => {
  beforeEach(async () => {
    jest.useRealTimers()
    jest.restoreAllMocks()
    for (let index = localStorage.length - 1; index >= 0; index--) {
      const key = localStorage.key(index)
      if (key?.startsWith(CAPTURE_TAIL_KEY_PREFIX)) localStorage.removeItem(key)
    }
    await DebugCapture.clear()
    jest.spyOn(Signaling.prototype, 'subscribe').mockReturnValue('sdp')
  })

  test('Capture is opt-in', ({ given, when, then }) => {
    let open
    let view
    let sessions

    given('a viewer with capture disabled', () => {
      open = jest.spyOn(indexedDB, 'open')
      view = new View(undefined, () => ({
        urls: ['wss://example.test'],
        jwt: 'test-jwt'
      }))
    })

    when('it connects to a stream', async () => {
      await view.connect()
    })

    then('no capture database is opened by the viewer and the session list is empty', async () => {
      expect(open).not.toHaveBeenCalled()
      expect(view.webRTCPeer.peer.createOffer).toBe(MockRTCPeerConnection.prototype.createOffer)
      expect(view.webRTCPeer.peer.eventListeners.size).toBe(0)
      sessions = await DebugCapture.listSessions()
      expect(sessions).toEqual([])
      view.stop()
    })
  })

  test('Capture records connection setup and network requests', ({ given, when, then }) => {
    let view
    let session
    let capture

    given('a viewer with capture enabled', () => {
      view = new View(undefined, () => ({
        urls: ['wss://signal.example.test'],
        jwt: 'long-jwt-secret-123456',
        iceServers: [{
          urls: 'turn:turn.example.test?token=turn-secret-123456',
          username: 'turn-user-secret',
          credential: 'turn-credential-secret'
        }],
        streamAccountId: 'account-1'
      }))
    })

    when('it connects and records peer, websocket, and Director activity', async () => {
      await view.connect({ debugCapture: { enabled: true } })
      session = view.debugCaptureSession
      const listeners = new Map()
      const socket = {
        url: 'wss://signal.example.test?token=socket-secret-123456',
        addEventListener: (name, fn) => listeners.set(name, fn),
        removeEventListener: jest.fn(),
        send: jest.fn()
      }
      session.attachWebSocket('pc-1', socket)
      socket.send('{"jwt":"message-secret-123456"}')
      listeners.get('open')()

      const directorResponse = {
        status: 'success',
        data: {
          urls: ['wss://signal.example.test'],
          jwt: 'director-jwt',
          iceServers: [
            { urls: 'turn:turn-one.example.test', username: '1791945353:k9Mwad', credential: 'abcdefghijklmnop123' },
            { urls: 'turn:turn-two.example.test', username: '1791945353:k9Mwad', credential: 'abcdefghijklmnop123' }
          ]
        }
      }
      jest.spyOn(global, 'fetch').mockResolvedValue({
        text: async () => JSON.stringify(directorResponse),
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'content-type': 'application/json', authorization: 'Bearer response-secret-123456' })
      })
      setCurrentHttpCapture(session)
      try {
        await Director.getSubscriber({ streamName: 'capture-stream', streamAccountId: 'account-1', subscriberToken: 'request-secret-123456' })
      } finally {
        setCurrentHttpCapture(null)
      }
      view.webRTCPeer.peer.connectionState = 'failed'
      view.webRTCPeer.peer.dispatchEvent({ type: 'connectionstatechange' })
      capture = await DebugCapture.getCapture(session.id)
    })

    then('its configuration and connection events are saved with secrets redacted', async () => {
      const sessions = await DebugCapture.listSessions()
      expect(sessions.find(sessionInfo => sessionInfo.id === session.id).active).toBe(true)
      const events = capture.webrtcDump.PeerConnections['pc-1'].updateLog
      expect(events.some(event => event.type === 'createOfferOnSuccess')).toBe(true)
      expect(events.some(event => event.type === 'setLocalDescriptionOnSuccess')).toBe(true)
      expect(events.some(event => event.type === 'setRemoteDescriptionOnSuccess')).toBe(true)
      expect(events.some(event => event.type === 'connectionstatechange')).toBe(true)
      expect(events.some(event => event.type === 'ws-created')).toBe(true)
      expect(events.find(event => event.type === 'ws-created').value).toContain('token=REDACTED')
      const dump = JSON.stringify(capture)
      expect(dump).toContain('rtcConfiguration')
      expect(dump).toContain('REDACTED')
      expect(dump).not.toContain('turn-credential-secret')
      expect(dump).not.toContain('turn-user-secret')
      expect(dump).not.toContain('turn-secret-123456')
      expect(dump).not.toContain('socket-secret-123456')
      expect(dump).not.toContain('request-secret-123456')
      expect(dump).not.toContain('response-secret-123456')
      expect(dump).not.toContain('message-secret-123456')
      expect(dump).not.toContain('director-jwt')
      const directorEntry = capture.har.log.entries.find(entry => entry.request.url.includes('director'))
      expect(directorEntry).toBeDefined()
      const directorResponse = JSON.parse(directorEntry.response.content.text)
      expect(directorResponse.data.iceServers.map(server => server.username)).toEqual([
        'REDACTED...k9Mwad',
        'REDACTED...k9Mwad'
      ])
      expect(directorResponse.data.iceServers.every(server => server.credential.includes('REDACTED'))).toBe(true)
      const har = JSON.stringify(capture.har)
      expect(har).not.toContain('1791945353:k9Mwad')
      expect(har).not.toContain('abcdefghijklmnop123')
      await session.end()
      view.stop()
      unregisterCaptureSession(session.id)
    })
  })

  test('Stats use deltas and export full series', ({ given, when, then }) => {
    let session
    let records
    let capture

    given('a capture session', async () => {
      session = new CaptureSession({ store: new CaptureStore('capture-deltas') })
      await session.start()
    })
    when('three raw stats reports are recorded', async () => {
      session.recordStats('pc-1', report(20, 100))
      session.recordStats('pc-1', report(25, 200))
      session.recordStats('pc-1', report(25, 300))
      await session.flush()
      records = (await session.store.listChunks(session.id)).flatMap(chunk => chunk.records)
      capture = buildCapture(session.meta, records)
      await session.end()
    })
    then('the stored deltas rebuild all three WebRTC stats samples', () => {
      const stats = records.filter(record => record.kind === 'stats')
      expect(stats[0].full).toBe(true)
      expect(stats[1].changed['inbound-1']).toEqual({ timestamp: 200, framesDecoded: 25 })
      expect(stats[2].changed['inbound-1']).toEqual({ timestamp: 300 })
      const output = capture.webrtcDump.PeerConnections['pc-1'].stats
      expect(JSON.parse(output['inbound-1-framesDecoded'].values)).toEqual([20, 25, 25])
      expect(output['inbound-1-framesDecoded'].statsType).toBe('inbound-rtp')
      expect(JSON.parse(output['inbound-1-kind'].values)).toEqual(['video', 'video', 'video'])
      expect(JSON.parse(output['inbound-1-timestamp'].values)).toEqual([100, 200, 300])
    })
  })

  test('Flush on interval and failed connection state', ({ given, when, then }) => {
    let session
    let store
    let peer
    let chunks

    given('a capture session with fake timers', async () => {
      jest.useFakeTimers()
      store = new CaptureStore('capture-flush')
      session = new CaptureSession({ store })
      await session.start()
      peer = new MockRTCPeerConnection()
      session.attachPeer('pc-1', { peer }, {})
    })
    when('a peer fails and the session is stopped', async () => {
      session.recordEvent(null, 'online')
      jest.advanceTimersByTime(5000)
      peer.connectionState = 'failed'
      peer.dispatchEvent({ type: 'connectionstatechange' })
      await session.flush()
      await session.end()
      chunks = await store.listChunks(session.id)
    })
    then('records are flushed and the session is ended', async () => {
      const meta = await store.getSession(session.id)
      const records = chunks.flatMap(chunk => chunk.records)
      expect(records.some(record => record.name === 'connectionstatechange')).toBe(true)
      expect(meta.endTime).toEqual(expect.any(Number))
      expect((await DebugCapture.listSessions()).some(sessionInfo => sessionInfo.id === session.id && !sessionInfo.active)).toBe(false)
    })
  })

  test('Storage pressure slows stats but retains events', ({ given, when, then }) => {
    let session
    let stats
    let records
    let storageDescriptor

    given('storage pressure has been detected', async () => {
      storageDescriptor = Object.getOwnPropertyDescriptor(navigator, 'storage')
      Object.defineProperty(navigator, 'storage', {
        configurable: true,
        enumerable: true,
        writable: true,
        value: { estimate: jest.fn().mockResolvedValue({ usage: 95, quota: 100 }) }
      })
      session = new CaptureSession({ store: new CaptureStore('capture-low') })
      await session.start()
      await session._checkStoragePressure()
    })
    when('ten stats samples and a lifecycle event are recorded', async () => {
      for (let index = 1; index <= 10; index++) session.recordStats('pc-1', report(index, index * 100))
      session.recordEvent(null, 'offline')
      await session.flush()
      records = (await session.store.listChunks(session.id)).flatMap(chunk => chunk.records)
      stats = records.filter(record => record.kind === 'stats')
      await session.end()
      if (storageDescriptor) Object.defineProperty(navigator, 'storage', storageDescriptor)
      else delete navigator.storage
    })
    then('stats are sampled more slowly and lifecycle events remain', () => {
      expect(stats).toHaveLength(2)
      expect(stats[0].full).toBe(true)
      expect(records.some(record => record.name === 'storage-low')).toBe(true)
      expect(records.some(record => record.name === 'offline')).toBe(true)
    })
  })

  test('Failed writes retain events and reset stats deltas', ({ given, when, then }) => {
    let session
    let records
    const chunks = []
    let attempts

    given('a capture store that fails one write', async () => {
      attempts = 0
      const store = {
        mode: 'indexeddb',
        open: async () => store,
        listSessions: async () => [],
        putSession: async () => {},
        appendChunk: async chunk => {
          if (attempts++ === 0) throw new Error('QuotaExceededError')
          chunks.push(chunk)
        }
      }
      session = new CaptureSession({ store })
      await session.start()
    })
    when('a stats chunk fails and a later sample arrives', async () => {
      session.recordEvent(null, 'kept-event')
      session.recordStats('pc-1', report(2, 10))
      await session.flush()
      for (let index = 3; index <= 6; index++) session.recordStats('pc-1', report(index, index * 10))
      await session.flush()
      records = chunks.flatMap(chunk => chunk.records)
      await session.end()
    })
    then('dropped stats are reported and the next stats sample is full', () => {
      expect(records.some(record => record.name === 'kept-event')).toBe(true)
      expect(records.some(record => record.name === 'stats-dropped')).toBe(true)
      expect(records.filter(record => record.kind === 'stats')).toHaveLength(1)
      expect(records.filter(record => record.kind === 'stats')[0].full).toBe(true)
    })
  })

  test('In-memory store remains readable', ({ given, when, then }) => {
    let session
    let result

    given('IndexedDB is unavailable', async () => {
      const store = new CaptureStore('capture-memory')
      const indexedDBDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'indexedDB')
      Object.defineProperty(globalThis, 'indexedDB', {
        configurable: true,
        enumerable: true,
        writable: true,
        value: undefined
      })
      await store.open()
      Object.defineProperty(globalThis, 'indexedDB', indexedDBDescriptor)
      session = await createCaptureSession({ store, streamName: 'memory-stream' })
      expect(session.meta.storageMode).toBe('memory')
    })
    when('a capture is written to memory', async () => {
      session.recordEvent(null, 'memory-event', { value: true })
      await session.flush()
      result = await DebugCapture.getCapture(session.id)
    })
    then('the capture API can still build its export', async () => {
      expect(result.sessionId).toBe(session.id)
      expect(result.webrtcDump.millicast.events.some(event => event.name === 'memory-event')).toBe(true)
      await DebugCapture.deleteSession(session.id)
    })
  })

  test('Migration records its start and allocates another peer connection id', ({ given, when, then }) => {
    let session
    let connectionIds
    let view
    given('a capture session', async () => {
      session = new CaptureSession({ store: new CaptureStore('capture-reconnect') })
      await session.start()
      connectionIds = [session.nextConnId()]
      view = {
        debugCaptureSession: session,
        initConnection: jest.fn().mockResolvedValue()
      }
    })
    when('the viewer migrates to a new peer connection', async () => {
      await View.prototype.replaceConnection.call(view)
      connectionIds.push(session.nextConnId())
    })
    then('both peer connections and the migrate-start event belong to the same session', async () => {
      expect(connectionIds).toEqual(['pc-1', 'pc-2'])
      session.recordEvent(connectionIds[0], 'connectionstatechange', 'closed')
      session.recordEvent(connectionIds[1], 'connectionstatechange', 'connected')
      await session.flush()
      const records = (await session.store.listChunks(session.id)).flatMap(chunk => chunk.records)
      const capture = buildCapture(session.meta, records)
      expect(Object.keys(capture.webrtcDump.PeerConnections)).toEqual(['pc-1', 'pc-2'])
      expect(capture.webrtcDump.millicast.events.some(event => event.name === 'migrate-start')).toBe(true)
      await session.end()
    })
  })

  test('Secrets are redacted from captured values', ({ given, when, then }) => {
    let values
    given('secret values in strings and objects', () => {
      values = {
        secret: 'very-long-secret-value',
        Authorization: 'Bearer very-long-bearer-token',
        url: 'https://example.test/path?token=very-long-token-value&ok=1'
      }
    })
    when('the redaction helpers are used', () => {
      values.secret = redactSecret(values.secret)
      values.object = redactDeep(values)
      values.url = redactUrl(values.url)
      values.message = redactMessage('{"jwt":"very-long-message-secret"}')
    })
    then('secrets and sensitive URL parameters are hidden', () => {
      expect(values.secret).toBe('REDACTED...-value')
      expect(values.object.Authorization).toContain('Bearer REDACTED...')
      expect(values.url).toContain('token=REDACTED')
      expect(values.message).toContain('REDACTED')
      expect(redactSecret('tiny')).toBe('REDACTED')
      expect(redactDeep({ username: 'x'.repeat(20) }).username).toBe('x'.repeat(20))
    })
  })

  test('HAR combines HTTP websocket and resource entries', ({ given, when, then }) => {
    let records
    let har
    const meta = {
      id: 'har-session',
      startTime: 1000,
      endTime: 4000,
      pageUrl: 'https://example.test/page?token=page-secret-123456',
      userAgent: 'Test browser',
      sdkVersion: '1.0.0',
      streamName: 'stream',
      accountId: 'account',
      storageMode: 'indexeddb'
    }
    given('HTTP, websocket, and resource records', () => {
      records = [
        { time: 1500, kind: 'http', entry: { startedDateTime: new Date(1500).toISOString(), time: 10, request: { method: 'POST', url: 'https://director.test/subscribe', headers: { authorization: 'Bearer secret' }, postData: '{}' }, response: { status: 200, headers: {}, body: '{}' } } },
        { time: 2000, kind: 'event', connId: 'pc-1', name: 'ws-created', value: { url: 'wss://signal.test/?token=long-secret-123456' } },
        { time: 2500, kind: 'ws', connId: 'pc-1', dir: 'send', data: '{"cmd":"view"}' },
        { time: 3500, kind: 'resource', entry: { name: 'https://cdn.test/app.js?jwt=long-secret-123456', duration: 100, startTime: 100, domainLookupStart: 1, domainLookupEnd: 2, connectStart: 2, connectEnd: 4, requestStart: 5, responseStart: 20, responseEnd: 100, initiatorType: 'script' } }
      ]
    })
    when('a HAR export is built', () => {
      har = buildCapture(meta, records).har
    })
    then('it contains sorted HAR 1.2 network entries', () => {
      expect(har.log.version).toBe('1.2')
      expect(har.log.entries).toHaveLength(3)
      expect(har.log.entries[0].request.method).toBe('POST')
      const websocket = har.log.entries.find(entry => entry._resourceType === 'websocket')
      const resource = har.log.entries.find(entry => entry._resourceType === 'script')
      expect(websocket._webSocketMessages[0].type).toBe('send')
      expect(websocket.request.url).not.toContain('long-secret-123456')
      expect(resource.comment).toContain('Resource Timing')
      expect(resource.request.url).not.toContain('long-secret-123456')
      expect(har.log.pages[0].title).not.toContain('page-secret-123456')
    })
  })

  test('New sessions prune only old ended sessions', ({ given, when, then }) => {
    let store
    let session
    given('one old ended session and one unfinished session', async () => {
      store = new CaptureStore('capture-retention')
      await store.open()
      const old = { id: 'old-ended', startTime: 1, endTime: Date.now() - 8 * 24 * 60 * 60 * 1000, storageMode: 'indexeddb' }
      const unfinished = { id: 'old-active', startTime: 1, endTime: null, storageMode: 'indexeddb' }
      await store.putSession(old)
      await store.putSession(unfinished)
      await store.appendChunk({ sessionId: old.id, seq: 1, records: [] })
      await store.appendChunk({ sessionId: unfinished.id, seq: 1, records: [] })
    })
    when('a new capture session starts', async () => {
      session = new CaptureSession({ store })
      await session.start()
    })
    then('only the old ended session and its chunks are deleted', async () => {
      const sessions = await store.listSessions()
      expect(sessions.map(value => value.id)).toContain('old-active')
      expect(sessions.map(value => value.id)).not.toContain('old-ended')
      expect(await store.listChunks('old-ended')).toEqual([])
      expect(await store.listChunks('old-active')).toHaveLength(1)
      await session.end()
    })
  })

  test('Storage persistence does not block connection', ({ given, when, then }) => {
    let view
    let session
    let storageDescriptor

    given('navigator persistence never resolves', () => {
      storageDescriptor = Object.getOwnPropertyDescriptor(navigator, 'storage')
      Object.defineProperty(navigator, 'storage', {
        configurable: true,
        enumerable: true,
        writable: true,
        value: { persist: () => new Promise(() => {}) }
      })
      view = new View(undefined, () => ({
        urls: ['wss://example.test'],
        jwt: 'test-jwt'
      }))
    })
    when('the viewer connects with capture enabled', async () => {
      await view.connect({ debugCapture: true })
      session = view.debugCaptureSession
    })
    then('playback setup completes without waiting for persistence', async () => {
      expect(session?.active).toBe(true)
      await session.end()
      view.stop()
      if (storageDescriptor) Object.defineProperty(navigator, 'storage', storageDescriptor)
      else delete navigator.storage
    })
  })

  test('Capture startup failure does not block connection', ({ given, when, then }) => {
    let view

    given('capture session creation will fail', () => {
      createCaptureSession.mockRejectedValueOnce(new Error('capture startup failed'))
      view = new View(undefined, () => ({
        urls: ['wss://example.test'],
        jwt: 'test-jwt'
      }))
    })
    when('the viewer connects with capture enabled', async () => {
      await view.connect({ debugCapture: true })
    })
    then('playback setup completes without a capture session', () => {
      expect(view.debugCaptureSession).toBeNull()
      expect(view.webRTCPeer.peer).toBeDefined()
      view.stop()
    })
  })

  test('IndexedDB open timeout falls back to memory', ({ given, when, then }) => {
    let store
    let request
    let opening
    let close

    given('an IndexedDB open request that never completes', () => {
      jest.useFakeTimers()
      request = {}
      close = jest.fn()
      jest.spyOn(indexedDB, 'open').mockReturnValue(request)
      store = new CaptureStore('capture-timeout')
      opening = store.open()
    })
    when('the open timeout expires and the request succeeds late', async () => {
      await jest.advanceTimersByTimeAsync(3000)
      await opening
      request.result = { close }
      request.onsuccess()
    })
    then('the store uses memory and closes the late database', () => {
      expect(store.mode).toBe('memory')
      expect(close).toHaveBeenCalledTimes(1)
      jest.useRealTimers()
    })
  })

  test('Capture writes succeed when the session is used through a reactive proxy', ({ given, when, then }) => {
    let store
    let rawSession
    let session
    let identityError
    let flushError
    let storedSession
    let records

    given('a capture session wrapped in a reactive proxy', async () => {
      cloneIndexedDbWrites()
      store = new CaptureStore('capture-reactive-proxy')
      rawSession = new CaptureSession({ store })
      await rawSession.start()
      session = makeReactiveProxy(rawSession)
    })
    when('its identity and event are updated and flushed', async () => {
      try {
        await session.updateIdentity('s', 'a')
      } catch (error) {
        identityError = `${error.name}: ${error.message}`
      }
      session.recordEvent(null, 'test', { nested: { a: 1 } })
      try {
        await session.flush()
      } catch (error) {
        flushError = `${error.name}: ${error.message}`
      }
      storedSession = await store.getSession(rawSession.id)
      records = (await store.listChunks(rawSession.id)).flatMap(chunk => chunk.records)
    })
    then('the session and event are stored without stats being dropped', async () => {
      try {
        expect(identityError).toBeUndefined()
        expect(flushError).toBeUndefined()
        expect(storedSession).toMatchObject({ streamName: 's', accountId: 'a' })
        expect(records.some(record => record.name === 'test' && record.value.nested.a === 1)).toBe(true)
        expect(records.some(record => record.name === 'stats-dropped')).toBe(false)
      } finally {
        await rawSession.end().catch(() => {})
      }
    })
  })

  test('An unserializable record does not block later writes', ({ given, when, then }) => {
    let store
    let session
    let records

    given('a capture session for resilient writes', async () => {
      cloneIndexedDbWrites()
      store = new CaptureStore('capture-unserializable-record')
      session = new CaptureSession({ store })
      await session.start()
    })
    when('a circular event and later records are flushed', async () => {
      const circularValue = {}
      circularValue.self = circularValue
      session.recordEvent(null, 'circular-event')
      session.buffer.at(-1).value = circularValue
      await session.flush()
      session.recordEvent(null, 'later-event', { written: true })
      session.recordStats('pc-1', report(1, Date.now()))
      await session.flush()
      records = (await store.listChunks(session.id)).flatMap(chunk => chunk.records)
    })
    then('the bad record is marked and later writes are stored', async () => {
      try {
        const badRecord = records.find(record => record.name === 'circular-event')
        expect(badRecord.value).toContain('[unserializable:')
        expect(records.some(record => record.name === 'later-event')).toBe(true)
        expect(records.some(record => record.kind === 'stats')).toBe(true)
        expect(records.some(record => record.name === 'stats-dropped')).toBe(false)
      } finally {
        await session.end()
      }
    })
  })

  test('Pagehide ends an active capture session', ({ given, when, then }) => {
    let store
    let session
    let waitForWrites
    let storedSession
    let capture

    given('an active capture session', async () => {
      store = new CaptureStore('capture-pagehide')
      session = await createCaptureSession({ store })
      waitForWrites = trackSessionWrites(store)
    })
    when('pagehide fires without persisted storage', async () => {
      dispatchPageEvent('pagehide', false)
      await session.flushChain
      await waitForWrites()
      storedSession = await store.getSession(session.id)
      const records = (await store.listChunks(session.id)).flatMap(chunk => chunk.records)
      capture = buildCapture(storedSession, records)
    })
    then('the stored session and export show a pagehide end reason', async () => {
      try {
        expect(storedSession.endTime).toEqual(expect.any(Number))
        expect(storedSession.endReason).toBe('pagehide')
        expect(capture.webrtcDump.millicast.endReason).toBe('pagehide')
      } finally {
        await session.end()
        unregisterCaptureSession(session.id)
      }
    })
  })

  test('Persisted pageshow resumes a capture session', ({ given, when, then }) => {
    let store
    let session
    let waitForWrites
    let storedSession
    let records

    given('an active capture session', async () => {
      store = new CaptureStore('capture-pageshow')
      session = await createCaptureSession({ store })
      waitForWrites = trackSessionWrites(store)
    })
    when('pagehide and persisted pageshow fire', async () => {
      dispatchPageEvent('pagehide', false)
      await session.flushChain
      await waitForWrites()
      dispatchPageEvent('pageshow', true)
      await waitForWrites()
      session.recordEvent(null, 'after-pageshow', { active: true })
      await session.flush()
      storedSession = await store.getSession(session.id)
      records = (await store.listChunks(session.id)).flatMap(chunk => chunk.records)
    })
    then('the session is reopened and later events are stored', async () => {
      try {
        expect(storedSession.endTime).toBeNull()
        expect(storedSession.endReason).toBeNull()
        expect(records.some(record => record.name === 'after-pageshow')).toBe(true)
        expect(localStorage.getItem(`${CAPTURE_TAIL_KEY_PREFIX}${session.id}`)).toBeNull()
      } finally {
        await session.end()
        unregisterCaptureSession(session.id)
      }
    })
  })

  test('Visibility change does not end a capture session', ({ given, when, then }) => {
    let session
    let restoreVisibility

    given('an active capture session', async () => {
      session = await createCaptureSession({ store: new CaptureStore('capture-visibility') })
      restoreVisibility = setVisibilityState('hidden')
    })
    when('the document becomes hidden', async () => {
      document.dispatchEvent(new Event('visibilitychange'))
      await session.flushChain
    })
    then('the capture session remains open', async () => {
      try {
        expect(session.endTime).toBeNull()
        expect(session.meta.endTime).toBeNull()
      } finally {
        restoreVisibility()
        await session.end()
        unregisterCaptureSession(session.id)
      }
    })
  })

  test('Stop records the capture end reason', ({ given, when, then }) => {
    let store
    let session
    let storedSession
    let sessionInfo

    given('an active capture session', async () => {
      store = new CaptureStore('capture-stop')
      session = await createCaptureSession({ store })
    })
    when('the capture session is stopped', async () => {
      await session.end()
      storedSession = await store.getSession(session.id)
      sessionInfo = (await DebugCapture.listSessions()).find(item => item.id === session.id)
    })
    then('the stored session and session list show a stop end reason', () => {
      try {
        expect(storedSession.endReason).toBe('stop')
        expect(sessionInfo.endReason).toBe('stop')
      } finally {
        unregisterCaptureSession(session.id)
      }
    })
  })

  test('Never-closed capture exports its last record time', ({ given, when, then }) => {
    let meta
    let records
    let millicast

    given('a capture session that was never closed', () => {
      meta = { id: 'never-closed', startTime: 100, endTime: null, endReason: null, sdkVersion: '1.0.0' }
      records = [{ time: 200, kind: 'event', connId: null, name: 'test', value: null }]
    })
    when('its capture export is built', () => {
      millicast = buildCapture(meta, records).webrtcDump.millicast
    })
    then('the export uses the last record time and not-closed end reason', () => {
      expect(millicast.endTime).toBe(200)
      expect(millicast.endReason).toBe('not-closed')
    })
  })

  test('Pagehide tail saves an in-flight chunk and buffered records', ({ given, when, then }) => {
    let store
    let session
    let appendStarted
    let startAppend
    let pendingChunk
    let tail

    given('a capture session with a pending chunk write', async () => {
      store = new CaptureStore('capture-tail-inflight')
      session = new CaptureSession({ store })
      await session.start()
      appendStarted = new Promise(resolve => { startAppend = resolve })
      jest.spyOn(store, 'appendChunk').mockImplementation(chunk => {
        pendingChunk = chunk
        startAppend()
        return new Promise(() => {})
      })
      jest.spyOn(store, 'putSession').mockImplementation(() => new Promise(() => {}))
    })
    when('pagehide fires while the chunk is in flight', async () => {
      session.recordEvent(null, 'inflight-event')
      session.flush().catch(() => {})
      await appendStarted
      dispatchPageEvent('pagehide', false)
      tail = JSON.parse(localStorage.getItem(`${CAPTURE_TAIL_KEY_PREFIX}${session.id}`))
    })
    then('the local tail contains both chunks and the pagehide end metadata', () => {
      try {
        expect(tail.meta.endReason).toBe('pagehide')
        expect(tail.meta.endTime).toEqual(expect.any(Number))
        expect(tail.chunks.map(chunk => chunk.seq)).toEqual([pendingChunk.seq, pendingChunk.seq + 1])
        expect(tail.chunks[0].records.some(record => record.name === 'inflight-event')).toBe(true)
        expect(tail.chunks[1].records.some(record => record.name === 'pagehide')).toBe(true)
      } finally {
        localStorage.removeItem(`${CAPTURE_TAIL_KEY_PREFIX}${session.id}`)
        clearInterval(session.timer)
        session.active = false
        session.cleanup.splice(0).forEach(remove => remove())
        store.db?.close()
      }
    })
  })

  test('Reload merges the pagehide tail into IndexedDB', ({ given, when, then }) => {
    let store
    let reloadedStore
    let session
    let storedSession
    let chunks
    let capture

    given('a capture session with a pagehide tail', async () => {
      store = new CaptureStore('capture-tail-reload')
      session = new CaptureSession({ store })
      await session.start()
      session.recordEvent(null, 'before-pagehide')
      await session.flush()
      jest.spyOn(store, 'appendChunk').mockImplementation(() => new Promise(() => {}))
      jest.spyOn(store, 'putSession').mockImplementation(() => new Promise(() => {}))
    })
    when('a new store merges the tail after reload', async () => {
      dispatchPageEvent('pagehide', false)
      reloadedStore = new CaptureStore('capture-tail-reload')
      await reloadedStore.mergeTails()
      storedSession = await reloadedStore.getSession(session.id)
      chunks = await reloadedStore.listChunks(session.id)
      capture = buildCapture(storedSession, chunks.flatMap(chunk => chunk.records))
    })
    then('the merged session and export contain the pagehide data', () => {
      try {
        const sequences = chunks.map(chunk => chunk.seq)
        expect(storedSession.endTime).toEqual(expect.any(Number))
        expect(storedSession.endReason).toBe('pagehide')
        expect(sequences).toEqual([1, 2])
        expect(new Set(sequences).size).toBe(sequences.length)
        expect(localStorage.getItem(`${CAPTURE_TAIL_KEY_PREFIX}${session.id}`)).toBeNull()
        expect(capture.webrtcDump.millicast.endReason).toBe('pagehide')
        expect(capture.webrtcDump.millicast.events.some(event => event.name === 'pagehide')).toBe(true)
      } finally {
        localStorage.removeItem(`${CAPTURE_TAIL_KEY_PREFIX}${session.id}`)
        clearInterval(session.timer)
        session.active = false
        session.cleanup.splice(0).forEach(remove => remove())
        store.db?.close()
        reloadedStore.db?.close()
      }
    })
  })

  test('Tail merge deduplicates sequences and retains failed writes', ({ given, when, then }) => {
    let store
    let chunks
    let failedKey
    let failedTailRetained

    given('a tail whose sequence already exists in IndexedDB', async () => {
      const sessionId = 'tail-deduplicate'
      const meta = { id: sessionId, startTime: 1, endTime: 10, endReason: 'pagehide', storageMode: 'indexeddb' }
      store = new CaptureStore('capture-tail-deduplicate')
      await store.open()
      await store.putSession({ ...meta, endTime: null, endReason: null })
      await store.appendChunk({
        sessionId,
        seq: 4,
        records: [{ time: 4, kind: 'event', connId: null, name: 'existing-sequence', value: null }]
      })
      localStorage.setItem(`${CAPTURE_TAIL_KEY_PREFIX}${sessionId}`, JSON.stringify({
        version: 1,
        meta,
        chunks: [
          { sessionId, seq: 4, records: [{ time: 5, kind: 'event', connId: null, name: 'duplicate-sequence', value: null }] },
          { sessionId, seq: 5, records: [{ time: 6, kind: 'event', connId: null, name: 'new-sequence', value: null }] }
        ]
      }))
    })
    when('the tail is merged more than once', async () => {
      await Promise.all([store.mergeTails(), store.mergeTails()])
      await store.mergeTails()
      chunks = await store.listChunks('tail-deduplicate')

      const failedSessionId = 'tail-write-failure'
      failedKey = `${CAPTURE_TAIL_KEY_PREFIX}${failedSessionId}`
      await store.putSession({ id: failedSessionId, startTime: 1, endTime: null, endReason: null })
      localStorage.setItem(failedKey, JSON.stringify({
        version: 1,
        meta: { id: failedSessionId, startTime: 1, endTime: 10, endReason: 'pagehide' },
        chunks: [{ sessionId: failedSessionId, seq: 1, records: [] }]
      }))
      jest.spyOn(store, 'appendChunk').mockRejectedValue(new Error('write failed'))
      await store.mergeTails()
      failedTailRetained = localStorage.getItem(failedKey) !== null
    })
    then('only one chunk per sequence remains and failed writes keep their key', () => {
      try {
        const sequences = chunks.map(chunk => chunk.seq)
        expect(sequences).toEqual([4, 5])
        expect(new Set(sequences).size).toBe(sequences.length)
        expect(chunks.flatMap(chunk => chunk.records).some(record => record.name === 'duplicate-sequence')).toBe(false)
        expect(localStorage.getItem(`${CAPTURE_TAIL_KEY_PREFIX}tail-deduplicate`)).toBeNull()
        expect(failedTailRetained).toBe(true)
      } finally {
        localStorage.removeItem(`${CAPTURE_TAIL_KEY_PREFIX}tail-deduplicate`)
        localStorage.removeItem(failedKey)
        store.db?.close()
      }
    })
  })

  test('Oversized tails omit stats but preserve events and metadata', ({ given, when, then }) => {
    let store
    let session
    let serialized
    let tail

    given('a capture session with a large stats record', async () => {
      store = new CaptureStore('capture-tail-size')
      session = new CaptureSession({ store })
      await session.start()
      session.recordEvent(null, 'preserved-event', { value: true })
      session.buffer.push({
        time: Date.now(),
        kind: 'stats',
        connId: 'pc-1',
        full: true,
        reports: { large: 'x'.repeat(TAIL_MAX_BYTES) }
      })
      jest.spyOn(store, 'appendChunk').mockImplementation(() => new Promise(() => {}))
      jest.spyOn(store, 'putSession').mockImplementation(() => new Promise(() => {}))
    })
    when('pagehide saves its tail', () => {
      dispatchPageEvent('pagehide', false)
      serialized = localStorage.getItem(`${CAPTURE_TAIL_KEY_PREFIX}${session.id}`)
      tail = JSON.parse(serialized)
    })
    then('stats are omitted and the tail remains under the size limit', () => {
      try {
        const records = tail.chunks.flatMap(chunk => chunk.records)
        expect(serialized.length).toBeLessThan(TAIL_MAX_BYTES)
        expect(records.some(record => record.kind === 'stats')).toBe(false)
        expect(records.find(record => record.name === 'tail-stats-omitted').value.count).toBe(1)
        expect(records.some(record => record.name === 'preserved-event')).toBe(true)
        expect(records.some(record => record.name === 'pagehide')).toBe(true)
        expect(tail.meta.endReason).toBe('pagehide')
      } finally {
        localStorage.removeItem(`${CAPTURE_TAIL_KEY_PREFIX}${session.id}`)
        clearInterval(session.timer)
        session.active = false
        session.cleanup.splice(0).forEach(remove => remove())
        store.db?.close()
      }
    })
  })

  test('Export orders chunks by sequence', ({ given, when, then }) => {
    let store
    let session
    let capture

    given('chunks were stored out of sequence order', async () => {
      store = new CaptureStore('capture-sequence-order')
      session = await createCaptureSession({ store })
      await store.appendChunk({
        sessionId: session.id,
        seq: 2,
        records: [{ time: 200, kind: 'event', connId: null, name: 'ordered-second', value: null }]
      })
      await store.appendChunk({
        sessionId: session.id,
        seq: 1,
        records: [{ time: 100, kind: 'event', connId: null, name: 'ordered-first', value: null }]
      })
      session.seq = 2
    })
    when('the capture export is built', async () => {
      capture = await DebugCapture.getCapture(session.id)
    })
    then('exported events follow chunk sequence order', async () => {
      try {
        const names = capture.webrtcDump.millicast.events
          .map(event => event.name)
          .filter(name => name.startsWith('ordered-'))
        expect(names).toEqual(['ordered-first', 'ordered-second'])
      } finally {
        await session.end()
        unregisterCaptureSession(session.id)
      }
    })
  })

  test('Current connection export excludes stale connection records', ({ given, when, then }) => {
    let session
    let capture

    given('a capture session with two connection attempts', async () => {
      session = await createSessionWithRecords('capture-current-connection', twoAttemptRecords())
    })
    when('the current connection export is built', async () => {
      capture = await DebugCapture.getCapture(session.id, { scope: 'connection' })
    })
    then('only the current connection data and stats are exported', async () => {
      try {
        expect(Object.keys(capture.webrtcDump.PeerConnections)).toEqual(['pc-2'])
        const httpUrls = capture.har.log.entries
          .filter(entry => entry.request.method === 'POST')
          .map(entry => entry.request.url)
        expect(httpUrls).toEqual(['https://director.test/subscribe/director-2'])
        const websocketUrls = capture.har.log.entries
          .filter(entry => entry._resourceType === 'websocket')
          .map(entry => entry.request.url)
        expect(websocketUrls).toEqual(['wss://signal.test/two'])
        expect(capture.webrtcDump.millicast.events.some(event => event.name === 'visibilitychange')).toBe(true)
        expect(capture.webrtcDump.millicast.events.some(event => event.name === 'ws-close')).toBe(false)
        expect(capture.streamViewId).toBe('B')
        expect(capture.connectionStartTime).toBe(2000)
        const stats = capture.webrtcDump.PeerConnections['pc-2'].stats['inbound-1-framesDecoded']
        expect(JSON.parse(stats.values)).toEqual([30, 31])
      } finally {
        await session.end()
        unregisterCaptureSession(session.id)
      }
    })
  })

  test('Single attempt connection export preserves the full session', ({ given, when, then }) => {
    let session
    let fullCapture
    let connectionCapture

    given('a capture session with one connection attempt', async () => {
      session = await createSessionWithRecords('capture-single-connection', [
        { time: 1000, kind: 'event', connId: null, name: 'connect-start', value: { migrate: false } },
        httpRecord(1100, 'director'),
        { time: 1200, kind: 'event', connId: 'pc-1', name: 'view-result', value: { streamViewId: 'A' } },
        { time: 1300, kind: 'event', connId: null, name: 'visibilitychange', value: { hidden: true } }
      ])
    })
    when('session and connection exports are built', async () => {
      fullCapture = await DebugCapture.getCapture(session.id)
      connectionCapture = await DebugCapture.getCapture(session.id, { scope: 'connection' })
    })
    then('both exports contain the same records', async () => {
      try {
        expect(connectionCapture.webrtcDump.PeerConnections).toEqual(fullCapture.webrtcDump.PeerConnections)
        expect(connectionCapture.webrtcDump.millicast.events).toEqual(fullCapture.webrtcDump.millicast.events)
        expect(connectionCapture.har.log.entries).toEqual(fullCapture.har.log.entries)
        expect(connectionCapture.connectionStartTime).toBe(fullCapture.connectionStartTime)
      } finally {
        await session.end()
        unregisterCaptureSession(session.id)
      }
    })
  })

  test('Failed current attempt has no stream view id', ({ given, when, then }) => {
    let session
    let capture
    let downloadCapture

    given('a capture session whose latest attempt failed', async () => {
      session = await createSessionWithRecords('capture-failed-current', [
        { time: 1000, kind: 'event', connId: null, name: 'connect-start', value: { migrate: false } },
        { time: 1100, kind: 'event', connId: 'pc-1', name: 'view-result', value: { streamViewId: 'A' } },
        { time: 2000, kind: 'event', connId: null, name: 'connect-start', value: { migrate: false } },
        { time: 2100, kind: 'event', connId: null, name: 'subscriber-data-error', value: { name: 'Error', message: 'failed' } }
      ])
    })
    when('the failed connection export is built and downloaded', async () => {
      capture = await DebugCapture.getCapture(session.id, { scope: 'connection' })
      downloadCapture = installDownloadCapture()
      jest.spyOn(Date, 'now').mockReturnValue(2200)
      await DebugCapture.download(session.id)
    })
    then('the export has no stream view id and the filenames use null', async () => {
      try {
        expect(capture.streamViewId).toBeNull()
        expect(downloadCapture.downloads).toHaveLength(2)
        expect(downloadCapture.downloads[0]).toContain('-null-start-')
        expect(downloadCapture.downloads[1]).toContain('-null-start-')
      } finally {
        await new Promise(resolve => setTimeout(resolve, 0))
        downloadCapture.restore()
        jest.spyOn(Date, 'now').mockRestore()
        await session.end()
        unregisterCaptureSession(session.id)
      }
    })
  })

  test('Download uses UTC current connection filenames', ({ given, when, then }) => {
    let session
    let downloadCapture
    const sessionStartTime = Date.UTC(2026, 9, 15, 0, 17, 45)
    const connectionStartTime = sessionStartTime + 5000
    const downloadTime = Date.UTC(2026, 9, 15, 0, 20, 10)

    given('a capture session with two connection attempts for download', async () => {
      session = await createSessionWithRecords('capture-download-names', [
        { time: sessionStartTime, kind: 'event', connId: null, name: 'connect-start', value: { migrate: false } },
        { time: sessionStartTime + 1000, kind: 'event', connId: 'pc-1', name: 'view-result', value: { streamViewId: 'old' } },
        { time: connectionStartTime, kind: 'event', connId: null, name: 'connect-start', value: { migrate: false } },
        { time: connectionStartTime + 1000, kind: 'event', connId: 'pc-2', name: 'view-result', value: { streamViewId: 'view/2' } }
      ], { startTime: sessionStartTime, streamName: 'stream name', accountId: 'acct/1' })
    })
    when('client stats are downloaded at fixed UTC times', async () => {
      downloadCapture = installDownloadCapture()
      jest.spyOn(Date, 'now').mockReturnValue(downloadTime)
      await DebugCapture.download(session.id)
    })
    then('the downloads identify the current connection with exact UTC names', async () => {
      try {
        expect(downloadCapture.downloads).toEqual([
          'client-stats-acct-1-stream-name-view-2-start-20261015-001750Z-download-20261015-002010Z-webrtc-dump.json',
          'client-stats-acct-1-stream-name-view-2-start-20261015-001750Z-download-20261015-002010Z-network.har'
        ])
      } finally {
        await new Promise(resolve => setTimeout(resolve, 0))
        downloadCapture.restore()
        jest.spyOn(Date, 'now').mockRestore()
        await session.end()
        unregisterCaptureSession(session.id)
      }
    })
  })

  test('Download revokes blob URLs after a delay', ({ given, when, then }) => {
    let session
    let downloadCapture

    given('a capture session for delayed URL revocation', async () => {
      session = await createSessionWithRecords('capture-download-revoke', [
        { time: 1000, kind: 'event', connId: null, name: 'connect-start', value: { migrate: false } },
        { time: 1100, kind: 'event', connId: 'pc-1', name: 'view-result', value: { streamViewId: 'view-1' } }
      ], { startTime: 1000, streamName: 'stream name', accountId: 'acct/1' })
    })
    when('client stats are downloaded with fake timers', async () => {
      downloadCapture = installDownloadCapture()
      jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate', 'queueMicrotask', 'performance'] })
      await DebugCapture.download(session.id)
    })
    then('both blob URLs remain available until the delay expires', async () => {
      try {
        expect(downloadCapture.downloads).toHaveLength(2)
        expect(downloadCapture.revoked).toEqual([])
        jest.advanceTimersByTime(59999)
        expect(downloadCapture.revoked).toEqual([])
        jest.advanceTimersByTime(1)
        expect(downloadCapture.revoked).toHaveLength(2)
      } finally {
        jest.useRealTimers()
        downloadCapture.restore()
        await session.end()
        unregisterCaptureSession(session.id)
      }
    })
  })

  test('Failed Director request keeps the configured capture identity', ({ given, when, then }) => {
    let view
    let session
    let downloadCapture

    given('a viewer with capture identity and a failed Director request', () => {
      view = new View(undefined, () => Promise.reject(new Error('Director request failed')))
    })
    when('it connects and downloads client stats', async () => {
      await expect(view.connect({
        debugCapture: { enabled: true, accountId: 'acc', streamName: 'a/b' }
      })).rejects.toThrow('Director request failed')
      session = view.debugCaptureSession
      downloadCapture = installDownloadCapture()
      await DebugCapture.download(session.id)
    })
    then('the filenames use the caller identity and null view id', async () => {
      try {
        expect(session.meta.accountId).toBe('acc')
        expect(session.meta.streamName).toBe('a/b')
        expect(downloadCapture.downloads).toHaveLength(2)
        expect(downloadCapture.downloads.every(name => name.startsWith('client-stats-acc-a-b-null-start-'))).toBe(true)
      } finally {
        await new Promise(resolve => setTimeout(resolve, 0))
        downloadCapture?.restore()
        await session?.end()
        view.stop()
        if (session) unregisterCaptureSession(session.id)
      }
    })
  })

  test('Download excludes records after its cutoff', ({ given, when, then }) => {
    let session
    let downloadCapture
    let downloaded
    let fullCapture
    const downloadTime = Date.now() + 10000

    given('a capture session with records before and after download time', async () => {
      session = await createSessionWithRecords('capture-download-cutoff', [
        { time: downloadTime - 1000, kind: 'event', connId: null, name: 'connect-start', value: null },
        statsRecord(downloadTime - 500, 'pc-1', 10, true),
        statsRecord(downloadTime + 100, 'pc-1', 20),
        { time: downloadTime + 200, kind: 'event', connId: null, name: 'after-download', value: null }
      ], { startTime: downloadTime - 1000 })
    })
    when('client stats are downloaded at the cutoff', async () => {
      downloadCapture = installDownloadCapture()
      jest.spyOn(Date, 'now').mockReturnValue(downloadTime)
      await DebugCapture.download(session.id)
      downloaded = await readJsonBlob(downloadCapture.blobs[0])
      fullCapture = await DebugCapture.getCapture(session.id)
    })
    then('the download omits later records and retains valid stats', async () => {
      try {
        expect(downloaded.millicast.events.some(event => event.name === 'after-download')).toBe(false)
        const downloadedStats = downloaded.PeerConnections['pc-1'].stats['inbound-1-framesDecoded']
        expect(JSON.parse(downloadedStats.values)).toEqual([10])
        expect(fullCapture.webrtcDump.millicast.events.some(event => event.name === 'after-download')).toBe(true)
        const fullStats = fullCapture.webrtcDump.PeerConnections['pc-1'].stats['inbound-1-framesDecoded']
        expect(JSON.parse(fullStats.values)).toEqual([10, 20])
      } finally {
        await new Promise(resolve => setTimeout(resolve, 0))
        downloadCapture?.restore()
        jest.spyOn(Date, 'now').mockRestore()
        await session.end()
        unregisterCaptureSession(session.id)
      }
    })
  })

  test('Get capture defaults to the full session', ({ given, when, then }) => {
    let session
    let fullCapture
    let connectionCapture

    given('a capture session with two connection attempts for the API', async () => {
      session = await createSessionWithRecords('capture-api-scope', twoAttemptRecords())
    })
    when('the default and connection captures are built', async () => {
      fullCapture = await DebugCapture.getCapture(session.id)
      connectionCapture = await DebugCapture.getCapture(session.id, { scope: 'connection' })
    })
    then('the default capture contains both connections', async () => {
      try {
        expect(Object.keys(fullCapture.webrtcDump.PeerConnections)).toEqual(['pc-1', 'pc-2'])
        expect(fullCapture.webrtcDump.millicast.scope).toBe('session')
        expect(connectionCapture.webrtcDump.millicast.scope).toBe('connection')
      } finally {
        await session.end()
        unregisterCaptureSession(session.id)
      }
    })
  })

  test('Signaling capture records the view result', ({ given, when, then }) => {
    let signaling
    let recordEvent
    let originalReceiver

    given('a signaling instance with debug capture enabled', () => {
      const ActualSignaling = jest.requireActual('../../src/Signaling').default
      signaling = new ActualSignaling({ streamName: 'stream', url: 'wss://signal.test' })
      signaling.connect = jest.fn().mockResolvedValue()
      signaling.transactionManager = {
        cmd: jest.fn().mockResolvedValue({
          sdp: 'v=0',
          streamViewId: 'view-1',
          subscriberId: 'subscriber-1',
          clusterId: 'cluster-1'
        })
      }
      recordEvent = jest.fn()
      signaling.debugCapture = { session: { recordEvent }, connId: 'pc-1' }
      originalReceiver = global.RTCRtpReceiver
      global.RTCRtpReceiver = { getCapabilities: () => ({ codecs: [] }) }
    })
    when('it receives a view result', async () => {
      await signaling.subscribe('v=0', {})
    })
    then('the view result is recorded for the connection', () => {
      try {
        expect(recordEvent).toHaveBeenCalledWith('pc-1', 'view-result', {
          streamViewId: 'view-1',
          subscriberId: 'subscriber-1',
          clusterId: 'cluster-1'
        })
      } finally {
        if (originalReceiver) global.RTCRtpReceiver = originalReceiver
        else delete global.RTCRtpReceiver
      }
    })
  })

  test('WebRTC dump includes user agent brands', ({ given, when, then }) => {
    let sourceBrands
    let dump
    let restoreUserAgentData
    const meta = { id: 'ua-data-session', startTime: 1000, userAgent: 'Test browser', sdkVersion: '1.0.0', storageMode: 'memory' }

    given('navigator user agent data with browser brands', () => {
      sourceBrands = [
        { brand: 'Chromium', version: '124' },
        { brand: 'Not(A:Brand)', version: '99' }
      ]
      restoreUserAgentData = setNavigatorUserAgentData({ brands: sourceBrands })
    })
    when('the WebRTC dump is built', () => {
      try {
        dump = buildCapture(meta, []).webrtcDump
      } finally {
        restoreUserAgentData?.()
        restoreUserAgentData = null
      }
    })
    then('it contains plain copies of the brand data', () => {
      expect(dump.UserAgentData).toEqual(sourceBrands)
      expect(dump.UserAgentData).not.toBe(sourceBrands)
      sourceBrands.forEach((brand, index) => {
        expect(dump.UserAgentData[index]).not.toBe(brand)
        expect(Object.getPrototypeOf(dump.UserAgentData[index])).toBe(Object.prototype)
      })
    })
  })

  test('WebRTC dump has empty user agent data when unavailable', ({ given, when, then }) => {
    let dump
    let restoreUserAgentData
    const meta = { id: 'ua-data-missing-session', startTime: 1000, userAgent: 'Test browser', sdkVersion: '1.0.0', storageMode: 'memory' }

    given('navigator user agent data is unavailable', () => {
      restoreUserAgentData = setNavigatorUserAgentData(undefined)
    })
    when('the WebRTC dump is built', () => {
      try {
        dump = buildCapture(meta, []).webrtcDump
      } finally {
        restoreUserAgentData?.()
        restoreUserAgentData = null
      }
    })
    then('UserAgentData is an empty array', () => {
      expect(dump.UserAgentData).toEqual([])
    })
  })
})
