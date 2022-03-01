global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({})
  })
)

export default function mockFetchJsonReturnValue (promiseImplementation) {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => promiseImplementation
    })
  )
}
