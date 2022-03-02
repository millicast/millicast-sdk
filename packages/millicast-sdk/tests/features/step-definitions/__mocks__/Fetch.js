global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({})
  })
)

export function mockFetchJsonReturnValue (promiseImplementation) {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => promiseImplementation
    })
  )
}

export function mockFetchRejectValue (promiseImplementation) {
  global.fetch = jest.fn(() =>
    Promise.reject(promiseImplementation)
  )
}
