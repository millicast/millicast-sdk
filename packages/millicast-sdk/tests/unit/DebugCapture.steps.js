import 'fake-indexeddb/auto'
import { loadFeature, defineFeature } from 'jest-cucumber'
import DebugCapture, { createCaptureSession, setCurrentHttpCapture, unregisterCaptureSession } from '../../src/DebugCapture'
import CaptureSession from '../../src/utils/CaptureSession'
import CaptureStore from '../../src/utils/CaptureStore'
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

defineFeature(feature, test => {
  beforeEach(async () => {
    jest.useRealTimers()
    jest.restoreAllMocks()
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

      jest.spyOn(global, 'fetch').mockResolvedValue({
        text: async () => JSON.stringify({ status: 'success', data: { urls: ['wss://signal.example.test'], jwt: 'director-jwt' } }),
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
      expect(capture.har.log.entries.some(entry => entry.request.url.includes('director'))).toBe(true)
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
})
