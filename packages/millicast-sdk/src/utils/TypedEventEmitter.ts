import EventEmitter from 'events'

/* eslint-disable @typescript-eslint/no-explicit-any */
export type EmittedEvents = Record<string | symbol, (...args: any) => any>;

export interface TypedEventEmitter<TEvents extends EmittedEvents> {
  /**
   * Adds the `listener` function to the end of the listeners array for the
   * event named `eventName`. No checks are made to see if the `listener` has
   * already been added. Multiple calls passing the same combination of `eventName`and `listener` will result in the `listener` being added, and called, multiple
   * times.
   *
   * Returns a reference to the `EventEmitter`, so that calls can be chained.
   * @param eventName The name of the event.
   * @param listener The callback function.
   */
  on<N extends keyof TEvents>(eventName: N, listener: TEvents[N]): this;

  /** @hidden */
  emit<N extends keyof TEvents>(eventName: N, ...args: Parameters<TEvents[N]>): boolean;
}

/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
/* eslint-disable @typescript-eslint/no-unused-vars */
export class TypedEventEmitter<TEvents extends EmittedEvents> extends EventEmitter {};
