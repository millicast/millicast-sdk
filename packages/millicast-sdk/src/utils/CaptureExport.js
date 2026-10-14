import { redactUrl } from './Redact'

const jsonValue = value => typeof value === 'string' ? value : JSON.stringify(value ?? null)
const iso = time => new Date(time).toISOString()

export const buildWebrtcDump = (meta, records) => {
  const connections = new Map()
  const sessionEvents = []
  for (const record of records) {
    if (record.kind === 'event' && record.connId === null) {
      sessionEvents.push(record)
    }
    if (record.connId && !connections.has(record.connId)) {
      connections.set(record.connId, { events: [], reports: {}, statTypes: {}, stats: {} })
    }
    if (record.connId && record.kind === 'event') {
      connections.get(record.connId).events.push(record)
    }
    if (record.connId && record.kind === 'stats') {
      const state = connections.get(record.connId)
      if (record.full) state.reports = { ...(record.reports || {}) }
      else {
        for (const id of record.removed || []) delete state.reports[id]
        Object.assign(state.reports, record.added || {})
        for (const [id, fields] of Object.entries(record.changed || {})) {
          state.reports[id] = { ...(state.reports[id] || {}), ...fields }
        }
      }
      for (const [id, stat] of Object.entries(state.reports)) {
        if (!Object.prototype.hasOwnProperty.call(state.statTypes, id)) {
          state.statTypes[id] = stat.type || ''
        }
        for (const [field, value] of Object.entries(stat)) {
          if (['id', 'type', 'timestamp'].includes(field)) continue
          if (!['number', 'string', 'boolean'].includes(typeof value) && !(value && typeof value === 'object')) continue
          const key = `${id}-${field}`
          let series = state.stats[key]
          if (!series) {
            series = state.stats[key] = {
              startTime: iso(record.time),
              endTime: iso(record.time),
              statsType: state.statTypes[id],
              values: []
            }
          }
          series.endTime = iso(record.time)
          series.values.push(typeof value === 'object' ? JSON.stringify(value) : value)
        }
        if (stat.timestamp !== undefined) {
          const key = `${id}-timestamp`
          let series = state.stats[key]
          if (!series) {
            series = state.stats[key] = {
              startTime: iso(record.time),
              endTime: iso(record.time),
              statsType: state.statTypes[id],
              values: []
            }
          }
          series.endTime = iso(record.time)
          series.values.push(stat.timestamp)
        }
      }
    }
  }

  const PeerConnections = {}
  let lid = 1
  for (const [connId, state] of connections) {
    const updateLog = state.events.map(record => ({
      time: iso(record.time),
      timestamp: record.time,
      type: record.name,
      value: jsonValue(record.value)
    }))
    for (const record of sessionEvents) {
      if (['pagehide', 'pageshow', 'online', 'offline', 'visibilitychange', 'freeze', 'resume', 'stats-gap'].includes(record.name)) {
        updateLog.push({ time: iso(record.time), timestamp: record.time, type: record.name, value: jsonValue(record.value) })
      }
    }
    updateLog.sort((a, b) => a.timestamp - b.timestamp)
    const stats = Object.fromEntries(Object.entries(state.stats).map(([key, series]) => [
      key,
      { ...series, values: JSON.stringify(series.values) }
    ]))
    const config = state.events.find(record => record.name === 'rtcConfiguration')?.value || {}
    PeerConnections[connId] = {
      pid: 0,
      lid: lid++,
      url: redactUrl(meta.pageUrl || ''),
      rtcConfiguration: JSON.stringify(config),
      constraints: '',
      updateLog,
      stats
    }
  }

  const endTime = meta.endTime || records.reduce((latest, record) => Math.max(latest, record.time || 0), meta.startTime)
  return {
    getUserMedia: [],
    PeerConnections,
    UserAgent: meta.userAgent,
    millicast: {
      sessionId: meta.id,
      sdkVersion: meta.sdkVersion,
      streamName: meta.streamName,
      accountId: meta.accountId,
      startTime: meta.startTime,
      endTime,
      endReason: meta.endReason || 'not-closed',
      storageMode: meta.storageMode,
      events: sessionEvents.map(record => ({ time: iso(record.time), name: record.name, value: record.value }))
    }
  }
}

const headers = values => Object.entries(values || {}).map(([name, value]) => ({ name, value: String(value) }))
const harHttp = record => {
  const { request = {}, response = {}, startedDateTime, time = 0, error } = record.entry || {}
  return {
    startedDateTime: startedDateTime || iso(record.time),
    time,
    request: {
      method: request.method || 'GET',
      url: redactUrl(request.url || ''),
      httpVersion: 'HTTP/1.1',
      headers: headers(request.headers),
      queryString: [],
      cookies: [],
      headersSize: -1,
      bodySize: request.postData?.length ?? -1,
      ...(request.postData !== undefined ? { postData: { mimeType: request.mimeType || 'application/json', text: request.postData } } : {})
    },
    response: {
      status: response.status || 0,
      statusText: response.statusText || '',
      httpVersion: 'HTTP/1.1',
      headers: headers(response.headers),
      cookies: [],
      content: { size: response.body?.length ?? 0, mimeType: response.mimeType || 'application/json', text: response.body || '' },
      redirectURL: '',
      headersSize: -1,
      bodySize: response.body?.length ?? -1
    },
    cache: {},
    timings: { send: 0, wait: time, receive: 0 },
    ...(error ? { comment: error } : {})
  }
}

const resourceEntry = record => {
  const entry = record.entry || {}
  const duration = entry.duration || 0
  const phase = (start, end) => end > start ? end - start : -1
  return {
    startedDateTime: iso(record.time - duration),
    time: duration,
    request: { method: 'GET', url: redactUrl(entry.name || ''), httpVersion: '', headers: [], queryString: [], cookies: [], headersSize: -1, bodySize: -1 },
    response: { status: entry.responseStatus || 0, statusText: '', httpVersion: '', headers: [], cookies: [], content: { size: entry.transferSize || 0, mimeType: '', text: '' }, redirectURL: '', headersSize: -1, bodySize: entry.encodedBodySize || -1 },
    cache: {},
    timings: {
      blocked: -1,
      dns: phase(entry.domainLookupStart, entry.domainLookupEnd),
      connect: phase(entry.connectStart, entry.connectEnd),
      ssl: entry.secureConnectionStart > 0 ? phase(entry.secureConnectionStart, entry.connectEnd) : -1,
      send: -1,
      wait: phase(entry.requestStart, entry.responseStart),
      receive: phase(entry.responseStart, entry.responseEnd)
    },
    _resourceType: entry.initiatorType || '',
    comment: 'from Resource Timing API (no headers/body)'
  }
}

export const buildHar = (meta, records) => {
  const entries = []
  const websockets = new Map()
  for (const record of records) {
    if (record.kind === 'http') entries.push(harHttp(record))
    if (record.kind === 'resource') entries.push(resourceEntry(record))
    if (record.kind === 'event' && record.name === 'ws-created') {
      websockets.set(record.connId, {
        startedDateTime: iso(record.time),
        time: 0,
        request: { method: 'GET', url: redactUrl(record.value?.url || ''), httpVersion: 'HTTP/1.1', headers: [], queryString: [], cookies: [], headersSize: -1, bodySize: 0 },
        response: { status: 101, statusText: 'Switching Protocols', httpVersion: 'HTTP/1.1', headers: [], cookies: [], content: { size: 0, mimeType: '', text: '' }, redirectURL: '', headersSize: -1, bodySize: 0 },
        cache: {},
        timings: { send: 0, wait: 0, receive: 0 },
        _resourceType: 'websocket',
        _webSocketMessages: []
      })
    }
    if (record.kind === 'ws') {
      let ws = websockets.get(record.connId)
      if (!ws) {
        ws = { startedDateTime: iso(record.time), time: 0, request: { method: 'GET', url: '', headers: [] }, response: { status: 101 }, timings: {}, _resourceType: 'websocket', _webSocketMessages: [] }
        websockets.set(record.connId, ws)
      }
      ws._webSocketMessages.push({ type: record.dir, time: record.time / 1000, opcode: 1, data: record.data })
    }
  }
  entries.push(...websockets.values())
  entries.sort((a, b) => new Date(a.startedDateTime).getTime() - new Date(b.startedDateTime).getTime())
  const pageUrl = redactUrl(meta.pageUrl || '')
  return {
    log: {
      version: '1.2',
      creator: { name: '@millicast/sdk DebugCapture', version: meta.sdkVersion },
      browser: { name: meta.userAgent },
      pages: [{ startedDateTime: iso(meta.startTime), id: 'page_1', title: pageUrl, pageTimings: {} }],
      entries
    }
  }
}

export const buildCapture = (meta, records) => ({
  sessionId: meta.id,
  webrtcDump: buildWebrtcDump(meta, records),
  har: buildHar(meta, records)
})
