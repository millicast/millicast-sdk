import { redactUrl } from './Redact'

const jsonValue = value => typeof value === 'string' ? value : JSON.stringify(value ?? null)
const iso = time => new Date(time).toISOString()
const statValues = (samples, statId, field) => {
  const values = []
  const times = []
  for (const sample of samples) {
    const stat = sample.reports[statId]
    if (!stat || !(field in stat)) continue
    const value = stat[field]
    if (['number', 'string', 'boolean'].includes(typeof value) || (value && typeof value === 'object')) {
      values.push(typeof value === 'object' ? JSON.stringify(value) : value)
      times.push(sample.time)
    }
  }
  return { values, times }
}

export const buildWebrtcDump = (meta, records) => {
  const connections = new Map()
  const sessionEvents = []
  for (const record of records) {
    if (record.kind === 'event' && record.connId === null) {
      sessionEvents.push(record)
    }
    if (record.connId && !connections.has(record.connId)) {
      connections.set(record.connId, { events: [], samples: [] })
    }
    if (record.connId && record.kind === 'event') connections.get(record.connId).events.push(record)
    if (record.connId && record.kind === 'stats') {
      const state = connections.get(record.connId)
      let reports = state.samples.length ? { ...state.samples[state.samples.length - 1].reports } : {}
      if (record.full) reports = record.reports || {}
      else {
        for (const id of record.removed || []) delete reports[id]
        Object.assign(reports, record.added || {})
        for (const [id, fields] of Object.entries(record.changed || {})) {
          reports[id] = { ...(reports[id] || {}), ...fields }
        }
      }
      state.samples.push({ time: record.time, reports })
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
    const stats = {}
    const ids = new Set(state.samples.flatMap(sample => Object.keys(sample.reports)))
    for (const id of ids) {
      const fields = new Set()
      for (const sample of state.samples) {
        for (const field of Object.keys(sample.reports[id] || {})) {
          if (!['id', 'type', 'timestamp'].includes(field)) fields.add(field)
        }
      }
      for (const field of fields) {
        const { values, times } = statValues(state.samples, id, field)
        if (!values.length) continue
        stats[`${id}-${field}`] = {
          startTime: iso(times[0]),
          endTime: iso(times[times.length - 1]),
          statsType: state.samples.find(sample => sample.reports[id])?.reports[id]?.type || '',
          values: JSON.stringify(values)
        }
      }
      const timestamps = state.samples.flatMap(sample => sample.reports[id]?.timestamp === undefined ? [] : [sample.reports[id].timestamp])
      if (timestamps.length) {
        const times = state.samples.filter(sample => sample.reports[id]?.timestamp !== undefined).map(sample => sample.time)
        stats[`${id}-timestamp`] = {
          startTime: iso(times[0]),
          endTime: iso(times[times.length - 1]),
          statsType: state.samples.find(sample => sample.reports[id])?.reports[id]?.type || '',
          values: JSON.stringify(timestamps)
        }
      }
    }
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
