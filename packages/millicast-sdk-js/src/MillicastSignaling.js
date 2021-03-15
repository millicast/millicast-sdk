const EventEmitter = require("events");
const { TransactionManager } = require("transaction-manager");

class MillicastSignaling extends EventEmitter {
  constructor(options) {
    super();
    this.ws = null;
    this.tm = null;
    this.wsUrl = options && options.url ? options.url : "ws://localhost:8080/";
  }

  /**
   * Establish MillicastStream Connection.
   * @param {String} url - WebSocket url.
   * @return {Promise}
   */
  async connect(url) {
    if (!!this.tm && !!this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.emit("connection.success", { ws: this.ws, tm: this.tm });
      return Promise.resolve(this.ws);
    }

    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(url);
      this.tm = new TransactionManager(this.ws);
      this.ws.onopen = () => {
        //console.log('ws::onopen');
        if (this.ws.readyState !== WebSocket.OPEN) {
          let error = { state: this.ws.readyState };
          this.emit("connection.error", error);
          return reject(error);
        }
        this.tm.on("event", (evt) => {
          this.emit("event", evt);
        });
        this.emit("connection.success", {});
        resolve(this.ws);
      };
      this.ws.onclose = () => {
        this.ws = null;
        this.tm = null;
        console.log("ws::onclose", this.ws);
        this.emit("connection.close", {});
      };
    });
  }

  /**
   * Destory MillicastStream Connection.
   *
   */
  async close() {
    if (this.ws) this.ws.close();
  }

  /**
   * Subscribe MillicastStream.
   * @param {String} sdp - The sdp.
   * @param {String} streamId  - The streamId.'
   * @return {String} sdp - Mangled SDP
   */
  async subscribe(sdp, streamId) {
    let data = {
      sdp,
      streamId,
    };

    let result;
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return this.connect(this.wsUrl).then(async (ws) => {
        try {
          result = await this.tm.cmd("view", data);
          return result.sdp;
        } catch (e) {
          throw e;
        }
      });
    } else {
      try {
        result = await this.tm.cmd("view", data);
        return result.sdp;
      } catch (e) {
        throw e;
      }
    }
  }

  /**
   * Publish MillicastStream.
   * @param {String} sdp - The local sdp.
   */
  async publish(sdp) {
    //console.log('publish ', sdp)
    let data = {
      sdp,
      codec: "h264",
    };
    let result;
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return this.connect(this.wsUrl).then(async (ws) => {
        try {
          result = await this.tm.cmd("publish", data);
          return result.sdp;
        } catch (e) {
          throw e;
        }
      });
    } else {
      try {
        result = await this.tm.cmd("publish", data);
        return result.sdp;
      } catch (e) {
        throw e;
      }
    }
  }
}

module.exports = MillicastSignaling;
