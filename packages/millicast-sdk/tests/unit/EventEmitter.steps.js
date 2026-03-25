import { loadFeature, defineFeature } from 'jest-cucumber'
import { MillicastEventEmitter } from '../../src/EventEmitter'

const feature = loadFeature('../features/EventEmitter.feature', { loadRelativePath: true, errors: true })

jest.setTimeout(30000)

defineFeature(feature, (test) => {
  test('Register event listener with on()', ({ given, when, then }) => {
    let emitter
    let listener

    given('an instance of EventEmitter', () => {
      emitter = new MillicastEventEmitter()
    })

    when('I register a listener for "test" event', () => {
      listener = jest.fn()
      emitter.on('test', listener)
    })

    then('the listener should be registered', () => {
      // Verify by emitting and checking if listener is called
      emitter.emit('test', { data: 'test' })
      expect(listener).toHaveBeenCalledWith({ data: 'test' })
    })
  })

  test('Emit event to registered listeners', ({ given, and, when, then }) => {
    let emitter
    let listener
    let receivedPayload

    given('an instance of EventEmitter', () => {
      emitter = new MillicastEventEmitter()
    })

    and('I register a listener for "data" event', () => {
      listener = jest.fn((payload) => {
        receivedPayload = payload
      })
      emitter.on('data', listener)
    })

    when('I emit "data" event with payload', () => {
      emitter.emit('data', { message: 'hello', count: 42 })
    })

    then('the listener should receive the payload', () => {
      expect(listener).toHaveBeenCalledTimes(1)
      expect(receivedPayload).toEqual({ message: 'hello', count: 42 })
    })
  })

  test('Multiple listeners for same event', ({ given, and, when, then }) => {
    let emitter
    let listener1
    let listener2

    given('an instance of EventEmitter', () => {
      emitter = new MillicastEventEmitter()
    })

    and('I register two listeners for "message" event', () => {
      listener1 = jest.fn()
      listener2 = jest.fn()
      emitter.on('message', listener1)
      emitter.on('message', listener2)
    })

    when('I emit "message" event', () => {
      emitter.emit('message', 'test-message')
    })

    then('both listeners should be called', () => {
      expect(listener1).toHaveBeenCalledWith('test-message')
      expect(listener2).toHaveBeenCalledWith('test-message')
    })
  })

  test('Remove event listener with off()', ({ given, and, when, then }) => {
    let emitter
    let listener

    given('an instance of EventEmitter', () => {
      emitter = new MillicastEventEmitter()
    })

    and('I register a listener for "remove" event', () => {
      listener = jest.fn()
      emitter.on('remove', listener)
    })

    when('I remove the listener', () => {
      emitter.off('remove', listener)
    })

    and('I emit "remove" event', () => {
      emitter.emit('remove', 'data')
    })

    then('the listener should not be called', () => {
      expect(listener).not.toHaveBeenCalled()
    })
  })

  test('Emit returns false when no listeners', ({ given, when, then }) => {
    let emitter
    let result

    given('an instance of EventEmitter', () => {
      emitter = new MillicastEventEmitter()
    })

    when('I emit "unknown" event', () => {
      result = emitter.emit('unknown', 'data')
    })

    then('emit should return false', () => {
      expect(result).toBe(false)
    })
  })

  test('Emit returns true when listeners exist', ({ given, and, when, then }) => {
    let emitter
    let result

    given('an instance of EventEmitter', () => {
      emitter = new MillicastEventEmitter()
    })

    and('I register a listener for "exists" event', () => {
      emitter.on('exists', jest.fn())
    })

    when('I emit "exists" event', () => {
      result = emitter.emit('exists', 'data')
    })

    then('emit should return true', () => {
      expect(result).toBe(true)
    })
  })

  test('Chaining on() calls', ({ given, when, then }) => {
    let emitter
    let listener1
    let listener2
    let listener3

    given('an instance of EventEmitter', () => {
      emitter = new MillicastEventEmitter()
    })

    when('I chain multiple on() calls', () => {
      listener1 = jest.fn()
      listener2 = jest.fn()
      listener3 = jest.fn()
      emitter
        .on('event1', listener1)
        .on('event2', listener2)
        .on('event3', listener3)
    })

    then('all listeners should be registered', () => {
      emitter.emit('event1', 'data1')
      emitter.emit('event2', 'data2')
      emitter.emit('event3', 'data3')
      expect(listener1).toHaveBeenCalledWith('data1')
      expect(listener2).toHaveBeenCalledWith('data2')
      expect(listener3).toHaveBeenCalledWith('data3')
    })
  })
})
