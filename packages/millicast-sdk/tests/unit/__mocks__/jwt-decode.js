const jwtDecodeMock = jest.fn()

const dummyToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJtaWxsaWNhc3QiOnt9fQ.IqT-PLLz-X7Wn7BNo-x4pFApAbMT9mmnlupR8eD9q4U'

jwtDecodeMock.mockImplementation(() => {
  return {
    millicast: {
      streamName: 'test-stream',
      jwt: dummyToken,
    },
  }
})

export default jwtDecodeMock
