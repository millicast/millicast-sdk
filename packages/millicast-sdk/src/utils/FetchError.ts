export default class FetchError extends Error {
  private status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'FetchError'
    this.status = status
  }
}
