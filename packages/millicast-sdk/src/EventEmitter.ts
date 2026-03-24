// EventEmitter.ts
import { EventEmitter } from 'events';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EventMap = Record<string, any>;

// Strip on/off/emit from the constructor's instance type so we can redeclare them with strict generics.
// At runtime this IS EventEmitter — the cast only affects TypeScript's view.
type StrictBase = Omit<EventEmitter, 'on' | 'off' | 'emit'>;
const TypedEventEmitter: new () => StrictBase = EventEmitter as unknown as new () => StrictBase;

export class MillicastEventEmitter<T extends EventMap = EventMap> extends TypedEventEmitter {
  on<K extends keyof T> (eventName: K, listener: (payload: T[K]) => void): this {
    EventEmitter.prototype.on.call(this, eventName as string, listener);
    return this;
  }

  off<K extends keyof T> (eventName: K, listener: (payload: T[K]) => void): this {
    EventEmitter.prototype.off.call(this, eventName as string, listener);
    return this;
  }

  emit<K extends keyof T> (eventName: K, ...args: undefined extends T[K] ? [payload?: T[K]] : [payload: T[K]]): boolean {
    return EventEmitter.prototype.emit.call(this, eventName as string, ...args);
  }
}
