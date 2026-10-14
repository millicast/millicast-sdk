const DB_OPEN_TIMEOUT_MS = 3000
const toPlain = value => JSON.parse(JSON.stringify(value))
const toPlainRecord = record => {
  try {
    return toPlain(record)
  } catch (error) {
    const read = key => {
      try {
        return toPlain(record?.[key]) ?? null
      } catch {
        return null
      }
    }
    let message
    try {
      message = String(error?.message ?? error)
    } catch {
      message = 'serialization failed'
    }
    return {
      time: read('time'),
      kind: read('kind'),
      connId: read('connId'),
      name: read('name'),
      value: `[unserializable: ${message}]`
    }
  }
}

export default class CaptureStore {
  constructor (name = 'millicast-debug-capture', version = 1) {
    this.name = name
    this.version = version
    this.db = null
    this.mode = 'indexeddb'
    this.sessions = new Map()
    this.chunks = new Map()
    this.nextChunkId = 1
  }

  async open () {
    if (this.db || this.mode === 'memory') return this
    if (!globalThis.indexedDB) {
      this.mode = 'memory'
      return this
    }
    try {
      this.db = await new Promise((resolve, reject) => {
        const request = indexedDB.open(this.name, this.version)
        let settled = false
        const timeout = setTimeout(() => {
          settled = true
          reject(new Error('IndexedDB open timed out'))
        }, DB_OPEN_TIMEOUT_MS)
        request.onupgradeneeded = () => {
          const db = request.result
          if (!db.objectStoreNames.contains('sessions')) {
            db.createObjectStore('sessions', { keyPath: 'id' })
          }
          if (!db.objectStoreNames.contains('chunks')) {
            const chunks = db.createObjectStore('chunks', { keyPath: 'key', autoIncrement: true })
            chunks.createIndex('sessionId', 'sessionId', { unique: false })
          }
        }
        request.onsuccess = () => {
          if (settled) {
            request.result.close()
            return
          }
          settled = true
          clearTimeout(timeout)
          resolve(request.result)
        }
        request.onerror = () => {
          if (settled) return
          settled = true
          clearTimeout(timeout)
          reject(request.error || new Error('IndexedDB open failed'))
        }
        request.onblocked = () => {
          if (settled) return
          settled = true
          clearTimeout(timeout)
          reject(new Error('IndexedDB open blocked'))
        }
      })
    } catch {
      this.mode = 'memory'
      this.db = null
    }
    return this
  }

  async getSession (id) {
    await this.open()
    if (this.mode === 'memory') return this.sessions.get(id) || null
    return this._request('sessions', 'readonly', store => store.get(id))
  }

  async putSession (session) {
    await this.open()
    const plainSession = toPlain(session)
    if (this.mode === 'memory') {
      this.sessions.set(plainSession.id, plainSession)
      return
    }
    await this._request('sessions', 'readwrite', store => store.put(plainSession))
  }

  async listSessions () {
    await this.open()
    if (this.mode === 'memory') return [...this.sessions.values()]
    return this._request('sessions', 'readonly', store => store.getAll())
  }

  async appendChunk (chunk) {
    await this.open()
    const { records, ...fields } = chunk
    const plainChunk = { ...toPlain(fields), records: records.map(toPlainRecord) }
    if (this.mode === 'memory') {
      const key = this.nextChunkId++
      this.chunks.set(key, { ...plainChunk, key })
      return
    }
    await this._request('chunks', 'readwrite', store => store.add(plainChunk))
  }

  async listChunks (sessionId) {
    await this.open()
    if (this.mode === 'memory') {
      return [...this.chunks.values()].filter(chunk => chunk.sessionId === sessionId).sort((a, b) => a.seq - b.seq)
    }
    const rows = await this._request('chunks', 'readonly', store => store.index('sessionId').getAll(sessionId))
    return rows.sort((a, b) => a.seq - b.seq)
  }

  async deleteSession (id) {
    await this.open()
    if (this.mode === 'memory') {
      this.sessions.delete(id)
      for (const [key, chunk] of this.chunks) {
        if (chunk.sessionId === id) this.chunks.delete(key)
      }
      return
    }
    await new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['sessions', 'chunks'], 'readwrite')
      transaction.objectStore('sessions').delete(id)
      const request = transaction.objectStore('chunks').index('sessionId').openCursor(IDBKeyRange.only(id))
      request.onsuccess = () => {
        const cursor = request.result
        if (cursor) {
          cursor.delete()
          cursor.continue()
        }
      }
      transaction.oncomplete = resolve
      transaction.onerror = () => reject(transaction.error)
      transaction.onabort = () => reject(transaction.error || new Error('IndexedDB transaction aborted'))
    })
  }

  async clear () {
    await this.open()
    if (this.mode === 'memory') {
      this.sessions.clear()
      this.chunks.clear()
      this.nextChunkId = 1
      return
    }
    await new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['sessions', 'chunks'], 'readwrite')
      transaction.objectStore('sessions').clear()
      transaction.objectStore('chunks').clear()
      transaction.oncomplete = resolve
      transaction.onerror = () => reject(transaction.error)
      transaction.onabort = () => reject(transaction.error || new Error('IndexedDB transaction aborted'))
    })
  }

  async _request (storeName, mode, requestFactory) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, mode)
      const request = requestFactory(transaction.objectStore(storeName))
      let result
      request.onsuccess = () => { result = request.result }
      request.onerror = () => reject(request.error || transaction.error)
      transaction.oncomplete = () => resolve(result)
      transaction.onerror = () => reject(transaction.error || new Error('IndexedDB transaction failed'))
      transaction.onabort = () => reject(transaction.error || new Error('IndexedDB transaction aborted'))
    })
  }
}
