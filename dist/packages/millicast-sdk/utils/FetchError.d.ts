export default class FetchError extends Error {
    status: number;
    constructor(message: string, status: number);
}
