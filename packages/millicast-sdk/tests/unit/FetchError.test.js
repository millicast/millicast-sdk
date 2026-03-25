import FetchError from '../../src/utils/FetchError'

describe('FetchError', () => {
  test('should create error with message and status', () => {
    const error = new FetchError('Not Found', 404)

    expect(error.message).toBe('Not Found')
    expect(error.status).toBe(404)
    expect(error.name).toBe('FetchError')
  })

  test('should be instance of Error', () => {
    const error = new FetchError('Server Error', 500)

    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(FetchError)
  })

  test('should have stack trace', () => {
    const error = new FetchError('Bad Request', 400)

    expect(error.stack).toBeDefined()
    expect(error.stack).toContain('FetchError')
  })

  test('should handle different HTTP status codes', () => {
    const testCases = [
      { message: 'Bad Request', status: 400 },
      { message: 'Unauthorized', status: 401 },
      { message: 'Forbidden', status: 403 },
      { message: 'Not Found', status: 404 },
      { message: 'Internal Server Error', status: 500 },
      { message: 'Service Unavailable', status: 503 }
    ]

    testCases.forEach(({ message, status }) => {
      const error = new FetchError(message, status)
      expect(error.message).toBe(message)
      expect(error.status).toBe(status)
    })
  })

  test('should handle empty message', () => {
    const error = new FetchError('', 500)

    expect(error.message).toBe('')
    expect(error.status).toBe(500)
  })

  test('should be throwable and catchable', () => {
    expect(() => {
      throw new FetchError('Test error', 500)
    }).toThrow(FetchError)

    try {
      throw new FetchError('Caught error', 404)
    } catch (e) {
      expect(e.status).toBe(404)
      expect(e.message).toBe('Caught error')
    }
  })
})
