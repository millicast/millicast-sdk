// EventEmitter.ts
type EventMap = Record<string, unknown>;

export class MillicastEventEmitter<T extends EventMap = Record<string, unknown>> {
  private events: Partial<{ [K in keyof T]: ((payload: T[K]) => void)[] }> = {}

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
