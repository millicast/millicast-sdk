declare module 're-emitter';

declare module '*.worker.js' {
  class WebWorker extends Worker {
    constructor();
  }
  export default WebWorker;
}
