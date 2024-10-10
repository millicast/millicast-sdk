export default class FetchError extends Error {
  public status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'FetchError'
    this.status = status
  }
}
