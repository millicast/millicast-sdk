// EventEmitter.ts
interface EventMap {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

export class MillicastEventEmitter<T extends EventMap = object> {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  private events: { [K in keyof T]: Array<(payload: T[K]) => void> } = {} as any

  on<K extends keyof T> (eventName: K, listener: (payload: T[K]) => void): this {
    if (!this.events[eventName]) {
      this.events[eventName] = []
    }
    this.events[eventName].push(listener)
    return this
  }

  off<K extends keyof T> (eventName: K, listener: (payload: T[K]) => void): this {
    const listeners = this.events[eventName]
    if (listeners) {
      const idx = listeners.indexOf(listener)
      if (idx >= 0) {
        listeners.splice(idx, 1)
      }
    }
    return this
  }

  emit<K extends keyof T> (eventName: K, payload: T[K]): boolean {
    if (this.events[eventName]) {
      this.events[eventName].forEach(listener => listener(payload))
      return true
    }
    return false
  }
}
