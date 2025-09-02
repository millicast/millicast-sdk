var Ei = Object.defineProperty, Ci = Object.defineProperties;
var _i = Object.getOwnPropertyDescriptors;
var zt = Object.getOwnPropertySymbols;
var Nn = Object.prototype.hasOwnProperty, On = Object.prototype.propertyIsEnumerable;
var Fn = (r, e, t) => e in r ? Ei(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : r[e] = t, J = (r, e) => {
  for (var t in e || (e = {}))
    Nn.call(e, t) && Fn(r, t, e[t]);
  if (zt)
    for (var t of zt(e))
      On.call(e, t) && Fn(r, t, e[t]);
  return r;
}, we = (r, e) => Ci(r, _i(e));
var Ye = (r, e) => {
  var t = {};
  for (var i in r)
    Nn.call(r, i) && e.indexOf(i) < 0 && (t[i] = r[i]);
  if (r != null && zt)
    for (var i of zt(r))
      e.indexOf(i) < 0 && On.call(r, i) && (t[i] = r[i]);
  return t;
};
var dr = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function wt(r) {
  return r && r.__esModule && Object.prototype.hasOwnProperty.call(r, "default") ? r.default : r;
}
var gs = { exports: {} };
/*!
 * js-logger - http://github.com/jonnyreeves/js-logger
 * Jonny Reeves, http://jonnyreeves.co.uk/
 * js-logger may be freely distributed under the MIT license.
 */
(function(r) {
  (function(e) {
    var t = {};
    t.VERSION = "1.6.1";
    var i, u = {}, m = function(g, o) {
      return function() {
        return o.apply(g, arguments);
      };
    }, f = function() {
      var g = arguments, o = g[0], c, l;
      for (l = 1; l < g.length; l++)
        for (c in g[l])
          !(c in o) && g[l].hasOwnProperty(c) && (o[c] = g[l][c]);
      return o;
    }, n = function(g, o) {
      return { value: g, name: o };
    };
    t.TRACE = n(1, "TRACE"), t.DEBUG = n(2, "DEBUG"), t.INFO = n(3, "INFO"), t.TIME = n(4, "TIME"), t.WARN = n(5, "WARN"), t.ERROR = n(8, "ERROR"), t.OFF = n(99, "OFF");
    var b = function(g) {
      this.context = g, this.setLevel(g.filterLevel), this.log = this.info;
    };
    b.prototype = {
      // Changes the current logging level for the logging instance.
      setLevel: function(g) {
        g && "value" in g && (this.context.filterLevel = g);
      },
      // Gets the current logging level for the logging instance
      getLevel: function() {
        return this.context.filterLevel;
      },
      // Is the logger configured to output messages at the supplied level?
      enabledFor: function(g) {
        var o = this.context.filterLevel;
        return g.value >= o.value;
      },
      trace: function() {
        this.invoke(t.TRACE, arguments);
      },
      debug: function() {
        this.invoke(t.DEBUG, arguments);
      },
      info: function() {
        this.invoke(t.INFO, arguments);
      },
      warn: function() {
        this.invoke(t.WARN, arguments);
      },
      error: function() {
        this.invoke(t.ERROR, arguments);
      },
      time: function(g) {
        typeof g == "string" && g.length > 0 && this.invoke(t.TIME, [g, "start"]);
      },
      timeEnd: function(g) {
        typeof g == "string" && g.length > 0 && this.invoke(t.TIME, [g, "end"]);
      },
      // Invokes the logger callback if it's not being filtered.
      invoke: function(g, o) {
        i && this.enabledFor(g) && i(o, f({ level: g }, this.context));
      }
    };
    var h = new b({ filterLevel: t.OFF });
    (function() {
      var g = t;
      g.enabledFor = m(h, h.enabledFor), g.trace = m(h, h.trace), g.debug = m(h, h.debug), g.time = m(h, h.time), g.timeEnd = m(h, h.timeEnd), g.info = m(h, h.info), g.warn = m(h, h.warn), g.error = m(h, h.error), g.log = g.info;
    })(), t.setHandler = function(g) {
      i = g;
    }, t.setLevel = function(g) {
      h.setLevel(g);
      for (var o in u)
        u.hasOwnProperty(o) && u[o].setLevel(g);
    }, t.getLevel = function() {
      return h.getLevel();
    }, t.get = function(g) {
      return u[g] || (u[g] = new b(f({ name: g }, h.context)));
    }, t.createDefaultHandler = function(g) {
      g = g || {}, g.formatter = g.formatter || function(a, s) {
        s.name && a.unshift("[" + s.name + "]");
      };
      var o = {}, c = function(l, a) {
        Function.prototype.apply.call(l, console, a);
      };
      return typeof console > "u" ? function() {
      } : function(l, a) {
        l = Array.prototype.slice.call(l);
        var s = console.log, p;
        a.level === t.TIME ? (p = (a.name ? "[" + a.name + "] " : "") + l[0], l[1] === "start" ? console.time ? console.time(p) : o[p] = (/* @__PURE__ */ new Date()).getTime() : console.timeEnd ? console.timeEnd(p) : c(s, [p + ": " + ((/* @__PURE__ */ new Date()).getTime() - o[p]) + "ms"])) : (a.level === t.WARN && console.warn ? s = console.warn : a.level === t.ERROR && console.error ? s = console.error : a.level === t.INFO && console.info ? s = console.info : a.level === t.DEBUG && console.debug ? s = console.debug : a.level === t.TRACE && console.trace && (s = console.trace), g.formatter(l, a), c(s, l));
      };
    }, t.useDefaults = function(g) {
      t.setLevel(g && g.defaultLevel || t.DEBUG), t.setHandler(t.createDefaultHandler(g));
    }, t.setDefaults = t.useDefaults, r.exports ? r.exports = t : (t._prevLogger = e.Logger, t.noConflict = function() {
      return e.Logger = t._prevLogger, t;
    }, e.Logger = t);
  })(dr);
})(gs);
var Ti = gs.exports;
const Be = /* @__PURE__ */ wt(Ti), ys = "1.0.0", Yt = 60;
var ps;
const Ai = ((ps = window == null ? void 0 : window.navigator) == null ? void 0 : ps.userAgent) || "No user agent available";
let Kt = "", Ht = "", Jt = "", xt = "", Rt = "", Vn = "", Qt = "", qt = 0;
const er = [];
function Li(r) {
  function e(i, u) {
    return {
      ts: u.timestamp ? Math.round(u.timestamp) : "",
      // Timestamp to the nearest millisecond
      ot: i === "audio" ? "a" : "v",
      // 'a' for audio, 'v' for video
      bl: u.jitterBufferDelay || 0,
      // Buffer length from jitterBufferDelay, default to 0 if not available
      br: Math.round(u.bitrateBitsPerSecond || 0),
      // Bitrate, rounded to nearest integer, default to 0 if not available
      pld: u.packetsLostDeltaPerSecond || 0,
      // Packets lost delta per second, default to 0 if not available
      j: u.jitter || 0,
      // Jitter, default to 0 if not available
      mtp: u.packetRate || 0,
      // Measured throughput, approximated by packet rate, default to 0 if not available
      mid: u.mid ? u.mid : "",
      // Media ID or track identifier, default to empty string if not available
      mimeType: u.mimeType || ""
      // MIME type of the media stream, default to empty string if not available
    };
  }
  const t = r.stats.reduce((i, u) => {
    const m = u.audio.inbounds.length !== 0 ? u.audio.inbounds.map((n) => e("audio", n)) : u.audio.outbounds.map((n) => e("audio", n)), f = u.video.inbounds.length !== 0 ? u.video.inbounds.map((n) => e("video", n)) : u.video.outbounds.map((n) => e("video", n));
    return i.concat([...m, ...f]);
  }, []);
  return we(J({}, r), { stats: t });
}
const Ie = {
  initAccountId: (r) => {
    Kt = Kt === "" ? r : Kt;
  },
  initStreamName: (r) => {
    Ht = Ht === "" ? r : Ht;
  },
  initSubscriberId: (r) => {
    Jt = Jt === "" ? r : Jt;
  },
  initStreamViewId: (r) => {
    xt = xt === "" ? r : xt;
  },
  initFeedId: (r) => {
    Rt = Rt === "" ? r : Rt;
  },
  setConnectionTime: (r) => {
    qt = qt === 0 ? r : qt;
  },
  setConnectionState: (r) => {
    Vn = r;
  },
  setClusterId: (r) => {
    Qt = Qt === "" ? r : Qt;
  },
  addStats: (r) => {
    er.length === Yt && er.shift(), er.push(r);
  },
  get: (r = Yt, e = "JSON") => {
    let t;
    !Number.isInteger(r) || r > Yt || r <= 0 ? t = Yt : t = r;
    const i = {
      client: "@millicast/millicast-sdk",
      version: ys,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      userAgent: Ai,
      clusterId: Qt,
      accountId: Kt,
      streamName: Ht,
      subscriberId: Jt,
      connection: Vn,
      stats: er.slice(-t),
      connectionDurationMs: (/* @__PURE__ */ new Date()).getTime() - qt
    };
    return Rt !== "" ? i.feedId = Rt : xt !== "" && (i.streamViewId = xt), e === "CMCD" ? Li(i) : i;
  }
};
Be.useDefaults({ defaultLevel: Be.TRACE });
const tr = ["TRACE", "DEBUG", "INFO", "WARN", "ERROR"], bs = (r, e) => {
  r.unshift("[".concat(e.name || "Global", "] ").concat((/* @__PURE__ */ new Date()).toISOString(), " - ").concat(e.level.name, " -"));
}, vs = (r, e) => e ? r.value >= Ke[e].value : r.value >= ar.value, Di = (r, e) => {
  r = Array.prototype.slice.call(r), r = r.map((t) => typeof t == "object" ? JSON.stringify(t) : t), bs(r, e), Tt !== 0 ? (ft.push(r.join(" ")), ft.length >= Tt && (ft = ft.slice(-Tt))) : ft = [];
}, Mi = Be.createDefaultHandler({ formatter: bs });
Be.setHandler((r, e) => {
  Di(r, e), vs(e.level, e.name || "") && Mi(r, e);
  for (const { handler: t, level: i } of ws)
    e.level.value >= i.value && t(r, e);
});
const Pi = 1e4;
let Tt = Pi, ft = [], ar = Be.OFF;
const Ke = {}, ws = [], Zi = Be.createDefaultHandler, Fe = we(J({}, Be), {
  createDefaultHandler: Zi,
  enabledFor: vs,
  /**
   * @function
   * @name getHistory
   * @description Get all logs generated during a session.
   * All logs are recollected besides the log level selected by the user.
   * @returns {Array<String>} All logs recollected from level TRACE.
   * @example Logger.getHistory()
   * // Outupt
   * // [
   * //   "[Director] 2021-04-05T14:09:26.625Z - Getting publisher connection data for stream name:  1xxx2",
   * //   "[Director] 2021-04-05T14:09:27.064Z - Getting publisher response",
   * //   "[Publish]  2021-04-05T14:09:27.066Z - Broadcasting"
   * // ]
   */
  getHistory: () => ft,
  /**
   * @function
   * @name getHistoryMaxSize
   * @description Get the maximum count of logs preserved during a session.
   * @example Logger.getHistoryMaxSize()
   */
  getHistoryMaxSize: () => Tt,
  /**
   * @function
   * @name setHistoryMaxSize
   * @description Set the maximum count of logs to preserve during a session.
   * By default it is set to 10000.
   * @param {Number} maxSize - Max size of log history. Set 0 to disable history or -1 to unlimited log history.
   * @example Logger.setHistoryMaxSize(100)
   */
  setHistoryMaxSize: (r) => {
    Tt = r;
  },
  /**
   * @function
   * @name setLevel
   * @description Set log level to all loggers.
   * @param {LogLevel} level - New log level to be set.
   * @example
   * // Global Level
   * Logger.setLevel(Logger.DEBUG)
   *
   * // Module Level
   * Logger.get('Publish').setLevel(Logger.DEBUG)
   */
  setLevel: (r) => {
    ar = r;
    for (const e in Ke)
      Ke[e] = r;
  },
  /**
   * @function
   * @name getLevel
   * @description Get global current logger level.
   * Also you can get the level of any particular logger.
   * @returns {LogLevel}
   * @example
   * // Global Level
   * Logger.getLevel()
   * // Output
   * // {value: 2, name: 'DEBUG'}
   *
   * // Module Level
   * Logger.get('Publish').getLevel()
   * // Output
   * // {value: 5, name: 'WARN'}
   */
  getLevel: () => ar,
  /**
   * @function
   * @name get
   * @description Gets or creates a named logger. Named loggers are used to group log messages
   * that refers to a common context.
   * @param {String} name
   * @returns {Object} Logger object with same properties and functions as Logger except
   * history and handlers related functions.
   * @example
   * const myLogger = Logger.get('MyLogger')
   * // Set logger level
   * myLogger.setLevel(Logger.DEBUG)
   *
   * myLogger.debug('This is a debug log')
   * myLogger.info('This is a info log')
   * myLogger.warn('This is a warning log')
   *
   * // Get logger level
   * myLogger.getLevel()
   * // {value: 3, name: 'INFO'}
   */
  get: (r) => {
    Ke[r] || (Ke[r] = ar);
    const e = Be.get(r);
    return e.setLevel = (t) => {
      Ke[r] = t;
    }, e.getLevel = () => Ke[r], e;
  },
  /**
   * Callback which handles log messages.
   *
   * @callback loggerHandler
   * @global
   * @param {any[]} messages         - Arguments object with the supplied log messages.
   * @param {Object} context
   * @param {LogLevel} context.level - The currrent log level.
   * @param {String?} context.name   - The optional current logger name.
   */
  /**
   * @function
   * @name setHandler
   * @description Add your custom log handler to Logger at the specified level.
   * @param {loggerHandler} handler  - Your custom log handler function.
   * @param {LogLevel} level         - Log level to filter messages.
   * @example
   * const myHandler = (messages, context) => {
   *  // You can filter by logger
   *  if (context.name === 'Publish') {
   *    sendToMyLogger(messages[0])
   *  }
   *
   *  // You can filter by logger level
   *  if (context.level.value >= Logger.INFO.value) {
   *    sendToMyLogger(messages[0])
   *  }
   * }
   *
   * Logger.setHandler(myHandler, Logger.INFO)
   */
  setHandler: (r, e) => {
    ws.push({ handler: r, level: e });
  },
  /**
   * @function
   * @name diagnose
   * @description Returns diagnostics information about the connection and environment, formatted according to the specified parameters.
   * @param {Object | Number} config - Configuration object for the diagnostic parameters
   * @param {Number} [config.statsCount = 60] - Number of stats objects to be included in the diagnostics report.
   * @param {Number} [config.historySize = 1000]  - Amount of history messages to be returned.
   * @param {String} [config.minLogLevel] - Levels of history messages to be included.
   * examples of minLogLevel values in level order:
   * 1 - TRACE
   * 2 - DEBUG
   * 3 - INFO
   * 4 - WARN
   * 5 - ERROR
   * If 'INFO' (3) given, return INFO (3), WARN (4), and ERROR (5) level messages.
   * @param {String} [config.statsFormat='JSON'] - Format of the stats objects in the diagnostics report. Use Logger.JSON or Logger.CMCD.
   * @returns {Object} An object containing relevant diagnostics information such as userAgent, SDK version, and stats data.
   * @example
   * // Example using default parameters
   * const diagnosticsDefault = Logger.diagnose();
   *
   * // Example specifying statsCount and format
   * const diagnostics = Logger.diagnose({ statsCount: 30, minLogLevel: 'INFO', format: Logger.CMCD });
   *
   * // Output: Diagnostics object with specified configuration
   */
  diagnose: (r = {
    statsCount: 60,
    historySize: 1e3,
    minLogLevel: "TRACE",
    statsFormat: "JSON"
  }) => {
    let e;
    const t = {
      statsCount: 60,
      historySize: 1e3,
      minLogLevel: "TRACE",
      statsFormat: "JSON"
    };
    typeof r == "number" ? (t.statsCount = r, e = t) : e = J(J({}, t), r);
    const { statsCount: i, historySize: u, minLogLevel: m, statsFormat: f } = e, n = Ie.get(i, f), b = Fe.getHistory();
    if (!Number.isInteger(u) || u <= 0)
      throw new Error("Invalid Argument Exception : historySize must be a positive integer.");
    if (!tr.includes(m.toUpperCase()))
      throw new Error(
        'Invalid Argument Exception : the minLogLevel parameter only excepts "trace", "debug", "info", "warn", and "error" as arguments.'
      );
    if (tr.includes(m.toUpperCase())) {
      const h = tr.slice(tr.indexOf(m.toUpperCase())), g = b.filter((o) => h.some((c) => o.includes(c)));
      n.history = g.slice(-u);
    }
    return n;
  },
  JSON: "JSON",
  CMCD: "CMCD",
  /**
   * @var
   * @name VERSION
   * @description Returns the current SDK version.
   */
  VERSION: ys
});
var rn = { exports: {} }, pt = typeof Reflect == "object" ? Reflect : null, jn = pt && typeof pt.apply == "function" ? pt.apply : function(e, t, i) {
  return Function.prototype.apply.call(e, t, i);
}, cr;
pt && typeof pt.ownKeys == "function" ? cr = pt.ownKeys : Object.getOwnPropertySymbols ? cr = function(e) {
  return Object.getOwnPropertyNames(e).concat(Object.getOwnPropertySymbols(e));
} : cr = function(e) {
  return Object.getOwnPropertyNames(e);
};
function Ui(r) {
  console && console.warn && console.warn(r);
}
var Ss = Number.isNaN || function(e) {
  return e !== e;
};
function re() {
  re.init.call(this);
}
rn.exports = re;
rn.exports.once = Vi;
re.EventEmitter = re;
re.prototype._events = void 0;
re.prototype._eventsCount = 0;
re.prototype._maxListeners = void 0;
var Wn = 10;
function br(r) {
  if (typeof r != "function")
    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof r);
}
Object.defineProperty(re, "defaultMaxListeners", {
  enumerable: !0,
  get: function() {
    return Wn;
  },
  set: function(r) {
    if (typeof r != "number" || r < 0 || Ss(r))
      throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + r + ".");
    Wn = r;
  }
});
re.init = function() {
  (this._events === void 0 || this._events === Object.getPrototypeOf(this)._events) && (this._events = /* @__PURE__ */ Object.create(null), this._eventsCount = 0), this._maxListeners = this._maxListeners || void 0;
};
re.prototype.setMaxListeners = function(e) {
  if (typeof e != "number" || e < 0 || Ss(e))
    throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + e + ".");
  return this._maxListeners = e, this;
};
function xs(r) {
  return r._maxListeners === void 0 ? re.defaultMaxListeners : r._maxListeners;
}
re.prototype.getMaxListeners = function() {
  return xs(this);
};
re.prototype.emit = function(e) {
  for (var t = [], i = 1; i < arguments.length; i++) t.push(arguments[i]);
  var u = e === "error", m = this._events;
  if (m !== void 0)
    u = u && m.error === void 0;
  else if (!u)
    return !1;
  if (u) {
    var f;
    if (t.length > 0 && (f = t[0]), f instanceof Error)
      throw f;
    var n = new Error("Unhandled error." + (f ? " (" + f.message + ")" : ""));
    throw n.context = f, n;
  }
  var b = m[e];
  if (b === void 0)
    return !1;
  if (typeof b == "function")
    jn(b, this, t);
  else
    for (var h = b.length, g = Cs(b, h), i = 0; i < h; ++i)
      jn(g[i], this, t);
  return !0;
};
function Rs(r, e, t, i) {
  var u, m, f;
  if (br(t), m = r._events, m === void 0 ? (m = r._events = /* @__PURE__ */ Object.create(null), r._eventsCount = 0) : (m.newListener !== void 0 && (r.emit(
    "newListener",
    e,
    t.listener ? t.listener : t
  ), m = r._events), f = m[e]), f === void 0)
    f = m[e] = t, ++r._eventsCount;
  else if (typeof f == "function" ? f = m[e] = i ? [t, f] : [f, t] : i ? f.unshift(t) : f.push(t), u = xs(r), u > 0 && f.length > u && !f.warned) {
    f.warned = !0;
    var n = new Error("Possible EventEmitter memory leak detected. " + f.length + " " + String(e) + " listeners added. Use emitter.setMaxListeners() to increase limit");
    n.name = "MaxListenersExceededWarning", n.emitter = r, n.type = e, n.count = f.length, Ui(n);
  }
  return r;
}
re.prototype.addListener = function(e, t) {
  return Rs(this, e, t, !1);
};
re.prototype.on = re.prototype.addListener;
re.prototype.prependListener = function(e, t) {
  return Rs(this, e, t, !0);
};
function Fi() {
  if (!this.fired)
    return this.target.removeListener(this.type, this.wrapFn), this.fired = !0, arguments.length === 0 ? this.listener.call(this.target) : this.listener.apply(this.target, arguments);
}
function Is(r, e, t) {
  var i = { fired: !1, wrapFn: void 0, target: r, type: e, listener: t }, u = Fi.bind(i);
  return u.listener = t, i.wrapFn = u, u;
}
re.prototype.once = function(e, t) {
  return br(t), this.on(e, Is(this, e, t)), this;
};
re.prototype.prependOnceListener = function(e, t) {
  return br(t), this.prependListener(e, Is(this, e, t)), this;
};
re.prototype.removeListener = function(e, t) {
  var i, u, m, f, n;
  if (br(t), u = this._events, u === void 0)
    return this;
  if (i = u[e], i === void 0)
    return this;
  if (i === t || i.listener === t)
    --this._eventsCount === 0 ? this._events = /* @__PURE__ */ Object.create(null) : (delete u[e], u.removeListener && this.emit("removeListener", e, i.listener || t));
  else if (typeof i != "function") {
    for (m = -1, f = i.length - 1; f >= 0; f--)
      if (i[f] === t || i[f].listener === t) {
        n = i[f].listener, m = f;
        break;
      }
    if (m < 0)
      return this;
    m === 0 ? i.shift() : Ni(i, m), i.length === 1 && (u[e] = i[0]), u.removeListener !== void 0 && this.emit("removeListener", e, n || t);
  }
  return this;
};
re.prototype.off = re.prototype.removeListener;
re.prototype.removeAllListeners = function(e) {
  var t, i, u;
  if (i = this._events, i === void 0)
    return this;
  if (i.removeListener === void 0)
    return arguments.length === 0 ? (this._events = /* @__PURE__ */ Object.create(null), this._eventsCount = 0) : i[e] !== void 0 && (--this._eventsCount === 0 ? this._events = /* @__PURE__ */ Object.create(null) : delete i[e]), this;
  if (arguments.length === 0) {
    var m = Object.keys(i), f;
    for (u = 0; u < m.length; ++u)
      f = m[u], f !== "removeListener" && this.removeAllListeners(f);
    return this.removeAllListeners("removeListener"), this._events = /* @__PURE__ */ Object.create(null), this._eventsCount = 0, this;
  }
  if (t = i[e], typeof t == "function")
    this.removeListener(e, t);
  else if (t !== void 0)
    for (u = t.length - 1; u >= 0; u--)
      this.removeListener(e, t[u]);
  return this;
};
function ks(r, e, t) {
  var i = r._events;
  if (i === void 0)
    return [];
  var u = i[e];
  return u === void 0 ? [] : typeof u == "function" ? t ? [u.listener || u] : [u] : t ? Oi(u) : Cs(u, u.length);
}
re.prototype.listeners = function(e) {
  return ks(this, e, !0);
};
re.prototype.rawListeners = function(e) {
  return ks(this, e, !1);
};
re.listenerCount = function(r, e) {
  return typeof r.listenerCount == "function" ? r.listenerCount(e) : Es.call(r, e);
};
re.prototype.listenerCount = Es;
function Es(r) {
  var e = this._events;
  if (e !== void 0) {
    var t = e[r];
    if (typeof t == "function")
      return 1;
    if (t !== void 0)
      return t.length;
  }
  return 0;
}
re.prototype.eventNames = function() {
  return this._eventsCount > 0 ? cr(this._events) : [];
};
function Cs(r, e) {
  for (var t = new Array(e), i = 0; i < e; ++i)
    t[i] = r[i];
  return t;
}
function Ni(r, e) {
  for (; e + 1 < r.length; e++)
    r[e] = r[e + 1];
  r.pop();
}
function Oi(r) {
  for (var e = new Array(r.length), t = 0; t < e.length; ++t)
    e[t] = r[t].listener || r[t];
  return e;
}
function Vi(r, e) {
  return new Promise(function(t, i) {
    function u(f) {
      r.removeListener(e, m), i(f);
    }
    function m() {
      typeof r.removeListener == "function" && r.removeListener("error", u), t([].slice.call(arguments));
    }
    _s(r, e, m, { once: !0 }), e !== "error" && ji(r, u, { once: !0 });
  });
}
function ji(r, e, t) {
  typeof r.on == "function" && _s(r, "error", e, t);
}
function _s(r, e, t, i) {
  if (typeof r.on == "function")
    i.once ? r.once(e, t) : r.on(e, t);
  else if (typeof r.addEventListener == "function")
    r.addEventListener(e, function u(m) {
      i.once && r.removeEventListener(e, u), t(m);
    });
  else
    throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof r);
}
var nn = rn.exports;
const vr = /* @__PURE__ */ wt(nn);
var sn = { exports: {} };
sn.exports = Ts;
sn.exports.filter = $i;
var Wi = nn.EventEmitter;
function Ts(r, e, t) {
  Array.isArray(t) || (t = [t]);
  var i = [];
  return t.forEach(function(u) {
    var m = function() {
      var f = [].slice.call(arguments);
      f.unshift(u), e.emit.apply(e, f);
    };
    i.push(m), r.on(u, m);
  }), function() {
    t.forEach(function(m, f) {
      r.removeListener(m, i[f]);
    });
  };
}
function $i(r, e) {
  var t = new Wi();
  return Ts(r, t, e), t;
}
var Bi = sn.exports;
const fr = /* @__PURE__ */ wt(Bi);
var As = { exports: {} };
/*! For license information please see webrtc-stats.js.LICENSE.txt */
(function(r, e) {
  (function(t, i) {
    r.exports = i();
  })(self, () => {
    return t = { 7: (u) => {
      var m, f = typeof Reflect == "object" ? Reflect : null, n = f && typeof f.apply == "function" ? f.apply : function(S, I, E) {
        return Function.prototype.apply.call(S, I, E);
      };
      m = f && typeof f.ownKeys == "function" ? f.ownKeys : Object.getOwnPropertySymbols ? function(S) {
        return Object.getOwnPropertyNames(S).concat(Object.getOwnPropertySymbols(S));
      } : function(S) {
        return Object.getOwnPropertyNames(S);
      };
      var b = Number.isNaN || function(S) {
        return S != S;
      };
      function h() {
        h.init.call(this);
      }
      u.exports = h, u.exports.once = function(S, I) {
        return new Promise(function(E, T) {
          function x(_) {
            S.removeListener(I, k), T(_);
          }
          function k() {
            typeof S.removeListener == "function" && S.removeListener("error", x), E([].slice.call(arguments));
          }
          v(S, I, k, { once: !0 }), I !== "error" && function(_, L, N) {
            typeof _.on == "function" && v(_, "error", L, { once: !0 });
          }(S, x);
        });
      }, h.EventEmitter = h, h.prototype._events = void 0, h.prototype._eventsCount = 0, h.prototype._maxListeners = void 0;
      var g = 10;
      function o(S) {
        if (typeof S != "function") throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof S);
      }
      function c(S) {
        return S._maxListeners === void 0 ? h.defaultMaxListeners : S._maxListeners;
      }
      function l(S, I, E, T) {
        var x, k, _, L;
        if (o(E), (k = S._events) === void 0 ? (k = S._events = /* @__PURE__ */ Object.create(null), S._eventsCount = 0) : (k.newListener !== void 0 && (S.emit("newListener", I, E.listener ? E.listener : E), k = S._events), _ = k[I]), _ === void 0) _ = k[I] = E, ++S._eventsCount;
        else if (typeof _ == "function" ? _ = k[I] = T ? [E, _] : [_, E] : T ? _.unshift(E) : _.push(E), (x = c(S)) > 0 && _.length > x && !_.warned) {
          _.warned = !0;
          var N = new Error("Possible EventEmitter memory leak detected. " + _.length + " " + String(I) + " listeners added. Use emitter.setMaxListeners() to increase limit");
          N.name = "MaxListenersExceededWarning", N.emitter = S, N.type = I, N.count = _.length, L = N, console && console.warn && console.warn(L);
        }
        return S;
      }
      function a() {
        if (!this.fired) return this.target.removeListener(this.type, this.wrapFn), this.fired = !0, arguments.length === 0 ? this.listener.call(this.target) : this.listener.apply(this.target, arguments);
      }
      function s(S, I, E) {
        var T = { fired: !1, wrapFn: void 0, target: S, type: I, listener: E }, x = a.bind(T);
        return x.listener = E, T.wrapFn = x, x;
      }
      function p(S, I, E) {
        var T = S._events;
        if (T === void 0) return [];
        var x = T[I];
        return x === void 0 ? [] : typeof x == "function" ? E ? [x.listener || x] : [x] : E ? function(k) {
          for (var _ = new Array(k.length), L = 0; L < _.length; ++L) _[L] = k[L].listener || k[L];
          return _;
        }(x) : y(x, x.length);
      }
      function d(S) {
        var I = this._events;
        if (I !== void 0) {
          var E = I[S];
          if (typeof E == "function") return 1;
          if (E !== void 0) return E.length;
        }
        return 0;
      }
      function y(S, I) {
        for (var E = new Array(I), T = 0; T < I; ++T) E[T] = S[T];
        return E;
      }
      function v(S, I, E, T) {
        if (typeof S.on == "function") T.once ? S.once(I, E) : S.on(I, E);
        else {
          if (typeof S.addEventListener != "function") throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof S);
          S.addEventListener(I, function x(k) {
            T.once && S.removeEventListener(I, x), E(k);
          });
        }
      }
      Object.defineProperty(h, "defaultMaxListeners", { enumerable: !0, get: function() {
        return g;
      }, set: function(S) {
        if (typeof S != "number" || S < 0 || b(S)) throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + S + ".");
        g = S;
      } }), h.init = function() {
        this._events !== void 0 && this._events !== Object.getPrototypeOf(this)._events || (this._events = /* @__PURE__ */ Object.create(null), this._eventsCount = 0), this._maxListeners = this._maxListeners || void 0;
      }, h.prototype.setMaxListeners = function(S) {
        if (typeof S != "number" || S < 0 || b(S)) throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + S + ".");
        return this._maxListeners = S, this;
      }, h.prototype.getMaxListeners = function() {
        return c(this);
      }, h.prototype.emit = function(S) {
        for (var I = [], E = 1; E < arguments.length; E++) I.push(arguments[E]);
        var T = S === "error", x = this._events;
        if (x !== void 0) T = T && x.error === void 0;
        else if (!T) return !1;
        if (T) {
          var k;
          if (I.length > 0 && (k = I[0]), k instanceof Error) throw k;
          var _ = new Error("Unhandled error." + (k ? " (" + k.message + ")" : ""));
          throw _.context = k, _;
        }
        var L = x[S];
        if (L === void 0) return !1;
        if (typeof L == "function") n(L, this, I);
        else {
          var N = L.length, O = y(L, N);
          for (E = 0; E < N; ++E) n(O[E], this, I);
        }
        return !0;
      }, h.prototype.addListener = function(S, I) {
        return l(this, S, I, !1);
      }, h.prototype.on = h.prototype.addListener, h.prototype.prependListener = function(S, I) {
        return l(this, S, I, !0);
      }, h.prototype.once = function(S, I) {
        return o(I), this.on(S, s(this, S, I)), this;
      }, h.prototype.prependOnceListener = function(S, I) {
        return o(I), this.prependListener(S, s(this, S, I)), this;
      }, h.prototype.removeListener = function(S, I) {
        var E, T, x, k, _;
        if (o(I), (T = this._events) === void 0) return this;
        if ((E = T[S]) === void 0) return this;
        if (E === I || E.listener === I) --this._eventsCount == 0 ? this._events = /* @__PURE__ */ Object.create(null) : (delete T[S], T.removeListener && this.emit("removeListener", S, E.listener || I));
        else if (typeof E != "function") {
          for (x = -1, k = E.length - 1; k >= 0; k--) if (E[k] === I || E[k].listener === I) {
            _ = E[k].listener, x = k;
            break;
          }
          if (x < 0) return this;
          x === 0 ? E.shift() : function(L, N) {
            for (; N + 1 < L.length; N++) L[N] = L[N + 1];
            L.pop();
          }(E, x), E.length === 1 && (T[S] = E[0]), T.removeListener !== void 0 && this.emit("removeListener", S, _ || I);
        }
        return this;
      }, h.prototype.off = h.prototype.removeListener, h.prototype.removeAllListeners = function(S) {
        var I, E, T;
        if ((E = this._events) === void 0) return this;
        if (E.removeListener === void 0) return arguments.length === 0 ? (this._events = /* @__PURE__ */ Object.create(null), this._eventsCount = 0) : E[S] !== void 0 && (--this._eventsCount == 0 ? this._events = /* @__PURE__ */ Object.create(null) : delete E[S]), this;
        if (arguments.length === 0) {
          var x, k = Object.keys(E);
          for (T = 0; T < k.length; ++T) (x = k[T]) !== "removeListener" && this.removeAllListeners(x);
          return this.removeAllListeners("removeListener"), this._events = /* @__PURE__ */ Object.create(null), this._eventsCount = 0, this;
        }
        if (typeof (I = E[S]) == "function") this.removeListener(S, I);
        else if (I !== void 0) for (T = I.length - 1; T >= 0; T--) this.removeListener(S, I[T]);
        return this;
      }, h.prototype.listeners = function(S) {
        return p(this, S, !0);
      }, h.prototype.rawListeners = function(S) {
        return p(this, S, !1);
      }, h.listenerCount = function(S, I) {
        return typeof S.listenerCount == "function" ? S.listenerCount(I) : d.call(S, I);
      }, h.prototype.listenerCount = d, h.prototype.eventNames = function() {
        return this._eventsCount > 0 ? m(this._events) : [];
      };
    }, 586: function(u, m, f) {
      var n, b;
      (function(h) {
        var g, o = { VERSION: "1.6.1" }, c = {}, l = function(v, S) {
          return function() {
            return S.apply(v, arguments);
          };
        }, a = function() {
          var v, S, I = arguments, E = I[0];
          for (S = 1; S < I.length; S++) for (v in I[S]) !(v in E) && I[S].hasOwnProperty(v) && (E[v] = I[S][v]);
          return E;
        }, s = function(v, S) {
          return { value: v, name: S };
        };
        o.TRACE = s(1, "TRACE"), o.DEBUG = s(2, "DEBUG"), o.INFO = s(3, "INFO"), o.TIME = s(4, "TIME"), o.WARN = s(5, "WARN"), o.ERROR = s(8, "ERROR"), o.OFF = s(99, "OFF");
        var p = function(v) {
          this.context = v, this.setLevel(v.filterLevel), this.log = this.info;
        };
        p.prototype = { setLevel: function(v) {
          v && "value" in v && (this.context.filterLevel = v);
        }, getLevel: function() {
          return this.context.filterLevel;
        }, enabledFor: function(v) {
          var S = this.context.filterLevel;
          return v.value >= S.value;
        }, trace: function() {
          this.invoke(o.TRACE, arguments);
        }, debug: function() {
          this.invoke(o.DEBUG, arguments);
        }, info: function() {
          this.invoke(o.INFO, arguments);
        }, warn: function() {
          this.invoke(o.WARN, arguments);
        }, error: function() {
          this.invoke(o.ERROR, arguments);
        }, time: function(v) {
          typeof v == "string" && v.length > 0 && this.invoke(o.TIME, [v, "start"]);
        }, timeEnd: function(v) {
          typeof v == "string" && v.length > 0 && this.invoke(o.TIME, [v, "end"]);
        }, invoke: function(v, S) {
          g && this.enabledFor(v) && g(S, a({ level: v }, this.context));
        } };
        var d, y = new p({ filterLevel: o.OFF });
        (d = o).enabledFor = l(y, y.enabledFor), d.trace = l(y, y.trace), d.debug = l(y, y.debug), d.time = l(y, y.time), d.timeEnd = l(y, y.timeEnd), d.info = l(y, y.info), d.warn = l(y, y.warn), d.error = l(y, y.error), d.log = d.info, o.setHandler = function(v) {
          g = v;
        }, o.setLevel = function(v) {
          for (var S in y.setLevel(v), c) c.hasOwnProperty(S) && c[S].setLevel(v);
        }, o.getLevel = function() {
          return y.getLevel();
        }, o.get = function(v) {
          return c[v] || (c[v] = new p(a({ name: v }, y.context)));
        }, o.createDefaultHandler = function(v) {
          (v = v || {}).formatter = v.formatter || function(E, T) {
            T.name && E.unshift("[" + T.name + "]");
          };
          var S = {}, I = function(E, T) {
            Function.prototype.apply.call(E, console, T);
          };
          return typeof console > "u" ? function() {
          } : function(E, T) {
            E = Array.prototype.slice.call(E);
            var x, k = console.log;
            T.level === o.TIME ? (x = (T.name ? "[" + T.name + "] " : "") + E[0], E[1] === "start" ? console.time ? console.time(x) : S[x] = (/* @__PURE__ */ new Date()).getTime() : console.timeEnd ? console.timeEnd(x) : I(k, [x + ": " + ((/* @__PURE__ */ new Date()).getTime() - S[x]) + "ms"])) : (T.level === o.WARN && console.warn ? k = console.warn : T.level === o.ERROR && console.error ? k = console.error : T.level === o.INFO && console.info ? k = console.info : T.level === o.DEBUG && console.debug ? k = console.debug : T.level === o.TRACE && console.trace && (k = console.trace), v.formatter(E, T), I(k, E));
          };
        }, o.useDefaults = function(v) {
          o.setLevel(v && v.defaultLevel || o.DEBUG), o.setHandler(o.createDefaultHandler(v));
        }, o.setDefaults = o.useDefaults, (b = typeof (n = o) == "function" ? n.call(m, f, m, u) : n) === void 0 || (u.exports = b);
      })();
    }, 156: function(u, m, f) {
      var n = this && this.__createBinding || (Object.create ? function(o, c, l, a) {
        a === void 0 && (a = l);
        var s = Object.getOwnPropertyDescriptor(c, l);
        s && !("get" in s ? !c.__esModule : s.writable || s.configurable) || (s = { enumerable: !0, get: function() {
          return c[l];
        } }), Object.defineProperty(o, a, s);
      } : function(o, c, l, a) {
        a === void 0 && (a = l), o[a] = c[l];
      }), b = this && this.__exportStar || function(o, c) {
        for (var l in o) l === "default" || Object.prototype.hasOwnProperty.call(c, l) || n(c, o, l);
      }, h = this && this.__importDefault || function(o) {
        return o && o.__esModule ? o : { default: o };
      };
      Object.defineProperty(m, "__esModule", { value: !0 }), m.Logger = void 0;
      var g = f(586);
      Object.defineProperty(m, "Logger", { enumerable: !0, get: function() {
        return h(g).default;
      } }), b(f(284), m), b(f(280), m), b(f(738), m), b(f(767), m);
    }, 738: (u, m) => {
      var f;
      Object.defineProperty(m, "__esModule", { value: !0 }), m.QualityLimitationReason = void 0, function(n) {
        n[n.none = 0] = "none", n[n.cpu = 1] = "cpu", n[n.bandwidth = 2] = "bandwidth", n[n.other = 3] = "other";
      }(f || (m.QualityLimitationReason = f = {}));
    }, 280: (u, m) => {
      Object.defineProperty(m, "__esModule", { value: !0 });
    }, 767: (u, m) => {
      Object.defineProperty(m, "__esModule", { value: !0 });
    }, 185: (u, m) => {
      Object.defineProperty(m, "__esModule", { value: !0 }), m.calculatePacketsLostRatio = m.calculateRate = m.getMediaKind = void 0, m.getMediaKind = (f) => {
        let n = f.kind || f.mediaType;
        return ["audio", "video"].includes(n) || f.type !== "inbound-rtp" || (n = f.id.toLocaleLowerCase().includes("video") ? "video" : "audio"), n;
      }, m.calculateRate = (f, n, b, h) => b && h ? (n - h) / ((f - b) / 1e3) : 0, m.calculatePacketsLostRatio = (f, n, b, h) => n == 0 ? 0 : (f - (b != null ? b : 0)) / (n - (h != null ? h : 0));
    }, 284: function(u, m, f) {
      var n, b, h, g, o, c, l, a, s, p, d, y, v, S, I, E, T = this && this.__awaiter || function(W, F, V, X) {
        return new (V || (V = Promise))(function(B, $) {
          function z(te) {
            try {
              ee(X.next(te));
            } catch (le) {
              $(le);
            }
          }
          function q(te) {
            try {
              ee(X.throw(te));
            } catch (le) {
              $(le);
            }
          }
          function ee(te) {
            var le;
            te.done ? B(te.value) : (le = te.value, le instanceof V ? le : new V(function(ye) {
              ye(le);
            })).then(z, q);
          }
          ee((X = X.apply(W, F || [])).next());
        });
      }, x = this && this.__classPrivateFieldSet || function(W, F, V, X, B) {
        if (X === "m") throw new TypeError("Private method is not writable");
        if (X === "a" && !B) throw new TypeError("Private accessor was defined without a setter");
        if (typeof F == "function" ? W !== F || !B : !F.has(W)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
        return X === "a" ? B.call(W, V) : B ? B.value = V : F.set(W, V), V;
      }, k = this && this.__classPrivateFieldGet || function(W, F, V, X) {
        if (V === "a" && !X) throw new TypeError("Private accessor was defined without a getter");
        if (typeof F == "function" ? W !== F || !X : !F.has(W)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
        return V === "m" ? X : V === "a" ? X.call(W) : X ? X.value : F.get(W);
      }, _ = this && this.__importDefault || function(W) {
        return W && W.__esModule ? W : { default: W };
      };
      Object.defineProperty(m, "__esModule", { value: !0 }), m.WebRTCStats = void 0;
      const L = f(7), N = _(f(586)), O = f(738), j = f(185);
      class G extends L.EventEmitter {
        constructor(F) {
          super(), n.add(this), b.set(this, void 0), h.set(this, void 0), g.set(this, void 0), o.set(this, null), c.set(this, void 0), l.set(this, null), this.start = () => {
            k(this, c, "f").info("WebRTC statistics collection is starting..."), x(this, l, null, "f"), x(this, o, setInterval(k(this, a, "f"), k(this, h, "f")), "f");
          }, this.stop = () => {
            k(this, o, "f") && (clearInterval(k(this, o, "f")), x(this, o, null, "f"), k(this, c, "f").info("WebRTC statistics collection has stopped."));
          }, a.set(this, () => T(this, void 0, void 0, function* () {
            let V, X;
            try {
              k(this, c, "f").trace("Requesting WebRTC statistics..."), V = yield k(this, b, "f").call(this), X = (/* @__PURE__ */ new Date()).toISOString();
            } catch (z) {
              return k(this, c, "f").error("Problem collecting the WebRTC statistics.", z), void this.emit("error", "Problem collecting the WebRTC statistics - ".concat(z));
            }
            const B = Array.from(V.values()), $ = { timestamp: X, input: { audio: [], video: [] }, output: { audio: [], video: [] } };
            k(this, g, "f") && ($.rawStats = V);
            for (let z = 0; z < Object.keys(B).length; z++) {
              const q = B[z];
              switch (q.type) {
                case "outbound-rtp":
                  const ee = q, te = (0, j.getMediaKind)(ee);
                  te === "audio" ? yield k(this, n, "m", d).call(this, V, ee, $) : te === "video" && (yield k(this, n, "m", y).call(this, V, ee, $));
                  break;
                case "inbound-rtp":
                  const le = q;
                  let ye = (0, j.getMediaKind)(le);
                  ye === "audio" ? yield k(this, n, "m", S).call(this, V, le, $) : ye === "video" && (yield k(this, n, "m", I).call(this, V, le, $));
                  break;
                case "candidate-pair":
                  const Ce = q;
                  Ce.nominated && k(this, n, "m", E).call(this, Ce, $);
              }
            }
            x(this, l, $, "f"), this.emit("stats", $);
          })), x(this, c, N.default.get("WebRTCStats"), "f"), x(this, b, F.getStats, "f"), x(this, h, F.getStatsInterval || 1e3, "f"), x(this, g, !!F.includeRawStats, "f");
        }
      }
      m.WebRTCStats = G, b = /* @__PURE__ */ new WeakMap(), h = /* @__PURE__ */ new WeakMap(), g = /* @__PURE__ */ new WeakMap(), o = /* @__PURE__ */ new WeakMap(), c = /* @__PURE__ */ new WeakMap(), l = /* @__PURE__ */ new WeakMap(), a = /* @__PURE__ */ new WeakMap(), n = /* @__PURE__ */ new WeakSet(), s = function(W, F) {
        if (F) {
          const V = W.get(F);
          if (V) return { mimeType: V.mimeType };
        }
        return {};
      }, p = function(W, F, V) {
        return T(this, void 0, void 0, function* () {
          var X, B, $, z;
          const q = (0, j.calculateRate)(F.timestamp, F.bytesSent, V == null ? void 0 : V.timestamp, V == null ? void 0 : V.totalBytesSent), ee = (0, j.calculateRate)(F.timestamp, F.packetsSent, V == null ? void 0 : V.timestamp, V == null ? void 0 : V.totalPacketsSent), te = k(this, n, "m", s).call(this, W, F.codecId);
          return Object.assign({ id: F.id, timestamp: F.timestamp, mid: F.mid, totalBytesSent: F.bytesSent, bytesSentDelta: F.bytesSent - ((X = V == null ? void 0 : V.totalBytesSent) !== null && X !== void 0 ? X : 0), totalPacketsSent: F.packetsSent, packetsSentDelta: F.packetsSent - ((B = V == null ? void 0 : V.totalPacketsSent) !== null && B !== void 0 ? B : 0), bitrate: q, packetRate: ee, targetBitrate: F.targetBitrate, retransmittedPacketsSent: F.retransmittedPacketsSent, retransmittedPacketsSentDelta: F.retransmittedPacketsSent - (($ = V == null ? void 0 : V.retransmittedPacketsSent) !== null && $ !== void 0 ? $ : 0), retransmittedBytesSent: F.retransmittedBytesSent, retransmittedBytesSentDelta: F.retransmittedBytesSent - ((z = V == null ? void 0 : V.retransmittedBytesSent) !== null && z !== void 0 ? z : 0) }, te);
        });
      }, d = function(W, F, V) {
        return T(this, void 0, void 0, function* () {
          var X;
          const B = (X = k(this, l, "f")) === null || X === void 0 ? void 0 : X.output.audio.find((q) => q.id === F.id);
          if (B && F.timestamp - B.timestamp <= 0) return;
          const $ = yield k(this, n, "m", p).call(this, W, F, B), z = Object.assign({}, $);
          V.output.audio.push(z);
        });
      }, y = function(W, F, V) {
        return T(this, void 0, void 0, function* () {
          var X;
          const B = (X = k(this, l, "f")) === null || X === void 0 ? void 0 : X.output.video.find((ee) => ee.id === F.id);
          if (B && F.timestamp - B.timestamp <= 0) return;
          const $ = yield k(this, n, "m", p).call(this, W, F, B);
          let z = O.QualityLimitationReason.none;
          F.qualityLimitationReason && (z = F.qualityLimitationReason);
          const q = Object.assign(Object.assign({}, $), { frameWidth: F.frameWidth, frameHeight: F.frameHeight, framesPerSecond: F.framesPerSecond, framesSent: F.framesSent, qualityLimitationReason: z, qualityLimitationDurations: F.qualityLimitationDurations });
          V.output.video.push(q);
        });
      }, v = function(W, F, V) {
        return T(this, void 0, void 0, function* () {
          var X, B;
          const $ = (0, j.calculateRate)(F.timestamp, F.bytesReceived, V == null ? void 0 : V.timestamp, V == null ? void 0 : V.totalBytesReceived), z = (0, j.calculateRate)(F.timestamp, F.packetsReceived, V == null ? void 0 : V.timestamp, V == null ? void 0 : V.totalPacketsReceived), q = (0, j.calculatePacketsLostRatio)(F.packetsReceived, F.packetsLost, V == null ? void 0 : V.totalPacketsReceived, V == null ? void 0 : V.totalPacketsLost), ee = ((X = F.packetsLost) !== null && X !== void 0 ? X : 0) - ((B = V == null ? void 0 : V.totalPacketsLost) !== null && B !== void 0 ? B : 0), te = k(this, n, "m", s).call(this, W, F.codecId);
          return Object.assign({ id: F.id, timestamp: F.timestamp, mid: F.mid, trackIdentifier: F.trackIdentifier, jitter: F.jitter, jitterBufferDelay: F.jitterBufferDelay, jitterBufferEmittedCount: F.jitterBufferEmittedCount, totalBytesReceived: F.bytesReceived, totalPacketsReceived: F.packetsReceived, totalPacketsLost: F.packetsLost, bitrate: $, packetRate: z, packetLossRatio: q, packetLossDelta: ee }, te);
        });
      }, S = function(W, F, V) {
        return T(this, void 0, void 0, function* () {
          var X;
          const B = (X = k(this, l, "f")) === null || X === void 0 ? void 0 : X.input.audio.find((z) => z.id === F.id);
          if (B && F.timestamp - B.timestamp <= 0) return;
          const $ = yield k(this, n, "m", v).call(this, W, F, B);
          V.input.audio.push($);
        });
      }, I = function(W, F, V) {
        return T(this, void 0, void 0, function* () {
          var X;
          const B = (X = k(this, l, "f")) === null || X === void 0 ? void 0 : X.input.video.find((q) => q.id === F.id);
          if (B && F.timestamp - B.timestamp <= 0) return;
          const $ = yield k(this, n, "m", v).call(this, W, F, B), z = Object.assign(Object.assign({}, $), { keyFramesDecoded: F.keyFramesDecoded, frameHeight: F.frameHeight, frameWidth: F.frameWidth, framesDecoded: F.framesDecoded, framesDropped: F.framesDropped, framesPerSecond: F.framesPerSecond, framesReceived: F.framesReceived });
          V.input.video.push(z);
        });
      }, E = function(W, F) {
        F.totalRoundTripTime = W.totalRoundTripTime, F.currentRoundTripTime = W.currentRoundTripTime, F.responsesReceived = W.responsesReceived, F.availableOutgoingBitrate = W.availableOutgoingBitrate, F.availableIncomingBitrate = W.availableIncomingBitrate;
      };
    } }, i = {}, function u(m) {
      var f = i[m];
      if (f !== void 0) return f.exports;
      var n = i[m] = { exports: {} };
      return t[m].call(n.exports, n, n.exports, u), n.exports;
    }(156);
    var t, i;
  });
})(As);
var Gi = As.exports;
const rr = Fe.get("PeerConnectionStats"), Ls = {
  stats: "stats"
}, Xi = (r) => {
  const f = r, { input: e, output: t, rawStats: i } = f, u = Ye(f, ["input", "output", "rawStats"]);
  return we(J({}, u), {
    audio: {
      inbounds: r.input.audio.map(
        (o) => {
          var c = o, {
            packetLossRatio: n = 0,
            packetLossDelta: b = 0,
            bitrate: h = 0
          } = c, g = Ye(c, [
            "packetLossRatio",
            "packetLossDelta",
            "bitrate"
          ]);
          return J({
            packetsLostRatioPerSecond: n,
            packetsLostDeltaPerSecond: b,
            bitrateBitsPerSecond: h * 8,
            bitrate: h
          }, g);
        }
      ),
      outbounds: r.output.audio.map((h) => {
        var g = h, { bitrate: n = 0 } = g, b = Ye(g, ["bitrate"]);
        return J({
          bitrateBitsPerSecond: n * 8,
          bitrate: n
        }, b);
      })
    },
    video: {
      inbounds: r.input.video.map(
        (o) => {
          var c = o, {
            packetLossRatio: n = 0,
            packetLossDelta: b = 0,
            bitrate: h = 0
          } = c, g = Ye(c, [
            "packetLossRatio",
            "packetLossDelta",
            "bitrate"
          ]);
          return J({
            packetsLostRatioPerSecond: n,
            packetsLostDeltaPerSecond: b,
            bitrateBitsPerSecond: h * 8,
            bitrate: h
          }, g);
        }
      ),
      outbounds: r.output.video.map((h) => {
        var g = h, { bitrate: n = 0 } = g, b = Ye(g, ["bitrate"]);
        return J({
          bitrateBitsPerSecond: n * 8,
          bitrate: n
        }, b);
      })
    },
    raw: r.rawStats
  });
};
class zi extends vr {
  constructor(e, t = { statsIntervalMs: 1e3, autoInitStats: !0 }) {
    super(), this.peer = e, this.collection = null, this.initialized = !1, t.autoInitStats && t.statsIntervalMs && this.init(t.statsIntervalMs);
  }
  /**
   * Initialize the statistics monitoring of the RTCPeerConnection.
   *
   * @param {number} [statsIntervalMs] The interval, in Milliseconds, at which stats need to be returned
   */
  init(e) {
    if (this.initialized) {
      rr.warn(
        "PeerConnectionStats.init() has already been called. Automatic initialization occurs when the PeerConnectionStats object is constructed."
      );
      return;
    }
    rr.info("Initializing peer connection stats");
    const t = this.peer;
    try {
      this.collection = new Gi.WebRTCStats({
        getStatsInterval: e,
        getStats: () => t.getStats(),
        includeRawStats: !0
      }), this.collection.on("stats", (i) => {
        const u = Xi(i);
        Ie.addStats(u), this.emit(Ls.stats, u);
      }), this.collection.start(), this.initialized = !0;
    } catch (i) {
      rr.error(i);
    }
  }
  /**
   * Stops the monitoring of RTCPeerConnection statistics.
   */
  stop() {
    var e;
    rr.info("Stopping peer connection stats"), (e = this.collection) == null || e.stop();
  }
}
var me = {}, Ne = {}, Ds = {}, Ms = { exports: {} }, $n = Ms.exports = {
  v: [{
    name: "version",
    reg: /^(\d*)$/
  }],
  o: [{
    // o=- 20518 0 IN IP4 203.0.113.1
    // NB: sessionId will be a String in most cases because it is huge
    name: "origin",
    reg: /^(\S*) (\d*) (\d*) (\S*) IP(\d) (\S*)/,
    names: ["username", "sessionId", "sessionVersion", "netType", "ipVer", "address"],
    format: "%s %s %d %s IP%d %s"
  }],
  // default parsing of these only (though some of these feel outdated)
  s: [{ name: "name" }],
  i: [{ name: "description" }],
  u: [{ name: "uri" }],
  e: [{ name: "email" }],
  p: [{ name: "phone" }],
  z: [{ name: "timezones" }],
  // TODO: this one can actually be parsed properly...
  r: [{ name: "repeats" }],
  // TODO: this one can also be parsed properly
  // k: [{}], // outdated thing ignored
  t: [{
    // t=0 0
    name: "timing",
    reg: /^(\d*) (\d*)/,
    names: ["start", "stop"],
    format: "%d %d"
  }],
  c: [{
    // c=IN IP4 10.47.197.26
    name: "connection",
    reg: /^IN IP(\d) (\S*)/,
    names: ["version", "ip"],
    format: "IN IP%d %s"
  }],
  b: [{
    // b=AS:4000
    push: "bandwidth",
    reg: /^(TIAS|AS|CT|RR|RS):(\d*)/,
    names: ["type", "limit"],
    format: "%s:%s"
  }],
  m: [{
    // m=video 51744 RTP/AVP 126 97 98 34 31
    // NB: special - pushes to session
    // TODO: rtp/fmtp should be filtered by the payloads found here?
    reg: /^(\w*) (\d*) ([\w/]*)(?: (.*))?/,
    names: ["type", "port", "protocol", "payloads"],
    format: "%s %d %s %s"
  }],
  a: [
    {
      // a=rtpmap:110 opus/48000/2
      push: "rtp",
      reg: /^rtpmap:(\d*) ([\w\-.]*)(?:\s*\/(\d*)(?:\s*\/(\S*))?)?/,
      names: ["payload", "codec", "rate", "encoding"],
      format: function(r) {
        return r.encoding ? "rtpmap:%d %s/%s/%s" : r.rate ? "rtpmap:%d %s/%s" : "rtpmap:%d %s";
      }
    },
    {
      // a=fmtp:108 profile-level-id=24;object=23;bitrate=64000
      // a=fmtp:111 minptime=10; useinbandfec=1
      push: "fmtp",
      reg: /^fmtp:(\d*) ([\S| ]*)/,
      names: ["payload", "config"],
      format: "fmtp:%d %s"
    },
    {
      // a=control:streamid=0
      name: "control",
      reg: /^control:(.*)/,
      format: "control:%s"
    },
    {
      // a=rtcp:65179 IN IP4 193.84.77.194
      name: "rtcp",
      reg: /^rtcp:(\d*)(?: (\S*) IP(\d) (\S*))?/,
      names: ["port", "netType", "ipVer", "address"],
      format: function(r) {
        return r.address != null ? "rtcp:%d %s IP%d %s" : "rtcp:%d";
      }
    },
    {
      // a=rtcp-fb:98 trr-int 100
      push: "rtcpFbTrrInt",
      reg: /^rtcp-fb:(\*|\d*) trr-int (\d*)/,
      names: ["payload", "value"],
      format: "rtcp-fb:%s trr-int %d"
    },
    {
      // a=rtcp-fb:98 nack rpsi
      push: "rtcpFb",
      reg: /^rtcp-fb:(\*|\d*) ([\w-_]*)(?: ([\w-_]*))?/,
      names: ["payload", "type", "subtype"],
      format: function(r) {
        return r.subtype != null ? "rtcp-fb:%s %s %s" : "rtcp-fb:%s %s";
      }
    },
    {
      // a=extmap:2 urn:ietf:params:rtp-hdrext:toffset
      // a=extmap:1/recvonly URI-gps-string
      // a=extmap:3 urn:ietf:params:rtp-hdrext:encrypt urn:ietf:params:rtp-hdrext:smpte-tc 25@600/24
      push: "ext",
      reg: /^extmap:(\d+)(?:\/(\w+))?(?: (urn:ietf:params:rtp-hdrext:encrypt))? (\S*)(?: (\S*))?/,
      names: ["value", "direction", "encrypt-uri", "uri", "config"],
      format: function(r) {
        return "extmap:%d" + (r.direction ? "/%s" : "%v") + (r["encrypt-uri"] ? " %s" : "%v") + " %s" + (r.config ? " %s" : "");
      }
    },
    {
      // a=extmap-allow-mixed
      name: "extmapAllowMixed",
      reg: /^(extmap-allow-mixed)/
    },
    {
      // a=crypto:1 AES_CM_128_HMAC_SHA1_80 inline:PS1uQCVeeCFCanVmcjkpPywjNWhcYD0mXXtxaVBR|2^20|1:32
      push: "crypto",
      reg: /^crypto:(\d*) ([\w_]*) (\S*)(?: (\S*))?/,
      names: ["id", "suite", "config", "sessionConfig"],
      format: function(r) {
        return r.sessionConfig != null ? "crypto:%d %s %s %s" : "crypto:%d %s %s";
      }
    },
    {
      // a=setup:actpass
      name: "setup",
      reg: /^setup:(\w*)/,
      format: "setup:%s"
    },
    {
      // a=connection:new
      name: "connectionType",
      reg: /^connection:(new|existing)/,
      format: "connection:%s"
    },
    {
      // a=mid:1
      name: "mid",
      reg: /^mid:([^\s]*)/,
      format: "mid:%s"
    },
    {
      // a=msid:0c8b064d-d807-43b4-b434-f92a889d8587 98178685-d409-46e0-8e16-7ef0db0db64a
      name: "msid",
      reg: /^msid:(.*)/,
      format: "msid:%s"
    },
    {
      // a=ptime:20
      name: "ptime",
      reg: /^ptime:(\d*(?:\.\d*)*)/,
      format: "ptime:%d"
    },
    {
      // a=maxptime:60
      name: "maxptime",
      reg: /^maxptime:(\d*(?:\.\d*)*)/,
      format: "maxptime:%d"
    },
    {
      // a=sendrecv
      name: "direction",
      reg: /^(sendrecv|recvonly|sendonly|inactive)/
    },
    {
      // a=ice-lite
      name: "icelite",
      reg: /^(ice-lite)/
    },
    {
      // a=ice-ufrag:F7gI
      name: "iceUfrag",
      reg: /^ice-ufrag:(\S*)/,
      format: "ice-ufrag:%s"
    },
    {
      // a=ice-pwd:x9cml/YzichV2+XlhiMu8g
      name: "icePwd",
      reg: /^ice-pwd:(\S*)/,
      format: "ice-pwd:%s"
    },
    {
      // a=fingerprint:SHA-1 00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33
      name: "fingerprint",
      reg: /^fingerprint:(\S*) (\S*)/,
      names: ["type", "hash"],
      format: "fingerprint:%s %s"
    },
    {
      // a=candidate:0 1 UDP 2113667327 203.0.113.1 54400 typ host
      // a=candidate:1162875081 1 udp 2113937151 192.168.34.75 60017 typ host generation 0 network-id 3 network-cost 10
      // a=candidate:3289912957 2 udp 1845501695 193.84.77.194 60017 typ srflx raddr 192.168.34.75 rport 60017 generation 0 network-id 3 network-cost 10
      // a=candidate:229815620 1 tcp 1518280447 192.168.150.19 60017 typ host tcptype active generation 0 network-id 3 network-cost 10
      // a=candidate:3289912957 2 tcp 1845501695 193.84.77.194 60017 typ srflx raddr 192.168.34.75 rport 60017 tcptype passive generation 0 network-id 3 network-cost 10
      push: "candidates",
      reg: /^candidate:(\S*) (\d*) (\S*) (\d*) (\S*) (\d*) typ (\S*)(?: raddr (\S*) rport (\d*))?(?: tcptype (\S*))?(?: generation (\d*))?(?: network-id (\d*))?(?: network-cost (\d*))?/,
      names: ["foundation", "component", "transport", "priority", "ip", "port", "type", "raddr", "rport", "tcptype", "generation", "network-id", "network-cost"],
      format: function(r) {
        var e = "candidate:%s %d %s %d %s %d typ %s";
        return e += r.raddr != null ? " raddr %s rport %d" : "%v%v", e += r.tcptype != null ? " tcptype %s" : "%v", r.generation != null && (e += " generation %d"), e += r["network-id"] != null ? " network-id %d" : "%v", e += r["network-cost"] != null ? " network-cost %d" : "%v", e;
      }
    },
    {
      // a=end-of-candidates (keep after the candidates line for readability)
      name: "endOfCandidates",
      reg: /^(end-of-candidates)/
    },
    {
      // a=remote-candidates:1 203.0.113.1 54400 2 203.0.113.1 54401 ...
      name: "remoteCandidates",
      reg: /^remote-candidates:(.*)/,
      format: "remote-candidates:%s"
    },
    {
      // a=ice-options:google-ice
      name: "iceOptions",
      reg: /^ice-options:(\S*)/,
      format: "ice-options:%s"
    },
    {
      // a=ssrc:2566107569 cname:t9YU8M1UxTF8Y1A1
      push: "ssrcs",
      reg: /^ssrc:(\d*) ([\w_-]*)(?::(.*))?/,
      names: ["id", "attribute", "value"],
      format: function(r) {
        var e = "ssrc:%d";
        return r.attribute != null && (e += " %s", r.value != null && (e += ":%s")), e;
      }
    },
    {
      // a=ssrc-group:FEC 1 2
      // a=ssrc-group:FEC-FR 3004364195 1080772241
      push: "ssrcGroups",
      // token-char = %x21 / %x23-27 / %x2A-2B / %x2D-2E / %x30-39 / %x41-5A / %x5E-7E
      reg: /^ssrc-group:([\x21\x23\x24\x25\x26\x27\x2A\x2B\x2D\x2E\w]*) (.*)/,
      names: ["semantics", "ssrcs"],
      format: "ssrc-group:%s %s"
    },
    {
      // a=msid-semantic: WMS Jvlam5X3SX1OP6pn20zWogvaKJz5Hjf9OnlV
      name: "msidSemantic",
      reg: /^msid-semantic:\s?(\w*) (\S*)/,
      names: ["semantic", "token"],
      format: "msid-semantic: %s %s"
      // space after ':' is not accidental
    },
    {
      // a=group:BUNDLE audio video
      push: "groups",
      reg: /^group:(\w*) (.*)/,
      names: ["type", "mids"],
      format: "group:%s %s"
    },
    {
      // a=rtcp-mux
      name: "rtcpMux",
      reg: /^(rtcp-mux)/
    },
    {
      // a=rtcp-rsize
      name: "rtcpRsize",
      reg: /^(rtcp-rsize)/
    },
    {
      // a=sctpmap:5000 webrtc-datachannel 1024
      name: "sctpmap",
      reg: /^sctpmap:([\w_/]*) (\S*)(?: (\S*))?/,
      names: ["sctpmapNumber", "app", "maxMessageSize"],
      format: function(r) {
        return r.maxMessageSize != null ? "sctpmap:%s %s %s" : "sctpmap:%s %s";
      }
    },
    {
      // a=x-google-flag:conference
      name: "xGoogleFlag",
      reg: /^x-google-flag:([^\s]*)/,
      format: "x-google-flag:%s"
    },
    {
      // a=rid:1 send max-width=1280;max-height=720;max-fps=30;depend=0
      push: "rids",
      reg: /^rid:([\d\w]+) (\w+)(?: ([\S| ]*))?/,
      names: ["id", "direction", "params"],
      format: function(r) {
        return r.params ? "rid:%s %s %s" : "rid:%s %s";
      }
    },
    {
      // a=imageattr:97 send [x=800,y=640,sar=1.1,q=0.6] [x=480,y=320] recv [x=330,y=250]
      // a=imageattr:* send [x=800,y=640] recv *
      // a=imageattr:100 recv [x=320,y=240]
      push: "imageattrs",
      reg: new RegExp(
        // a=imageattr:97
        "^imageattr:(\\d+|\\*)[\\s\\t]+(send|recv)[\\s\\t]+(\\*|\\[\\S+\\](?:[\\s\\t]+\\[\\S+\\])*)(?:[\\s\\t]+(recv|send)[\\s\\t]+(\\*|\\[\\S+\\](?:[\\s\\t]+\\[\\S+\\])*))?"
      ),
      names: ["pt", "dir1", "attrs1", "dir2", "attrs2"],
      format: function(r) {
        return "imageattr:%s %s %s" + (r.dir2 ? " %s %s" : "");
      }
    },
    {
      // a=simulcast:send 1,2,3;~4,~5 recv 6;~7,~8
      // a=simulcast:recv 1;4,5 send 6;7
      name: "simulcast",
      reg: new RegExp(
        // a=simulcast:
        "^simulcast:(send|recv) ([a-zA-Z0-9\\-_~;,]+)(?:\\s?(send|recv) ([a-zA-Z0-9\\-_~;,]+))?$"
      ),
      names: ["dir1", "list1", "dir2", "list2"],
      format: function(r) {
        return "simulcast:%s %s" + (r.dir2 ? " %s %s" : "");
      }
    },
    {
      // old simulcast draft 03 (implemented by Firefox)
      //   https://tools.ietf.org/html/draft-ietf-mmusic-sdp-simulcast-03
      // a=simulcast: recv pt=97;98 send pt=97
      // a=simulcast: send rid=5;6;7 paused=6,7
      name: "simulcast_03",
      reg: /^simulcast:[\s\t]+([\S+\s\t]+)$/,
      names: ["value"],
      format: "simulcast: %s"
    },
    {
      // a=framerate:25
      // a=framerate:29.97
      name: "framerate",
      reg: /^framerate:(\d+(?:$|\.\d+))/,
      format: "framerate:%s"
    },
    {
      // RFC4570
      // a=source-filter: incl IN IP4 239.5.2.31 10.1.15.5
      name: "sourceFilter",
      reg: /^source-filter: *(excl|incl) (\S*) (IP4|IP6|\*) (\S*) (.*)/,
      names: ["filterMode", "netType", "addressTypes", "destAddress", "srcList"],
      format: "source-filter: %s %s %s %s %s"
    },
    {
      // a=bundle-only
      name: "bundleOnly",
      reg: /^(bundle-only)/
    },
    {
      // a=label:1
      name: "label",
      reg: /^label:(.+)/,
      format: "label:%s"
    },
    {
      // RFC version 26 for SCTP over DTLS
      // https://tools.ietf.org/html/draft-ietf-mmusic-sctp-sdp-26#section-5
      name: "sctpPort",
      reg: /^sctp-port:(\d+)$/,
      format: "sctp-port:%s"
    },
    {
      // RFC version 26 for SCTP over DTLS
      // https://tools.ietf.org/html/draft-ietf-mmusic-sctp-sdp-26#section-6
      name: "maxMessageSize",
      reg: /^max-message-size:(\d+)$/,
      format: "max-message-size:%s"
    },
    {
      // RFC7273
      // a=ts-refclk:ptp=IEEE1588-2008:39-A7-94-FF-FE-07-CB-D0:37
      push: "tsRefClocks",
      reg: /^ts-refclk:([^\s=]*)(?:=(\S*))?/,
      names: ["clksrc", "clksrcExt"],
      format: function(r) {
        return "ts-refclk:%s" + (r.clksrcExt != null ? "=%s" : "");
      }
    },
    {
      // RFC7273
      // a=mediaclk:direct=963214424
      name: "mediaClk",
      reg: /^mediaclk:(?:id=(\S*))? *([^\s=]*)(?:=(\S*))?(?: *rate=(\d+)\/(\d+))?/,
      names: ["id", "mediaClockName", "mediaClockValue", "rateNumerator", "rateDenominator"],
      format: function(r) {
        var e = "mediaclk:";
        return e += r.id != null ? "id=%s %s" : "%v%s", e += r.mediaClockValue != null ? "=%s" : "", e += r.rateNumerator != null ? " rate=%s" : "", e += r.rateDenominator != null ? "/%s" : "", e;
      }
    },
    {
      // a=keywds:keywords
      name: "keywords",
      reg: /^keywds:(.+)$/,
      format: "keywds:%s"
    },
    {
      // a=content:main
      name: "content",
      reg: /^content:(.+)/,
      format: "content:%s"
    },
    // BFCP https://tools.ietf.org/html/rfc4583
    {
      // a=floorctrl:c-s
      name: "bfcpFloorCtrl",
      reg: /^floorctrl:(c-only|s-only|c-s)/,
      format: "floorctrl:%s"
    },
    {
      // a=confid:1
      name: "bfcpConfId",
      reg: /^confid:(\d+)/,
      format: "confid:%s"
    },
    {
      // a=userid:1
      name: "bfcpUserId",
      reg: /^userid:(\d+)/,
      format: "userid:%s"
    },
    {
      // a=floorid:1
      name: "bfcpFloorId",
      reg: /^floorid:(.+) (?:m-stream|mstrm):(.+)/,
      names: ["id", "mStream"],
      format: "floorid:%s mstrm:%s"
    },
    {
      // any a= that we don't understand is kept verbatim on media.invalid
      push: "invalid",
      names: ["value"]
    }
  ]
};
Object.keys($n).forEach(function(r) {
  var e = $n[r];
  e.forEach(function(t) {
    t.reg || (t.reg = /(.*)/), t.format || (t.format = "%s");
  });
});
var Ps = Ms.exports;
(function(r) {
  var e = function(n) {
    return String(Number(n)) === n ? Number(n) : n;
  }, t = function(n, b, h, g) {
    if (g && !h)
      b[g] = e(n[1]);
    else
      for (var o = 0; o < h.length; o += 1)
        n[o + 1] != null && (b[h[o]] = e(n[o + 1]));
  }, i = function(n, b, h) {
    var g = n.name && n.names;
    n.push && !b[n.push] ? b[n.push] = [] : g && !b[n.name] && (b[n.name] = {});
    var o = n.push ? {} : (
      // blank object that will be pushed
      g ? b[n.name] : b
    );
    t(h.match(n.reg), o, n.names, n.name), n.push && b[n.push].push(o);
  }, u = Ps, m = RegExp.prototype.test.bind(/^([a-z])=(.*)/);
  r.parse = function(n) {
    var b = {}, h = [], g = b;
    return n.split(/(\r\n|\r|\n)/).filter(m).forEach(function(o) {
      var c = o[0], l = o.slice(2);
      c === "m" && (h.push({ rtp: [], fmtp: [] }), g = h[h.length - 1]);
      for (var a = 0; a < (u[c] || []).length; a += 1) {
        var s = u[c][a];
        if (s.reg.test(l))
          return i(s, g, l);
      }
    }), b.media = h, b;
  };
  var f = function(n, b) {
    var h = b.split(/=(.+)/, 2);
    return h.length === 2 ? n[h[0]] = e(h[1]) : h.length === 1 && b.length > 1 && (n[h[0]] = void 0), n;
  };
  r.parseParams = function(n) {
    return n.split(/;\s?/).reduce(f, {});
  }, r.parseFmtpConfig = r.parseParams, r.parsePayloads = function(n) {
    return n.toString().split(" ").map(Number);
  }, r.parseRemoteCandidates = function(n) {
    for (var b = [], h = n.split(" ").map(e), g = 0; g < h.length; g += 3)
      b.push({
        component: h[g],
        ip: h[g + 1],
        port: h[g + 2]
      });
    return b;
  }, r.parseImageAttributes = function(n) {
    return n.split(" ").map(function(b) {
      return b.substring(1, b.length - 1).split(",").reduce(f, {});
    });
  }, r.parseSimulcastStreamList = function(n) {
    return n.split(";").map(function(b) {
      return b.split(",").map(function(h) {
        var g, o = !1;
        return h[0] !== "~" ? g = e(h) : (g = e(h.substring(1, h.length)), o = !0), {
          scid: g,
          paused: o
        };
      });
    });
  };
})(Ds);
var Cr = Ps, Yi = /%[sdv%]/g, Ki = function(r) {
  var e = 1, t = arguments, i = t.length;
  return r.replace(Yi, function(u) {
    if (e >= i)
      return u;
    var m = t[e];
    switch (e += 1, u) {
      case "%%":
        return "%";
      case "%s":
        return String(m);
      case "%d":
        return Number(m);
      case "%v":
        return "";
    }
  });
}, It = function(r, e, t) {
  var i = e.format instanceof Function ? e.format(e.push ? t : t[e.name]) : e.format, u = [r + "=" + i];
  if (e.names)
    for (var m = 0; m < e.names.length; m += 1) {
      var f = e.names[m];
      e.name ? u.push(t[e.name][f]) : u.push(t[e.names[m]]);
    }
  else
    u.push(t[e.name]);
  return Ki.apply(null, u);
}, Hi = [
  "v",
  "o",
  "s",
  "i",
  "u",
  "e",
  "p",
  "c",
  "b",
  "t",
  "r",
  "z",
  "a"
], Ji = ["i", "c", "b", "a"], Qi = function(r, e) {
  e = e || {}, r.version == null && (r.version = 0), r.name == null && (r.name = " "), r.media.forEach(function(m) {
    m.payloads == null && (m.payloads = "");
  });
  var t = e.outerOrder || Hi, i = e.innerOrder || Ji, u = [];
  return t.forEach(function(m) {
    Cr[m].forEach(function(f) {
      f.name in r && r[f.name] != null ? u.push(It(m, f, r)) : f.push in r && r[f.push] != null && r[f.push].forEach(function(n) {
        u.push(It(m, f, n));
      });
    });
  }), r.media.forEach(function(m) {
    u.push(It("m", Cr.m[0], m)), i.forEach(function(f) {
      Cr[f].forEach(function(n) {
        n.name in m && m[n.name] != null ? u.push(It(f, n, m)) : n.push in m && m[n.push] != null && m[n.push].forEach(function(b) {
          u.push(It(f, n, b));
        });
      });
    });
  }), u.join("\r\n") + "\r\n";
}, it = Ds, qi = Qi;
Ne.write = qi;
Ne.parse = it.parse;
Ne.parseParams = it.parseParams;
Ne.parseFmtpConfig = it.parseFmtpConfig;
Ne.parsePayloads = it.parsePayloads;
Ne.parseRemoteCandidates = it.parseRemoteCandidates;
Ne.parseImageAttributes = it.parseImageAttributes;
Ne.parseSimulcastStreamList = it.parseSimulcastStreamList;
var eo = function(r) {
  const e = new Intl.Collator(r, { sensitivity: "base" });
  return (t, i) => e.compare(t, i) == 0;
};
let Lt = class Zs {
  /**
   * CanditateInfo constructor
   * @constructor
   * @alias CandidateInfo
   * @param {String} foundation
   * @param {Number} componentId
   * @param {String} transport
   * @param {Number} priority
   * @param {String} address
   * @param {Number} port
   * @param {String} type
   * @param {String} [relAddr]
   * @param {Number} [relPort]
   */
  constructor(e, t, i, u, m, f, n, b, h) {
    this.foundation = e, this.componentId = t, this.transport = i, this.priority = u, this.address = m, this.port = f, this.type = n, this.relAddr = b, this.relPort = h;
  }
  /**
   * Check if the ice candadate has same info as us
   * @param {CandidateInfo} candidate - ICE candadate to check against
   * @returns {Boolean}
   */
  equals(e) {
    return e.foundation === this.foundation && e.componentId === this.componentId && e.transport === this.transport && e.priority === this.priority && e.address === this.address && e.port === this.port && e.type === this.type && e.relAddr === this.relAddr && e.relPort === this.relPort;
  }
  /**
   * Create a clone of this Candidate info object
   * @returns {CandidateInfo}
   */
  clone() {
    return new Zs(this.foundation, this.componentId, this.transport, this.priority, this.address, this.port, this.type, this.relAddr, this.relPort);
  }
  /**
   * Return a plain javascript object which can be converted to JSON
   * @returns {CandidateInfoPlain} Plain javascript object
   */
  plain() {
    const e = (
      /** @type {CandidateInfoPlain} */
      {
        foundation: this.foundation,
        componentId: this.componentId,
        transport: this.transport,
        priority: this.priority,
        address: this.address,
        port: this.port,
        type: this.type
      }
    );
    return this.relAddr && (e.relAddr = this.relAddr), this.relPort && (e.relPort = this.relPort), e;
  }
  /**
   * Get the candidate foundation
   * @returns {String}
   */
  getFoundation() {
    return this.foundation;
  }
  /**
   * Get the candidate component id
   * @returns {Number}
   */
  getComponentId() {
    return this.componentId;
  }
  /**
   * Get the candidate transport type
   * @returns {String}
   */
  getTransport() {
    return this.transport;
  }
  /**
   * Get the candidate priority
   * @returns {Number}
   */
  getPriority() {
    return this.priority;
  }
  /**
   * Get the candidate IP address
   * @returns {String}
   */
  getAddress() {
    return this.address;
  }
  /**
   * Get the candidate IP port
   * @returns {Number}
   */
  getPort() {
    return this.port;
  }
  /**
   * Get the candidate type
   * @returns {String}
   */
  getType() {
    return this.type;
  }
  /**
   * Get the candidate related IP address for relfexive candidates
   * @returns {String | undefined}
   */
  getRelAddr() {
    return this.relAddr;
  }
  /**
   * Get the candidate related IP port for relfexive candidates
   * @returns {Number | undefined}
   */
  getRelPort() {
    return this.relPort;
  }
};
Lt.expand = function(r) {
  return r.constructor.name === "CandidateInfo" ? (
    /** @type {CandidateInfo} */
    r
  ) : (r = /** @type {CandidateInfoPlain} */
  r, new Lt(r.foundation, r.componentId, r.transport, r.priority, r.address, r.port, r.type, r.relAddr, r.relPort));
};
Lt.clone = function(r) {
  return r.constructor.name === "CandidateInfo" ? (
    /** @type {CandidateInfo} */
    r.clone()
  ) : Lt.expand(r);
};
var Us = Lt;
let Dt = class Fs {
  /**
   * @constructor
   * @alias RTCPFeedbackInfo
   * @param {String} id		- RTCP feedback id
   * @param {Array<String>} params - RTCP feedback params
   */
  constructor(e, t) {
    this.id = e, this.params = t || [];
  }
  /**
   * Create a clone of this RTCPFeedbackParameter info object
   * @returns {RTCPFeedbackInfo}
   */
  clone() {
    return new Fs(this.id, this.params);
  }
  /**
   * Return a plain javascript object which can be converted to JSON
   * @returns {RTCPFeedbackInfoPlain} Plain javascript object
   */
  plain() {
    return this.params.length ? {
      id: this.id,
      params: this.params
    } : {
      id: this.id
    };
  }
  /**
   * Get id fo the rtcp feedback parameter
   * @returns {String}
   */
  getId() {
    return this.id;
  }
  /**
   * Get codec  rtcp feedback parameters
   * @returns {Array<String>} parameters
   */
  getParams() {
    return this.params;
  }
};
Dt.expand = function(r) {
  return r.constructor.name === "RTCPFeedbackInfo" ? (
    /** @type {RTCPFeedbackInfo} */
    r
  ) : (r = /** @type {RTCPFeedbackInfoPlain} */
  r, new Dt(r.id, r.params));
};
Dt.clone = function(r) {
  return r.constructor.name === "RTCPFeedbackInfo" ? (
    /** @type {RTCPFeedbackInfo} */
    r.clone()
  ) : Dt.expand(r);
};
var on = Dt;
const Ns = on;
let tt = class Os {
  /**
   * @constructor
   * @alias CodecInfo
   * @param {String} codec	- Codec name
   * @param {Number} type		- the payload type number
   * @param {{[k: string]: string}} [params]	- Format params for codec
   */
  constructor(e, t, i) {
    this.codec = e, this.type = t, this.params = /** @type {{[k: string]: string}} */
    {}, this.rtcpfbs = /** @type {Set<RTCPFeedbackInfo>} */
    /* @__PURE__ */ new Set(), i && this.addParams(i);
  }
  /**
   * Create a clone of this Codec info object
   * @returns {CodecInfo}
   */
  clone() {
    const e = new Os(this.codec, this.type, this.params);
    this.hasRTX() && e.setRTX(this.getRTX());
    for (const t of this.rtcpfbs)
      e.addRTCPFeedback(t.clone());
    return this.hasChannels() && e.setChannels(this.getChannels()), e;
  }
  /**
   * Return a plain javascript object which can be converted to JSON
   * @returns {CodecInfoPlain} Plain javascript object
   */
  plain() {
    const e = (
      /** @type {CodecInfoPlain} */
      {
        codec: this.codec,
        type: this.type
      }
    );
    this.rtx && (e.rtx = this.rtx), this.channels && (e.channels = this.channels), Object.keys(this.params).length && (e.params = this.params);
    for (const t of this.rtcpfbs)
      e.rtcpfbs || (e.rtcpfbs = []), e.rtcpfbs.push(t.plain());
    return e;
  }
  /**
   * Set the RTX payload type number for this codec
   * @param {Number} rtx
   */
  setRTX(e) {
    this.rtx = e;
  }
  /**
   * Get payload type for codec
   * @returns {Number}
   */
  getType() {
    return this.type;
  }
  /**
   * Set the payload type for codec
   * @param {Number} type
   */
  setType(e) {
    this.type = e;
  }
  /**
   * Get codec name
   * @returns {String}
   */
  getCodec() {
    return this.codec;
  }
  /**
   * Get codec format parameters
   */
  getParams() {
    return this.params;
  }
  /**
   * Add codec info params
   * @param {{[k: string]: string}} params
   */
  addParams(e) {
    for (const t in e)
      this.params[t] = e[t];
  }
  /**
   * Add codec info param
   * @param {String} key
   * @param {String} value
   */
  addParam(e, t) {
    this.params[e] = t;
  }
  /**
   * Check if codec has requested param
   * @param {String} key
   * @returns {Boolean}
   */
  hasParam(e) {
    return Object.hasOwnProperty.call(this.params, e);
  }
  /**
   * Get param
   * @param {String} key
   * @param {String} defaultValue default value if param is not found
   * @returns {String}
   */
  getParam(e, t = void 0) {
    if (this.hasParam(e))
      return this.params[e];
    if (t === void 0)
      throw new Error("param ".concat(e, " not found and no default value provided"));
    return "" + t;
  }
  /**
   * Check if this codec has an associated RTX payload type
   * @returns {Number}
   */
  hasRTX() {
    return this.rtx;
  }
  /**
   * Get the associated RTX payload type for this codec
   * @returns {Number}
   */
  getRTX() {
    return this.rtx;
  }
  /**
   * Check if this codec has number of channels
   * @returns {Number}
   */
  hasChannels() {
    return this.channels;
  }
  /**
   * Get the number of channels
   * @returns {Number}
   */
  getChannels() {
    return this.channels;
  }
  /**
   * Set the number of channels
   * @param {Number} channels
   */
  setChannels(e) {
    this.channels = e;
  }
  /**
   * Add an RTCP feedback parameter to this codec type
   * @param {RTCPFeedbackInfo} rtcpfb - RTCP feedback info object
   */
  addRTCPFeedback(e) {
    this.rtcpfbs.add(e);
  }
  /**
   * Get all extensions rtcp feedback parameters in this codec info
   * @returns {Set<RTCPFeedbackInfo>}
   */
  getRTCPFeedbacks() {
    return this.rtcpfbs;
  }
};
tt.expand = function(r) {
  if (r.constructor.name === "CodecInfo")
    return (
      /** @type {CodecInfo} */
      r
    );
  r = /** @type {CodecInfoPlain} */
  r;
  const e = new tt(r.codec, r.type, r.params);
  r.rtx && e.setRTX(r.rtx), r.channels && e.setChannels(r.channels);
  for (const t of r.rtcpfbs || []) {
    const i = Ns.expand(t);
    e.addRTCPFeedback(i);
  }
  return e;
};
tt.clone = function(r) {
  return r.constructor.name === "CodecInfo" ? (
    /** @type {CodecInfo} */
    r.clone()
  ) : tt.expand(r);
};
tt.MapFromNames = function(r, e, t) {
  var i;
  const u = (
    /** @type {Map<number, CodecInfo>} */
    /* @__PURE__ */ new Map()
  );
  let m = 96;
  for (const f of r) {
    let n;
    const b = f.split(";"), h = b.shift().toLowerCase().trim();
    h === "pcmu" ? n = 0 : h === "pcma" ? n = 8 : n = ++m;
    const g = new tt(h, n);
    h === "opus" ? g.setChannels(2) : h === "multiopus" && g.setChannels(6), e && h !== "ulpfec" && h !== "flexfec-03" && h !== "red" && g.setRTX(++m);
    for (const o of t || [])
      g.addRTCPFeedback(new Ns(o.id, o.params));
    for (const o of b) {
      let c = o.split("=");
      g.addParam(c[0].trim(), (i = c[1]) === null || i === void 0 ? void 0 : i.trim());
    }
    u.set(n, g);
  }
  return u;
};
var wr = tt;
function Vr() {
  var r = this;
  if (!(this instanceof Vr))
    return new (Function.prototype.bind.apply(Vr, [null].concat(Array.prototype.slice.call(arguments))))();
  Array.from(arguments).forEach(function(e) {
    r[e] = Symbol.for("MEDOOZE_SEMANTIC_SDP_" + e);
  });
}
var an = Vr;
const to = an, fe = to("ACTIVE", "PASSIVE", "ACTPASS", "INACTIVE");
fe.byValue = function(r) {
  switch (r) {
    case fe.ACTIVE:
    case fe.PASSIVE:
    case fe.ACTPASS:
    case fe.INACTIVE:
      return r;
  }
  return fe[r.toUpperCase()];
};
fe.toString = function(r) {
  switch (r) {
    case fe.ACTIVE:
      return "active";
    case fe.PASSIVE:
      return "passive";
    case fe.ACTPASS:
      return "actpass";
    case fe.INACTIVE:
      return "inactive";
  }
};
fe.reverse = function(r, e) {
  switch (r) {
    case fe.ACTIVE:
      return fe.PASSIVE;
    case fe.PASSIVE:
      return fe.ACTIVE;
    case fe.ACTPASS:
      return e ? fe.ACTIVE : fe.PASSIVE;
    case fe.INACTIVE:
      return fe.INACTIVE;
  }
};
var cn = fe;
const jr = cn;
let Mt = class Vs {
  /**
   * @constructor
   * @alias DTLSInfo
   * @param {Setup} setup		- Setup type
   * @param {String} hash		- Hash function
   * @param {String} fingerprint	- Peer fingerprint
   */
  constructor(e, t, i) {
    this.setup = e, this.hash = t, this.fingerprint = i;
  }
  /**
   * Create a clone of this DTLS info object
   * @returns {DTLSInfo}
   */
  clone() {
    return new Vs(this.setup, this.hash, this.fingerprint);
  }
  /**
   * Return a plain javascript object which can be converted to JSON
   * @returns {DTLSInfoPlain} Plain javascript object
   */
  plain() {
    return {
      setup: jr.toString(this.setup),
      hash: this.hash,
      fingerprint: this.fingerprint
    };
  }
  /**
   * Get peer fingerprint
   * @returns {String}
   */
  getFingerprint() {
    return this.fingerprint;
  }
  /**
   * Get hash function name
   * @returns {String}
   */
  getHash() {
    return this.hash;
  }
  /**
   * Get connection setup
   * @returns {Setup}
   */
  getSetup() {
    return this.setup;
  }
  /**
   * Set connection setup
   * @param {Setup} setup
   */
  setSetup(e) {
    this.setup = e;
  }
};
Mt.expand = function(r) {
  return r.constructor.name === "DTLSInfo" ? (
    /** @type {DTLSInfo} */
    r
  ) : (r = /** @type {DTLSInfoPlain} */
  r, new Mt(r.setup ? jr.byValue(r.setup) : jr.ACTPASS, r.hash, r.fingerprint));
};
Mt.clone = function(r) {
  return r.constructor.name === "DTLSInfo" ? (
    /** @type {DTLSInfo} */
    r.clone()
  ) : Mt.expand(r);
};
var js = Mt;
let Pt = class Ws {
  /**
   * @constructor
   * @alias CryptoInfo
   * @param {Number} tag
   * @param {String} suite
   * @param {String} keyParams
   * @param {String} sessionParams
   */
  constructor(e, t, i, u) {
    this.tag = e, this.suite = t, this.keyParams = i, this.sessionParams = u;
  }
  /**
   * Create a clone of this SDES info object
   * @returns {CryptoInfo}
   */
  clone() {
    return new Ws(this.tag, this.suite, this.keyParams, this.sessionParams);
  }
  /**
   * Return a plain javascript object which can be converted to JSON
   * @returns {CryptoInfoPlain} Plain javascript object
   */
  plain() {
    return {
      tag: this.tag,
      suite: this.suite,
      keyParams: this.keyParams,
      sessionParams: this.sessionParams
    };
  }
  /**
   * Return the SDES session params
   * @returns {String}
   */
  getSessionParams() {
    return this.sessionParams;
  }
  /**
   * Return the SDES key params
   * @returns {String}
   */
  getKeyParams() {
    return this.keyParams;
  }
  /**
   * Returns the chypher suite
   * @returns {String}
   */
  getSuite() {
    return this.suite;
  }
  /**
   * Get SDES tag
   * @returns {Number}
   */
  getTag() {
    return this.tag;
  }
};
Pt.expand = function(r) {
  return r.constructor.name === "CryptoInfo" ? (
    /** @type {CryptoInfo} */
    r
  ) : (r = /** @type {CryptoInfoPlain} */
  r, new Pt(r.tag, r.suite, r.keyParams, r.sessionParams));
};
Pt.clone = function(r) {
  return r.constructor.name === "CryptoInfo" ? (
    /** @type {CryptoInfo} */
    r.clone()
  ) : Pt.expand(r);
};
var $s = Pt, Wr = { exports: {} }, $r = { exports: {} }, Bs = {}, Sr = {};
Sr.byteLength = so;
Sr.toByteArray = oo;
Sr.fromByteArray = lo;
var Pe = [], Te = [], ro = typeof Uint8Array < "u" ? Uint8Array : Array, _r = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
for (var lt = 0, no = _r.length; lt < no; ++lt)
  Pe[lt] = _r[lt], Te[_r.charCodeAt(lt)] = lt;
Te[45] = 62;
Te[95] = 63;
function Gs(r) {
  var e = r.length;
  if (e % 4 > 0)
    throw new Error("Invalid string. Length must be a multiple of 4");
  var t = r.indexOf("=");
  t === -1 && (t = e);
  var i = t === e ? 0 : 4 - t % 4;
  return [t, i];
}
function so(r) {
  var e = Gs(r), t = e[0], i = e[1];
  return (t + i) * 3 / 4 - i;
}
function io(r, e, t) {
  return (e + t) * 3 / 4 - t;
}
function oo(r) {
  var e, t = Gs(r), i = t[0], u = t[1], m = new ro(io(r, i, u)), f = 0, n = u > 0 ? i - 4 : i, b;
  for (b = 0; b < n; b += 4)
    e = Te[r.charCodeAt(b)] << 18 | Te[r.charCodeAt(b + 1)] << 12 | Te[r.charCodeAt(b + 2)] << 6 | Te[r.charCodeAt(b + 3)], m[f++] = e >> 16 & 255, m[f++] = e >> 8 & 255, m[f++] = e & 255;
  return u === 2 && (e = Te[r.charCodeAt(b)] << 2 | Te[r.charCodeAt(b + 1)] >> 4, m[f++] = e & 255), u === 1 && (e = Te[r.charCodeAt(b)] << 10 | Te[r.charCodeAt(b + 1)] << 4 | Te[r.charCodeAt(b + 2)] >> 2, m[f++] = e >> 8 & 255, m[f++] = e & 255), m;
}
function ao(r) {
  return Pe[r >> 18 & 63] + Pe[r >> 12 & 63] + Pe[r >> 6 & 63] + Pe[r & 63];
}
function co(r, e, t) {
  for (var i, u = [], m = e; m < t; m += 3)
    i = (r[m] << 16 & 16711680) + (r[m + 1] << 8 & 65280) + (r[m + 2] & 255), u.push(ao(i));
  return u.join("");
}
function lo(r) {
  for (var e, t = r.length, i = t % 3, u = [], m = 16383, f = 0, n = t - i; f < n; f += m)
    u.push(co(r, f, f + m > n ? n : f + m));
  return i === 1 ? (e = r[t - 1], u.push(
    Pe[e >> 2] + Pe[e << 4 & 63] + "=="
  )) : i === 2 && (e = (r[t - 2] << 8) + r[t - 1], u.push(
    Pe[e >> 10] + Pe[e >> 4 & 63] + Pe[e << 2 & 63] + "="
  )), u.join("");
}
var ln = {};
/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
ln.read = function(r, e, t, i, u) {
  var m, f, n = u * 8 - i - 1, b = (1 << n) - 1, h = b >> 1, g = -7, o = t ? u - 1 : 0, c = t ? -1 : 1, l = r[e + o];
  for (o += c, m = l & (1 << -g) - 1, l >>= -g, g += n; g > 0; m = m * 256 + r[e + o], o += c, g -= 8)
    ;
  for (f = m & (1 << -g) - 1, m >>= -g, g += i; g > 0; f = f * 256 + r[e + o], o += c, g -= 8)
    ;
  if (m === 0)
    m = 1 - h;
  else {
    if (m === b)
      return f ? NaN : (l ? -1 : 1) * (1 / 0);
    f = f + Math.pow(2, i), m = m - h;
  }
  return (l ? -1 : 1) * f * Math.pow(2, m - i);
};
ln.write = function(r, e, t, i, u, m) {
  var f, n, b, h = m * 8 - u - 1, g = (1 << h) - 1, o = g >> 1, c = u === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0, l = i ? 0 : m - 1, a = i ? 1 : -1, s = e < 0 || e === 0 && 1 / e < 0 ? 1 : 0;
  for (e = Math.abs(e), isNaN(e) || e === 1 / 0 ? (n = isNaN(e) ? 1 : 0, f = g) : (f = Math.floor(Math.log(e) / Math.LN2), e * (b = Math.pow(2, -f)) < 1 && (f--, b *= 2), f + o >= 1 ? e += c / b : e += c * Math.pow(2, 1 - o), e * b >= 2 && (f++, b /= 2), f + o >= g ? (n = 0, f = g) : f + o >= 1 ? (n = (e * b - 1) * Math.pow(2, u), f = f + o) : (n = e * Math.pow(2, o - 1) * Math.pow(2, u), f = 0)); u >= 8; r[t + l] = n & 255, l += a, n /= 256, u -= 8)
    ;
  for (f = f << u | n, h += u; h > 0; r[t + l] = f & 255, l += a, f /= 256, h -= 8)
    ;
  r[t + l - a] |= s * 128;
};
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
(function(r) {
  const e = Sr, t = ln, i = typeof Symbol == "function" && typeof Symbol.for == "function" ? Symbol.for("nodejs.util.inspect.custom") : null;
  r.Buffer = n, r.SlowBuffer = y, r.INSPECT_MAX_BYTES = 50;
  const u = 2147483647;
  r.kMaxLength = u, n.TYPED_ARRAY_SUPPORT = m(), !n.TYPED_ARRAY_SUPPORT && typeof console < "u" && typeof console.error == "function" && console.error(
    "This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support."
  );
  function m() {
    try {
      const C = new Uint8Array(1), w = { foo: function() {
        return 42;
      } };
      return Object.setPrototypeOf(w, Uint8Array.prototype), Object.setPrototypeOf(C, w), C.foo() === 42;
    } catch (C) {
      return !1;
    }
  }
  Object.defineProperty(n.prototype, "parent", {
    enumerable: !0,
    get: function() {
      if (n.isBuffer(this))
        return this.buffer;
    }
  }), Object.defineProperty(n.prototype, "offset", {
    enumerable: !0,
    get: function() {
      if (n.isBuffer(this))
        return this.byteOffset;
    }
  });
  function f(C) {
    if (C > u)
      throw new RangeError('The value "' + C + '" is invalid for option "size"');
    const w = new Uint8Array(C);
    return Object.setPrototypeOf(w, n.prototype), w;
  }
  function n(C, w, R) {
    if (typeof C == "number") {
      if (typeof w == "string")
        throw new TypeError(
          'The "string" argument must be of type string. Received type number'
        );
      return o(C);
    }
    return b(C, w, R);
  }
  n.poolSize = 8192;
  function b(C, w, R) {
    if (typeof C == "string")
      return c(C, w);
    if (ArrayBuffer.isView(C))
      return a(C);
    if (C == null)
      throw new TypeError(
        "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof C
      );
    if (ke(C, ArrayBuffer) || C && ke(C.buffer, ArrayBuffer) || typeof SharedArrayBuffer < "u" && (ke(C, SharedArrayBuffer) || C && ke(C.buffer, SharedArrayBuffer)))
      return s(C, w, R);
    if (typeof C == "number")
      throw new TypeError(
        'The "value" argument must not be of type number. Received type number'
      );
    const A = C.valueOf && C.valueOf();
    if (A != null && A !== C)
      return n.from(A, w, R);
    const D = p(C);
    if (D) return D;
    if (typeof Symbol < "u" && Symbol.toPrimitive != null && typeof C[Symbol.toPrimitive] == "function")
      return n.from(C[Symbol.toPrimitive]("string"), w, R);
    throw new TypeError(
      "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof C
    );
  }
  n.from = function(C, w, R) {
    return b(C, w, R);
  }, Object.setPrototypeOf(n.prototype, Uint8Array.prototype), Object.setPrototypeOf(n, Uint8Array);
  function h(C) {
    if (typeof C != "number")
      throw new TypeError('"size" argument must be of type number');
    if (C < 0)
      throw new RangeError('The value "' + C + '" is invalid for option "size"');
  }
  function g(C, w, R) {
    return h(C), C <= 0 ? f(C) : w !== void 0 ? typeof R == "string" ? f(C).fill(w, R) : f(C).fill(w) : f(C);
  }
  n.alloc = function(C, w, R) {
    return g(C, w, R);
  };
  function o(C) {
    return h(C), f(C < 0 ? 0 : d(C) | 0);
  }
  n.allocUnsafe = function(C) {
    return o(C);
  }, n.allocUnsafeSlow = function(C) {
    return o(C);
  };
  function c(C, w) {
    if ((typeof w != "string" || w === "") && (w = "utf8"), !n.isEncoding(w))
      throw new TypeError("Unknown encoding: " + w);
    const R = v(C, w) | 0;
    let A = f(R);
    const D = A.write(C, w);
    return D !== R && (A = A.slice(0, D)), A;
  }
  function l(C) {
    const w = C.length < 0 ? 0 : d(C.length) | 0, R = f(w);
    for (let A = 0; A < w; A += 1)
      R[A] = C[A] & 255;
    return R;
  }
  function a(C) {
    if (ke(C, Uint8Array)) {
      const w = new Uint8Array(C);
      return s(w.buffer, w.byteOffset, w.byteLength);
    }
    return l(C);
  }
  function s(C, w, R) {
    if (w < 0 || C.byteLength < w)
      throw new RangeError('"offset" is outside of buffer bounds');
    if (C.byteLength < w + (R || 0))
      throw new RangeError('"length" is outside of buffer bounds');
    let A;
    return w === void 0 && R === void 0 ? A = new Uint8Array(C) : R === void 0 ? A = new Uint8Array(C, w) : A = new Uint8Array(C, w, R), Object.setPrototypeOf(A, n.prototype), A;
  }
  function p(C) {
    if (n.isBuffer(C)) {
      const w = d(C.length) | 0, R = f(w);
      return R.length === 0 || C.copy(R, 0, 0, w), R;
    }
    if (C.length !== void 0)
      return typeof C.length != "number" || xe(C.length) ? f(0) : l(C);
    if (C.type === "Buffer" && Array.isArray(C.data))
      return l(C.data);
  }
  function d(C) {
    if (C >= u)
      throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + u.toString(16) + " bytes");
    return C | 0;
  }
  function y(C) {
    return +C != C && (C = 0), n.alloc(+C);
  }
  n.isBuffer = function(w) {
    return w != null && w._isBuffer === !0 && w !== n.prototype;
  }, n.compare = function(w, R) {
    if (ke(w, Uint8Array) && (w = n.from(w, w.offset, w.byteLength)), ke(R, Uint8Array) && (R = n.from(R, R.offset, R.byteLength)), !n.isBuffer(w) || !n.isBuffer(R))
      throw new TypeError(
        'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
      );
    if (w === R) return 0;
    let A = w.length, D = R.length;
    for (let P = 0, Z = Math.min(A, D); P < Z; ++P)
      if (w[P] !== R[P]) {
        A = w[P], D = R[P];
        break;
      }
    return A < D ? -1 : D < A ? 1 : 0;
  }, n.isEncoding = function(w) {
    switch (String(w).toLowerCase()) {
      case "hex":
      case "utf8":
      case "utf-8":
      case "ascii":
      case "latin1":
      case "binary":
      case "base64":
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return !0;
      default:
        return !1;
    }
  }, n.concat = function(w, R) {
    if (!Array.isArray(w))
      throw new TypeError('"list" argument must be an Array of Buffers');
    if (w.length === 0)
      return n.alloc(0);
    let A;
    if (R === void 0)
      for (R = 0, A = 0; A < w.length; ++A)
        R += w[A].length;
    const D = n.allocUnsafe(R);
    let P = 0;
    for (A = 0; A < w.length; ++A) {
      let Z = w[A];
      if (ke(Z, Uint8Array))
        P + Z.length > D.length ? (n.isBuffer(Z) || (Z = n.from(Z)), Z.copy(D, P)) : Uint8Array.prototype.set.call(
          D,
          Z,
          P
        );
      else if (n.isBuffer(Z))
        Z.copy(D, P);
      else
        throw new TypeError('"list" argument must be an Array of Buffers');
      P += Z.length;
    }
    return D;
  };
  function v(C, w) {
    if (n.isBuffer(C))
      return C.length;
    if (ArrayBuffer.isView(C) || ke(C, ArrayBuffer))
      return C.byteLength;
    if (typeof C != "string")
      throw new TypeError(
        'The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof C
      );
    const R = C.length, A = arguments.length > 2 && arguments[2] === !0;
    if (!A && R === 0) return 0;
    let D = !1;
    for (; ; )
      switch (w) {
        case "ascii":
        case "latin1":
        case "binary":
          return R;
        case "utf8":
        case "utf-8":
          return Ge(C).length;
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return R * 2;
        case "hex":
          return R >>> 1;
        case "base64":
          return Xt(C).length;
        default:
          if (D)
            return A ? -1 : Ge(C).length;
          w = ("" + w).toLowerCase(), D = !0;
      }
  }
  n.byteLength = v;
  function S(C, w, R) {
    let A = !1;
    if ((w === void 0 || w < 0) && (w = 0), w > this.length || ((R === void 0 || R > this.length) && (R = this.length), R <= 0) || (R >>>= 0, w >>>= 0, R <= w))
      return "";
    for (C || (C = "utf8"); ; )
      switch (C) {
        case "hex":
          return X(this, w, R);
        case "utf8":
        case "utf-8":
          return j(this, w, R);
        case "ascii":
          return F(this, w, R);
        case "latin1":
        case "binary":
          return V(this, w, R);
        case "base64":
          return O(this, w, R);
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return B(this, w, R);
        default:
          if (A) throw new TypeError("Unknown encoding: " + C);
          C = (C + "").toLowerCase(), A = !0;
      }
  }
  n.prototype._isBuffer = !0;
  function I(C, w, R) {
    const A = C[w];
    C[w] = C[R], C[R] = A;
  }
  n.prototype.swap16 = function() {
    const w = this.length;
    if (w % 2 !== 0)
      throw new RangeError("Buffer size must be a multiple of 16-bits");
    for (let R = 0; R < w; R += 2)
      I(this, R, R + 1);
    return this;
  }, n.prototype.swap32 = function() {
    const w = this.length;
    if (w % 4 !== 0)
      throw new RangeError("Buffer size must be a multiple of 32-bits");
    for (let R = 0; R < w; R += 4)
      I(this, R, R + 3), I(this, R + 1, R + 2);
    return this;
  }, n.prototype.swap64 = function() {
    const w = this.length;
    if (w % 8 !== 0)
      throw new RangeError("Buffer size must be a multiple of 64-bits");
    for (let R = 0; R < w; R += 8)
      I(this, R, R + 7), I(this, R + 1, R + 6), I(this, R + 2, R + 5), I(this, R + 3, R + 4);
    return this;
  }, n.prototype.toString = function() {
    const w = this.length;
    return w === 0 ? "" : arguments.length === 0 ? j(this, 0, w) : S.apply(this, arguments);
  }, n.prototype.toLocaleString = n.prototype.toString, n.prototype.equals = function(w) {
    if (!n.isBuffer(w)) throw new TypeError("Argument must be a Buffer");
    return this === w ? !0 : n.compare(this, w) === 0;
  }, n.prototype.inspect = function() {
    let w = "";
    const R = r.INSPECT_MAX_BYTES;
    return w = this.toString("hex", 0, R).replace(/(.{2})/g, "$1 ").trim(), this.length > R && (w += " ... "), "<Buffer " + w + ">";
  }, i && (n.prototype[i] = n.prototype.inspect), n.prototype.compare = function(w, R, A, D, P) {
    if (ke(w, Uint8Array) && (w = n.from(w, w.offset, w.byteLength)), !n.isBuffer(w))
      throw new TypeError(
        'The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof w
      );
    if (R === void 0 && (R = 0), A === void 0 && (A = w ? w.length : 0), D === void 0 && (D = 0), P === void 0 && (P = this.length), R < 0 || A > w.length || D < 0 || P > this.length)
      throw new RangeError("out of range index");
    if (D >= P && R >= A)
      return 0;
    if (D >= P)
      return -1;
    if (R >= A)
      return 1;
    if (R >>>= 0, A >>>= 0, D >>>= 0, P >>>= 0, this === w) return 0;
    let Z = P - D, Y = A - R;
    const oe = Math.min(Z, Y), ne = this.slice(D, P), ue = w.slice(R, A);
    for (let se = 0; se < oe; ++se)
      if (ne[se] !== ue[se]) {
        Z = ne[se], Y = ue[se];
        break;
      }
    return Z < Y ? -1 : Y < Z ? 1 : 0;
  };
  function E(C, w, R, A, D) {
    if (C.length === 0) return -1;
    if (typeof R == "string" ? (A = R, R = 0) : R > 2147483647 ? R = 2147483647 : R < -2147483648 && (R = -2147483648), R = +R, xe(R) && (R = D ? 0 : C.length - 1), R < 0 && (R = C.length + R), R >= C.length) {
      if (D) return -1;
      R = C.length - 1;
    } else if (R < 0)
      if (D) R = 0;
      else return -1;
    if (typeof w == "string" && (w = n.from(w, A)), n.isBuffer(w))
      return w.length === 0 ? -1 : T(C, w, R, A, D);
    if (typeof w == "number")
      return w = w & 255, typeof Uint8Array.prototype.indexOf == "function" ? D ? Uint8Array.prototype.indexOf.call(C, w, R) : Uint8Array.prototype.lastIndexOf.call(C, w, R) : T(C, [w], R, A, D);
    throw new TypeError("val must be string, number or Buffer");
  }
  function T(C, w, R, A, D) {
    let P = 1, Z = C.length, Y = w.length;
    if (A !== void 0 && (A = String(A).toLowerCase(), A === "ucs2" || A === "ucs-2" || A === "utf16le" || A === "utf-16le")) {
      if (C.length < 2 || w.length < 2)
        return -1;
      P = 2, Z /= 2, Y /= 2, R /= 2;
    }
    function oe(ue, se) {
      return P === 1 ? ue[se] : ue.readUInt16BE(se * P);
    }
    let ne;
    if (D) {
      let ue = -1;
      for (ne = R; ne < Z; ne++)
        if (oe(C, ne) === oe(w, ue === -1 ? 0 : ne - ue)) {
          if (ue === -1 && (ue = ne), ne - ue + 1 === Y) return ue * P;
        } else
          ue !== -1 && (ne -= ne - ue), ue = -1;
    } else
      for (R + Y > Z && (R = Z - Y), ne = R; ne >= 0; ne--) {
        let ue = !0;
        for (let se = 0; se < Y; se++)
          if (oe(C, ne + se) !== oe(w, se)) {
            ue = !1;
            break;
          }
        if (ue) return ne;
      }
    return -1;
  }
  n.prototype.includes = function(w, R, A) {
    return this.indexOf(w, R, A) !== -1;
  }, n.prototype.indexOf = function(w, R, A) {
    return E(this, w, R, A, !0);
  }, n.prototype.lastIndexOf = function(w, R, A) {
    return E(this, w, R, A, !1);
  };
  function x(C, w, R, A) {
    R = Number(R) || 0;
    const D = C.length - R;
    A ? (A = Number(A), A > D && (A = D)) : A = D;
    const P = w.length;
    A > P / 2 && (A = P / 2);
    let Z;
    for (Z = 0; Z < A; ++Z) {
      const Y = parseInt(w.substr(Z * 2, 2), 16);
      if (xe(Y)) return Z;
      C[R + Z] = Y;
    }
    return Z;
  }
  function k(C, w, R, A) {
    return ze(Ge(w, C.length - R), C, R, A);
  }
  function _(C, w, R, A) {
    return ze(Xe(w), C, R, A);
  }
  function L(C, w, R, A) {
    return ze(Xt(w), C, R, A);
  }
  function N(C, w, R, A) {
    return ze(ct(w, C.length - R), C, R, A);
  }
  n.prototype.write = function(w, R, A, D) {
    if (R === void 0)
      D = "utf8", A = this.length, R = 0;
    else if (A === void 0 && typeof R == "string")
      D = R, A = this.length, R = 0;
    else if (isFinite(R))
      R = R >>> 0, isFinite(A) ? (A = A >>> 0, D === void 0 && (D = "utf8")) : (D = A, A = void 0);
    else
      throw new Error(
        "Buffer.write(string, encoding, offset[, length]) is no longer supported"
      );
    const P = this.length - R;
    if ((A === void 0 || A > P) && (A = P), w.length > 0 && (A < 0 || R < 0) || R > this.length)
      throw new RangeError("Attempt to write outside buffer bounds");
    D || (D = "utf8");
    let Z = !1;
    for (; ; )
      switch (D) {
        case "hex":
          return x(this, w, R, A);
        case "utf8":
        case "utf-8":
          return k(this, w, R, A);
        case "ascii":
        case "latin1":
        case "binary":
          return _(this, w, R, A);
        case "base64":
          return L(this, w, R, A);
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return N(this, w, R, A);
        default:
          if (Z) throw new TypeError("Unknown encoding: " + D);
          D = ("" + D).toLowerCase(), Z = !0;
      }
  }, n.prototype.toJSON = function() {
    return {
      type: "Buffer",
      data: Array.prototype.slice.call(this._arr || this, 0)
    };
  };
  function O(C, w, R) {
    return w === 0 && R === C.length ? e.fromByteArray(C) : e.fromByteArray(C.slice(w, R));
  }
  function j(C, w, R) {
    R = Math.min(C.length, R);
    const A = [];
    let D = w;
    for (; D < R; ) {
      const P = C[D];
      let Z = null, Y = P > 239 ? 4 : P > 223 ? 3 : P > 191 ? 2 : 1;
      if (D + Y <= R) {
        let oe, ne, ue, se;
        switch (Y) {
          case 1:
            P < 128 && (Z = P);
            break;
          case 2:
            oe = C[D + 1], (oe & 192) === 128 && (se = (P & 31) << 6 | oe & 63, se > 127 && (Z = se));
            break;
          case 3:
            oe = C[D + 1], ne = C[D + 2], (oe & 192) === 128 && (ne & 192) === 128 && (se = (P & 15) << 12 | (oe & 63) << 6 | ne & 63, se > 2047 && (se < 55296 || se > 57343) && (Z = se));
            break;
          case 4:
            oe = C[D + 1], ne = C[D + 2], ue = C[D + 3], (oe & 192) === 128 && (ne & 192) === 128 && (ue & 192) === 128 && (se = (P & 15) << 18 | (oe & 63) << 12 | (ne & 63) << 6 | ue & 63, se > 65535 && se < 1114112 && (Z = se));
        }
      }
      Z === null ? (Z = 65533, Y = 1) : Z > 65535 && (Z -= 65536, A.push(Z >>> 10 & 1023 | 55296), Z = 56320 | Z & 1023), A.push(Z), D += Y;
    }
    return W(A);
  }
  const G = 4096;
  function W(C) {
    const w = C.length;
    if (w <= G)
      return String.fromCharCode.apply(String, C);
    let R = "", A = 0;
    for (; A < w; )
      R += String.fromCharCode.apply(
        String,
        C.slice(A, A += G)
      );
    return R;
  }
  function F(C, w, R) {
    let A = "";
    R = Math.min(C.length, R);
    for (let D = w; D < R; ++D)
      A += String.fromCharCode(C[D] & 127);
    return A;
  }
  function V(C, w, R) {
    let A = "";
    R = Math.min(C.length, R);
    for (let D = w; D < R; ++D)
      A += String.fromCharCode(C[D]);
    return A;
  }
  function X(C, w, R) {
    const A = C.length;
    (!w || w < 0) && (w = 0), (!R || R < 0 || R > A) && (R = A);
    let D = "";
    for (let P = w; P < R; ++P)
      D += je[C[P]];
    return D;
  }
  function B(C, w, R) {
    const A = C.slice(w, R);
    let D = "";
    for (let P = 0; P < A.length - 1; P += 2)
      D += String.fromCharCode(A[P] + A[P + 1] * 256);
    return D;
  }
  n.prototype.slice = function(w, R) {
    const A = this.length;
    w = ~~w, R = R === void 0 ? A : ~~R, w < 0 ? (w += A, w < 0 && (w = 0)) : w > A && (w = A), R < 0 ? (R += A, R < 0 && (R = 0)) : R > A && (R = A), R < w && (R = w);
    const D = this.subarray(w, R);
    return Object.setPrototypeOf(D, n.prototype), D;
  };
  function $(C, w, R) {
    if (C % 1 !== 0 || C < 0) throw new RangeError("offset is not uint");
    if (C + w > R) throw new RangeError("Trying to access beyond buffer length");
  }
  n.prototype.readUintLE = n.prototype.readUIntLE = function(w, R, A) {
    w = w >>> 0, R = R >>> 0, A || $(w, R, this.length);
    let D = this[w], P = 1, Z = 0;
    for (; ++Z < R && (P *= 256); )
      D += this[w + Z] * P;
    return D;
  }, n.prototype.readUintBE = n.prototype.readUIntBE = function(w, R, A) {
    w = w >>> 0, R = R >>> 0, A || $(w, R, this.length);
    let D = this[w + --R], P = 1;
    for (; R > 0 && (P *= 256); )
      D += this[w + --R] * P;
    return D;
  }, n.prototype.readUint8 = n.prototype.readUInt8 = function(w, R) {
    return w = w >>> 0, R || $(w, 1, this.length), this[w];
  }, n.prototype.readUint16LE = n.prototype.readUInt16LE = function(w, R) {
    return w = w >>> 0, R || $(w, 2, this.length), this[w] | this[w + 1] << 8;
  }, n.prototype.readUint16BE = n.prototype.readUInt16BE = function(w, R) {
    return w = w >>> 0, R || $(w, 2, this.length), this[w] << 8 | this[w + 1];
  }, n.prototype.readUint32LE = n.prototype.readUInt32LE = function(w, R) {
    return w = w >>> 0, R || $(w, 4, this.length), (this[w] | this[w + 1] << 8 | this[w + 2] << 16) + this[w + 3] * 16777216;
  }, n.prototype.readUint32BE = n.prototype.readUInt32BE = function(w, R) {
    return w = w >>> 0, R || $(w, 4, this.length), this[w] * 16777216 + (this[w + 1] << 16 | this[w + 2] << 8 | this[w + 3]);
  }, n.prototype.readBigUInt64LE = Ee(function(w) {
    w = w >>> 0, Ae(w, "offset");
    const R = this[w], A = this[w + 7];
    (R === void 0 || A === void 0) && Oe(w, this.length - 8);
    const D = R + this[++w] * 2 ** 8 + this[++w] * 2 ** 16 + this[++w] * 2 ** 24, P = this[++w] + this[++w] * 2 ** 8 + this[++w] * 2 ** 16 + A * 2 ** 24;
    return BigInt(D) + (BigInt(P) << BigInt(32));
  }), n.prototype.readBigUInt64BE = Ee(function(w) {
    w = w >>> 0, Ae(w, "offset");
    const R = this[w], A = this[w + 7];
    (R === void 0 || A === void 0) && Oe(w, this.length - 8);
    const D = R * 2 ** 24 + this[++w] * 2 ** 16 + this[++w] * 2 ** 8 + this[++w], P = this[++w] * 2 ** 24 + this[++w] * 2 ** 16 + this[++w] * 2 ** 8 + A;
    return (BigInt(D) << BigInt(32)) + BigInt(P);
  }), n.prototype.readIntLE = function(w, R, A) {
    w = w >>> 0, R = R >>> 0, A || $(w, R, this.length);
    let D = this[w], P = 1, Z = 0;
    for (; ++Z < R && (P *= 256); )
      D += this[w + Z] * P;
    return P *= 128, D >= P && (D -= Math.pow(2, 8 * R)), D;
  }, n.prototype.readIntBE = function(w, R, A) {
    w = w >>> 0, R = R >>> 0, A || $(w, R, this.length);
    let D = R, P = 1, Z = this[w + --D];
    for (; D > 0 && (P *= 256); )
      Z += this[w + --D] * P;
    return P *= 128, Z >= P && (Z -= Math.pow(2, 8 * R)), Z;
  }, n.prototype.readInt8 = function(w, R) {
    return w = w >>> 0, R || $(w, 1, this.length), this[w] & 128 ? (255 - this[w] + 1) * -1 : this[w];
  }, n.prototype.readInt16LE = function(w, R) {
    w = w >>> 0, R || $(w, 2, this.length);
    const A = this[w] | this[w + 1] << 8;
    return A & 32768 ? A | 4294901760 : A;
  }, n.prototype.readInt16BE = function(w, R) {
    w = w >>> 0, R || $(w, 2, this.length);
    const A = this[w + 1] | this[w] << 8;
    return A & 32768 ? A | 4294901760 : A;
  }, n.prototype.readInt32LE = function(w, R) {
    return w = w >>> 0, R || $(w, 4, this.length), this[w] | this[w + 1] << 8 | this[w + 2] << 16 | this[w + 3] << 24;
  }, n.prototype.readInt32BE = function(w, R) {
    return w = w >>> 0, R || $(w, 4, this.length), this[w] << 24 | this[w + 1] << 16 | this[w + 2] << 8 | this[w + 3];
  }, n.prototype.readBigInt64LE = Ee(function(w) {
    w = w >>> 0, Ae(w, "offset");
    const R = this[w], A = this[w + 7];
    (R === void 0 || A === void 0) && Oe(w, this.length - 8);
    const D = this[w + 4] + this[w + 5] * 2 ** 8 + this[w + 6] * 2 ** 16 + (A << 24);
    return (BigInt(D) << BigInt(32)) + BigInt(R + this[++w] * 2 ** 8 + this[++w] * 2 ** 16 + this[++w] * 2 ** 24);
  }), n.prototype.readBigInt64BE = Ee(function(w) {
    w = w >>> 0, Ae(w, "offset");
    const R = this[w], A = this[w + 7];
    (R === void 0 || A === void 0) && Oe(w, this.length - 8);
    const D = (R << 24) + // Overflow
    this[++w] * 2 ** 16 + this[++w] * 2 ** 8 + this[++w];
    return (BigInt(D) << BigInt(32)) + BigInt(this[++w] * 2 ** 24 + this[++w] * 2 ** 16 + this[++w] * 2 ** 8 + A);
  }), n.prototype.readFloatLE = function(w, R) {
    return w = w >>> 0, R || $(w, 4, this.length), t.read(this, w, !0, 23, 4);
  }, n.prototype.readFloatBE = function(w, R) {
    return w = w >>> 0, R || $(w, 4, this.length), t.read(this, w, !1, 23, 4);
  }, n.prototype.readDoubleLE = function(w, R) {
    return w = w >>> 0, R || $(w, 8, this.length), t.read(this, w, !0, 52, 8);
  }, n.prototype.readDoubleBE = function(w, R) {
    return w = w >>> 0, R || $(w, 8, this.length), t.read(this, w, !1, 52, 8);
  };
  function z(C, w, R, A, D, P) {
    if (!n.isBuffer(C)) throw new TypeError('"buffer" argument must be a Buffer instance');
    if (w > D || w < P) throw new RangeError('"value" argument is out of bounds');
    if (R + A > C.length) throw new RangeError("Index out of range");
  }
  n.prototype.writeUintLE = n.prototype.writeUIntLE = function(w, R, A, D) {
    if (w = +w, R = R >>> 0, A = A >>> 0, !D) {
      const Y = Math.pow(2, 8 * A) - 1;
      z(this, w, R, A, Y, 0);
    }
    let P = 1, Z = 0;
    for (this[R] = w & 255; ++Z < A && (P *= 256); )
      this[R + Z] = w / P & 255;
    return R + A;
  }, n.prototype.writeUintBE = n.prototype.writeUIntBE = function(w, R, A, D) {
    if (w = +w, R = R >>> 0, A = A >>> 0, !D) {
      const Y = Math.pow(2, 8 * A) - 1;
      z(this, w, R, A, Y, 0);
    }
    let P = A - 1, Z = 1;
    for (this[R + P] = w & 255; --P >= 0 && (Z *= 256); )
      this[R + P] = w / Z & 255;
    return R + A;
  }, n.prototype.writeUint8 = n.prototype.writeUInt8 = function(w, R, A) {
    return w = +w, R = R >>> 0, A || z(this, w, R, 1, 255, 0), this[R] = w & 255, R + 1;
  }, n.prototype.writeUint16LE = n.prototype.writeUInt16LE = function(w, R, A) {
    return w = +w, R = R >>> 0, A || z(this, w, R, 2, 65535, 0), this[R] = w & 255, this[R + 1] = w >>> 8, R + 2;
  }, n.prototype.writeUint16BE = n.prototype.writeUInt16BE = function(w, R, A) {
    return w = +w, R = R >>> 0, A || z(this, w, R, 2, 65535, 0), this[R] = w >>> 8, this[R + 1] = w & 255, R + 2;
  }, n.prototype.writeUint32LE = n.prototype.writeUInt32LE = function(w, R, A) {
    return w = +w, R = R >>> 0, A || z(this, w, R, 4, 4294967295, 0), this[R + 3] = w >>> 24, this[R + 2] = w >>> 16, this[R + 1] = w >>> 8, this[R] = w & 255, R + 4;
  }, n.prototype.writeUint32BE = n.prototype.writeUInt32BE = function(w, R, A) {
    return w = +w, R = R >>> 0, A || z(this, w, R, 4, 4294967295, 0), this[R] = w >>> 24, this[R + 1] = w >>> 16, this[R + 2] = w >>> 8, this[R + 3] = w & 255, R + 4;
  };
  function q(C, w, R, A, D) {
    Gt(w, A, D, C, R, 7);
    let P = Number(w & BigInt(4294967295));
    C[R++] = P, P = P >> 8, C[R++] = P, P = P >> 8, C[R++] = P, P = P >> 8, C[R++] = P;
    let Z = Number(w >> BigInt(32) & BigInt(4294967295));
    return C[R++] = Z, Z = Z >> 8, C[R++] = Z, Z = Z >> 8, C[R++] = Z, Z = Z >> 8, C[R++] = Z, R;
  }
  function ee(C, w, R, A, D) {
    Gt(w, A, D, C, R, 7);
    let P = Number(w & BigInt(4294967295));
    C[R + 7] = P, P = P >> 8, C[R + 6] = P, P = P >> 8, C[R + 5] = P, P = P >> 8, C[R + 4] = P;
    let Z = Number(w >> BigInt(32) & BigInt(4294967295));
    return C[R + 3] = Z, Z = Z >> 8, C[R + 2] = Z, Z = Z >> 8, C[R + 1] = Z, Z = Z >> 8, C[R] = Z, R + 8;
  }
  n.prototype.writeBigUInt64LE = Ee(function(w, R = 0) {
    return q(this, w, R, BigInt(0), BigInt("0xffffffffffffffff"));
  }), n.prototype.writeBigUInt64BE = Ee(function(w, R = 0) {
    return ee(this, w, R, BigInt(0), BigInt("0xffffffffffffffff"));
  }), n.prototype.writeIntLE = function(w, R, A, D) {
    if (w = +w, R = R >>> 0, !D) {
      const oe = Math.pow(2, 8 * A - 1);
      z(this, w, R, A, oe - 1, -oe);
    }
    let P = 0, Z = 1, Y = 0;
    for (this[R] = w & 255; ++P < A && (Z *= 256); )
      w < 0 && Y === 0 && this[R + P - 1] !== 0 && (Y = 1), this[R + P] = (w / Z >> 0) - Y & 255;
    return R + A;
  }, n.prototype.writeIntBE = function(w, R, A, D) {
    if (w = +w, R = R >>> 0, !D) {
      const oe = Math.pow(2, 8 * A - 1);
      z(this, w, R, A, oe - 1, -oe);
    }
    let P = A - 1, Z = 1, Y = 0;
    for (this[R + P] = w & 255; --P >= 0 && (Z *= 256); )
      w < 0 && Y === 0 && this[R + P + 1] !== 0 && (Y = 1), this[R + P] = (w / Z >> 0) - Y & 255;
    return R + A;
  }, n.prototype.writeInt8 = function(w, R, A) {
    return w = +w, R = R >>> 0, A || z(this, w, R, 1, 127, -128), w < 0 && (w = 255 + w + 1), this[R] = w & 255, R + 1;
  }, n.prototype.writeInt16LE = function(w, R, A) {
    return w = +w, R = R >>> 0, A || z(this, w, R, 2, 32767, -32768), this[R] = w & 255, this[R + 1] = w >>> 8, R + 2;
  }, n.prototype.writeInt16BE = function(w, R, A) {
    return w = +w, R = R >>> 0, A || z(this, w, R, 2, 32767, -32768), this[R] = w >>> 8, this[R + 1] = w & 255, R + 2;
  }, n.prototype.writeInt32LE = function(w, R, A) {
    return w = +w, R = R >>> 0, A || z(this, w, R, 4, 2147483647, -2147483648), this[R] = w & 255, this[R + 1] = w >>> 8, this[R + 2] = w >>> 16, this[R + 3] = w >>> 24, R + 4;
  }, n.prototype.writeInt32BE = function(w, R, A) {
    return w = +w, R = R >>> 0, A || z(this, w, R, 4, 2147483647, -2147483648), w < 0 && (w = 4294967295 + w + 1), this[R] = w >>> 24, this[R + 1] = w >>> 16, this[R + 2] = w >>> 8, this[R + 3] = w & 255, R + 4;
  }, n.prototype.writeBigInt64LE = Ee(function(w, R = 0) {
    return q(this, w, R, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
  }), n.prototype.writeBigInt64BE = Ee(function(w, R = 0) {
    return ee(this, w, R, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
  });
  function te(C, w, R, A, D, P) {
    if (R + A > C.length) throw new RangeError("Index out of range");
    if (R < 0) throw new RangeError("Index out of range");
  }
  function le(C, w, R, A, D) {
    return w = +w, R = R >>> 0, D || te(C, w, R, 4), t.write(C, w, R, A, 23, 4), R + 4;
  }
  n.prototype.writeFloatLE = function(w, R, A) {
    return le(this, w, R, !0, A);
  }, n.prototype.writeFloatBE = function(w, R, A) {
    return le(this, w, R, !1, A);
  };
  function ye(C, w, R, A, D) {
    return w = +w, R = R >>> 0, D || te(C, w, R, 8), t.write(C, w, R, A, 52, 8), R + 8;
  }
  n.prototype.writeDoubleLE = function(w, R, A) {
    return ye(this, w, R, !0, A);
  }, n.prototype.writeDoubleBE = function(w, R, A) {
    return ye(this, w, R, !1, A);
  }, n.prototype.copy = function(w, R, A, D) {
    if (!n.isBuffer(w)) throw new TypeError("argument should be a Buffer");
    if (A || (A = 0), !D && D !== 0 && (D = this.length), R >= w.length && (R = w.length), R || (R = 0), D > 0 && D < A && (D = A), D === A || w.length === 0 || this.length === 0) return 0;
    if (R < 0)
      throw new RangeError("targetStart out of bounds");
    if (A < 0 || A >= this.length) throw new RangeError("Index out of range");
    if (D < 0) throw new RangeError("sourceEnd out of bounds");
    D > this.length && (D = this.length), w.length - R < D - A && (D = w.length - R + A);
    const P = D - A;
    return this === w && typeof Uint8Array.prototype.copyWithin == "function" ? this.copyWithin(R, A, D) : Uint8Array.prototype.set.call(
      w,
      this.subarray(A, D),
      R
    ), P;
  }, n.prototype.fill = function(w, R, A, D) {
    if (typeof w == "string") {
      if (typeof R == "string" ? (D = R, R = 0, A = this.length) : typeof A == "string" && (D = A, A = this.length), D !== void 0 && typeof D != "string")
        throw new TypeError("encoding must be a string");
      if (typeof D == "string" && !n.isEncoding(D))
        throw new TypeError("Unknown encoding: " + D);
      if (w.length === 1) {
        const Z = w.charCodeAt(0);
        (D === "utf8" && Z < 128 || D === "latin1") && (w = Z);
      }
    } else typeof w == "number" ? w = w & 255 : typeof w == "boolean" && (w = Number(w));
    if (R < 0 || this.length < R || this.length < A)
      throw new RangeError("Out of range index");
    if (A <= R)
      return this;
    R = R >>> 0, A = A === void 0 ? this.length : A >>> 0, w || (w = 0);
    let P;
    if (typeof w == "number")
      for (P = R; P < A; ++P)
        this[P] = w;
    else {
      const Z = n.isBuffer(w) ? w : n.from(w, D), Y = Z.length;
      if (Y === 0)
        throw new TypeError('The value "' + w + '" is invalid for argument "value"');
      for (P = 0; P < A - R; ++P)
        this[P + R] = Z[P % Y];
    }
    return this;
  };
  const Ce = {};
  function at(C, w, R) {
    Ce[C] = class extends R {
      constructor() {
        super(), Object.defineProperty(this, "message", {
          value: w.apply(this, arguments),
          writable: !0,
          configurable: !0
        }), this.name = "".concat(this.name, " [").concat(C, "]"), this.stack, delete this.name;
      }
      get code() {
        return C;
      }
      set code(D) {
        Object.defineProperty(this, "code", {
          configurable: !0,
          enumerable: !0,
          value: D,
          writable: !0
        });
      }
      toString() {
        return "".concat(this.name, " [").concat(C, "]: ").concat(this.message);
      }
    };
  }
  at(
    "ERR_BUFFER_OUT_OF_BOUNDS",
    function(C) {
      return C ? "".concat(C, " is outside of buffer bounds") : "Attempt to access memory outside buffer bounds";
    },
    RangeError
  ), at(
    "ERR_INVALID_ARG_TYPE",
    function(C, w) {
      return 'The "'.concat(C, '" argument must be of type number. Received type ').concat(typeof w);
    },
    TypeError
  ), at(
    "ERR_OUT_OF_RANGE",
    function(C, w, R) {
      let A = 'The value of "'.concat(C, '" is out of range.'), D = R;
      return Number.isInteger(R) && Math.abs(R) > 2 ** 32 ? D = St(String(R)) : typeof R == "bigint" && (D = String(R), (R > BigInt(2) ** BigInt(32) || R < -(BigInt(2) ** BigInt(32))) && (D = St(D)), D += "n"), A += " It must be ".concat(w, ". Received ").concat(D), A;
    },
    RangeError
  );
  function St(C) {
    let w = "", R = C.length;
    const A = C[0] === "-" ? 1 : 0;
    for (; R >= A + 4; R -= 3)
      w = "_".concat(C.slice(R - 3, R)).concat(w);
    return "".concat(C.slice(0, R)).concat(w);
  }
  function Bt(C, w, R) {
    Ae(w, "offset"), (C[w] === void 0 || C[w + R] === void 0) && Oe(w, C.length - (R + 1));
  }
  function Gt(C, w, R, A, D, P) {
    if (C > R || C < w) {
      const Z = typeof w == "bigint" ? "n" : "";
      let Y;
      throw w === 0 || w === BigInt(0) ? Y = ">= 0".concat(Z, " and < 2").concat(Z, " ** ").concat((P + 1) * 8).concat(Z) : Y = ">= -(2".concat(Z, " ** ").concat((P + 1) * 8 - 1).concat(Z, ") and < 2 ** ") + "".concat((P + 1) * 8 - 1).concat(Z), new Ce.ERR_OUT_OF_RANGE("value", Y, C);
    }
    Bt(A, D, P);
  }
  function Ae(C, w) {
    if (typeof C != "number")
      throw new Ce.ERR_INVALID_ARG_TYPE(w, "number", C);
  }
  function Oe(C, w, R) {
    throw Math.floor(C) !== C ? (Ae(C, R), new Ce.ERR_OUT_OF_RANGE("offset", "an integer", C)) : w < 0 ? new Ce.ERR_BUFFER_OUT_OF_BOUNDS() : new Ce.ERR_OUT_OF_RANGE(
      "offset",
      ">= 0 and <= ".concat(w),
      C
    );
  }
  const Ve = /[^+/0-9A-Za-z-_]/g;
  function Er(C) {
    if (C = C.split("=")[0], C = C.trim().replace(Ve, ""), C.length < 2) return "";
    for (; C.length % 4 !== 0; )
      C = C + "=";
    return C;
  }
  function Ge(C, w) {
    w = w || 1 / 0;
    let R;
    const A = C.length;
    let D = null;
    const P = [];
    for (let Z = 0; Z < A; ++Z) {
      if (R = C.charCodeAt(Z), R > 55295 && R < 57344) {
        if (!D) {
          if (R > 56319) {
            (w -= 3) > -1 && P.push(239, 191, 189);
            continue;
          } else if (Z + 1 === A) {
            (w -= 3) > -1 && P.push(239, 191, 189);
            continue;
          }
          D = R;
          continue;
        }
        if (R < 56320) {
          (w -= 3) > -1 && P.push(239, 191, 189), D = R;
          continue;
        }
        R = (D - 55296 << 10 | R - 56320) + 65536;
      } else D && (w -= 3) > -1 && P.push(239, 191, 189);
      if (D = null, R < 128) {
        if ((w -= 1) < 0) break;
        P.push(R);
      } else if (R < 2048) {
        if ((w -= 2) < 0) break;
        P.push(
          R >> 6 | 192,
          R & 63 | 128
        );
      } else if (R < 65536) {
        if ((w -= 3) < 0) break;
        P.push(
          R >> 12 | 224,
          R >> 6 & 63 | 128,
          R & 63 | 128
        );
      } else if (R < 1114112) {
        if ((w -= 4) < 0) break;
        P.push(
          R >> 18 | 240,
          R >> 12 & 63 | 128,
          R >> 6 & 63 | 128,
          R & 63 | 128
        );
      } else
        throw new Error("Invalid code point");
    }
    return P;
  }
  function Xe(C) {
    const w = [];
    for (let R = 0; R < C.length; ++R)
      w.push(C.charCodeAt(R) & 255);
    return w;
  }
  function ct(C, w) {
    let R, A, D;
    const P = [];
    for (let Z = 0; Z < C.length && !((w -= 2) < 0); ++Z)
      R = C.charCodeAt(Z), A = R >> 8, D = R % 256, P.push(D), P.push(A);
    return P;
  }
  function Xt(C) {
    return e.toByteArray(Er(C));
  }
  function ze(C, w, R, A) {
    let D;
    for (D = 0; D < A && !(D + R >= w.length || D >= C.length); ++D)
      w[D + R] = C[D];
    return D;
  }
  function ke(C, w) {
    return C instanceof w || C != null && C.constructor != null && C.constructor.name != null && C.constructor.name === w.name;
  }
  function xe(C) {
    return C !== C;
  }
  const je = function() {
    const C = "0123456789abcdef", w = new Array(256);
    for (let R = 0; R < 16; ++R) {
      const A = R * 16;
      for (let D = 0; D < 16; ++D)
        w[A + D] = C[R] + C[D];
    }
    return w;
  }();
  function Ee(C) {
    return typeof BigInt > "u" ? Q : C;
  }
  function Q() {
    throw new Error("BigInt not supported");
  }
})(Bs);
(function(r, e) {
  var t = Bs, i = t.Buffer;
  function u(f, n) {
    for (var b in f)
      n[b] = f[b];
  }
  i.from && i.alloc && i.allocUnsafe && i.allocUnsafeSlow ? r.exports = t : (u(t, e), e.Buffer = m);
  function m(f, n, b) {
    return i(f, n, b);
  }
  u(i, m), m.from = function(f, n, b) {
    if (typeof f == "number")
      throw new TypeError("Argument must not be a number");
    return i(f, n, b);
  }, m.alloc = function(f, n, b) {
    if (typeof f != "number")
      throw new TypeError("Argument must be a number");
    var h = i(f);
    return n !== void 0 ? typeof b == "string" ? h.fill(n, b) : h.fill(n) : h.fill(0), h;
  }, m.allocUnsafe = function(f) {
    if (typeof f != "number")
      throw new TypeError("Argument must be a number");
    return i(f);
  }, m.allocUnsafeSlow = function(f) {
    if (typeof f != "number")
      throw new TypeError("Argument must be a number");
    return t.SlowBuffer(f);
  };
})($r, $r.exports);
var uo = $r.exports, Tr = 65536, fo = 4294967295;
function ho() {
  throw new Error("Secure random number generation is not supported by this browser.\nUse Chrome, Firefox or Internet Explorer 11");
}
var mo = uo.Buffer, hr = dr.crypto || dr.msCrypto;
hr && hr.getRandomValues ? Wr.exports = po : Wr.exports = ho;
function po(r, e) {
  if (r > fo) throw new RangeError("requested too many random bytes");
  var t = mo.allocUnsafe(r);
  if (r > 0)
    if (r > Tr)
      for (var i = 0; i < r; i += Tr)
        hr.getRandomValues(t.slice(i, i + Tr));
    else
      hr.getRandomValues(t);
  return typeof e == "function" ? process.nextTick(function() {
    e(null, t);
  }) : t;
}
var go = Wr.exports;
const Bn = go;
let rt = class Xs {
  //TODO: ice-options: trickle
  /**
   * @constructor
   * @alias ICEInfo
   * @param {String} ufrag	- Peer ICE username framgent
   * @param {String} pwd		- Peer ICE password
   */
  constructor(e, t) {
    this.ufrag = e, this.pwd = t, this.lite = !1, this.endOfCandidates = !1;
  }
  /**
   * Create a clone of this Codec info object
   * @returns {ICEInfo}
   */
  clone() {
    const e = new Xs(this.ufrag, this.pwd);
    return e.setLite(this.lite), e.setEndOfCandidates(this.endOfCandidates), e;
  }
  /**
   * Return a plain javascript object which can be converted to JSON
   * @returns {ICEInfoPlain} Plain javascript object
   */
  plain() {
    const e = (
      /** @type {ICEInfoPlain} */
      {
        ufrag: this.ufrag,
        pwd: this.pwd
      }
    );
    return this.lite && (e.lite = this.lite), this.endOfCandidates && (e.endOfCandidates = this.endOfCandidates), e;
  }
  /**
   * Get username fragment
   * @returns {String} ufrag
   */
  getUfrag() {
    return this.ufrag;
  }
  /**
   * Get username password
   * @returns {String}	password
   */
  getPwd() {
    return this.pwd;
  }
  /**
   * Is peer ICE lite
   * @returns {Boolean}
   */
  isLite() {
    return this.lite;
  }
  /**
   * Set peer as ICE lite
   * @param {boolean} lite
   */
  setLite(e) {
    this.lite = e;
  }
  isEndOfCandidates() {
    return this.endOfCandidates;
  }
  /**
   * @param {Boolean} endOfCandidates
   */
  setEndOfCandidates(e) {
    this.endOfCandidates = e;
  }
};
rt.generate = function(r) {
  const e = new rt(), t = Bn(8), i = Bn(24);
  return e.ufrag = t.toString("hex"), e.pwd = i.toString("hex"), e.lite = r, e;
};
rt.expand = function(r) {
  if (r.constructor.name === "ICEInfo")
    return (
      /** @type {ICEInfo} */
      r
    );
  r = /** @type {ICEInfoPlain} */
  r;
  const e = new rt(r.ufrag, r.pwd);
  return e.setLite(r.lite), e.setEndOfCandidates(r.endOfCandidates), e;
};
rt.clone = function(r) {
  return r.constructor.name === "ICEInfo" ? (
    /** @type {ICEInfo} */
    r.clone()
  ) : rt.expand(r);
};
var zs = rt;
const yo = an, Le = yo("SEND", "RECV");
Le.byValue = function(r) {
  return Le[r.toUpperCase()];
};
Le.toString = function(r) {
  switch (r) {
    case Le.SEND:
      return "send";
    case Le.RECV:
      return "recv";
  }
};
Le.reverse = function(r) {
  switch (r) {
    case Le.SEND:
      return Le.RECV;
    case Le.RECV:
      return Le.SEND;
  }
};
var xr = Le;
const Ys = xr;
let Zt = class Ks {
  /**
   * @constructor
   * @alias DTLSInfo
   * @param {String} id		- rid value
   * @param {DirectionWay} direction	- direction
   */
  constructor(e, t) {
    this.id = e, this.direction = t, this.formats = /** @type {number[]} */
    [], this.params = /* @__PURE__ */ new Map();
  }
  /**
   * Create a clone of this RID info object
   * @returns {RIDInfo}
   */
  clone() {
    var e = new Ks(this.id, this.direction);
    return e.setFormats(this.formats), e.setParams(this.params), e;
  }
  /**
   * Return a plain javascript object which can be converted to JSON
   * @returns {RIDInfoPlain} Plain javascript object
   */
  plain() {
    var e = (
      /** @type {RIDInfoPlain} */
      {
        id: this.id,
        direction: Ys.toString(this.direction)
      }
    );
    this.formats && (e.formats = this.formats);
    for (var [t, i] of this.params.entries())
      e.params || (e.params = {}), e.params[t] = i;
    return e;
  }
  /**
   * Get the rid id value
   * @returns {String}
   */
  getId() {
    return this.id;
  }
  /**
   * Get rid direction
   * @returns {DirectionWay}
   */
  getDirection() {
    return this.direction;
  }
  /**
   * Set direction setup
   * @param {DirectionWay} direction
   */
  setDirection(e) {
    this.direction = e;
  }
  /**
   * Get pt formats for rid
   * @returns {Array<Number>}
   */
  getFormats() {
    return this.formats;
  }
  /**
   * Set pt formats for rid
   * @param {Array<Number>} formats
   */
  setFormats(e) {
    this.formats = [];
    for (let t = 0; t < e.length; ++t)
      this.formats.push(parseInt(
        /** @type {any} */
        e[t]
      ));
  }
  /**
   * Get the rid params
   * @returns {Map<String,String>} The params map
   */
  getParams() {
    return this.params;
  }
  /**
   * Set the rid params
   * @param {Map<String,String>} params - rid params map
   */
  setParams(e) {
    this.params = new Map(e);
  }
  /**
   * Add an rid param
   * @param {String} id
   * @param {String} param
   */
  addParam(e, t) {
    this.params.set(e, t);
  }
};
Zt.expand = function(r) {
  if (r.constructor.name === "RIDInfo")
    return (
      /** @type {RIDInfo} */
      r
    );
  r = /** @type {RIDInfoPlain} */
  r;
  const e = new Zt(r.id, Ys.byValue(r.direction));
  for (const [t, i] of Object.entries(r.params || {}))
    e.addParam(t, i);
  return r.formats && e.setFormats(r.formats), e;
};
Zt.clone = function(r) {
  return r.constructor.name === "RIDInfo" ? (
    /** @type {RIDInfo} */
    r.clone()
  ) : Zt.expand(r);
};
var un = Zt;
let Ut = class Hs {
  /**
   * @constructor
   * @alias SimulcastStreamInfo
   * @param {String} id		- rid for this simulcast stream
   * @param {Boolean} paused	- If this stream is initially paused
   */
  constructor(e, t) {
    this.paused = t, this.id = e;
  }
  /**
   * Create a clone of this simulcast stream info object
   * @returns {SimulcastStreamInfo}
   */
  clone() {
    return new Hs(this.id, this.paused);
  }
  /**
   * Return a plain javascript object which can be converted to JSON
   * @returns {SimulcastStreamInfoPlain} Plain javascript object
   */
  plain() {
    return {
      id: this.id,
      paused: this.paused
    };
  }
  /**
   * Is the stream paused
   * @returns {Boolean}
   */
  isPaused() {
    return this.paused;
  }
  /**
   * Get rid in this stream
   * @returns {String}
   */
  getId() {
    return this.id;
  }
};
Ut.expand = function(r) {
  return r.constructor.name === "SimulcastStreamInfo" ? (
    /** @type {SimulcastStreamInfo} */
    r
  ) : (r = /** @type {SimulcastStreamInfoPlain} */
  r, new Ut(r.id, r.paused));
};
Ut.clone = function(r) {
  return r.constructor.name === "SimulcastStreamInfo" ? (
    /** @type {SimulcastStreamInfo} */
    r.clone()
  ) : Ut.expand(r);
};
var dn = Ut;
const Gn = dn, He = xr;
let Ft = class Js {
  /**
   * @constructor
   * @alias SimulcastInfo
   */
  constructor() {
    this.send = /** @type {SimulcastStreamInfo[][]} */
    [], this.recv = /** @type {SimulcastStreamInfo[][]} */
    [];
  }
  /**
   * Create a clone of this track info object
   * @returns {SimulcastInfo}
   */
  clone() {
    const e = new Js();
    for (const t of this.send)
      e.addSimulcastAlternativeStreams(He.SEND, t.map((i) => i.clone()));
    for (const t of this.recv)
      e.addSimulcastAlternativeStreams(He.RECV, t.map((i) => i.clone()));
    return e;
  }
  /**
   * Return a plain javascript object which can be converted to JSON
   * @returns {SimulcastInfoPlain} Plain javascript object
   */
  plain() {
    const e = (
      /** @type {SimulcastInfoPlain} */
      {
        send: [],
        recv: []
      }
    );
    for (const t of this.send)
      e.send.push(t.map((i) => i.plain()));
    for (const t of this.recv)
      e.recv.push(t.map((i) => i.plain()));
    return e;
  }
  /**
   * Add a simulcast alternative streams for the specific direction
   * @param {DirectionWay} direction - Which direction you want the streams for
   * @param {Array<SimulcastStreamInfo>} streams - Stream info of all the alternatives
   */
  addSimulcastAlternativeStreams(e, t) {
    return e === He.SEND ? this.send.push(t) : this.recv.push(t);
  }
  /**
   * Add a single simulcast stream for the specific direction
   * @param {DirectionWay} direction - Which direction you want the streams for
   * @param {SimulcastStreamInfo} stream - Stream info of the single alternative
   */
  addSimulcastStream(e, t) {
    return e === He.SEND ? this.send.push([t]) : this.recv.push([t]);
  }
  /**
   * Get all simulcast streams by direction
   * @param {DirectionWay} direction - Which direction you want the streams for
   * @returns {Array<Array<SimulcastStreamInfo>>}
   */
  getSimulcastStreams(e) {
    return e === He.SEND ? this.send : this.recv;
  }
};
Ft.expand = function(r) {
  if (r.constructor.name === "SimulcastInfo")
    return (
      /** @type {SimulcastInfo} */
      r
    );
  r = /** @type {SimulcastInfoPlain} */
  r;
  const e = new Ft();
  for (const t of r.send || [])
    e.addSimulcastAlternativeStreams(He.SEND, t.map(Gn.expand));
  for (const t of r.recv || [])
    e.addSimulcastAlternativeStreams(He.RECV, t.map(Gn.expand));
  return e;
};
Ft.clone = function(r) {
  return r.constructor.name === "SimulcastInfo" ? (
    /** @type {SimulcastInfo} */
    r.clone()
  ) : Ft.expand(r);
};
var fn = Ft;
const bo = an, be = bo("SENDRECV", "SENDONLY", "RECVONLY", "INACTIVE");
be.byValue = function(r) {
  return be[r.toUpperCase()];
};
be.toString = function(r) {
  switch (r) {
    case be.SENDRECV:
      return "sendrecv";
    case be.SENDONLY:
      return "sendonly";
    case be.RECVONLY:
      return "recvonly";
    case be.INACTIVE:
      return "inactive";
  }
};
be.reverse = function(r) {
  switch (r) {
    case be.SENDRECV:
      return be.SENDRECV;
    case be.SENDONLY:
      return be.RECVONLY;
    case be.RECVONLY:
      return be.SENDONLY;
    case be.INACTIVE:
      return be.INACTIVE;
  }
};
var hn = be;
let Nt = class Qs {
  /**
   * @constructor
   * @alias DataChannelInfo
   * @param {Number} port
   * @param {Number} [maxMessageSize]
   */
  constructor(e, t) {
    this.port = e, this.maxMessageSize = t;
  }
  /**
   * Create a clone of this D info object
   * @returns {DataChannelInfo}
   */
  clone() {
    return new Qs(this.port, this.maxMessageSize);
  }
  /**
   * Return a plain javascript object which can be converted to JSON
   * @returns {DataChannelInfoPlain} Plain javascript object
   */
  plain() {
    return {
      port: this.port,
      maxMessageSize: this.maxMessageSize
    };
  }
  /**
   * Returns the sctp port number
   * @returns {Number}
   */
  getPort() {
    return this.port;
  }
  /**
   * Get max message size
   * @returns {Number | undefined}
   */
  getMaxMessageSize() {
    return this.maxMessageSize;
  }
};
Nt.expand = function(r) {
  return r.constructor.name === "DataChannelInfo" ? (
    /** @type {DataChannelInfo} */
    r
  ) : (r = /** @type {DataChannelInfoPlain} */
  r, new Nt(r.port, r.maxMessageSize));
};
Nt.clone = function(r) {
  return r.constructor.name === "DataChannelInfo" ? (
    /** @type {DataChannelInfo} */
    r.clone()
  ) : Nt.expand(r);
};
var mn = Nt;
const pn = wr, vo = un, qs = fn, ht = hn, kt = xr, ei = mn;
let nt = class Br {
  /**
   * @constructor
   * @alias MediaInfo
   * @param {String} id	- Media id
   * @param {MediaType} type	- Media type "audio"|"video"|"application"
   */
  constructor(e, t) {
    this.id = e, this.type = t, this.direction = ht.SENDRECV, this.extensions = /** @type {Map<Number, String>} */
    /* @__PURE__ */ new Map(), this.codecs = /** @type {Map<Number, CodecInfo>} */
    /* @__PURE__ */ new Map(), this.rids = /** @type {Map<String, RIDInfo>} */
    /* @__PURE__ */ new Map(), this.simulcast = null, this.bitrate = 0, this.control = null, this.dataChannel = null;
  }
  /**
   * Clone MediaInfo object
   * @returns {MediaInfo} cloned object
   */
  clone() {
    const e = new Br(this.id, this.type);
    e.setDirection(this.direction), e.setBitrate(this.bitrate);
    for (const t of this.codecs.values())
      e.addCodec(t.clone());
    for (const [t, i] of this.extensions.entries())
      e.addExtension(t, i);
    for (const t of this.rids.values())
      e.addRID(t.clone());
    return this.simulcast && e.setSimulcast(this.simulcast.clone()), this.control && e.setControl(this.control), this.dataChannel && e.setDataChannel(this.dataChannel.clone()), e;
  }
  /**
   * Return a plain javascript object which can be converted to JSON
   * @returns {MediaInfoPlain} Plain javascript object
   */
  plain() {
    const e = (
      /** @type {MediaInfoPlain} */
      {
        id: this.id,
        type: this.type,
        direction: ht.toString(this.direction),
        codecs: []
      }
    );
    this.dataChannel && (e.dataChannel = this.dataChannel.plain()), this.bitrate && (e.bitrate = this.bitrate);
    for (const t of this.codecs.values())
      e.codecs.push(t.plain());
    for (const [t, i] of this.extensions.entries())
      e.extensions || (e.extensions = {}), e.extensions[t] = i;
    for (const t of this.rids.values())
      e.rids || (e.rids = []), e.rids.push(t.plain());
    return this.simulcast && (e.simulcast = this.simulcast.plain()), this.control && (e.control = this.control), e;
  }
  /**
   * Get media type "audio"|"video"|"application"
   * @returns {MediaType}
   */
  getType() {
    return this.type;
  }
  /**
   * Get id (msid) for the media info
   * @returns {String}
   */
  getId() {
    return this.id;
  }
  /**
   * Set id (msid) for the media info
   * @param {String} id
   */
  setId(e) {
    this.id = e;
  }
  /**
   * Add rtp header extension support
   * @param {Number} id
   * @param {String} name
   */
  addExtension(e, t) {
    this.extensions.set(e, t);
  }
  /**
   * Add rid information
   * @param {RIDInfo} ridInfo
   */
  addRID(e) {
    this.rids.set(e.getId(), e);
  }
  /**
   * Add Codec support information
   * @param {CodecInfo} codecInfo - Codec info object
   */
  addCodec(e) {
    this.codecs.set(e.getType(), e);
  }
  /**
   * Set codec map
   * @param {Map<Number,CodecInfo>} codecs - Map of codec info objecs
   */
  setCodecs(e) {
    this.codecs = e;
  }
  /**
   * Get codec for payload type number
   * @param {Number} type - Payload type number
   * @returns {CodecInfo} codec info object
   */
  getCodecForType(e) {
    return this.codecs.get(e);
  }
  /**
   * Get codec by codec name
   * @param {String} codec - Codec name (eg: "vp8")
   * @returns {CodecInfo}
   */
  getCodec(e) {
    for (const t of this.codecs.values())
      if (t.getCodec().toLowerCase() === e.toLowerCase())
        return t;
    return null;
  }
  /**
   * Check if this media has information for this codec
   * @param {String} codec - Codec name
   * @returns {Boolean}
   */
  hasCodec(e) {
    return this.getCodec(e) !== null;
  }
  /**
   * Get all codecs in this media
   * @returns {Map<Number,CodecInfo>}
   */
  getCodecs() {
    return this.codecs;
  }
  /**
   * Check if any of the codecs on the media description supports rtx
   * @returns {Boolean}
   */
  hasRTX() {
    for (const e of this.codecs.values())
      if (e.hasRTX())
        return !0;
    return !1;
  }
  /**
   * Get all extensions registered in  this media info
   * @returns {Map<Number,String>}
   */
  getExtensions() {
    return this.extensions;
  }
  /**
   * Get all rids registered in  this media info
   * @returns {Map<String,RIDInfo>}
   */
  getRIDs() {
    return this.rids;
  }
  /**
   * Get rid info for id
   * @param {String} id - rid value to get info for
   * @returns {RIDInfo}
   */
  getRID(e) {
    return this.rids.get(e);
  }
  /**
   * Returns maximum bitrate for this media
   * @returns {Number}
   */
  getBitrate() {
    return this.bitrate;
  }
  /**
   * Set maximum bitrate for this media
   * @param {Number} bitrate
   */
  setBitrate(e) {
    this.bitrate = e;
  }
  /**
   * Get media direction
   * @returns {Direction}
   */
  getDirection() {
    return this.direction;
  }
  /**
   * Set media direction
   * @param {Direction} direction
   */
  setDirection(e) {
    this.direction = e;
  }
  /**
   * Check if media has control attribute
   * @returns {Boolean}
   */
  hasControl() {
    return !!this.control;
  }
  /**
   * Get control attribute
   * @returns {String}
   */
  getControl() {
    return this.control;
  }
  /**
   * Set control attribute
   * @param {String} control
   */
  setControl(e) {
    this.control = e;
  }
  /**
   * Check if media has a dataChannel
   * @returns {Boolean}
   */
  hasDataChannel() {
    return !!this.dataChannel;
  }
  /**
   * Get dataChannel info
   * @returns {DataChannelInfo}
   */
  getDataChannel() {
    return this.dataChannel;
  }
  /**
   * Set dataChannel info
   * @param {DataChannelInfo} dataChannel info
   */
  setDataChannel(e) {
    this.dataChannel = e;
  }
  /**
   * Helper usefull for creating media info answers.
   * - Will reverse the direction
   * - For each supported codec, it will change the payload type to match the offer and append it to the answer
   * - For each supported extension, it will append the ones present on the offer with the id offered
   * @param {SupportedMedia} [supported] - Supported codecs and extensions to be included on answer
   * @returns {MediaInfo}
   */
  answer(e) {
    const t = new Br(this.id, this.type);
    if (e) {
      t.setDirection(ht.reverse(this.direction));
      const { codecs: i, dataChannel: u } = e;
      if (i) {
        let f;
        Array.isArray(i) ? f = pn.MapFromNames(i, e.rtx, e.rtcpfbs) : f = i;
        for (let n of this.codecs.values())
          for (let b of f.values()) {
            if (b.getCodec().toLowerCase() !== n.getCodec().toLowerCase() || b.getCodec() === "h264" && b.hasParam("packetization-mode") && b.getParam("packetization-mode") != n.getParam("packetization-mode", "0") || b.getCodec() === "h264" && b.hasParam("profile-level-id") && n.hasParam("profile-level-id") && b.getParam("profile-level-id") != n.getParam("profile-level-id") || b.getCodec() === "multiopus" && b.hasParam("num_streams") && n.hasParam("num_streams") && b.getParam("num_streams") != n.getParam("num_streams"))
              continue;
            const h = b.clone();
            h.setType(n.getType()), h.hasRTX() && h.setRTX(n.getRTX()), n.hasChannels() && h.setChannels(n.getChannels()), h.addParams(n.getParams()), t.addCodec(h);
            break;
          }
      }
      const m = new Set(e.extensions);
      for (let [f, n] of this.extensions)
        m.has(n) && t.addExtension(f, n);
      if (e.simulcast && this.simulcast) {
        const f = new qs(), n = this.simulcast.getSimulcastStreams(kt.SEND);
        if (n)
          for (const h of n) {
            const g = h.map((o) => o.clone());
            f.addSimulcastAlternativeStreams(kt.RECV, g);
          }
        const b = this.simulcast.getSimulcastStreams(kt.RECV);
        if (b)
          for (const h of b) {
            const g = h.map((o) => o.clone());
            f.addSimulcastAlternativeStreams(kt.SEND, g);
          }
        for (const h of this.rids.values()) {
          const g = h.clone();
          g.setDirection(kt.reverse(h.getDirection())), t.addRID(g);
        }
        t.setSimulcast(f);
      }
      if (u && this.dataChannel) {
        const f = new ei(this.dataChannel.getPort(), u.maxMessageSize ? u.maxMessageSize : this.dataChannel.getMaxMessageSize());
        t.setDataChannel(f);
      }
    } else
      t.setDirection(ht.INACTIVE);
    return t;
  }
  /**
   * Get Simulcast info
   * @returns {SimulcastInfo}
   */
  getSimulcast() {
    return this.simulcast;
  }
  /**
   * Set stream simulcast info
   * @param {SimulcastInfo} simulcast - Simulcast stream info
   */
  setSimulcast(e) {
    this.simulcast = e;
  }
};
nt.create = function(r, e, t) {
  !t && typeof e != "string" && (t = e, e = r);
  const i = new nt(r, e);
  if (t) {
    const { codecs: u } = t;
    u && (Array.isArray(u) ? i.setCodecs(pn.MapFromNames(u, t.rtx, t.rtcpfbs)) : i.setCodecs(u));
  } else
    i.setDirection(ht.INACTIVE);
  return i;
};
nt.expand = function(r) {
  if (r.constructor.name === "MediaInfo")
    return (
      /** @type {MediaInfo} */
      r
    );
  r = /** @type {MediaInfoPlain} */
  r;
  const e = new nt(r.id, r.type);
  if (r.direction && e.setDirection(ht.byValue(r.direction)), e.setBitrate(r.bitrate), r.dataChannel) {
    const t = ei.expand(r.dataChannel);
    t && e.setDataChannel(t);
  }
  for (const [t, i] of Object.entries(r.extensions))
    e.addExtension(wo(t), i);
  for (const t of r.codecs) {
    const i = pn.expand(t);
    i && e.addCodec(i);
  }
  for (const t of r.rids || []) {
    const i = vo.expand(t);
    e.addRID(i);
  }
  return r.simulcast && e.setSimulcast(qs.expand(r.simulcast)), r.control && e.setControl(r.control), e;
};
nt.clone = function(r) {
  return r.constructor.name === "MediaInfo" ? (
    /** @type {MediaInfo} */
    r.clone()
  ) : nt.expand(r);
};
function wo(r) {
  const e = r.toString();
  if (!/^\d+$/.test(e))
    throw new Error("invalid integer ".concat(e));
  return parseInt(e);
}
var ti = nt;
let Ot = class ri {
  /**
   * @constructor
   * @alias SourceGroupInfo
   * @alias SourceGroupInfo
   * @param {String} semantics	- Group semantics
   * @param {Array<Number>} ssrcs	- SSRC list
   */
  constructor(e, t) {
    this.semantics = e, this.ssrcs = [];
    for (let i = 0; i < t.length; ++i)
      this.ssrcs.push(parseInt(
        /** @type {any} */
        t[i]
      ));
  }
  /**
   * Create a clone of this source group info object
   * @returns {SourceGroupInfo}
   */
  clone() {
    return new ri(this.semantics, this.ssrcs);
  }
  /**
   * Return a plain javascript object which can be converted to JSON
   * @returns {SourceGroupInfoPlain} Plain javascript object
   */
  plain() {
    const e = (
      /** @type {SourceGroupInfoPlain} */
      {
        semantics: this.semantics,
        ssrcs: []
      }
    );
    for (let t = 0; t < this.ssrcs.length; ++t)
      e.ssrcs.push(this.ssrcs[t]);
    return e;
  }
  /**
   * Get group semantics
   * @returns {String}
   */
  getSemantics() {
    return this.semantics;
  }
  /**
   * Get list of ssrcs from this group
   * @returns {Array<Number>}
   */
  getSSRCs() {
    return this.ssrcs;
  }
};
Ot.expand = function(r) {
  return r.constructor.name === "SourceGroupInfo" ? (
    /** @type {SourceGroupInfo} */
    r
  ) : (r = /** @type {SourceGroupInfoPlain} */
  r, new Ot(r.semantics, r.ssrcs));
};
Ot.clone = function(r) {
  return r.constructor.name === "SourceGroupInfo" ? (
    /** @type {SourceGroupInfo} */
    r.clone()
  ) : Ot.expand(r);
};
var gn = Ot;
let Vt = class ni {
  /**
   * @constructor
   * @alias SourceInfo
   * @param {Number} ssrc
   */
  constructor(e) {
    this.ssrc = e;
  }
  /**
   * Create a clone of this source info object
   * @returns {SourceInfo}
   */
  clone() {
    const e = new ni(this.ssrc);
    return e.setCName(this.cname), e.setStreamId(this.streamId), e.setTrackId(this.trackId), e;
  }
  /**
   * Return a plain javascript object which can be converted to JSON
   * @returns {SourceInfoPlain} Plain javascript object
   */
  plain() {
    const e = (
      /** @type {SourceInfoPlain} */
      {
        ssrc: this.ssrc
      }
    );
    return this.cname && (e.cname = this.cname), this.streamId && (e.streamId = this.streamId), this.trackId && (e.trackId = this.trackId), e;
  }
  /**
   * Get source CName
   * @returns {String}
   */
  getCName() {
    return this.cname;
  }
  /**
   * Set source CName
   * @param {String} cname
   */
  setCName(e) {
    this.cname = e;
  }
  /**
   * Get associated stream id
   * @returns {String}
   */
  getStreamId() {
    return this.streamId;
  }
  /**
   * Set associated stream id for this ssrc
   * @param {String} streamId
   */
  setStreamId(e) {
    this.streamId = e;
  }
  /**
   * Get associated track id
   * @returns {String}
   */
  getTrackId() {
    return this.trackId;
  }
  /**
   * Set associated track id for this ssrc
   * @param {String} trackId
   */
  setTrackId(e) {
    this.trackId = e;
  }
  /**
   * Get ssrc from source
   * @returns {Number}
   */
  getSSRC() {
    return this.ssrc;
  }
};
Vt.expand = function(r) {
  if (r.constructor.name === "SourceInfo")
    return (
      /** @type {SourceInfo} */
      r
    );
  r = /** @type {SourceInfoPlain} */
  r;
  const e = new Vt(r.ssrc);
  return e.setCName(r.cname), e.setStreamId(r.streamId), e.setTrackId(r.trackId), e;
};
Vt.clone = function(r) {
  return r.constructor.name === "SourceInfo" ? (
    /** @type {SourceInfo} */
    r.clone()
  ) : Vt.expand(r);
};
var si = Vt;
const So = wr;
let jt = class ii {
  /**
   * @constructor
   * @alias DTLSInfo
   * @param {String} id		- rid value
   * @param {Boolean} [paused]
   */
  constructor(e, t = !1) {
    this.id = e, this.paused = t, this.codecs = /* @__PURE__ */ new Map(), this.params = /* @__PURE__ */ new Map();
  }
  /**
   * Create a clone of this RID info object
   * @returns {TrackEncodingInfo}
   */
  clone() {
    var e = new ii(this.id, this.paused);
    for (let t of this.codecs.values())
      e.addCodec(t.clone());
    return e.setParams(this.params), e;
  }
  /**
   * Return a plain javascript object which can be converted to JSON
   * @returns {TrackEncodingInfoPlain} Plain javascript object
   */
  plain() {
    var e = (
      /** @type {TrackEncodingInfoPlain} */
      {
        id: this.id,
        paused: this.paused,
        codecs: {},
        params: {}
      }
    );
    for (var [t, i] of this.codecs.entries())
      e.codecs[t] = i.plain();
    for (var [t, u] of this.params.entries())
      e.params[t] = u;
    return e;
  }
  /**
   * Get the rid id value
   * @returns {String}
   */
  getId() {
    return this.id;
  }
  /**
   * Get codec information for this encoding (if any)
   * @returns {Map<Number,CodecInfo>}
   */
  getCodecs() {
    return this.codecs;
  }
  /**
   * Add codec info
   * @param {CodecInfo} codec - Codec Info
   */
  addCodec(e) {
    this.codecs.set(e.getType(), e);
  }
  /**
   * Get the rid params
   * @returns {Map<String,String>} The params map
   */
  getParams() {
    return this.params;
  }
  /**
   * Set the rid params
   * @param {Map<String,String>} params - rid params map
   */
  setParams(e) {
    this.params = new Map(e);
  }
  /**
   * Add an rid param
   * @param {String} id
   * @param {String} param
   */
  addParam(e, t) {
    this.params.set(e, t);
  }
  /**
   * Is the stream paused
   * @returns {Boolean}
   */
  isPaused() {
    return this.paused;
  }
};
jt.expand = function(r) {
  if (r.constructor.name === "TrackEncodingInfo")
    return (
      /** @type {TrackEncodingInfo} */
      r
    );
  r = /** @type {TrackEncodingInfoPlain} */
  r;
  const e = new jt(r.id, r.paused);
  for (const t of Object.values(r.codecs || {}))
    e.addCodec(So.expand(t));
  for (const [t, i] of Object.entries(r.params || {}))
    e.addParam(t, i);
  return e;
};
jt.clone = function(r) {
  return r.constructor.name === "TrackEncodingInfo" ? (
    /** @type {TrackEncodingInfo} */
    r.clone()
  ) : jt.expand(r);
};
var yn = jt;
const Ar = gn, Xn = yn;
let Wt = class oi {
  /**
   * @constructor
   * @alias TrackInfo
   * @param {TrackType} media	- Media type "audio"|"video"
   * @param {String} id		- Track id
   */
  constructor(e, t) {
    this.media = e, this.id = t, this.ssrcs = /** @type {number[]} */
    [], this.groups = /** @type {SourceGroupInfo[]} */
    [], this.encodings = /** @type {TrackEncodingInfo[][]} */
    [];
  }
  /**
   * Create a clone of this track info object
   * @returns {TrackInfo}
   */
  clone() {
    const e = new oi(this.media, this.id);
    this.mediaId && e.setMediaId(this.mediaId);
    for (let t = 0; t < this.ssrcs.length; ++t)
      e.addSSRC(this.ssrcs[t]);
    for (let t = 0; t < this.groups.length; ++t)
      e.addSourceGroup(this.groups[t].clone());
    for (let t = 0; t < this.encodings.length; ++t) {
      const i = [];
      for (let u = 0; u < this.encodings[t].length; ++u)
        i.push(this.encodings[t][u].clone());
      e.addAlternativeEncodings(i);
    }
    return e;
  }
  /**
   * Return a plain javascript object which can be converted to JSON
   * @returns {TrackInfoPlain} Plain javascript object
   */
  plain() {
    const e = (
      /** @type {TrackInfoPlain} */
      {
        media: this.media,
        id: this.id,
        ssrcs: []
      }
    );
    this.mediaId && (e.mediaId = this.mediaId);
    for (let t = 0; t < this.ssrcs.length; ++t)
      e.ssrcs.push(this.ssrcs[t]);
    for (let t = 0; t < this.groups.length; ++t)
      e.groups || (e.groups = []), e.groups.push(this.groups[t].plain());
    for (let t = 0; t < this.encodings.length; ++t) {
      const i = (
        /** @type {TrackEncodingInfoPlain[]} */
        []
      );
      for (let u = 0; u < this.encodings[t].length; ++u)
        i.push(this.encodings[t][u].plain());
      i.length && (e.encodings || (e.encodings = []), e.encodings.push(i));
    }
    return e;
  }
  /**
   * Get media type
   * @returns {TrackType} - "audio"|"video"
   */
  getMedia() {
    return this.media;
  }
  /**
   * Set the media line id this track belongs to. Set to null for first media line of the media type
   * @param {String} mediaId		- MediaInfo id
   */
  setMediaId(e) {
    this.mediaId = e;
  }
  /**
   * Returns the MediaInfo id this track belongs two (unified) or undefined if indiferent (plan B)
   * @returns {String}
   */
  getMediaId() {
    return this.mediaId;
  }
  /**
   * Get track id
   * @returns {String}
   */
  getId() {
    return this.id;
  }
  /**
   * Add ssrc for this track
   * @param {Number} ssrc
   */
  addSSRC(e) {
    this.ssrcs.push(e);
  }
  /**
   * Get all
   * @returns {Array<Number>}
   */
  getSSRCs() {
    return this.ssrcs;
  }
  /**
   * Add source group to track
   * @param {SourceGroupInfo} group
   */
  addSourceGroup(e) {
    this.groups.push(e);
  }
  /**
   * Get the source group fot the desired type
   * @param {String} schematics - Group type
   * @returns {SourceGroupInfo}
   */
  getSourceGroup(e) {
    for (const t of this.groups)
      if (t.getSemantics().toLowerCase() === e.toLowerCase())
        return t;
    return null;
  }
  /**
   * Get all source groups for this track
   * @returns {Array<SourceGroupInfo>}
   */
  getSourceGroups() {
    return this.groups;
  }
  /**
   * Get groups for given media ssrc
   * @param {number} ssrc - Media SSRC
   * @returns {Array<SourceGroupInfo>}
   */
  getSourceGroupsForMediaSSRC(e) {
    return this.groups.filter((t) => t.getSSRCs()[0] === e);
  }
  /**
   * Check if track has a group for this type
   * @param {String} schematics
   * @returns {Boolean}
   */
  hasSourceGroup(e) {
    for (const t of this.groups)
      if (t.getSemantics().toLowerCase() === e.toLowerCase())
        return !0;
    return !1;
  }
  /**
   * Get simulcast encoding information for this track (if any)
   * @returns {Array<Array<TrackEncodingInfo>>}
   */
  getEncodings() {
    return this.encodings;
  }
  /**
   * Add simulcast encoding information for this track
   * @param {TrackEncodingInfo} encoding - Simulcast encoding info
   */
  addEncoding(e) {
    this.encodings.push([e]);
  }
  /**
   * Add simulcast encoding information for this track
   * @param {Array<TrackEncodingInfo>} alternatives - Simulcast encoding info
   */
  addAlternativeEncodings(e) {
    this.encodings.push(e);
  }
  /**
   * Add simulcast encoding information for this track
   * @param {Array<Array<TrackEncodingInfo>>} encodings - Simulcast encoding info
   */
  setEncodings(e) {
    this.encodings = e;
  }
  /**
   * Get parsed encoding sources
   * @returns {Array<EncodingSourceInfo>}
   */
  getEncodingSources() {
    const e = [];
    if (this.encodings.length)
      for (const t of this.encodings)
        for (const i of t) {
          const u = {
            id: i.getId(),
            rid: i.getId()
          }, m = i.getParams(), f = m == null ? void 0 : m.get("ssrc");
          if (f !== void 0) {
            u.media = parseInt(f);
            for (const n of this.getSourceGroupsForMediaSSRC(u.media))
              switch (n.getSemantics()) {
                case "FID":
                  u.rtx = n.getSSRCs()[1];
                  break;
                case "FEC-FR":
                  u.fec = n.getSSRCs()[1];
                  break;
              }
          }
          e.push(u);
        }
    else if (this.hasSourceGroup("SIM")) {
      const i = this.getSourceGroup("SIM").getSSRCs();
      this.getSourceGroups();
      for (const u of i) {
        const m = {
          id: String(u),
          media: u
        };
        for (const f of this.getSourceGroupsForMediaSSRC(m.media))
          switch (f.getSemantics()) {
            case "FID":
              m.rtx = f.getSSRCs()[1];
              break;
            case "FEC-FR":
              m.fec = f.getSSRCs()[1];
              break;
          }
        e.push(m);
      }
    } else {
      const t = {
        id: ""
      };
      if (this.ssrcs.length) {
        t.media = this.ssrcs[0];
        for (const i of this.getSourceGroupsForMediaSSRC(t.media))
          switch (i.getSemantics()) {
            case "FID":
              t.rtx = i.getSSRCs()[1];
              break;
            case "FEC-FR":
              t.fec = i.getSSRCs()[1];
              break;
          }
      }
      e.push(t);
    }
    return e;
  }
};
Wt.expand = function(r) {
  var e, t;
  if (r.constructor.name === "TrackInfo")
    return (
      /** @type {TrackInfo} */
      r
    );
  r = /** @type {TrackInfoPlain} */
  r;
  const i = new Wt(r.media, r.id);
  if (r.mediaId && i.setMediaId(r.mediaId), Array.isArray(r.ssrcs))
    for (const u of r.ssrcs)
      i.addSSRC(u);
  else if (((e = r.ssrcs) === null || e === void 0 ? void 0 : e.media) !== void 0) {
    const u = r.ssrcs.media;
    if (i.addSSRC(u), r.ssrcs.rtx !== void 0) {
      const m = r.ssrcs.rtx;
      i.addSSRC(m), i.addSourceGroup(new Ar("FID", [u, m]));
    }
    if (r.ssrcs.fec !== void 0) {
      const m = r.ssrcs.fec;
      i.addSSRC(m), i.addSourceGroup(new Ar("FEC-FR", [u, m]));
    }
  }
  if (r.rid) {
    const u = new Xn(r.rid);
    ((t = r.ssrcs) === null || t === void 0 ? void 0 : t.media) !== void 0 && u.addParam("ssrc", r.ssrcs.media), i.addAlternativeEncodings([
      u
    ]);
  }
  for (const u of r.groups || [])
    i.addSourceGroup(Ar.expand(u));
  for (const u of r.encodings || []) {
    const m = [];
    for (const f of u)
      m.push(Xn.expand(f));
    i.addAlternativeEncodings(m);
  }
  return i;
};
Wt.clone = function(r) {
  return r.constructor.name === "TrackInfo" ? (
    /** @type {TrackInfo} */
    r.clone()
  ) : Wt.expand(r);
};
var bn = Wt;
const xo = bn;
let $t = class ai {
  /**
   * @constructor
   * @alias StreamInfo
   * @param {String} id
   */
  constructor(e) {
    this.id = e, this.tracks = /** @type {Map<String, TrackInfo>} */
    /* @__PURE__ */ new Map();
  }
  /**
   * Create a clone of this stream info object
   * @returns {StreamInfo}
   */
  clone() {
    const e = new ai(this.id);
    for (const t of this.tracks.values())
      e.addTrack(t.clone());
    return e;
  }
  /**
   * Return a plain javascript object which can be converted to JSON
   * @returns {StreamInfoPlain} Plain javascript object
   */
  plain() {
    const e = (
      /** @type {StreamInfoPlain} */
      {
        id: this.id,
        tracks: []
      }
    );
    for (const t of this.tracks.values())
      e.tracks.push(t.plain());
    return e;
  }
  /**
   * Get the media stream id
   * @returns {String}
   */
  getId() {
    return this.id;
  }
  /**
   * Add media track
   * @param {TrackInfo} track
   */
  addTrack(e) {
    this.tracks.set(e.getId(), e);
  }
  /**
   * Remove a media track from stream
   * @param {TrackInfo} track - Info object from the track
   * @returns {Boolean} if the track was present on track map or not
   */
  removeTrack(e) {
    return this.tracks.delete(e.getId());
  }
  /**
   * Remove a media track from stream
   * @param {String} trackId - Id of the track to remote
   * @returns {Boolean} if the track was present on track map or not
   */
  removeTrackById(e) {
    return this.tracks.delete(e);
  }
  /**
   * Get first track for the media type
   * @param {TrackType} media - Media type "audio"|"video"
   * @returns {TrackInfo}
   */
  getFirstTrack(e) {
    for (let t of this.tracks.values())
      if (t.getMedia().toLowerCase() === e.toLowerCase())
        return t;
    return null;
  }
  /**
   * Get all tracks from the media stream
   * @returns {Map<String, TrackInfo>}
   */
  getTracks() {
    return this.tracks;
  }
  /**
   * Remove all tracks from media sream
   */
  removeAllTracks() {
    this.tracks.clear();
  }
  /**
   * Get track by id
   * @param {String} trackId
   * @returns {TrackInfo}
   */
  getTrack(e) {
    return this.tracks.get(e);
  }
};
$t.expand = function(r) {
  if (r.constructor.name === "StreamInfo")
    return (
      /** @type {StreamInfo} */
      r
    );
  r = /** @type {StreamInfoPlain} */
  r;
  const e = new $t(r.id);
  for (const t of r.tracks || []) {
    const i = xo.expand(t);
    i && e.addTrack(i);
  }
  return e;
};
$t.clone = function(r) {
  return r.constructor.name === "StreamInfo" ? (
    /** @type {StreamInfo} */
    r.clone()
  ) : $t.expand(r);
};
var ci = $t;
const mt = Ne, _e = eo("en-US"), gt = Us, Ro = wr, Io = on, yt = js, bt = $s, st = zs, mr = ti, Gr = cn, Xr = hn, Qe = xr, ko = gn, Eo = si, At = ci, Lr = bn, Co = yn, _o = fn, zn = dn, To = un, Ao = mn;
let De = class lr {
  /**
   * @constructor
   * @alias SDPInfo
   * @param {Number} [version] SDP version attribute
   */
  constructor(e) {
    this.version = e || 1, this.streams = /** @type {Map<String, StreamInfo>} */
    /* @__PURE__ */ new Map(), this.medias = /** @type {Array<MediaInfo>} */
    new Array(), this.candidates = /** @type {Array<CandidateInfo>} */
    new Array(), this.ice = null, this.dtls = null, this.crypto = null, this.extmapAllowMixed = !0;
  }
  /**
   * Clone SDPinfo object
   * @returns {SDPInfo} cloned object
   */
  clone() {
    const e = new lr(this.version);
    for (const t of this.medias)
      e.addMedia(t.clone());
    for (const t of this.streams.values())
      e.addStream(t.clone());
    for (const t of this.candidates)
      e.addCandidate(t.clone());
    return e.setICE(this.ice.clone()), this.dtls && e.setDTLS(this.dtls.clone()), this.crypto && e.setCrypto(this.crypto.clone()), e.setExtmapAllowMixed(this.extmapAllowMixed), e;
  }
  /**
   * Return a plain javascript object which can be converted to JSON
   * @returns {SDPInfoPlain} Plain javascript object
   */
  plain() {
    const e = (
      /** @type {SDPInfoPlain} */
      {
        version: this.version,
        streams: [],
        medias: [],
        candidates: []
      }
    );
    for (const t of this.medias)
      e.medias.push(t.plain());
    for (const t of this.streams.values())
      e.streams.push(t.plain());
    for (const t of this.candidates)
      e.candidates.push(t.plain());
    return this.ice && (e.ice = this.ice.plain()), this.dtls && (e.dtls = this.dtls.plain()), this.crypto && (e.crypto = this.crypto.plain()), this.extmapAllowMixed || (e.extmapAllowMixedNotSupported = !this.extmapAllowMixed), e;
  }
  /**
   * Returns an unified plan version of the SDP info
   * @returns {SDPInfo} Unified version
   */
  unify() {
    const e = new lr(this.version);
    for (const i of this.medias)
      e.addMedia(i.clone());
    const t = {
      audio: e.getMediasByType("audio"),
      video: e.getMediasByType("video")
    };
    for (const i of this.streams.values()) {
      const u = i.clone();
      for (const m of u.getTracks().values()) {
        let f = t[m.getMedia()].pop();
        f || (f = this.getMedia(m.getMedia()).clone(), f.setId(m.getId()), e.addMedia(f)), m.setMediaId(f.getId());
      }
      e.addStream(u);
    }
    for (const i of this.candidates)
      e.addCandidate(i.clone());
    return this.ice && e.setICE(this.ice.clone()), this.dtls && e.setDTLS(this.dtls.clone()), this.crypto && e.setCrypto(this.crypto.clone()), e;
  }
  /**
   * Set SDP version
   * @param {Number} version
   */
  setVersion(e) {
    this.version = e;
  }
  /**
   * Add a new media description information to this sdp info
   * @param {MediaInfo} media
   */
  addMedia(e) {
    this.medias.push(e);
  }
  /**
   * Get first media description info associated to the media type
   * @param {MediaType} type - Media type ('audio'|'video')
   * @returns {MediaInfo} or null if not found
   */
  getMedia(e) {
    for (let t in this.medias) {
      let i = this.medias[t];
      if (_e(i.getType(), e))
        return i;
    }
    return null;
  }
  /**
   * Get all media description info associated to the media type
   * @param {MediaType} type - Media type ('audio'|'video')
   * @returns {Array<MediaInfo>} or null if not found
   */
  getMediasByType(e) {
    let t = [];
    for (let i in this.medias) {
      let u = this.medias[i];
      _e(u.getType(), e) && t.push(u);
    }
    return t;
  }
  /**
   * Get media description info associated by media Ide
   * @param {string} msid - Media ID
   * @returns {MediaInfo} or null if not found
   */
  getMediaById(e) {
    for (const t of this.medias)
      if (_e(t.getId(), e))
        return t;
    return null;
  }
  /**
   * Replace media with same id with the new one
   * @param {MediaInfo} media - The new media
   * @returns {boolean} true if the media was replaced, false if not found
   */
  replaceMedia(e) {
    for (let t in this.medias)
      if (this.medias[t].getId() == e.getId())
        return this.medias[t] = e, !0;
    return !1;
  }
  /**
   * Return all media description information
   * @returns {Array<MediaInfo>}
   */
  getMedias() {
    return this.medias;
  }
  /**
   * Return SDP version attribute
   * @returns {Number}
   */
  getVersion() {
    return this.version;
  }
  /**
   * Get DTLS info for the transport bundle
   * @returns {DTLSInfo} DTLS info object
   */
  getDTLS() {
    return this.dtls;
  }
  /**
   * Set DTLS info object for the transport bundle
   * @param {DTLSInfo}  dtlsInfo - DTLS info object
   */
  setDTLS(e) {
    this.dtls = e;
  }
  /**
   * Check if sdp is using crypto
   * @returns {boolean}
   */
  hasCrypto() {
    return !!this.crypto;
  }
  /**
   * Get SDES info for the transport bundle
   * @returns {CryptoInfo} DTLS info object
   */
  getCrypto() {
    return this.crypto;
  }
  /**
   * Set SDES info object for the transport bundle
   * @param {CryptoInfo}  cryptoInfo - DTLS info object
   */
  setCrypto(e) {
    this.crypto = e;
  }
  /**
   * Check if sdp is using ice
   * @returns {boolean}
   */
  hasICE() {
    return !!this.ice;
  }
  /**
   * Get the ICE info object for the transport bundle
   * @returns {ICEInfo} ICE info object
   */
  getICE() {
    return this.ice;
  }
  /**
   * Set ICE info object for the transport bundle
   * @param {ICEInfo} iceInfo - ICE info object
   */
  setICE(e) {
    this.ice = e;
  }
  /**
   * Add ICE candidate for transport
   * @param {CandidateInfo} candidate - ICE candidate
   */
  addCandidate(e) {
    for (const t of this.candidates)
      if (t.equals(e))
        return;
    this.candidates.push(e);
  }
  /**
   * Add ICE candidates for transport
   * @param {Array<CandidateInfo>} candidates - ICE candidates
   */
  addCandidates(e) {
    for (const t of e)
      this.addCandidate(t);
  }
  /**
   * Get all ICE candidates for this transport
   * @returns {Array<CandidateInfo>}
   */
  getCandidates() {
    return this.candidates;
  }
  /**
   * Get announced stream
   * @param {String} id
   * @returns {StreamInfo}
   */
  getStream(e) {
    return this.streams.get(e);
  }
  /**
   * Get all announced stream
   * @returns {Map<String, StreamInfo>}
   */
  getStreams() {
    return this.streams;
  }
  /**
   * Get first announced stream
   * @returns {StreamInfo}
   */
  getFirstStream() {
    for (const e of this.streams.values())
      return e;
    return null;
  }
  /**
   * Announce a new stream in SDP
   * @param {StreamInfo} stream
   */
  addStream(e) {
    this.streams.set(e.getId(), e);
  }
  /**
   * Remove an announced stream from SDP
   * @param {StreamInfo} stream
   * @returns {boolean}
   */
  removeStream(e) {
    return this.streams.delete(e.getId());
  }
  /**
   * Remove all streams
   */
  removeAllStreams() {
    this.streams.clear();
  }
  /**
   * Get all tracks in all streams by media type
   * @param {MediaType} type - Media type ('audio'|'video')
   * @returns {Array<TrackInfo>} or null if not found
   */
  getTracksByMediaType(e) {
    let t = [];
    for (const i of this.streams.values())
      for (const [u, m] of i.getTracks())
        _e(m.getMedia(), e) && t.push(m);
    return t;
  }
  /**
   *
   * @param {String} mid Media Id
   * @returns {TrackInfo} Track info
   */
  getTrackByMediaId(e) {
    for (const t of this.streams.values())
      for (const [i, u] of t.getTracks())
        if (u.getMediaId() == e)
          return u;
    return null;
  }
  /**
   *
   * @param {String} mid Media Id
   * @returns {StreamInfo | null} Streaminfo
   */
  getStreamByMediaId(e) {
    for (const t of this.streams.values())
      for (const [i, u] of t.getTracks())
        if (u.getMediaId() == e)
          return t;
    return null;
  }
  /**
   * Set if mixed extmaps are allowed
   * @returns {boolean}
   */
  getExtmapAllowMixed() {
    return this.extmapAllowMixed;
  }
  /**
   * Check if mixed extmaps are allowed
   * @param {boolean} extmapAllowMixed
   */
  setExtmapAllowMixed(e) {
    this.extmapAllowMixed = e;
  }
  /**
   * Create answer to this SDP
   * @param {SDPInfoParams} params		- Parameters to create answer
   * @returns {SDPInfo} answer
   */
  answer(e) {
    const t = new lr();
    e.ice && (e.ice instanceof st ? t.setICE(e.ice.clone()) : t.setICE(st.expand(e.ice))), e.dtls && (e.dtls instanceof yt ? t.setDTLS(e.dtls) : t.setDTLS(yt.expand(e.dtls))), e.crypto && (e.crypto instanceof bt ? t.setCrypto(e.crypto) : t.setCrypto(bt.expand(e.crypto)));
    for (let i = 0; e.candidates && i < e.candidates.length; ++i)
      e.candidates[i] instanceof gt ? t.addCandidate(e.candidates[i].clone()) : t.addCandidate(gt.expand(e.candidates[i]));
    for (const i of this.medias) {
      const u = e && e.capabilities && e.capabilities[i.getType()];
      t.addMedia(i.answer(u));
    }
    return t.setExtmapAllowMixed(this.extmapAllowMixed), t;
  }
  /**
   * Convert to an SDP string
   * @returns {String}
   */
  toString() {
    let e = (
      /** @type {SDPTransform.SessionDescription} */
      {
        version: 0,
        media: []
      }
    );
    e.version = 0, e.origin = {
      username: "-",
      sessionId: (/* @__PURE__ */ new Date()).getTime(),
      sessionVersion: this.version,
      netType: "IN",
      ipVer: 4,
      address: "127.0.0.1"
    }, e.name = "semantic-sdp", e.connection = { version: 4, ip: "0.0.0.0" }, e.timing = { start: 0, stop: 0 }, this.hasICE() && this.getICE().isLite() && (e.icelite = "ice-lite"), e.msidSemantic = { semantic: "WMS", token: "*" }, e.groups = [], this.extmapAllowMixed && (e.extmapAllowMixed = "extmap-allow-mixed");
    const t = (
      /** @type {string[]} */
      []
    );
    for (const u of this.medias) {
      let m = (
        /** @type {SDPTransform.SessionDescription['media'][0]} */
        {
          type: u.getType(),
          port: 9,
          protocol: "",
          fmtp: [],
          rtp: [],
          rtcpFb: [],
          ext: [],
          bandwidth: [],
          candidates: [],
          ssrcGroups: [],
          ssrcs: [],
          rids: []
        }
      );
      m.direction = Xr.toString(u.getDirection()), this.extmapAllowMixed && (m.extmapAllowMixed = "extmap-allow-mixed"), m.mid = u.getId(), t.push(u.getId()), u.hasControl() && (m.control = u.getControl()), u.getBitrate() > 0 && (m.bandwidth.push({
        type: "AS",
        limit: u.getBitrate()
      }), m.bandwidth.push({
        type: "TIAS",
        limit: u.getBitrate() * 1e3
      }));
      let f = this.getCandidates();
      for (const n of f)
        m.candidates.push({
          foundation: n.getFoundation(),
          component: n.getComponentId(),
          transport: n.getTransport(),
          priority: n.getPriority(),
          ip: n.getAddress(),
          port: n.getPort(),
          type: n.getType(),
          raddr: n.getRelAddr(),
          rport: n.getRelPort()
        });
      if (this.getICE() && (m.iceUfrag = this.getICE().getUfrag(), m.icePwd = this.getICE().getPwd()), _e("audio", u.getType()) || _e("video", u.getType())) {
        m.rtcpMux = "rtcp-mux", m.rtcpRsize = "rtcp-rsize", this.getDTLS() ? (m.protocol = "UDP/TLS/RTP/SAVPF", m.fingerprint = {
          type: this.getDTLS().getHash(),
          hash: this.getDTLS().getFingerprint()
        }, m.setup = Gr.toString(this.getDTLS().getSetup())) : this.getCrypto() ? (m.protocol = "RTP/SAVPF", m.crypto = [{
          id: this.getCrypto().getTag(),
          suite: this.getCrypto().getSuite(),
          config: this.getCrypto().getKeyParams()
        }]) : m.protocol = "RTP/AVP";
        for (const h of u.getCodecs().values()) {
          _e("video", u.getType()) ? m.rtp.push({
            payload: h.getType(),
            codec: h.getCodec().toUpperCase(),
            rate: 9e4
          }) : _e("opus", h.getCodec()) ? m.rtp.push({
            payload: h.getType(),
            codec: h.getCodec(),
            rate: 48e3,
            encoding: h.getChannels()
          }) : _e("multiopus", h.getCodec()) ? m.rtp.push({
            payload: h.getType(),
            codec: h.getCodec(),
            rate: 48e3,
            encoding: h.getChannels()
          }) : m.rtp.push({
            payload: h.getType(),
            codec: h.getCodec(),
            rate: 8e3
          });
          for (const o of h.getRTCPFeedbacks())
            m.rtcpFb.push({ payload: h.getType(), type: o.getId(), subtype: o.getParams().join(" ") });
          h.hasRTX() && (m.rtp.push({
            payload: h.getRTX(),
            codec: "rtx",
            rate: 9e4
          }), m.fmtp.push({
            payload: h.getRTX(),
            config: "apt=" + h.getType()
          }));
          const g = h.getParams();
          if (Object.keys(g).length) {
            const o = {
              payload: h.getType(),
              config: ""
            };
            for (const c in g)
              o.config.length && (o.config += ";"), Object.hasOwnProperty.call(g, c) ? o.config += c + "=" + g[c] : o.config += c;
            m.fmtp.push(o);
          }
        }
        const n = [];
        for (const h of m.rtp)
          n.push(h.payload);
        m.payloads = n.join(" ");
        for (let [h, g] of u.getExtensions().entries())
          m.ext.push({
            value: h,
            uri: g
          });
        for (let h of u.getRIDs().values()) {
          let g = {
            id: h.getId(),
            direction: Qe.toString(h.getDirection()),
            params: ""
          };
          h.getFormats().length && (g.params = "pt=" + h.getFormats().join(","));
          for (let [o, c] of h.getParams().entries())
            g.params += (g.params.length ? ";" : "") + o + "=" + c;
          m.rids.push(g);
        }
        const b = u.getSimulcast();
        if (b) {
          let h = 1;
          m.simulcast = {};
          const g = b.getSimulcastStreams(Qe.SEND), o = b.getSimulcastStreams(Qe.RECV);
          if (g && g.length) {
            let c = "";
            for (const l of g) {
              let a = "";
              for (const s of l)
                a += (a.length ? "," : "") + (s.isPaused() ? "~" : "") + s.getId();
              c += (c.length ? ";" : "") + a;
            }
            m.simulcast["dir" + h] = "send", m.simulcast["list" + h] = c, h++;
          }
          if (o && o.length) {
            let c = "";
            for (const l of o) {
              let a = "";
              for (const s of l)
                a += (a.length ? "," : "") + (s.isPaused() ? "~" : "") + s.getId();
              c += (c.length ? ";" : "") + a;
            }
            m.simulcast["dir" + h] = "recv", m.simulcast["list" + h] = c, h++;
          }
        }
      } else if (u.hasDataChannel()) {
        m.protocol = "UDP/DTLS/SCTP", m.payloads = "webrtc-datachannel";
        const n = u.getDataChannel();
        m.sctpPort = n.getPort(), m.maxMessageSize = n.getMaxMessageSize();
      }
      e.media.push(m);
    }
    for (let u of this.streams.values())
      for (let m of u.getTracks().values())
        for (let f in e.media) {
          let n = e.media[f];
          if (m.getMediaId()) {
            if (m.getMediaId() == n.mid) {
              let b = m.getSourceGroups();
              for (let g in b) {
                let o = b[g];
                n.ssrcGroups.push({
                  semantics: o.getSemantics(),
                  ssrcs: o.getSSRCs().join(" ")
                });
              }
              let h = m.getSSRCs();
              for (let g in h)
                n.ssrcs.push({
                  id: h[g],
                  attribute: "cname",
                  value: u.getId()
                }), n.ssrcs.push({
                  id: h[g],
                  attribute: "msid",
                  value: u.getId() + " " + m.getId()
                });
              n.msid = u.getId() + " " + m.getId();
              break;
            }
          } else if (_e(n.type, m.getMedia())) {
            let b = m.getSourceGroups();
            for (let g in b) {
              let o = b[g];
              n.ssrcGroups.push({
                semantics: o.getSemantics(),
                ssrcs: o.getSSRCs().join(" ")
              });
            }
            let h = m.getSSRCs();
            for (let g in h)
              n.ssrcs.push({
                id: h[g],
                attribute: "cname",
                value: u.getId()
              }), n.ssrcs.push({
                id: h[g],
                attribute: "msid",
                value: u.getId() + " " + m.getId()
              });
            break;
          }
        }
    const i = { type: "BUNDLE", mids: t.join(" ") };
    return e.groups.push(i), mt.write(e);
  }
  /**
   * Convert to an SDP string for trickle-ice-sdpfrag
   * @returns {String}
   */
  toIceFragmentString() {
    let e = (
      /** @type {SDPTransform.SessionDescription} */
      {
        version: 0,
        media: [],
        candidates: []
      }
    );
    this.hasICE() && this.getICE().isLite() && (e.icelite = "ice-lite"), this.getICE() && (e.iceUfrag = this.getICE().getUfrag(), e.icePwd = this.getICE().getPwd());
    for (const t of this.getCandidates())
      e.candidates.push({
        foundation: t.getFoundation(),
        component: t.getComponentId(),
        transport: t.getTransport(),
        priority: t.getPriority(),
        ip: t.getAddress(),
        port: t.getPort(),
        type: t.getType(),
        raddr: t.getRelAddr(),
        rport: t.getRelPort()
      });
    return mt.write(e).slice(10);
  }
};
De.create = function(r) {
  var e;
  const t = new De();
  if (r.streams)
    for (const f of r.streams)
      t.addStream(At.expand(f));
  r.ice && (r.ice instanceof st ? t.setICE(r.ice.clone()) : t.setICE(st.expand(r.ice))), r.dtls && (r.dtls instanceof yt ? t.setDTLS(r.dtls) : t.setDTLS(yt.expand(r.dtls))), r.crypto && (r.crypto instanceof bt ? t.setCrypto(r.crypto) : t.setCrypto(bt.expand(r.crypto)));
  for (const f of r.candidates || [])
    f instanceof gt ? t.addCandidate(f.clone()) : t.addCandidate(gt.expand(f));
  let i = 96, u = 1, m = 0;
  for (const [f, n] of Object.entries(r.capabilities || {}))
    if (r.unified && (!((e = r.streams) === null || e === void 0) && e.length))
      for (const b of t.getTracksByMediaType(f)) {
        const h = mr.create(
          b.getMediaId(),
          /** @type MediaType */
          f,
          n
        );
        for (const [g, o] of h.getCodecs())
          o.getType() >= 96 && o.setType(i++), o.getRTX() && o.setRTX(i++);
        if (n.extensions)
          for (let g of n.extensions)
            u === 15 && u++, h.addExtension(u++, g);
        t.addMedia(h);
      }
    else {
      const b = mr.create(
        r.unified ? String(m++) : f,
        /** @type MediaType */
        f,
        n
      );
      for (const [h, g] of b.getCodecs())
        g.getType() >= 96 && g.setType(i++), g.getRTX() && g.setRTX(i++);
      if (n.extensions)
        for (let h of n.extensions)
          u === 15 && u++, b.addExtension(u++, h);
      t.addMedia(b);
    }
  return t;
};
De.expand = function(r) {
  if (r.constructor.name === "SDPInfo")
    return (
      /** @type {SDPInfo} */
      r
    );
  r = /** @type {SDPInfoPlain} */
  r;
  const e = new De(r.version);
  for (const t of r.medias || []) {
    const i = mr.expand(t);
    i && e.addMedia(i);
  }
  for (const t of r.streams || []) {
    const i = At.expand(t);
    i && e.addStream(i);
  }
  for (const t of r.candidates || []) {
    const i = gt.expand(t);
    i && e.addCandidate(i);
  }
  return r.ice && e.setICE(st.expand(r.ice)), r.dtls && e.setDTLS(yt.expand(r.dtls)), r.crypto && e.setCrypto(bt.expand(r.crypto)), r.extmapAllowMixedNotSupported && (this.extmapAllowMixed = !r.extmapAllowMixedNotSupported), e;
};
De.clone = function(r) {
  return r.constructor.name === "SDPInfo" ? (
    /** @type {SDPInfo} */
    r.clone()
  ) : De.expand(r);
};
De.process = function(r) {
  return De.parse(r);
};
De.parse = function(r) {
  const e = mt.parse(r), t = new De();
  if (t.setVersion(e.version), e.iceUfrag && e.icePwd) {
    const i = String(e.iceUfrag), u = String(e.icePwd), m = new st(i, u);
    m.setLite(e.icelite == "ice-lite"), m.setEndOfCandidates(e.endOfCandidates == "end-of-candidates"), t.setICE(m);
  }
  for (let i in e.media) {
    const u = e.media[i], m = u.type, f = u.mid ? u.mid.toString() : i, n = new mr(f, m);
    if (u.iceUfrag && u.icePwd) {
      const s = String(u.iceUfrag), p = String(u.icePwd), d = new st(s, p);
      d.setLite(e.icelite == "ice-lite"), d.setEndOfCandidates(u.endOfCandidates == "end-of-candidates"), t.setICE(d);
    }
    for (let s = 0; u.candidates && s < u.candidates.length; ++s) {
      const p = u.candidates[s], d = new gt(p.foundation, p.component, p.transport, p.priority, p.ip, p.port, p.type, p.raddr, p.rport);
      t.addCandidate(d);
    }
    const b = u.fingerprint || e.fingerprint;
    if (b) {
      const s = b.type, p = b.hash;
      let d = Gr.ACTPASS;
      u.setup && (d = Gr.byValue(u.setup)), t.setDTLS(new yt(d, s, p));
    }
    if (u.crypto) {
      const s = u.crypto[0];
      t.setCrypto(new bt(s.id, s.suite, s.config, s.sessionConfig));
    }
    let h = Xr.SENDRECV;
    u.direction && (h = Xr.byValue(u.direction), n.setDirection(h)), u.control && n.setControl(u.control), t.setExtmapAllowMixed(u.extmapAllowMixed == "extmap-allow-mixed" || e.extmapAllowMixed == "extmap-allow-mixed");
    const g = /* @__PURE__ */ new Map();
    for (let s in u.rtp) {
      const p = u.rtp[s], d = p.payload, y = p.codec;
      if (y.toUpperCase() === "RED" || y.toUpperCase() === "ULPFEC")
        continue;
      let v = (
        /** @type {{[k: string]: string}} */
        {}
      );
      for (let S in u.fmtp) {
        const I = u.fmtp[S];
        if (I.payload === d) {
          const E = I.config.split(";");
          for (let T in E) {
            const x = E[T].split("="), k = x[0].trim(), _ = x.splice(1).join("=").trim();
            v[k] = _;
          }
        }
      }
      if (y.toUpperCase() === "RTX")
        g.set(parseInt(v.apt), d);
      else {
        const S = new Ro(y, d, v);
        p.encoding > 1 && S.setChannels(p.encoding), n.addCodec(S);
      }
    }
    for (let s of g.entries()) {
      const p = n.getCodecForType(s[0]);
      p && p.setRTX(s[1]);
    }
    for (let s = 0; u.rtcpFb && s < u.rtcpFb.length; ++s) {
      const p = n.getCodecForType(u.rtcpFb[s].payload);
      if (p) {
        const d = u.rtcpFb[s].type, y = u.rtcpFb[s].subtype ? u.rtcpFb[s].subtype.split(" ") : null;
        p.addRTCPFeedback(new Io(d, y));
      }
    }
    const o = u.ext;
    for (let s in o) {
      const p = o[s];
      n.addExtension(p.value, p.uri);
    }
    const c = u.rids;
    for (let s in c) {
      const p = c[s], d = new To(p.id, Qe.byValue(p.direction));
      let y = [];
      const v = /* @__PURE__ */ new Map();
      if (p.params) {
        const S = mt.parseParams(p.params);
        for (let I in S)
          I === "pt" ? y = S[I].split(",") : v.set(I, S[I]);
        d.setFormats(y), d.setParams(v);
      }
      n.addRID(d);
    }
    const l = [];
    if (u.simulcast) {
      const s = new _o();
      if (u.simulcast.dir1) {
        const p = Qe.byValue(u.simulcast.dir1), d = mt.parseSimulcastStreamList(u.simulcast.list1);
        for (let y = 0; y < d.length; ++y) {
          const v = [];
          for (let S = 0; S < d[y].length; ++S)
            v.push(new zn(d[y][S].scid, d[y][S].paused));
          s.addSimulcastAlternativeStreams(p, v);
        }
      }
      if (u.simulcast.dir2) {
        const p = Qe.byValue(u.simulcast.dir2), d = mt.parseSimulcastStreamList(u.simulcast.list2);
        for (let y = 0; y < d.length; ++y) {
          const v = [];
          for (let S = 0; S < d[y].length; ++S)
            v.push(new zn(d[y][S].scid, d[y][S].paused));
          s.addSimulcastAlternativeStreams(p, v);
        }
      }
      for (let p of s.getSimulcastStreams(Qe.SEND)) {
        const d = [];
        for (let y = 0; y < p.length; y++) {
          const v = new Co(p[y].getId(), p[y].isPaused()), S = n.getRID(v.getId());
          if (S) {
            const I = S.getFormats();
            for (let E = 0; I && E < I.length; ++E) {
              const T = n.getCodecForType(I[E]);
              T && v.addCodec(T);
            }
            v.setParams(S.getParams()), d.push(v);
          }
        }
        d.length && l.push(d);
      }
      n.setSimulcast(s);
    }
    const a = /* @__PURE__ */ new Map();
    if (u.ssrcs)
      for (let s in u.ssrcs) {
        let p = u.ssrcs[s], d = p.id, y = p.attribute, v = p.value, S = a.get(d);
        if (S || (S = new Eo(d), a.set(S.getSSRC(), S)), _e("cname", y))
          S.setCName(v);
        else if (_e("msid", y)) {
          let I = v.split(" "), E = I[0], T = I[1];
          S.setStreamId(E), S.setTrackId(T);
          let x = t.getStream(E);
          x || (x = new At(E), t.addStream(x));
          let k = x.getTrack(T);
          k || (k = new Lr(m, T), k.setMediaId(f), k.setEncodings(l), x.addTrack(k)), k.addSSRC(d);
        }
      }
    if (u.msid) {
      let s = u.msid.split(" "), p = s[0], d = s[1], y = t.getStream(p);
      y || (y = new At(p), t.addStream(y));
      let v = y.getTrack(d);
      v || (v = new Lr(m, d), v.setMediaId(f), v.setEncodings(l), y.addTrack(v));
      for (let [S, I] of a.entries())
        I.getStreamId() || (I.setStreamId(p), I.setTrackId(d), v.addSSRC(S));
    }
    for (let [s, p] of a.entries())
      if (!p.getStreamId()) {
        let d = p.getCName(), y = f;
        p.setStreamId(d), p.setTrackId(y);
        let v = t.getStream(d);
        v || (v = new At(d), t.addStream(v));
        let S = v.getTrack(y);
        S || (S = new Lr(m, y), S.setMediaId(f), S.setEncodings(l), v.addTrack(S)), S.addSSRC(s);
      }
    if (u.ssrcGroups)
      for (let s in u.ssrcGroups) {
        let p = u.ssrcGroups[s], d = p.ssrcs.split(" "), y = new ko(p.semantics, d), v = a.get(parseInt(d[0]));
        v && t.getStream(v.getStreamId()).getTrack(v.getTrackId()).addSourceGroup(y);
      }
    if (u.type == "application" && u.payloads == "webrtc-datachannel") {
      const s = new Ao(u.sctpPort, u.maxMessageSize);
      n.setDataChannel(s);
    }
    t.addMedia(n);
  }
  return t;
};
var Lo = De;
Object.defineProperty(me, "__esModule", { value: !0 });
var Et = me.SDPInfo = Lo;
me.CandidateInfo = Us;
me.CodecInfo = wr;
me.DTLSInfo = js;
me.CryptoInfo = $s;
me.ICEInfo = zs;
var Do = me.MediaInfo = ti;
me.Setup = cn;
me.SourceGroupInfo = gn;
me.SourceInfo = si;
me.StreamInfo = ci;
me.TrackInfo = bn;
me.RTCPFeedbackInfo = on;
me.TrackEncodingInfo = yn;
me.RIDInfo = un;
me.SimulcastInfo = fn;
me.SimulcastStreamInfo = dn;
me.DataChannelInfo = mn;
var Mo = me.Direction = hn, zr = { exports: {} };
(function(r, e) {
  (function(t, i) {
    var u = "1.0.39", m = "", f = "?", n = "function", b = "undefined", h = "object", g = "string", o = "major", c = "model", l = "name", a = "type", s = "vendor", p = "version", d = "architecture", y = "console", v = "mobile", S = "tablet", I = "smarttv", E = "wearable", T = "embedded", x = 500, k = "Amazon", _ = "Apple", L = "ASUS", N = "BlackBerry", O = "Browser", j = "Chrome", G = "Edge", W = "Firefox", F = "Google", V = "Huawei", X = "LG", B = "Microsoft", $ = "Motorola", z = "Opera", q = "Samsung", ee = "Sharp", te = "Sony", le = "Xiaomi", ye = "Zebra", Ce = "Facebook", at = "Chromium OS", St = "Mac OS", Bt = " Browser", Gt = function(Q, C) {
      var w = {};
      for (var R in Q)
        C[R] && C[R].length % 2 === 0 ? w[R] = C[R].concat(Q[R]) : w[R] = Q[R];
      return w;
    }, Ae = function(Q) {
      for (var C = {}, w = 0; w < Q.length; w++)
        C[Q[w].toUpperCase()] = Q[w];
      return C;
    }, Oe = function(Q, C) {
      return typeof Q === g ? Ve(C).indexOf(Ve(Q)) !== -1 : !1;
    }, Ve = function(Q) {
      return Q.toLowerCase();
    }, Er = function(Q) {
      return typeof Q === g ? Q.replace(/[^\d\.]/g, m).split(".")[0] : i;
    }, Ge = function(Q, C) {
      if (typeof Q === g)
        return Q = Q.replace(/^\s\s*/, m), typeof C === b ? Q : Q.substring(0, x);
    }, Xe = function(Q, C) {
      for (var w = 0, R, A, D, P, Z, Y; w < C.length && !Z; ) {
        var oe = C[w], ne = C[w + 1];
        for (R = A = 0; R < oe.length && !Z && oe[R]; )
          if (Z = oe[R++].exec(Q), Z)
            for (D = 0; D < ne.length; D++)
              Y = Z[++A], P = ne[D], typeof P === h && P.length > 0 ? P.length === 2 ? typeof P[1] == n ? this[P[0]] = P[1].call(this, Y) : this[P[0]] = P[1] : P.length === 3 ? typeof P[1] === n && !(P[1].exec && P[1].test) ? this[P[0]] = Y ? P[1].call(this, Y, P[2]) : i : this[P[0]] = Y ? Y.replace(P[1], P[2]) : i : P.length === 4 && (this[P[0]] = Y ? P[3].call(this, Y.replace(P[1], P[2])) : i) : this[P] = Y || i;
        w += 2;
      }
    }, ct = function(Q, C) {
      for (var w in C)
        if (typeof C[w] === h && C[w].length > 0) {
          for (var R = 0; R < C[w].length; R++)
            if (Oe(C[w][R], Q))
              return w === f ? i : w;
        } else if (Oe(C[w], Q))
          return w === f ? i : w;
      return C.hasOwnProperty("*") ? C["*"] : Q;
    }, Xt = {
      "1.0": "/8",
      "1.2": "/1",
      "1.3": "/3",
      "2.0": "/412",
      "2.0.2": "/416",
      "2.0.3": "/417",
      "2.0.4": "/419",
      "?": "/"
    }, ze = {
      ME: "4.90",
      "NT 3.11": "NT3.51",
      "NT 4.0": "NT4.0",
      2e3: "NT 5.0",
      XP: ["NT 5.1", "NT 5.2"],
      Vista: "NT 6.0",
      7: "NT 6.1",
      8: "NT 6.2",
      "8.1": "NT 6.3",
      10: ["NT 6.4", "NT 10.0"],
      RT: "ARM"
    }, ke = {
      browser: [
        [
          /\b(?:crmo|crios)\/([\w\.]+)/i
          // Chrome for Android/iOS
        ],
        [p, [l, "Chrome"]],
        [
          /edg(?:e|ios|a)?\/([\w\.]+)/i
          // Microsoft Edge
        ],
        [p, [l, "Edge"]],
        [
          // Presto based
          /(opera mini)\/([-\w\.]+)/i,
          // Opera Mini
          /(opera [mobiletab]{3,6})\b.+version\/([-\w\.]+)/i,
          // Opera Mobi/Tablet
          /(opera)(?:.+version\/|[\/ ]+)([\w\.]+)/i
          // Opera
        ],
        [l, p],
        [
          /opios[\/ ]+([\w\.]+)/i
          // Opera mini on iphone >= 8.0
        ],
        [p, [l, z + " Mini"]],
        [
          /\bop(?:rg)?x\/([\w\.]+)/i
          // Opera GX
        ],
        [p, [l, z + " GX"]],
        [
          /\bopr\/([\w\.]+)/i
          // Opera Webkit
        ],
        [p, [l, z]],
        [
          // Mixed
          /\bb[ai]*d(?:uhd|[ub]*[aekoprswx]{5,6})[\/ ]?([\w\.]+)/i
          // Baidu
        ],
        [p, [l, "Baidu"]],
        [
          /(kindle)\/([\w\.]+)/i,
          // Kindle
          /(lunascape|maxthon|netfront|jasmine|blazer|sleipnir)[\/ ]?([\w\.]*)/i,
          // Lunascape/Maxthon/Netfront/Jasmine/Blazer/Sleipnir
          // Trident based
          /(avant|iemobile|slim)\s?(?:browser)?[\/ ]?([\w\.]*)/i,
          // Avant/IEMobile/SlimBrowser
          /(?:ms|\()(ie) ([\w\.]+)/i,
          // Internet Explorer
          // Webkit/KHTML based                                               // Flock/RockMelt/Midori/Epiphany/Silk/Skyfire/Bolt/Iron/Iridium/PhantomJS/Bowser/QupZilla/Falkon
          /(flock|rockmelt|midori|epiphany|silk|skyfire|ovibrowser|bolt|iron|vivaldi|iridium|phantomjs|bowser|qupzilla|falkon|rekonq|puffin|brave|whale(?!.+naver)|qqbrowserlite|duckduckgo|klar|helio)\/([-\w\.]+)/i,
          // Rekonq/Puffin/Brave/Whale/QQBrowserLite/QQ//Vivaldi/DuckDuckGo/Klar/Helio
          /(heytap|ovi)browser\/([\d\.]+)/i,
          // HeyTap/Ovi
          /(weibo)__([\d\.]+)/i
          // Weibo
        ],
        [l, p],
        [
          /quark(?:pc)?\/([-\w\.]+)/i
          // Quark
        ],
        [p, [l, "Quark"]],
        [
          /\bddg\/([\w\.]+)/i
          // DuckDuckGo
        ],
        [p, [l, "DuckDuckGo"]],
        [
          /(?:\buc? ?browser|(?:juc.+)ucweb)[\/ ]?([\w\.]+)/i
          // UCBrowser
        ],
        [p, [l, "UC" + O]],
        [
          /microm.+\bqbcore\/([\w\.]+)/i,
          // WeChat Desktop for Windows Built-in Browser
          /\bqbcore\/([\w\.]+).+microm/i,
          /micromessenger\/([\w\.]+)/i
          // WeChat
        ],
        [p, [l, "WeChat"]],
        [
          /konqueror\/([\w\.]+)/i
          // Konqueror
        ],
        [p, [l, "Konqueror"]],
        [
          /trident.+rv[: ]([\w\.]{1,9})\b.+like gecko/i
          // IE11
        ],
        [p, [l, "IE"]],
        [
          /ya(?:search)?browser\/([\w\.]+)/i
          // Yandex
        ],
        [p, [l, "Yandex"]],
        [
          /slbrowser\/([\w\.]+)/i
          // Smart Lenovo Browser
        ],
        [p, [l, "Smart Lenovo " + O]],
        [
          /(avast|avg)\/([\w\.]+)/i
          // Avast/AVG Secure Browser
        ],
        [[l, /(.+)/, "$1 Secure " + O], p],
        [
          /\bfocus\/([\w\.]+)/i
          // Firefox Focus
        ],
        [p, [l, W + " Focus"]],
        [
          /\bopt\/([\w\.]+)/i
          // Opera Touch
        ],
        [p, [l, z + " Touch"]],
        [
          /coc_coc\w+\/([\w\.]+)/i
          // Coc Coc Browser
        ],
        [p, [l, "Coc Coc"]],
        [
          /dolfin\/([\w\.]+)/i
          // Dolphin
        ],
        [p, [l, "Dolphin"]],
        [
          /coast\/([\w\.]+)/i
          // Opera Coast
        ],
        [p, [l, z + " Coast"]],
        [
          /miuibrowser\/([\w\.]+)/i
          // MIUI Browser
        ],
        [p, [l, "MIUI " + O]],
        [
          /fxios\/([-\w\.]+)/i
          // Firefox for iOS
        ],
        [p, [l, W]],
        [
          /\bqihu|(qi?ho?o?|360)browser/i
          // 360
        ],
        [[l, "360" + Bt]],
        [
          /\b(qq)\/([\w\.]+)/i
          // QQ
        ],
        [[l, /(.+)/, "$1Browser"], p],
        [
          /(oculus|sailfish|huawei|vivo|pico)browser\/([\w\.]+)/i
        ],
        [[l, /(.+)/, "$1" + Bt], p],
        [
          // Oculus/Sailfish/HuaweiBrowser/VivoBrowser/PicoBrowser
          /samsungbrowser\/([\w\.]+)/i
          // Samsung Internet
        ],
        [p, [l, q + " Internet"]],
        [
          /(comodo_dragon)\/([\w\.]+)/i
          // Comodo Dragon
        ],
        [[l, /_/g, " "], p],
        [
          /metasr[\/ ]?([\d\.]+)/i
          // Sogou Explorer
        ],
        [p, [l, "Sogou Explorer"]],
        [
          /(sogou)mo\w+\/([\d\.]+)/i
          // Sogou Mobile
        ],
        [[l, "Sogou Mobile"], p],
        [
          /(electron)\/([\w\.]+) safari/i,
          // Electron-based App
          /(tesla)(?: qtcarbrowser|\/(20\d\d\.[-\w\.]+))/i,
          // Tesla
          /m?(qqbrowser|2345Explorer)[\/ ]?([\w\.]+)/i
          // QQBrowser/2345 Browser
        ],
        [l, p],
        [
          /(lbbrowser|rekonq)/i,
          // LieBao Browser/Rekonq
          /\[(linkedin)app\]/i
          // LinkedIn App for iOS & Android
        ],
        [l],
        [
          // WebView
          /((?:fban\/fbios|fb_iab\/fb4a)(?!.+fbav)|;fbav\/([\w\.]+);)/i
          // Facebook App for iOS & Android
        ],
        [[l, Ce], p],
        [
          /(Klarna)\/([\w\.]+)/i,
          // Klarna Shopping Browser for iOS & Android
          /(kakao(?:talk|story))[\/ ]([\w\.]+)/i,
          // Kakao App
          /(naver)\(.*?(\d+\.[\w\.]+).*\)/i,
          // Naver InApp
          /safari (line)\/([\w\.]+)/i,
          // Line App for iOS
          /\b(line)\/([\w\.]+)\/iab/i,
          // Line App for Android
          /(alipay)client\/([\w\.]+)/i,
          // Alipay
          /(twitter)(?:and| f.+e\/([\w\.]+))/i,
          // Twitter
          /(chromium|instagram|snapchat)[\/ ]([-\w\.]+)/i
          // Chromium/Instagram/Snapchat
        ],
        [l, p],
        [
          /\bgsa\/([\w\.]+) .*safari\//i
          // Google Search Appliance on iOS
        ],
        [p, [l, "GSA"]],
        [
          /musical_ly(?:.+app_?version\/|_)([\w\.]+)/i
          // TikTok
        ],
        [p, [l, "TikTok"]],
        [
          /headlesschrome(?:\/([\w\.]+)| )/i
          // Chrome Headless
        ],
        [p, [l, j + " Headless"]],
        [
          / wv\).+(chrome)\/([\w\.]+)/i
          // Chrome WebView
        ],
        [[l, j + " WebView"], p],
        [
          /droid.+ version\/([\w\.]+)\b.+(?:mobile safari|safari)/i
          // Android Browser
        ],
        [p, [l, "Android " + O]],
        [
          /(chrome|omniweb|arora|[tizenoka]{5} ?browser)\/v?([\w\.]+)/i
          // Chrome/OmniWeb/Arora/Tizen/Nokia
        ],
        [l, p],
        [
          /version\/([\w\.\,]+) .*mobile\/\w+ (safari)/i
          // Mobile Safari
        ],
        [p, [l, "Mobile Safari"]],
        [
          /version\/([\w(\.|\,)]+) .*(mobile ?safari|safari)/i
          // Safari & Safari Mobile
        ],
        [p, l],
        [
          /webkit.+?(mobile ?safari|safari)(\/[\w\.]+)/i
          // Safari < 3.0
        ],
        [l, [p, ct, Xt]],
        [
          /(webkit|khtml)\/([\w\.]+)/i
        ],
        [l, p],
        [
          // Gecko based
          /(navigator|netscape\d?)\/([-\w\.]+)/i
          // Netscape
        ],
        [[l, "Netscape"], p],
        [
          /(wolvic)\/([\w\.]+)/i
          // Wolvic
        ],
        [l, p],
        [
          /mobile vr; rv:([\w\.]+)\).+firefox/i
          // Firefox Reality
        ],
        [p, [l, W + " Reality"]],
        [
          /ekiohf.+(flow)\/([\w\.]+)/i,
          // Flow
          /(swiftfox)/i,
          // Swiftfox
          /(icedragon|iceweasel|camino|chimera|fennec|maemo browser|minimo|conkeror)[\/ ]?([\w\.\+]+)/i,
          // IceDragon/Iceweasel/Camino/Chimera/Fennec/Maemo/Minimo/Conkeror
          /(seamonkey|k-meleon|icecat|iceape|firebird|phoenix|palemoon|basilisk|waterfox)\/([-\w\.]+)$/i,
          // Firefox/SeaMonkey/K-Meleon/IceCat/IceApe/Firebird/Phoenix
          /(firefox)\/([\w\.]+)/i,
          // Other Firefox-based
          /(mozilla)\/([\w\.]+) .+rv\:.+gecko\/\d+/i,
          // Mozilla
          // Other
          /(polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|obigo|mosaic|(?:go|ice|up)[\. ]?browser)[-\/ ]?v?([\w\.]+)/i,
          // Polaris/Lynx/Dillo/iCab/Doris/Amaya/w3m/NetSurf/Obigo/Mosaic/Go/ICE/UP.Browser
          /(links) \(([\w\.]+)/i
          // Links
        ],
        [l, [p, /_/g, "."]],
        [
          /(cobalt)\/([\w\.]+)/i
          // Cobalt
        ],
        [l, [p, /master.|lts./, ""]]
      ],
      cpu: [
        [
          /(?:(amd|x(?:(?:86|64)[-_])?|wow|win)64)[;\)]/i
          // AMD64 (x64)
        ],
        [[d, "amd64"]],
        [
          /(ia32(?=;))/i
          // IA32 (quicktime)
        ],
        [[d, Ve]],
        [
          /((?:i[346]|x)86)[;\)]/i
          // IA32 (x86)
        ],
        [[d, "ia32"]],
        [
          /\b(aarch64|arm(v?8e?l?|_?64))\b/i
          // ARM64
        ],
        [[d, "arm64"]],
        [
          /\b(arm(?:v[67])?ht?n?[fl]p?)\b/i
          // ARMHF
        ],
        [[d, "armhf"]],
        [
          // PocketPC mistakenly identified as PowerPC
          /windows (ce|mobile); ppc;/i
        ],
        [[d, "arm"]],
        [
          /((?:ppc|powerpc)(?:64)?)(?: mac|;|\))/i
          // PowerPC
        ],
        [[d, /ower/, m, Ve]],
        [
          /(sun4\w)[;\)]/i
          // SPARC
        ],
        [[d, "sparc"]],
        [
          /((?:avr32|ia64(?=;))|68k(?=\))|\barm(?=v(?:[1-7]|[5-7]1)l?|;|eabi)|(?=atmel )avr|(?:irix|mips|sparc)(?:64)?\b|pa-risc)/i
          // IA64, 68K, ARM/64, AVR/32, IRIX/64, MIPS/64, SPARC/64, PA-RISC
        ],
        [[d, Ve]]
      ],
      device: [
        [
          //////////////////////////
          // MOBILES & TABLETS
          /////////////////////////
          // Samsung
          /\b(sch-i[89]0\d|shw-m380s|sm-[ptx]\w{2,4}|gt-[pn]\d{2,4}|sgh-t8[56]9|nexus 10)/i
        ],
        [c, [s, q], [a, S]],
        [
          /\b((?:s[cgp]h|gt|sm)-(?![lr])\w+|sc[g-]?[\d]+a?|galaxy nexus)/i,
          /samsung[- ]((?!sm-[lr])[-\w]+)/i,
          /sec-(sgh\w+)/i
        ],
        [c, [s, q], [a, v]],
        [
          // Apple
          /(?:\/|\()(ip(?:hone|od)[\w, ]*)(?:\/|;)/i
          // iPod/iPhone
        ],
        [c, [s, _], [a, v]],
        [
          /\((ipad);[-\w\),; ]+apple/i,
          // iPad
          /applecoremedia\/[\w\.]+ \((ipad)/i,
          /\b(ipad)\d\d?,\d\d?[;\]].+ios/i
        ],
        [c, [s, _], [a, S]],
        [
          /(macintosh);/i
        ],
        [c, [s, _]],
        [
          // Sharp
          /\b(sh-?[altvz]?\d\d[a-ekm]?)/i
        ],
        [c, [s, ee], [a, v]],
        [
          // Huawei
          /\b((?:ag[rs][23]?|bah2?|sht?|btv)-a?[lw]\d{2})\b(?!.+d\/s)/i
        ],
        [c, [s, V], [a, S]],
        [
          /(?:huawei|honor)([-\w ]+)[;\)]/i,
          /\b(nexus 6p|\w{2,4}e?-[atu]?[ln][\dx][012359c][adn]?)\b(?!.+d\/s)/i
        ],
        [c, [s, V], [a, v]],
        [
          // Xiaomi
          /\b(poco[\w ]+|m2\d{3}j\d\d[a-z]{2})(?: bui|\))/i,
          // Xiaomi POCO
          /\b; (\w+) build\/hm\1/i,
          // Xiaomi Hongmi 'numeric' models
          /\b(hm[-_ ]?note?[_ ]?(?:\d\w)?) bui/i,
          // Xiaomi Hongmi
          /\b(redmi[\-_ ]?(?:note|k)?[\w_ ]+)(?: bui|\))/i,
          // Xiaomi Redmi
          /oid[^\)]+; (m?[12][0-389][01]\w{3,6}[c-y])( bui|; wv|\))/i,
          // Xiaomi Redmi 'numeric' models
          /\b(mi[-_ ]?(?:a\d|one|one[_ ]plus|note lte|max|cc)?[_ ]?(?:\d?\w?)[_ ]?(?:plus|se|lite|pro)?)(?: bui|\))/i
          // Xiaomi Mi
        ],
        [[c, /_/g, " "], [s, le], [a, v]],
        [
          /oid[^\)]+; (2\d{4}(283|rpbf)[cgl])( bui|\))/i,
          // Redmi Pad
          /\b(mi[-_ ]?(?:pad)(?:[\w_ ]+))(?: bui|\))/i
          // Mi Pad tablets
        ],
        [[c, /_/g, " "], [s, le], [a, S]],
        [
          // OPPO
          /; (\w+) bui.+ oppo/i,
          /\b(cph[12]\d{3}|p(?:af|c[al]|d\w|e[ar])[mt]\d0|x9007|a101op)\b/i
        ],
        [c, [s, "OPPO"], [a, v]],
        [
          /\b(opd2\d{3}a?) bui/i
        ],
        [c, [s, "OPPO"], [a, S]],
        [
          // Vivo
          /vivo (\w+)(?: bui|\))/i,
          /\b(v[12]\d{3}\w?[at])(?: bui|;)/i
        ],
        [c, [s, "Vivo"], [a, v]],
        [
          // Realme
          /\b(rmx[1-3]\d{3})(?: bui|;|\))/i
        ],
        [c, [s, "Realme"], [a, v]],
        [
          // Motorola
          /\b(milestone|droid(?:[2-4x]| (?:bionic|x2|pro|razr))?:?( 4g)?)\b[\w ]+build\//i,
          /\bmot(?:orola)?[- ](\w*)/i,
          /((?:moto[\w\(\) ]+|xt\d{3,4}|nexus 6)(?= bui|\)))/i
        ],
        [c, [s, $], [a, v]],
        [
          /\b(mz60\d|xoom[2 ]{0,2}) build\//i
        ],
        [c, [s, $], [a, S]],
        [
          // LG
          /((?=lg)?[vl]k\-?\d{3}) bui| 3\.[-\w; ]{10}lg?-([06cv9]{3,4})/i
        ],
        [c, [s, X], [a, S]],
        [
          /(lm(?:-?f100[nv]?|-[\w\.]+)(?= bui|\))|nexus [45])/i,
          /\blg[-e;\/ ]+((?!browser|netcast|android tv)\w+)/i,
          /\blg-?([\d\w]+) bui/i
        ],
        [c, [s, X], [a, v]],
        [
          // Lenovo
          /(ideatab[-\w ]+)/i,
          /lenovo ?(s[56]000[-\w]+|tab(?:[\w ]+)|yt[-\d\w]{6}|tb[-\d\w]{6})/i
        ],
        [c, [s, "Lenovo"], [a, S]],
        [
          // Nokia
          /(?:maemo|nokia).*(n900|lumia \d+)/i,
          /nokia[-_ ]?([-\w\.]*)/i
        ],
        [[c, /_/g, " "], [s, "Nokia"], [a, v]],
        [
          // Google
          /(pixel c)\b/i
          // Google Pixel C
        ],
        [c, [s, F], [a, S]],
        [
          /droid.+; (pixel[\daxl ]{0,6})(?: bui|\))/i
          // Google Pixel
        ],
        [c, [s, F], [a, v]],
        [
          // Sony
          /droid.+ (a?\d[0-2]{2}so|[c-g]\d{4}|so[-gl]\w+|xq-a\w[4-7][12])(?= bui|\).+chrome\/(?![1-6]{0,1}\d\.))/i
        ],
        [c, [s, te], [a, v]],
        [
          /sony tablet [ps]/i,
          /\b(?:sony)?sgp\w+(?: bui|\))/i
        ],
        [[c, "Xperia Tablet"], [s, te], [a, S]],
        [
          // OnePlus
          / (kb2005|in20[12]5|be20[12][59])\b/i,
          /(?:one)?(?:plus)? (a\d0\d\d)(?: b|\))/i
        ],
        [c, [s, "OnePlus"], [a, v]],
        [
          // Amazon
          /(alexa)webm/i,
          /(kf[a-z]{2}wi|aeo(?!bc)\w\w)( bui|\))/i,
          // Kindle Fire without Silk / Echo Show
          /(kf[a-z]+)( bui|\)).+silk\//i
          // Kindle Fire HD
        ],
        [c, [s, k], [a, S]],
        [
          /((?:sd|kf)[0349hijorstuw]+)( bui|\)).+silk\//i
          // Fire Phone
        ],
        [[c, /(.+)/g, "Fire Phone $1"], [s, k], [a, v]],
        [
          // BlackBerry
          /(playbook);[-\w\),; ]+(rim)/i
          // BlackBerry PlayBook
        ],
        [c, s, [a, S]],
        [
          /\b((?:bb[a-f]|st[hv])100-\d)/i,
          /\(bb10; (\w+)/i
          // BlackBerry 10
        ],
        [c, [s, N], [a, v]],
        [
          // Asus
          /(?:\b|asus_)(transfo[prime ]{4,10} \w+|eeepc|slider \w+|nexus 7|padfone|p00[cj])/i
        ],
        [c, [s, L], [a, S]],
        [
          / (z[bes]6[027][012][km][ls]|zenfone \d\w?)\b/i
        ],
        [c, [s, L], [a, v]],
        [
          // HTC
          /(nexus 9)/i
          // HTC Nexus 9
        ],
        [c, [s, "HTC"], [a, S]],
        [
          /(htc)[-;_ ]{1,2}([\w ]+(?=\)| bui)|\w+)/i,
          // HTC
          // ZTE
          /(zte)[- ]([\w ]+?)(?: bui|\/|\))/i,
          /(alcatel|geeksphone|nexian|panasonic(?!(?:;|\.))|sony(?!-bra))[-_ ]?([-\w]*)/i
          // Alcatel/GeeksPhone/Nexian/Panasonic/Sony
        ],
        [s, [c, /_/g, " "], [a, v]],
        [
          // TCL
          /droid [\w\.]+; ((?:8[14]9[16]|9(?:0(?:48|60|8[01])|1(?:3[27]|66)|2(?:6[69]|9[56])|466))[gqswx])\w*(\)| bui)/i
        ],
        [c, [s, "TCL"], [a, S]],
        [
          // itel
          /(itel) ((\w+))/i
        ],
        [[s, Ve], c, [a, ct, { tablet: ["p10001l", "w7001"], "*": "mobile" }]],
        [
          // Acer
          /droid.+; ([ab][1-7]-?[0178a]\d\d?)/i
        ],
        [c, [s, "Acer"], [a, S]],
        [
          // Meizu
          /droid.+; (m[1-5] note) bui/i,
          /\bmz-([-\w]{2,})/i
        ],
        [c, [s, "Meizu"], [a, v]],
        [
          // Ulefone
          /; ((?:power )?armor(?:[\w ]{0,8}))(?: bui|\))/i
        ],
        [c, [s, "Ulefone"], [a, v]],
        [
          // Nothing
          /droid.+; (a(?:015|06[35]|142p?))/i
        ],
        [c, [s, "Nothing"], [a, v]],
        [
          // MIXED
          /(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|meizu|motorola|polytron|infinix|tecno)[-_ ]?([-\w]*)/i,
          // BlackBerry/BenQ/Palm/Sony-Ericsson/Acer/Asus/Dell/Meizu/Motorola/Polytron
          /(hp) ([\w ]+\w)/i,
          // HP iPAQ
          /(asus)-?(\w+)/i,
          // Asus
          /(microsoft); (lumia[\w ]+)/i,
          // Microsoft Lumia
          /(lenovo)[-_ ]?([-\w]+)/i,
          // Lenovo
          /(jolla)/i,
          // Jolla
          /(oppo) ?([\w ]+) bui/i
          // OPPO
        ],
        [s, c, [a, v]],
        [
          /(kobo)\s(ereader|touch)/i,
          // Kobo
          /(archos) (gamepad2?)/i,
          // Archos
          /(hp).+(touchpad(?!.+tablet)|tablet)/i,
          // HP TouchPad
          /(kindle)\/([\w\.]+)/i,
          // Kindle
          /(nook)[\w ]+build\/(\w+)/i,
          // Nook
          /(dell) (strea[kpr\d ]*[\dko])/i,
          // Dell Streak
          /(le[- ]+pan)[- ]+(\w{1,9}) bui/i,
          // Le Pan Tablets
          /(trinity)[- ]*(t\d{3}) bui/i,
          // Trinity Tablets
          /(gigaset)[- ]+(q\w{1,9}) bui/i,
          // Gigaset Tablets
          /(vodafone) ([\w ]+)(?:\)| bui)/i
          // Vodafone
        ],
        [s, c, [a, S]],
        [
          /(surface duo)/i
          // Surface Duo
        ],
        [c, [s, B], [a, S]],
        [
          /droid [\d\.]+; (fp\du?)(?: b|\))/i
          // Fairphone
        ],
        [c, [s, "Fairphone"], [a, v]],
        [
          /(u304aa)/i
          // AT&T
        ],
        [c, [s, "AT&T"], [a, v]],
        [
          /\bsie-(\w*)/i
          // Siemens
        ],
        [c, [s, "Siemens"], [a, v]],
        [
          /\b(rct\w+) b/i
          // RCA Tablets
        ],
        [c, [s, "RCA"], [a, S]],
        [
          /\b(venue[\d ]{2,7}) b/i
          // Dell Venue Tablets
        ],
        [c, [s, "Dell"], [a, S]],
        [
          /\b(q(?:mv|ta)\w+) b/i
          // Verizon Tablet
        ],
        [c, [s, "Verizon"], [a, S]],
        [
          /\b(?:barnes[& ]+noble |bn[rt])([\w\+ ]*) b/i
          // Barnes & Noble Tablet
        ],
        [c, [s, "Barnes & Noble"], [a, S]],
        [
          /\b(tm\d{3}\w+) b/i
        ],
        [c, [s, "NuVision"], [a, S]],
        [
          /\b(k88) b/i
          // ZTE K Series Tablet
        ],
        [c, [s, "ZTE"], [a, S]],
        [
          /\b(nx\d{3}j) b/i
          // ZTE Nubia
        ],
        [c, [s, "ZTE"], [a, v]],
        [
          /\b(gen\d{3}) b.+49h/i
          // Swiss GEN Mobile
        ],
        [c, [s, "Swiss"], [a, v]],
        [
          /\b(zur\d{3}) b/i
          // Swiss ZUR Tablet
        ],
        [c, [s, "Swiss"], [a, S]],
        [
          /\b((zeki)?tb.*\b) b/i
          // Zeki Tablets
        ],
        [c, [s, "Zeki"], [a, S]],
        [
          /\b([yr]\d{2}) b/i,
          /\b(dragon[- ]+touch |dt)(\w{5}) b/i
          // Dragon Touch Tablet
        ],
        [[s, "Dragon Touch"], c, [a, S]],
        [
          /\b(ns-?\w{0,9}) b/i
          // Insignia Tablets
        ],
        [c, [s, "Insignia"], [a, S]],
        [
          /\b((nxa|next)-?\w{0,9}) b/i
          // NextBook Tablets
        ],
        [c, [s, "NextBook"], [a, S]],
        [
          /\b(xtreme\_)?(v(1[045]|2[015]|[3469]0|7[05])) b/i
          // Voice Xtreme Phones
        ],
        [[s, "Voice"], c, [a, v]],
        [
          /\b(lvtel\-)?(v1[12]) b/i
          // LvTel Phones
        ],
        [[s, "LvTel"], c, [a, v]],
        [
          /\b(ph-1) /i
          // Essential PH-1
        ],
        [c, [s, "Essential"], [a, v]],
        [
          /\b(v(100md|700na|7011|917g).*\b) b/i
          // Envizen Tablets
        ],
        [c, [s, "Envizen"], [a, S]],
        [
          /\b(trio[-\w\. ]+) b/i
          // MachSpeed Tablets
        ],
        [c, [s, "MachSpeed"], [a, S]],
        [
          /\btu_(1491) b/i
          // Rotor Tablets
        ],
        [c, [s, "Rotor"], [a, S]],
        [
          /(shield[\w ]+) b/i
          // Nvidia Shield Tablets
        ],
        [c, [s, "Nvidia"], [a, S]],
        [
          /(sprint) (\w+)/i
          // Sprint Phones
        ],
        [s, c, [a, v]],
        [
          /(kin\.[onetw]{3})/i
          // Microsoft Kin
        ],
        [[c, /\./g, " "], [s, B], [a, v]],
        [
          /droid.+; (cc6666?|et5[16]|mc[239][23]x?|vc8[03]x?)\)/i
          // Zebra
        ],
        [c, [s, ye], [a, S]],
        [
          /droid.+; (ec30|ps20|tc[2-8]\d[kx])\)/i
        ],
        [c, [s, ye], [a, v]],
        [
          ///////////////////
          // SMARTTVS
          ///////////////////
          /smart-tv.+(samsung)/i
          // Samsung
        ],
        [s, [a, I]],
        [
          /hbbtv.+maple;(\d+)/i
        ],
        [[c, /^/, "SmartTV"], [s, q], [a, I]],
        [
          /(nux; netcast.+smarttv|lg (netcast\.tv-201\d|android tv))/i
          // LG SmartTV
        ],
        [[s, X], [a, I]],
        [
          /(apple) ?tv/i
          // Apple TV
        ],
        [s, [c, _ + " TV"], [a, I]],
        [
          /crkey/i
          // Google Chromecast
        ],
        [[c, j + "cast"], [s, F], [a, I]],
        [
          /droid.+aft(\w+)( bui|\))/i
          // Fire TV
        ],
        [c, [s, k], [a, I]],
        [
          /\(dtv[\);].+(aquos)/i,
          /(aquos-tv[\w ]+)\)/i
          // Sharp
        ],
        [c, [s, ee], [a, I]],
        [
          /(bravia[\w ]+)( bui|\))/i
          // Sony
        ],
        [c, [s, te], [a, I]],
        [
          /(mitv-\w{5}) bui/i
          // Xiaomi
        ],
        [c, [s, le], [a, I]],
        [
          /Hbbtv.*(technisat) (.*);/i
          // TechniSAT
        ],
        [s, c, [a, I]],
        [
          /\b(roku)[\dx]*[\)\/]((?:dvp-)?[\d\.]*)/i,
          // Roku
          /hbbtv\/\d+\.\d+\.\d+ +\([\w\+ ]*; *([\w\d][^;]*);([^;]*)/i
          // HbbTV devices
        ],
        [[s, Ge], [c, Ge], [a, I]],
        [
          /\b(android tv|smart[- ]?tv|opera tv|tv; rv:)\b/i
          // SmartTV from Unidentified Vendors
        ],
        [[a, I]],
        [
          ///////////////////
          // CONSOLES
          ///////////////////
          /(ouya)/i,
          // Ouya
          /(nintendo) ([wids3utch]+)/i
          // Nintendo
        ],
        [s, c, [a, y]],
        [
          /droid.+; (shield) bui/i
          // Nvidia
        ],
        [c, [s, "Nvidia"], [a, y]],
        [
          /(playstation [345portablevi]+)/i
          // Playstation
        ],
        [c, [s, te], [a, y]],
        [
          /\b(xbox(?: one)?(?!; xbox))[\); ]/i
          // Microsoft Xbox
        ],
        [c, [s, B], [a, y]],
        [
          ///////////////////
          // WEARABLES
          ///////////////////
          /\b(sm-[lr]\d\d[05][fnuw]?s?)\b/i
          // Samsung Galaxy Watch
        ],
        [c, [s, q], [a, E]],
        [
          /((pebble))app/i
          // Pebble
        ],
        [s, c, [a, E]],
        [
          /(watch)(?: ?os[,\/]|\d,\d\/)[\d\.]+/i
          // Apple Watch
        ],
        [c, [s, _], [a, E]],
        [
          /droid.+; (glass) \d/i
          // Google Glass
        ],
        [c, [s, F], [a, E]],
        [
          /droid.+; (wt63?0{2,3})\)/i
        ],
        [c, [s, ye], [a, E]],
        [
          /(quest( \d| pro)?)/i
          // Oculus Quest
        ],
        [c, [s, Ce], [a, E]],
        [
          ///////////////////
          // EMBEDDED
          ///////////////////
          /(tesla)(?: qtcarbrowser|\/[-\w\.]+)/i
          // Tesla
        ],
        [s, [a, T]],
        [
          /(aeobc)\b/i
          // Echo Dot
        ],
        [c, [s, k], [a, T]],
        [
          ////////////////////
          // MIXED (GENERIC)
          ///////////////////
          /droid .+?; ([^;]+?)(?: bui|; wv\)|\) applew).+? mobile safari/i
          // Android Phones from Unidentified Vendors
        ],
        [c, [a, v]],
        [
          /droid .+?; ([^;]+?)(?: bui|\) applew).+?(?! mobile) safari/i
          // Android Tablets from Unidentified Vendors
        ],
        [c, [a, S]],
        [
          /\b((tablet|tab)[;\/]|focus\/\d(?!.+mobile))/i
          // Unidentifiable Tablet
        ],
        [[a, S]],
        [
          /(phone|mobile(?:[;\/]| [ \w\/\.]*safari)|pda(?=.+windows ce))/i
          // Unidentifiable Mobile
        ],
        [[a, v]],
        [
          /(android[-\w\. ]{0,9});.+buil/i
          // Generic Android Device
        ],
        [c, [s, "Generic"]]
      ],
      engine: [
        [
          /windows.+ edge\/([\w\.]+)/i
          // EdgeHTML
        ],
        [p, [l, G + "HTML"]],
        [
          /webkit\/537\.36.+chrome\/(?!27)([\w\.]+)/i
          // Blink
        ],
        [p, [l, "Blink"]],
        [
          /(presto)\/([\w\.]+)/i,
          // Presto
          /(webkit|trident|netfront|netsurf|amaya|lynx|w3m|goanna)\/([\w\.]+)/i,
          // WebKit/Trident/NetFront/NetSurf/Amaya/Lynx/w3m/Goanna
          /ekioh(flow)\/([\w\.]+)/i,
          // Flow
          /(khtml|tasman|links)[\/ ]\(?([\w\.]+)/i,
          // KHTML/Tasman/Links
          /(icab)[\/ ]([23]\.[\d\.]+)/i,
          // iCab
          /\b(libweb)/i
        ],
        [l, p],
        [
          /rv\:([\w\.]{1,9})\b.+(gecko)/i
          // Gecko
        ],
        [p, l]
      ],
      os: [
        [
          // Windows
          /microsoft (windows) (vista|xp)/i
          // Windows (iTunes)
        ],
        [l, p],
        [
          /(windows (?:phone(?: os)?|mobile))[\/ ]?([\d\.\w ]*)/i
          // Windows Phone
        ],
        [l, [p, ct, ze]],
        [
          /windows nt 6\.2; (arm)/i,
          // Windows RT
          /windows[\/ ]?([ntce\d\. ]+\w)(?!.+xbox)/i,
          /(?:win(?=3|9|n)|win 9x )([nt\d\.]+)/i
        ],
        [[p, ct, ze], [l, "Windows"]],
        [
          // iOS/macOS
          /ip[honead]{2,4}\b(?:.*os ([\w]+) like mac|; opera)/i,
          // iOS
          /(?:ios;fbsv\/|iphone.+ios[\/ ])([\d\.]+)/i,
          /cfnetwork\/.+darwin/i
        ],
        [[p, /_/g, "."], [l, "iOS"]],
        [
          /(mac os x) ?([\w\. ]*)/i,
          /(macintosh|mac_powerpc\b)(?!.+haiku)/i
          // Mac OS
        ],
        [[l, St], [p, /_/g, "."]],
        [
          // Mobile OSes
          /droid ([\w\.]+)\b.+(android[- ]x86|harmonyos)/i
          // Android-x86/HarmonyOS
        ],
        [p, l],
        [
          // Android/WebOS/QNX/Bada/RIM/Maemo/MeeGo/Sailfish OS
          /(android|webos|qnx|bada|rim tablet os|maemo|meego|sailfish)[-\/ ]?([\w\.]*)/i,
          /(blackberry)\w*\/([\w\.]*)/i,
          // Blackberry
          /(tizen|kaios)[\/ ]([\w\.]+)/i,
          // Tizen/KaiOS
          /\((series40);/i
          // Series 40
        ],
        [l, p],
        [
          /\(bb(10);/i
          // BlackBerry 10
        ],
        [p, [l, N]],
        [
          /(?:symbian ?os|symbos|s60(?=;)|series60)[-\/ ]?([\w\.]*)/i
          // Symbian
        ],
        [p, [l, "Symbian"]],
        [
          /mozilla\/[\d\.]+ \((?:mobile|tablet|tv|mobile; [\w ]+); rv:.+ gecko\/([\w\.]+)/i
          // Firefox OS
        ],
        [p, [l, W + " OS"]],
        [
          /web0s;.+rt(tv)/i,
          /\b(?:hp)?wos(?:browser)?\/([\w\.]+)/i
          // WebOS
        ],
        [p, [l, "webOS"]],
        [
          /watch(?: ?os[,\/]|\d,\d\/)([\d\.]+)/i
          // watchOS
        ],
        [p, [l, "watchOS"]],
        [
          // Google Chromecast
          /crkey\/([\d\.]+)/i
          // Google Chromecast
        ],
        [p, [l, j + "cast"]],
        [
          /(cros) [\w]+(?:\)| ([\w\.]+)\b)/i
          // Chromium OS
        ],
        [[l, at], p],
        [
          // Smart TVs
          /panasonic;(viera)/i,
          // Panasonic Viera
          /(netrange)mmh/i,
          // Netrange
          /(nettv)\/(\d+\.[\w\.]+)/i,
          // NetTV
          // Console
          /(nintendo|playstation) ([wids345portablevuch]+)/i,
          // Nintendo/Playstation
          /(xbox); +xbox ([^\);]+)/i,
          // Microsoft Xbox (360, One, X, S, Series X, Series S)
          // Other
          /\b(joli|palm)\b ?(?:os)?\/?([\w\.]*)/i,
          // Joli/Palm
          /(mint)[\/\(\) ]?(\w*)/i,
          // Mint
          /(mageia|vectorlinux)[; ]/i,
          // Mageia/VectorLinux
          /([kxln]?ubuntu|debian|suse|opensuse|gentoo|arch(?= linux)|slackware|fedora|mandriva|centos|pclinuxos|red ?hat|zenwalk|linpus|raspbian|plan 9|minix|risc os|contiki|deepin|manjaro|elementary os|sabayon|linspire)(?: gnu\/linux)?(?: enterprise)?(?:[- ]linux)?(?:-gnu)?[-\/ ]?(?!chrom|package)([-\w\.]*)/i,
          // Ubuntu/Debian/SUSE/Gentoo/Arch/Slackware/Fedora/Mandriva/CentOS/PCLinuxOS/RedHat/Zenwalk/Linpus/Raspbian/Plan9/Minix/RISCOS/Contiki/Deepin/Manjaro/elementary/Sabayon/Linspire
          /(hurd|linux) ?([\w\.]*)/i,
          // Hurd/Linux
          /(gnu) ?([\w\.]*)/i,
          // GNU
          /\b([-frentopcghs]{0,5}bsd|dragonfly)[\/ ]?(?!amd|[ix346]{1,2}86)([\w\.]*)/i,
          // FreeBSD/NetBSD/OpenBSD/PC-BSD/GhostBSD/DragonFly
          /(haiku) (\w+)/i
          // Haiku
        ],
        [l, p],
        [
          /(sunos) ?([\w\.\d]*)/i
          // Solaris
        ],
        [[l, "Solaris"], p],
        [
          /((?:open)?solaris)[-\/ ]?([\w\.]*)/i,
          // Solaris
          /(aix) ((\d)(?=\.|\)| )[\w\.])*/i,
          // AIX
          /\b(beos|os\/2|amigaos|morphos|openvms|fuchsia|hp-ux|serenityos)/i,
          // BeOS/OS2/AmigaOS/MorphOS/OpenVMS/Fuchsia/HP-UX/SerenityOS
          /(unix) ?([\w\.]*)/i
          // UNIX
        ],
        [l, p]
      ]
    }, xe = function(Q, C) {
      if (typeof Q === h && (C = Q, Q = i), !(this instanceof xe))
        return new xe(Q, C).getResult();
      var w = typeof t !== b && t.navigator ? t.navigator : i, R = Q || (w && w.userAgent ? w.userAgent : m), A = w && w.userAgentData ? w.userAgentData : i, D = C ? Gt(ke, C) : ke, P = w && w.userAgent == R;
      return this.getBrowser = function() {
        var Z = {};
        return Z[l] = i, Z[p] = i, Xe.call(Z, R, D.browser), Z[o] = Er(Z[p]), P && w && w.brave && typeof w.brave.isBrave == n && (Z[l] = "Brave"), Z;
      }, this.getCPU = function() {
        var Z = {};
        return Z[d] = i, Xe.call(Z, R, D.cpu), Z;
      }, this.getDevice = function() {
        var Z = {};
        return Z[s] = i, Z[c] = i, Z[a] = i, Xe.call(Z, R, D.device), P && !Z[a] && A && A.mobile && (Z[a] = v), P && Z[c] == "Macintosh" && w && typeof w.standalone !== b && w.maxTouchPoints && w.maxTouchPoints > 2 && (Z[c] = "iPad", Z[a] = S), Z;
      }, this.getEngine = function() {
        var Z = {};
        return Z[l] = i, Z[p] = i, Xe.call(Z, R, D.engine), Z;
      }, this.getOS = function() {
        var Z = {};
        return Z[l] = i, Z[p] = i, Xe.call(Z, R, D.os), P && !Z[l] && A && A.platform && A.platform != "Unknown" && (Z[l] = A.platform.replace(/chrome os/i, at).replace(/macos/i, St)), Z;
      }, this.getResult = function() {
        return {
          ua: this.getUA(),
          browser: this.getBrowser(),
          engine: this.getEngine(),
          os: this.getOS(),
          device: this.getDevice(),
          cpu: this.getCPU()
        };
      }, this.getUA = function() {
        return R;
      }, this.setUA = function(Z) {
        return R = typeof Z === g && Z.length > x ? Ge(Z, x) : Z, this;
      }, this.setUA(R), this;
    };
    xe.VERSION = u, xe.BROWSER = Ae([l, p, o]), xe.CPU = Ae([d]), xe.DEVICE = Ae([c, s, a, y, v, I, S, E, T]), xe.ENGINE = xe.OS = Ae([l, p]), r.exports && (e = r.exports = xe), e.UAParser = xe;
    var je = typeof t !== b && (t.jQuery || t.Zepto);
    if (je && !je.ua) {
      var Ee = new xe();
      je.ua = Ee.getResult(), je.ua.get = function() {
        return Ee.getUA();
      }, je.ua.set = function(Q) {
        Ee.setUA(Q);
        var C = Ee.getResult();
        for (var w in C)
          je.ua[w] = C[w];
      };
    }
  })(typeof window == "object" ? window : dr);
})(zr, zr.exports);
var Po = zr.exports;
const Zo = /* @__PURE__ */ wt(Po), Uo = ["iOS"];
class Rr extends Zo {
  constructor() {
    super(window.navigator.userAgent);
  }
  isChromium() {
    return !!this.getUA().match(/Chrome/i);
  }
  isChrome() {
    const e = this.getBrowser();
    if (!e.name)
      return !1;
    const t = this.getOS();
    let i = !0;
    return i = !new RegExp(Uo.join("|"), "i").test(t.name || ""), !!e.name.match(/Chrome/i) && i;
  }
  isFirefox() {
    const e = this.getBrowser();
    return e.name ? !!e.name.match(/Firefox/i) : !1;
  }
  isOpera() {
    const e = this.getBrowser();
    return e.name ? !!e.name.match(/Opera/i) : !1;
  }
  isSafari() {
    const e = this.getBrowser();
    return e.name ? !!e.name.match(/Safari/i) : !1;
  }
}
const pe = Fe.get("SdpParser"), Yn = 35, Fo = 65, Kn = 96, No = 127, Oo = Array.from(
  { length: Fo - Yn + 1 },
  (r, e) => e + Yn
), Vo = Array.from(
  { length: No - Kn + 1 },
  (r, e) => e + Kn
), Hn = 1, jo = 14, Jn = 16, Wo = 255, $o = Array.from(
  { length: jo - Hn + 1 },
  (r, e) => e + Hn
), Bo = Array.from(
  { length: Wo - Jn + 1 },
  (r, e) => e + Jn
), Se = {
  /**
   * @function
   * @name setStereo
   * @description Parse SDP for support stereo.
   * @param {String} sdp - Current SDP.
   * @returns {String} SDP parsed with stereo support.
   * @example SdpParser.setStereo(sdp)
   */
  setStereo(r = "") {
    return pe.info("Replacing SDP response for support stereo"), r = r.replace(/useinbandfec=1/g, "useinbandfec=1; stereo=1"), pe.info("Replaced SDP response for support stereo"), pe.debug("New SDP value: ", r), r;
  },
  /**
   * @function
   * @name setDTX
   * @description Set DTX (Discontinuous Transmission) to the connection. Advanced configuration of the opus audio codec that allows for a large reduction in the audio traffic. For example, when a participant is silent, the audio packets won't be transmitted.
   * @param {String} sdp - Current SDP.
   * @returns {String} SDP parsed with dtx support.
   * @example SdpParser.setDTX(sdp)
   */
  setDTX(r = "") {
    return pe.info("Replacing SDP response for support dtx"), r = r.replace("useinbandfec=1", "useinbandfec=1; usedtx=1"), pe.info("Replaced SDP response for support dtx"), pe.debug("New SDP value: ", r), r;
  },
  /**
   * @function
   * @name setAbsoluteCaptureTime
   * @description Mangle SDP for adding absolute capture time header extension.
   * @param {String} sdp - Current SDP.
   * @returns {String} SDP mungled with abs-capture-time header extension.
   * @example SdpParser.setAbsoluteCaptureTime(sdp)
   */
  setAbsoluteCaptureTime(r = "") {
    const t = "a=extmap:" + Se.getAvailableHeaderExtensionIdRange(r)[0] + " http://www.webrtc.org/experiments/rtp-hdrext/abs-capture-time\r\n", i = /(m=.*\r\n(?:.*\r\n)*?)(a=extmap.*\r\n)/gm;
    return r = r.replace(i, (u, m, f) => m + t + f), pe.info("Replaced SDP response for setting absolute capture time"), pe.debug("New SDP value: ", r), r;
  },
  /**
   * @function
   * @name setDependencyDescriptor
   * @description Mangle SDP for adding dependency descriptor header extension.
   * @param {String} sdp - Current SDP.
   * @returns {String} SDP mungled with abs-capture-time header extension.
   * @example SdpParser.setAbsoluteCaptureTime(sdp)
   */
  setDependencyDescriptor(r = "") {
    const t = "a=extmap:" + Se.getAvailableHeaderExtensionIdRange(r)[0] + " https://aomediacodec.github.io/av1-rtp-spec/#dependency-descriptor-rtp-header-extension\r\n", i = /(m=.*\r\n(?:.*\r\n)*?)(a=extmap.*\r\n)/gm;
    return r = r.replace(i, (u, m, f) => m + t + f), pe.info("Replaced SDP response for setting depency descriptor"), pe.debug("New SDP value: ", r), r;
  },
  /**
   * @function
   * @name setVideoBitrate
   * @description Parse SDP for desired bitrate.
   * @param {String} sdp - Current SDP.
   * @param {Number} bitrate - Bitrate value in kbps or 0 for unlimited bitrate.
   * @returns {String} SDP parsed with desired bitrate.
   * @example SdpParser.setVideoBitrate(sdp, 1000)
   */
  setVideoBitrate(r = "", e = 0) {
    if (e < 1)
      pe.info("Remove bitrate restrictions"), r = r.replace(/b=AS:.*\r\n/, "").replace(/b=TIAS:.*\r\n/, "");
    else {
      const t = Et.parse(r), i = t.getMedia("video");
      pe.info("Setting video bitrate"), i.setBitrate(e), r = t.toString();
    }
    return r;
  },
  /**
   * @function
   * @name removeSdpLine
   * @description Remove SDP line.
   * @param {String} sdp - Current SDP.
   * @param {String} sdpLine - SDP line to remove.
   * @returns {String} SDP without the line.
   * @example SdpParser.removeSdpLine(sdp, 'custom line')
   */
  removeSdpLine(r = "", e = "") {
    return pe.debug("SDP before trimming: ", r), r = r.split("\n").filter((t) => t.trim() !== e).join("\n"), pe.debug("SDP trimmed result: ", r), r;
  },
  /**
   * @function
   * @name adaptCodecName
   * @description Replace codec name of a SDP.
   * @param {String} sdp - Current SDP.
   * @param {String} codec - Codec name to be replaced.
   * @param {String} newCodecName - New codec name to replace.
   * @returns {String} SDP updated with new codec name.
   */
  adaptCodecName(r = "", e = "", t = "") {
    if (!r)
      return r;
    const i = new RegExp("".concat(e), "i");
    return r.replace(i, t);
  },
  /**
   * @function
   * @name setMultiopus
   * @description Parse SDP for support multiopus.
   * **Only available in Google Chrome.**
   * @param {String} sdp - Current SDP.
   * @param {MediaStream} mediaStream - MediaStream offered in the stream.
   * @returns {String} SDP parsed with multiopus support.
   * @example SdpParser.setMultiopus(sdp, mediaStream)
   */
  setMultiopus(r = "", e) {
    var i, u;
    if (!new Rr().isFirefox() && (!e || Go(e)))
      if (r.includes("multiopus/48000/6"))
        pe.info("Multiopus already setted");
      else {
        pe.info("Setting multiopus");
        const f = (u = ((i = new RegExp("m=audio 9 UDP/TLS/RTP/SAVPF (.*)\\r\\n").exec(r)) != null ? i : [])[0]) != null ? u : "", n = Se.getAvailablePayloadTypeRange(r)[0], b = f.replace("\r\n", " ") + n + "\r\na=rtpmap:" + n + " multiopus/48000/6\r\na=fmtp:" + n + " channel_mapping=0,4,1,2,3,5;coupled_streams=2;minptime=10;num_streams=4;useinbandfec=1\r\n";
        r = r.replace(f, b), pe.info("Multiopus offer created"), pe.debug("SDP parsed for multioups: ", r);
      }
    return r;
  },
  /**
   * @function
   * @name getAvailablePayloadTypeRange
   * @description Gets all available payload type IDs of the current Session Description.
   * @param {String} sdp - Current SDP.
   * @returns {Array<Number>} All available payload type ids.
   */
  getAvailablePayloadTypeRange(r = "") {
    const e = new RegExp("m=(?:.*) (?:.*) UDP/TLS/RTP/SAVPF (.*)\\r\\n", "gm"), t = r.matchAll(e);
    let i = Vo.concat(Oo);
    for (const u of t) {
      const m = u[1].split(" ").map((f) => parseInt(f));
      i = i.filter((f) => !m.includes(f));
    }
    return i;
  },
  /**
   * @function
   * @name getAvailableHeaderExtensionIdRange
   * @description Gets all available header extension IDs of the current Session Description.
   * @param {String} sdp - Current SDP.
   * @returns {Array<Number>} All available header extension IDs.
   */
  getAvailableHeaderExtensionIdRange(r = "") {
    const e = new RegExp("a=extmap:(\\d+)(?:.*)\\r\\n", "gm"), t = r.matchAll(e);
    let i = $o.concat(Bo);
    for (const u of t) {
      const m = u[1].split(" ").map((f) => parseInt(f));
      i = i.filter((f) => !m.includes(f));
    }
    return i;
  },
  /**
   * @function
   * @name renegotiate
   * @description Renegotiate remote sdp based on previous description.
   * This function will fill missing m-lines cloning on the remote description by cloning the codec and extensions already negotiated for that media
   * @param {String} localDescription - Updated local sdp
   * @param {String} remoteDescription - Previous remote sdp
   */
  renegotiate(r = "", e = "") {
    const t = Et.parse(r), i = Et.parse(e);
    for (const u of t.getMedias()) {
      let m = i.getMediaById(u.getId());
      if (!m) {
        m = new Do(u.getId(), u.getType()), m.setDirection(Mo.reverse(u.getDirection()));
        const f = i.getMedia(u.getType());
        if (f) {
          m.setCodecs(f.getCodecs());
          for (const [n, b] of f.getExtensions())
            m.addExtension(n, b);
        }
        i.addMedia(m);
      }
    }
    return i.toString();
  },
  /**
   * @function
   * @name updateMissingVideoExtensions
   * @description Adds missing extensions of each video section in the localDescription
   * @param {String} localDescription - Previous local sdp
   * @param {String} remoteDescription - Remote sdp
   * @returns {String} SDP updated with missing extensions.
   */
  updateMissingVideoExtensions(r = "", e = "") {
    var m;
    const t = Et.parse(r), u = (m = Et.parse(e).getMediasByType("video")[0]) == null ? void 0 : m.getExtensions();
    if (u) {
      for (const f of t.getMediasByType("video")) {
        const n = f.getExtensions();
        u.forEach((b, h) => {
          if (!n.get(h)) {
            const g = f.getId(), o = "a=extmap:" + h + " " + b + "\r\n", c = new RegExp("(a=mid:" + g + "\\r\\n(?:.*\\r\\n)*?)", "g");
            r = r.replace(c, (l, a) => a + o);
          }
        });
      }
      return r;
    }
  },
  getCodecPayloadType(r = "") {
    const e = new RegExp("a=rtpmap:(\\d+) (\\w+)/\\d+", "g"), t = r.matchAll(e), i = {};
    for (const u of t)
      i[u[1]] = u[2];
    return i;
  }
}, Go = (r) => r.getAudioTracks().some((e) => e.getSettings().channelCount > 2);
var ge = /* @__PURE__ */ ((r) => (r.VP8 = "vp8", r.VP9 = "vp9", r.H264 = "h264", r.AV1 = "av1", r.H265 = "h265", r))(ge || {}), li = /* @__PURE__ */ ((r) => (r.OPUS = "opus", r.MULTIOPUS = "multiopus", r))(li || {});
const K = Fe.get("PeerConnection"), ur = {
  Publisher: "Publisher",
  Viewer: "Viewer"
}, Ue = {
  track: "track",
  connectionStateChange: "connectionStateChange"
}, Qn = {
  stereo: !1,
  codec: ge.H264,
  simulcast: !1,
  disableAudio: !1,
  disableVideo: !1,
  setSDPToPeer: !0
};
class qe extends vr {
  constructor() {
    super(), this.mode = null, this.sessionDescription = null, this.peer = null, this.peerConnectionStats = null, this.transceiverMap = /* @__PURE__ */ new Map();
  }
  /**
   * Instance new RTCPeerConnection.
   * @param {RTCConfiguration} config - Peer configuration.
   * @param {Boolean} [config.autoInitStats = true] - True to initialize statistics monitoring of the RTCPeerConnection accessed via Logger.get(), false to opt-out.
   * @param {Number} [config.statsIntervalMs = 1000] - The default interval at which the SDK will return WebRTC stats to the consuming application.
   * @param {"Publisher" | "Viewer"} [mode = "Viewer"] - Type of connection that is trying to be created, either 'Viewer' or 'Publisher'.
   */
  async createRTCPeer(e = { autoInitStats: !0, statsIntervalMs: 1e3 }, t = ur.Viewer) {
    K.info("Creating new RTCPeerConnection"), K.debug("RTC configuration provided by user: ", e), this.peer = zo(this, e), this.mode = t, e.autoInitStats && this.initStats(e);
  }
  /**
   * Get current RTC peer connection.
   * @returns {RTCPeerConnection} Object which represents the RTCPeerConnection.
   */
  getRTCPeer() {
    return K.info("Getting RTC Peer"), this.peer;
  }
  /**
   * Close RTC peer connection.
   * @fires PeerConnection#connectionStateChange
   */
  async closeRTCPeer() {
    var e;
    K.info("Closing RTCPeerConnection"), (e = this.peer) == null || e.close(), this.peer = null, this.stopStats(), this.emit(Ue.connectionStateChange, "closed");
  }
  /**
   * Set SDP information to remote peer.
   * @param {String} sdp - New SDP to be set in the remote peer.
   * @returns {Promise<void>} Promise object which resolves when SDP information was successfully set.
   */
  async setRTCRemoteSDP(e) {
    var i;
    K.info("Setting RTC Remote SDP");
    const t = { type: "answer", sdp: e };
    try {
      await ((i = this.peer) == null ? void 0 : i.setRemoteDescription(t)), K.info("RTC Remote SDP was set successfully."), K.debug("RTC Remote SDP new value: ", e);
    } catch (u) {
      throw K.error("Error while setting RTC Remote SDP: ", u), u;
    }
  }
  /**
   * Get the SDP modified depending the options. Optionally set the SDP information to local peer.
   * @param {Object} options
   * @param {Boolean} options.stereo - True to modify SDP for support stereo. Otherwise False.
   * @param {Boolean} options.dtx - True to modify SDP for supporting dtx in opus. Otherwise False.*
   * @param {MediaStream|Array<MediaStreamTrack>} options.mediaStream - MediaStream to offer in a stream. This object must have
   * 1 audio track and 1 video track, or at least one of them. Alternative you can provide both tracks in an array.
   * @param {VideoCodec} options.codec - Selected codec for support simulcast.
   * @param {Boolean} options.simulcast - True to modify SDP for support simulcast. **Only available in Chromium based browsers and with H.264 or VP8 video codecs.**
   * @param {String} options.scalabilityMode - Selected scalability mode. You can get the available capabilities using <a href="PeerConnection#.getCapabilities">PeerConnection.getCapabilities</a> method.
   * **Only available in Google Chrome.**
   * @param {Boolean} options.absCaptureTime - True to modify SDP for supporting absolute capture time header extension. Otherwise False.
   * @param {Boolean} options.dependencyDescriptor - True to modify SDP for supporting aom dependency descriptor header extension. Otherwise False.
   * @param {Boolean} options.disableAudio - True to not support audio.
   * @param {Boolean} options.disableVideo - True to not support video.
   * @param {Boolean} options.setSDPToPeer - True to set the SDP to local peer.
   * @returns {Promise<String>} Promise object which represents the SDP information of the created offer.
   */
  async getRTCLocalSDP(e = Qn) {
    var t;
    if (K.info("Getting RTC Local SDP"), e = J(J({}, Qn), e), K.debug("Options: ", e), this.peer) {
      const i = Xo(e.mediaStream);
      i ? Ho(this.peer, i, e) : Jo(this.peer, e), K.info("Creating peer offer");
      const u = await this.peer.createOffer() || null;
      K.info("Peer offer created"), K.debug("Peer offer response: ", u.sdp), this.sessionDescription = u, e.disableAudio || (e.stereo && (this.sessionDescription.sdp = Se.setStereo(this.sessionDescription.sdp)), e.dtx && (this.sessionDescription.sdp = Se.setDTX(this.sessionDescription.sdp)), this.sessionDescription.sdp = Se.setMultiopus(this.sessionDescription.sdp, i)), e.absCaptureTime && (this.sessionDescription.sdp = Se.setAbsoluteCaptureTime(this.sessionDescription.sdp)), e.dependencyDescriptor && (this.sessionDescription.sdp = Se.setDependencyDescriptor(this.sessionDescription.sdp)), e.setSDPToPeer && (await this.peer.setLocalDescription(this.sessionDescription), K.info("Peer local description set"));
    }
    return (t = this.sessionDescription) == null ? void 0 : t.sdp;
  }
  /**
   * Add remote receiving track.
   * @param {String} media - Media kind ('audio' | 'video').
   * @param {Array<MediaStream>} streams - Streams the track will belong to.
   * @return {Promise<RTCRtpTransceiver>} Promise that will be resolved when the RTCRtpTransceiver is assigned an mid value.
   */
  async addRemoteTrack(e, t) {
    return new Promise((i, u) => {
      try {
        if (this.peer) {
          const m = this.peer.addTransceiver(e, {
            direction: "recvonly",
            streams: t
          });
          this.transceiverMap.set(m, i);
        }
      } catch (m) {
        u(m);
      }
    });
  }
  /**
   * Update remote SDP information to restrict bandwidth.
   * @param {String} sdp - Remote SDP.
   * @param {Number} bitrate - New bitrate value in kbps or 0 unlimited bitrate.
   * @return {String} Updated SDP information with new bandwidth restriction.
   */
  updateBandwidthRestriction(e, t) {
    if (this.mode === ur.Viewer)
      throw K.error("Viewer attempting to update bitrate, this is not allowed"), new Error("It is not possible for a viewer to update the bitrate.");
    return K.info("Updating bandwidth restriction, bitrate value: ", t), K.debug("SDP value: ", e), Se.setVideoBitrate(e, t);
  }
  /**
   * Set SDP information to remote peer with bandwidth restriction.
   * @param {Number} bitrate - New bitrate value in kbps or 0 unlimited bitrate.
   * @returns {Promise<void>} Promise object which resolves when bitrate was successfully updated.
   */
  async updateBitrate(e = 0) {
    var i;
    if (this.mode === ur.Viewer)
      throw K.error("Viewer attempting to update bitrate, this is not allowed"), new Error("It is not possible for a viewer to update the bitrate.");
    if (!this.peer)
      throw K.error("Cannot update bitrate. No peer found."), new Error("Cannot update bitrate. No peer found.");
    K.info("Updating bitrate to value: ", e), this.sessionDescription = await this.peer.createOffer(), await this.peer.setLocalDescription(this.sessionDescription);
    const t = this.updateBandwidthRestriction((i = this.peer.remoteDescription) == null ? void 0 : i.sdp, e);
    await this.setRTCRemoteSDP(t), K.info("Bitrate restrictions updated: ", "".concat(e > 0 ? e : "unlimited", " kbps"));
  }
  /**
   * Get peer connection state.
   * @returns {RTCPeerConnectionState?} Promise object which represents the peer connection state.
   */
  getRTCPeerStatus() {
    if (K.info("Getting RTC peer status"), !this.peer)
      return null;
    const e = Qo(this.peer);
    return K.info("RTC peer status getted, value: ", e), e;
  }
  /**
   * Replace current audio or video track that is being broadcasted.
   * @param {MediaStreamTrack} mediaStreamTrack - New audio or video track to replace the current one.
   */
  replaceTrack(e) {
    if (!this.peer) {
      K.error("Could not change track if there is not an active connection.");
      return;
    }
    const t = this.peer.getSenders().find((i) => {
      var u;
      return ((u = i.track) == null ? void 0 : u.kind) === e.kind;
    });
    t ? t.replaceTrack(e) : K.error("There is no ".concat(e.kind, " track in active broadcast."));
  }
  /**
   * @typedef {Object} MillicastCapability
   * @property {Array<Object>} codecs
   * @property {String} codecs.codec - Audio or video codec name.
   * @property {String} codecs.mimeType - Audio or video codec mime type.
   * @property {Array<String>} [codecs.scalabilityModes] - In case of SVC support, a list of scalability modes supported.
   * @property {Number} [codecs.channels] - Only for audio, the number of audio channels supported.
   * @property {Array<RTCRtpHeaderExtensionCapability>} headerExtensions - An array specifying the URI of the header extension, as described in RFC 5285.
   */
  /**
   * Gets user's browser media capabilities compared with Millicast Media Server support.
   *
   * @param {"audio"|"video"} kind - Type of media for which you wish to get sender capabilities.
   * @returns {MillicastCapability} Object with all capabilities supported by user's browser and Millicast Media Server.
   */
  static getCapabilities(e) {
    const t = new Rr(), i = RTCRtpSender.getCapabilities(e);
    if (i) {
      const u = {};
      let m = new RegExp("^video/(".concat(Object.values(ge).join("|"), ")x?$"), "i");
      e === "audio" && (m = new RegExp("^audio/(".concat(Object.values(li).join("|"), ")$"), "i"), t.isChrome() && (u.multiopus = { mimeType: "audio/multiopus", channels: 6 }));
      for (const f of i.codecs) {
        const n = f.mimeType.match(m);
        if (n) {
          const b = n[1].toLowerCase();
          if (u[b] = we(J({}, u[b]), { mimeType: f.mimeType }), f.scalabilityModes) {
            let h = u[b].scalabilityModes || [];
            h = [...h, ...f.scalabilityModes], u[b].scalabilityModes = [...new Set(h)];
          }
          f.channels && (u[b].channels = f.channels);
        }
      }
      i.codecs = Object.keys(u).map((f) => J({ codec: f }, u[f]));
    }
    return i;
  }
  /**
   * Get sender tracks
   * @returns {Array<MediaStreamTrack>} An array with all tracks in sender peer.
   */
  getTracks() {
    var e;
    return ((e = this.peer) == null ? void 0 : e.getSenders().map((t) => t.track)) || [];
  }
  /**
   * Initialize the statistics monitoring of the RTCPeerConnection.
   *
   * It will be emitted every second.
   * @fires PeerConnection#stats
   * @example peerConnection.initStats()
   * @example
   * import Publish from '@millicast/sdk'
   *
   * //Initialize and connect your Publisher
   * const millicastPublish = new Publish(tokenGenerator)
   * await millicastPublish.connect(options)
   *
   * //Initialize get stats
   * millicastPublish.webRTCPeer.initStats()
   *
   * //Capture new stats from event every second
   * millicastPublish.webRTCPeer.on('stats', (stats) => {
   *   console.log('Stats from event: ', stats)
   * })
   * @example
   * import View from '@millicast/sdk'
   *
   * //Initialize and connect your Viewer
   * const millicastView = new View(tokenGenerator)
   * await millicastView.connect()
   *
   * //Initialize get stats
   * millicastView.webRTCPeer.initStats()
   *
   * //Capture new stats from event every second
   * millicastView.webRTCPeer.on('stats', (stats) => {
   *   console.log('Stats from event: ', stats)
   * })
   */
  initStats(e) {
    this.peerConnectionStats ? K.warn(
      "PeerConnection.initStats() has already been called. Automatic initialization occurs via View.connect(), Publish.connect() or this.createRTCPeer(). See options"
    ) : this.peer ? (this.peerConnectionStats = new zi(this.peer, e), fr(this.peerConnectionStats, this, [Ls.stats])) : K.warn("Cannot init peer stats: RTCPeerConnection not initialized");
  }
  /**
   * Stops the monitoring of RTCPeerConnection statistics.
   * @example peerConnection.stopStats()
   */
  stopStats() {
    var e;
    (e = this.peerConnectionStats) == null || e.stop(), this.peerConnectionStats = null;
  }
}
const qn = (r) => r.getAudioTracks().length <= 1 && r.getVideoTracks().length <= 1, Xo = (r) => {
  if (!r)
    return null;
  if (r instanceof MediaStream && qn(r))
    return r;
  if (r instanceof Array) {
    K.info("Creating MediaStream to add received tracks.");
    const e = new MediaStream();
    for (const t of r)
      e.addTrack(t);
    if (qn(e))
      return e;
  }
  throw K.error("MediaStream must have 1 audio track and 1 video track, or at least one of them."), new Error("MediaStream must have 1 audio track and 1 video track, or at least one of them.");
}, zo = (r, e) => {
  const t = new RTCPeerConnection(e);
  return Ko(r, t), t;
};
async function Yo(r) {
  return new Promise((e) => setTimeout(e, r));
}
const Ko = (r, e) => {
  e.ontrack = async (t) => {
    K.info("New track from peer."), K.debug("Track event value: ", t);
    const i = r.transceiverMap.get(t.transceiver);
    if (i) {
      for (; !t.transceiver.mid; )
        await Yo(100);
      i(t.transceiver), r.transceiverMap.delete(t.transceiver);
    }
    setTimeout(() => {
      r.emit(Ue.track, t);
    }, 0);
  }, e.connectionState ? e.onconnectionstatechange = () => {
    K.info("Peer connection state change: ", e.connectionState), r.emit(Ue.connectionStateChange, e.connectionState);
  } : e.oniceconnectionstatechange = () => {
    K.info("Peer ICE connection state change: ", e.iceConnectionState), r.emit(Ue.connectionStateChange, e.iceConnectionState);
  }, e.onnegotiationneeded = async () => {
    if (!e.remoteDescription) return;
    K.info("Peer onnegotiationneeded, updating local description");
    const t = await e.createOffer();
    K.info("Peer onnegotiationneeded, got local offer", t.sdp), t.sdp = Se.updateMissingVideoExtensions(t.sdp, e.remoteDescription.sdp), await e.setLocalDescription(t);
    const i = Se.renegotiate(t.sdp, e.remoteDescription.sdp);
    K.info("Peer onnegotiationneeded, updating remote description", i), await e.setRemoteDescription({ type: "answer", sdp: i }), K.info("Peer onnegotiationneeded, renegotiation done");
  };
}, Ho = (r, e, t) => {
  K.info("Adding mediaStream tracks to RTCPeerConnection");
  for (const i of e.getTracks()) {
    const u = {
      streams: [e]
    };
    if (i.kind === "audio" && (u.direction = t.disableAudio ? "inactive" : "sendonly"), i.kind === "video") {
      u.direction = t.disableVideo ? "inactive" : "sendonly";
      const m = [];
      t.scalabilityMode && new Rr().isChrome() ? (K.debug("Video track with scalability mode: ".concat(t.scalabilityMode, ".")), m.push({ scalabilityMode: t.scalabilityMode })) : t.scalabilityMode && K.warn("SVC is only supported in Google Chrome"), t.simulcast && m.push(
        { rid: "f", scaleResolutionDownBy: 1 },
        { rid: "h", scaleResolutionDownBy: 2 },
        { rid: "q", scaleResolutionDownBy: 4 }
      ), m.length > 0 && (u.sendEncodings = m);
    }
    r.addTransceiver(i, u), K.info("Track '".concat(i.label, "' added: "), "id: ".concat(i.id), "kind: ".concat(i.kind));
  }
}, Jo = (r, e) => {
  var i;
  const t = new Rr();
  if (!e.disableVideo) {
    const u = r.addTransceiver("video", {
      direction: "recvonly"
    });
    t.isOpera() && u.setCodecPreferences(
      ((i = RTCRtpReceiver.getCapabilities("video")) == null ? void 0 : i.codecs.filter(
        (m) => {
          var f;
          return m.mimeType !== "video/H264" || ((f = m.sdpFmtpLine) == null ? void 0 : f.includes("profile-level-id=4"));
        }
      )) || []
    );
  }
  if (e.disableAudio || r.addTransceiver("audio", {
    direction: "recvonly"
  }), e.multiplexedAudioTracks)
    for (let u = 0; u < e.multiplexedAudioTracks; u++)
      r.addTransceiver("audio", {
        direction: "recvonly"
      });
}, Qo = (r) => {
  var t;
  const e = (t = r.connectionState) != null ? t : r.iceConnectionState;
  switch (e) {
    case "checking":
      return "connecting";
    case "completed":
      return "connected";
    default:
      return e;
  }
};
var vn = {};
Object.defineProperty(vn, "__esModule", { value: !0 });
vn.TypedEmitter = nn.EventEmitter;
const { TypedEmitter: ui } = vn;
class qo extends ui {
  constructor(e, t) {
    super(), this.namespace = e, this.tm = t;
  }
  /**
   * send a command to the peer
   * @template {TMsg['tx']['cmd']['name']} K
   * @returns {Promise<Parameters<(TMsg['tx']['cmd'] & { namespace: N, name: K })['accept']>[0]>}
   */
  cmd(e, t) {
    return this.tm.cmd(e, t, this.namespace);
  }
  /**
   * send an event to the peer
   * @template {TMsg['tx']['event']['name']} K
   */
  event(e, t) {
    return this.tm.event(e, t, this.namespace);
  }
  close() {
    return this.tm.namespaces.delete(this.namespace);
  }
}
class ea extends ui {
  constructor(e) {
    super(), this.maxId = 0, this.namespaces = /** @type {Map<string, Namespace<string, TMsg>>} */
    /* @__PURE__ */ new Map(), this.transactions = /** @type {Map<number, Transaction>} */
    /* @__PURE__ */ new Map(), this.transport = /** @type {any} */
    e, this.listener = (t) => {
      let i;
      try {
        i = JSON.parse(t.utf8Data || t.data || t);
      } catch (m) {
        return;
      }
      switch (i.type) {
        case "cmd":
          const { transId: m } = i, f = {
            name: i.name,
            data: i.data,
            namespace: i.namespace,
            accept: (b) => {
              this._send({
                type: "response",
                transId: m,
                data: b
              });
            },
            reject: (b) => {
              this._send({
                type: "error",
                transId: m,
                data: b
              });
            }
          };
          if (f.namespace) {
            const b = this.namespaces.get(f.namespace);
            b ? b.emit("cmd", f) : this.emit("cmd", f);
          } else
            this.emit("cmd", f);
          break;
        case "response": {
          const b = this.transactions.get(i.transId);
          if (!b)
            return;
          this.transactions.delete(i.transId), b.resolve(i.data);
          break;
        }
        case "error": {
          const b = this.transactions.get(i.transId);
          if (!b)
            return;
          this.transactions.delete(i.transId), b.reject(i.data);
          break;
        }
        case "event":
          const n = {
            name: i.name,
            data: i.data,
            namespace: i.namespace
          };
          if (n.namespace) {
            var u = this.namespaces.get(n.namespace);
            u ? u.emit("event", n) : this.emit("event", n);
          } else
            this.emit("event", n);
          break;
      }
    }, this.transport.addListener ? this.transport.addListener("message", this.listener) : this.transport.addEventListener("message", this.listener);
  }
  /** @protected */
  _send(e) {
    this.transport.send(JSON.stringify(e));
  }
  /**
   * send a command to the peer
   * @template {string} N
   * @template {TMsg['tx']['cmd']['name']} K
   * @returns {Promise<Parameters<(TMsg['tx']['cmd'] & { namespace: N, name: K })['accept']>[0]>}
   */
  cmd(e, t, i = void 0) {
    return new Promise((u, m) => {
      if (!e || e.length === 0)
        throw new Error("Bad command name");
      const f = {
        type: "cmd",
        transId: this.maxId++,
        name: e,
        data: t
      };
      i && (f.namespace = i), this.transactions.set(f.transId, we(J({}, f), { resolve: u, reject: m }));
      try {
        this._send(f);
      } catch (n) {
        throw this.transactions.delete(f.transId), n;
      }
    });
  }
  /**
   * send an event to the peer
   * @template {string} N
   * @template {TMsg['tx']['event']['name']} K
   */
  event(e, t, i = void 0) {
    if (!e || e.length === 0)
      throw new Error("Bad event name");
    const u = {
      type: "event",
      name: e,
      data: t
    };
    i && (u.namespace = i), this._send(u);
  }
  /**
   * @template {string} N
   * @returns {Namespace<N, TMsg>}
   */
  namespace(e) {
    let t = (
      /** @type {Namespace<N, TMsg>} */
      this.namespaces.get(e)
    );
    return t || (t = new qo(e, this), this.namespaces.set(e, t), t);
  }
  close() {
    for (const e of this.namespaces.values())
      e.close();
    this.transport.removeListener ? this.transport.removeListener("message", this.listener) : this.transport.removeEventListener("message", this.listener);
  }
}
var ta = ea;
const ra = /* @__PURE__ */ wt(ta), ce = Fe.get("Signaling"), $e = {
  connectionSuccess: "wsConnectionSuccess",
  connectionError: "wsConnectionError",
  connectionClose: "wsConnectionClose",
  broadcastEvent: "broadcastEvent"
};
class di extends vr {
  constructor(e = {
    streamName: null,
    url: "ws://localhost:8080/"
  }) {
    super(), this.webSocket = null, this.transactionManager = null, this.serverId = null, this.clusterId = null, this.streamViewId = null, this.streamName = e.streamName, this.wsUrl = e.url;
  }
  /**
   * Starts a WebSocket connection with signaling server.
   * @example const response = await millicastSignaling.connect()
   * @returns {Promise<WebSocket>} Promise object which represents the [WebSocket object]{@link https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API} of the establshed connection.
   * @fires Signaling#wsConnectionSuccess
   * @fires Signaling#wsConnectionError
   * @fires Signaling#wsConnectionClose
   * @fires Signaling#broadcastEvent
   */
  async connect() {
    var e;
    return ce.info("Connecting to Signaling Server"), this.transactionManager && ((e = this.webSocket) == null ? void 0 : e.readyState) === WebSocket.OPEN ? (ce.info("Connected to server: ", this.webSocket.url), ce.debug("WebSocket value: ", {
      url: this.webSocket.url,
      protocol: this.webSocket.protocol,
      readyState: this.webSocket.readyState,
      binaryType: this.webSocket.binaryType,
      extensions: this.webSocket.extensions
    }), this.emit($e.connectionSuccess, { ws: this.webSocket, tm: this.transactionManager }), this.webSocket) : new Promise((t, i) => {
      this.webSocket = new WebSocket(this.wsUrl), this.transactionManager = new ra(this.webSocket), this.webSocket.onopen = () => {
        ce.info("WebSocket opened"), this.transactionManager && this.transactionManager.on("event", (u) => {
          this.emit($e.broadcastEvent, u);
        }), this.webSocket && (ce.info("Connected to server: ", this.webSocket.url), ce.debug("WebSocket value: ", {
          url: this.webSocket.url,
          protocol: this.webSocket.protocol,
          readyState: this.webSocket.readyState,
          binaryType: this.webSocket.binaryType,
          extensions: this.webSocket.extensions
        }), this.emit($e.connectionSuccess, { ws: this.webSocket, tm: this.transactionManager }), t(this.webSocket));
      }, this.webSocket.onerror = () => {
        this.webSocket && (ce.error("WebSocket not connected: ", this.webSocket.url), this.emit($e.connectionError, this.webSocket.url), i(this.webSocket.url));
      }, this.webSocket.onclose = () => {
        this.webSocket = null, this.transactionManager = null, ce.info("Connection closed with Signaling Server."), this.emit($e.connectionClose);
      };
    });
  }
  /**
   * Close WebSocket connection with Millicast server.
   * @example millicastSignaling.close()
   */
  close() {
    var e;
    ce.info("Closing connection with Signaling Server."), (e = this.webSocket) == null || e.close();
  }
  /**
   * Establish WebRTC connection with Millicast Server as Subscriber role.
   * @param {String} sdp - The SDP information created by your offer.
   * @param {SignalingSubscribeOptions} options - Signaling Subscribe Options.
   * @example const response = await millicastSignaling.subscribe(sdp)
   * @return {Promise<String>} Promise object which represents the SDP command response.
   */
  async subscribe(e = "", t = {}) {
    var u, m, f, n;
    ce.info("Starting subscription to streamName: ", this.streamName), ce.debug("Subcription local description: ", e), e = Se.adaptCodecName(e, "AV1X", ge.AV1);
    const i = {
      sdp: e
    };
    t.pinnedSourceId && (i.pinnedSourceId = t.pinnedSourceId), t.excludedSourceIds && (i.excludedSourceIds = t.excludedSourceIds), t.vad && (i.vad = !0), Array.isArray(t.events) && (i.events = t.events), t.forcePlayoutDelay && (i.forcePlayoutDelay = t.forcePlayoutDelay), t.layer && (i.layer = t.layer);
    try {
      if (t.disableVideo && t.disableAudio)
        throw new Error("Not attempting to connect as video and audio are disabled");
      if (await this.connect(), this.transactionManager) {
        ce.info("Sending view command");
        const b = await this.transactionManager.cmd("view", i), h = (n = (f = (m = (u = RTCRtpReceiver.getCapabilities) == null ? void 0 : u.call(RTCRtpReceiver, "video")) == null ? void 0 : m.codecs) == null ? void 0 : f.find) == null ? void 0 : n.call(
          f,
          (g) => g.mimeType === "video/AV1X"
        );
        return b.sdp = h ? Se.adaptCodecName(b.sdp, ge.AV1, "AV1X") : b.sdp, ce.info("Command sent, subscriberId: ", b.subscriberId), ce.debug("Command result: ", b), this.serverId = b.subscriberId, this.clusterId = b.clusterId, this.streamViewId = b.streamViewId, Ie.initStreamName(this.streamName || ""), Ie.initSubscriberId(this.serverId || ""), Ie.initStreamViewId(b.streamViewId), Ie.setClusterId(this.clusterId || ""), b.sdp;
      } else
        return "";
    } catch (b) {
      throw ce.error("Error sending view command, error: ", b), b;
    }
  }
  /**
   * Establish WebRTC connection with Millicast Server as Publisher role.
   * @param {String} sdp - The SDP information created by your offer.
   * @param {SignalingPublishOptions} options - Signaling Publish Options.
   * @example const response = await millicastSignaling.publish(sdp, {codec: 'h264'})
   * @return {Promise<String>} Promise object which represents the SDP command response.
   */
  async publish(e = "", t = { codec: ge.H264 }) {
    var f, n, b, h, g, o, c, l;
    ce.info("Starting publishing to streamName: ".concat(this.streamName, ", codec: ").concat(t.codec)), ce.debug("Publishing local description: ", e);
    const i = (h = (b = (n = (f = qe.getCapabilities) == null ? void 0 : f.call(qe, "video")) == null ? void 0 : n.codecs) == null ? void 0 : b.map((a) => a.codec)) != null ? h : [], u = Object.values(ge);
    if (u.indexOf(t.codec) === -1)
      throw ce.error("Invalid codec ".concat(t.codec, ". Possible values are: "), u), new Error("Invalid codec ".concat(t.codec, ". Possible values are: ").concat(u));
    if (i.length > 0 && i.indexOf(t.codec) === -1)
      throw ce.error("Unsupported codec ".concat(t.codec, ". Possible values are: "), i), new Error("Unsupported codec ".concat(t.codec, ". Possible values are: ").concat(i));
    t.codec === ge.AV1 && (e = Se.adaptCodecName(e, "AV1X", ge.AV1));
    const m = {
      sdp: e,
      codec: t.codec,
      sourceId: t.sourceId
    };
    if (t.priority)
      if (Number.isInteger(t.priority) && t.priority >= -2147483648 && t.priority <= 2147483647)
        m.priority = t.priority;
      else
        throw new Error(
          "Invalid value for priority option. It should be a decimal integer between the range [-2^31, +2^31 - 1]"
        );
    t.record !== null && (m.record = t.record), Array.isArray(t.events) && (m.events = t.events);
    try {
      if (t.disableVideo && t.disableAudio)
        throw new Error("Not attempting to connect as video and audio are disabled");
      if (await this.connect(), this.transactionManager) {
        ce.info("Sending publish command");
        const a = await this.transactionManager.cmd("publish", m);
        if (t.codec === ge.AV1) {
          const s = (l = (c = (o = (g = RTCRtpSender.getCapabilities) == null ? void 0 : g.call(RTCRtpSender, "video")) == null ? void 0 : o.codecs) == null ? void 0 : c.find) == null ? void 0 : l.call(
            c,
            (p) => p.mimeType === "video/AV1X"
          );
          a.sdp = s ? Se.adaptCodecName(a.sdp, ge.AV1, "AV1X") : a.sdp;
        }
        return ce.info("Command sent, publisherId: ", a.publisherId), ce.debug("Command result: ", a), this.serverId = a.publisherId, this.clusterId = a.clusterId, Ie.initStreamName(this.streamName || ""), Ie.initSubscriberId(this.serverId || ""), Ie.initFeedId(a.feedId), Ie.setClusterId(this.clusterId || ""), a.sdp;
      } else
        return "";
    } catch (a) {
      throw ce.error("Error sending publish command, error: ", a), a;
    }
  }
  /**
   * Send command to the server.
   * @param {String} cmd - Command name.
   * @param {Object} [data] - Command parameters.
   * @return {Promise<Object>} Promise object which represents the command response.
   */
  async cmd(e, t) {
    var i;
    return ce.info("Sending cmd: ".concat(e)), (i = this.transactionManager) == null ? void 0 : i.cmd(e, t);
  }
}
class pr extends Error {
  constructor(e, t) {
    super(e), this.name = "FetchError", this.status = t;
  }
}
const ut = Fe.get("Director");
let es = "";
const na = "https://director.millicast.com";
let ts = na;
const We = {
  /**
   * @function
   * @name setEndpoint
   * @description Set Director API endpoint where requests will be sent.
   * @param {String} url - New Director API endpoint
   * @returns {void}
   */
  setEndpoint: (r) => {
    ts = r.replace(/\/$/, "");
  },
  /**
   * @function
   * @name getEndpoint
   * @description Get current Director API endpoint where requests will be sent. Default endpoint is 'https://director.millicast.com'.
   * @returns {String} API base url
   */
  getEndpoint: () => ts,
  /**
   * @function
   * @name setLiveDomain
   * @description Set Websocket Live domain from Director API response.
   * If it is set to empty, it will not parse the response.
   * @param {String} domain - New Websocket Live domain
   * @returns {void}
   */
  setLiveDomain: (r) => {
    es = r.replace(/\/$/, "");
  },
  /**
   * @function
   * @name getLiveDomain
   * @description Get current Websocket Live domain.
   * By default is empty which corresponds to not parse the Director response.
   * @returns {String} Websocket Live domain
   */
  getLiveDomain: () => es,
  /**
   * @function
   * @name getPublisher
   * @description Get publisher connection data.
   * @param {DirectorPublisherOptions} options - Millicast options.
   * @returns {Promise<MillicastDirectorResponse>} Promise object which represents the result of getting the publishing connection path.
   * @example const response = await Director.getPublisher(options)
   * @example
   * import { Publish, Director } from '@millicast/sdk'
   *
   * //Define getPublisher as callback for Publish
   * const streamName = "My Millicast Stream Name"
   * const token = "My Millicast publishing token"
   * const options: DirectorPublisherOptions = { token, streamName }
   * const tokenGenerator = () => Director.getPublisher(options)
   *
   * //Create a new instance
   * const millicastPublish = new Publish(tokenGenerator)
   *
   * //Get MediaStream
   * const mediaStream = getYourMediaStreamImplementation()
   *
   * //Options
   * const broadcastOptions = {
   *    mediaStream: mediaStream
   *  }
   *
   * //Start broadcast
   * await millicastPublish.connect(broadcastOptions)
   */
  getPublisher: async (r) => {
    r.streamType = r.streamType || "WebRtc", ut.info("Getting publisher connection path for stream name: ", r.streamName);
    const e = {
      streamName: r.streamName,
      streamType: r.streamType
    }, t = { "Content-Type": "application/json", Authorization: "Bearer ".concat(r.token) }, i = "".concat(We.getEndpoint(), "/api/director/publish");
    try {
      const u = await fetch(i, { method: "POST", headers: t, body: JSON.stringify(e) });
      let m = await u.json();
      if (m.status === "fail")
        throw new pr(m.data.message, u.status);
      return m = rs(m), ut.debug("Getting publisher response: ", m), Ie.initAccountId(m.data.streamAccountId), m.data;
    } catch (u) {
      throw ut.error("Error while getting publisher connection path. ", u), u;
    }
  },
  /**
   * @function
   * @name getSubscriber
   * @description Get subscriber connection data.
   * @param {DirectorSubscriberOptions} options - Millicast options.
   * @returns {Promise<MillicastDirectorResponse>} Promise object which represents the result of getting the subscribe connection data.
   * @example const response = await Director.getSubscriber(options)
   * @example
   * import { View, Director } from '@millicast/sdk'
   *
   * //Define getSubscriber as callback for Subscribe
   * const streamName = "My Millicast Stream Name"
   * const accountId = "Millicast Publisher account Id"
   * const options: DirectorSubscriberOptions = { streamName, streamAccountId }
   * const tokenGenerator = () => Director.getSubscriber(options)
   * //... or for an secure stream
   * const options: DirectorSubscriberOptions = { {streamName, accountId, subscriberToken: '176949b9e57de248d37edcff1689a84a047370ddc3f0dd960939ad1021e0b744'} }
   * const tokenGenerator = () => Director.getSubscriber(options)
   *
   * //Create a new instance
   * const millicastView = new View(tokenGenerator)
   *
   * //Set track event handler to receive streams from Publisher.
   * millicastView.on('track', (event) => {
   *   addStreamToYourVideoTag(event.streams[0])
   * })
   *
   * //View Options
   * const options = {
   *  }
   *
   * //Start connection to broadcast
   * await millicastView.connect(options)
   */
  getSubscriber: async (r) => {
    Ie.initAccountId(r.streamAccountId), ut.info(
      "Getting subscriber connection data for stream name: ".concat(r.streamName, " and account id: ").concat(r.streamAccountId)
    );
    const e = {
      streamAccountId: r.streamAccountId,
      streamName: r.streamName
    }, t = r.subscriberToken;
    let i = { "Content-Type": "application/json" };
    t && (i = we(J({}, i), { Authorization: "Bearer ".concat(t) }));
    const u = "".concat(We.getEndpoint(), "/api/director/subscribe");
    try {
      const m = await fetch(u, { method: "POST", headers: i, body: JSON.stringify(e) });
      let f = await m.json();
      if (f.status === "fail")
        throw new pr(f.data.message, m.status);
      return f = rs(f), ut.debug("Getting subscriber response: ", f), r.subscriberToken && (f.data.subscriberToken = r.subscriberToken), f.data;
    } catch (m) {
      throw ut.error("Error while getting subscriber connection path. ", m), m;
    }
  }
}, rs = (r) => {
  if (We.getLiveDomain()) {
    const e = /\/\/(.*?)\//, t = r.data.urls.map((i) => {
      const u = e.exec(i);
      return i.replace(u[1], We.getLiveDomain());
    });
    r.data.urls = t;
  }
  if (r.data.drmObject) {
    const e = r.data.drmObject.playReadyUrl;
    e && (r.data.drmObject.playReadyUrl = "".concat(We.getEndpoint()).concat(e));
    const t = r.data.drmObject.widevineUrl;
    t && (r.data.drmObject.widevineUrl = "".concat(We.getEndpoint()).concat(t));
    const i = r.data.drmObject.fairPlayUrl;
    i && (r.data.drmObject.fairPlayUrl = "".concat(We.getEndpoint()).concat(i));
    const u = r.data.drmObject.fairPlayCertUrl;
    u && (r.data.drmObject.fairPlayCertUrl = "".concat(We.getEndpoint()).concat(u));
  }
  return r;
};
function Yr(r) {
  this.message = r;
}
Yr.prototype = new Error(), Yr.prototype.name = "InvalidCharacterError";
var ns = typeof window < "u" && window.atob && window.atob.bind(window) || function(r) {
  var e = String(r).replace(/=+$/, "");
  if (e.length % 4 == 1) throw new Yr("'atob' failed: The string to be decoded is not correctly encoded.");
  for (var t, i, u = 0, m = 0, f = ""; i = e.charAt(m++); ~i && (t = u % 4 ? 64 * t + i : i, u++ % 4) ? f += String.fromCharCode(255 & t >> (-2 * u & 6)) : 0) i = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(i);
  return f;
};
function sa(r) {
  var e = r.replace(/-/g, "+").replace(/_/g, "/");
  switch (e.length % 4) {
    case 0:
      break;
    case 2:
      e += "==";
      break;
    case 3:
      e += "=";
      break;
    default:
      throw "Illegal base64url string!";
  }
  try {
    return function(t) {
      return decodeURIComponent(ns(t).replace(/(.)/g, function(i, u) {
        var m = u.charCodeAt(0).toString(16).toUpperCase();
        return m.length < 2 && (m = "0" + m), "%" + m;
      }));
    }(e);
  } catch (t) {
    return ns(e);
  }
}
function gr(r) {
  this.message = r;
}
function fi(r, e) {
  if (typeof r != "string") throw new gr("Invalid token specified");
  var t = (e = e || {}).header === !0 ? 0 : 1;
  try {
    return JSON.parse(sa(r.split(".")[t]));
  } catch (i) {
    throw new gr("Invalid token specified: " + i.message);
  }
}
gr.prototype = new Error(), gr.prototype.name = "InvalidTokenError";
const ia = typeof Buffer == "function";
typeof TextDecoder == "function" && new TextDecoder();
typeof TextEncoder == "function" && new TextEncoder();
const oa = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", aa = Array.prototype.slice.call(oa), nr = ((r) => {
  let e = {};
  return r.forEach((t, i) => e[t] = i), e;
})(aa), ca = /^(?:[A-Za-z\d+\/]{4})*?(?:[A-Za-z\d+\/]{2}(?:==)?|[A-Za-z\d+\/]{3}=?)?$/, Dr = String.fromCharCode.bind(String);
typeof Uint8Array.from == "function" && Uint8Array.from.bind(Uint8Array);
const la = (r) => r.replace(/[^A-Za-z0-9\+\/]/g, ""), ua = (r) => {
  if (r = r.replace(/\s+/g, ""), !ca.test(r))
    throw new TypeError("malformed base64.");
  r += "==".slice(2 - (r.length & 3));
  let e, t = "", i, u;
  for (let m = 0; m < r.length; )
    e = nr[r.charAt(m++)] << 18 | nr[r.charAt(m++)] << 12 | (i = nr[r.charAt(m++)]) << 6 | (u = nr[r.charAt(m++)]), t += i === 64 ? Dr(e >> 16 & 255) : u === 64 ? Dr(e >> 16 & 255, e >> 8 & 255) : Dr(e >> 16 & 255, e >> 8 & 255, e & 255);
  return t;
}, da = typeof atob == "function" ? (r) => atob(la(r)) : ia ? (r) => Buffer.from(r, "base64").toString("binary") : ua;
var hi = { exports: {} };
(function(r, e) {
  (function(t, i) {
    r.exports = i();
  })(self, () => {
    return t = { 7629: (u, m, f) => {
      const n = f(375), b = f(8571), h = f(9474), g = f(1687), o = f(8652), c = f(8160), l = f(3292), a = f(6354), s = f(8901), p = f(9708), d = f(6914), y = f(2294), v = f(6133), S = f(1152), I = f(8863), E = f(2036), T = { Base: class {
        constructor(x) {
          this.type = x, this.$_root = null, this._definition = {}, this._reset();
        }
        _reset() {
          this._ids = new y.Ids(), this._preferences = null, this._refs = new v.Manager(), this._cache = null, this._valids = null, this._invalids = null, this._flags = {}, this._rules = [], this._singleRules = /* @__PURE__ */ new Map(), this.$_terms = {}, this.$_temp = { ruleset: null, whens: {} };
        }
        describe() {
          return n(typeof p.describe == "function", "Manifest functionality disabled"), p.describe(this);
        }
        allow(...x) {
          return c.verifyFlat(x, "allow"), this._values(x, "_valids");
        }
        alter(x) {
          n(x && typeof x == "object" && !Array.isArray(x), "Invalid targets argument"), n(!this._inRuleset(), "Cannot set alterations inside a ruleset");
          const k = this.clone();
          k.$_terms.alterations = k.$_terms.alterations || [];
          for (const _ in x) {
            const L = x[_];
            n(typeof L == "function", "Alteration adjuster for", _, "must be a function"), k.$_terms.alterations.push({ target: _, adjuster: L });
          }
          return k.$_temp.ruleset = !1, k;
        }
        artifact(x) {
          return n(x !== void 0, "Artifact cannot be undefined"), n(!this._cache, "Cannot set an artifact with a rule cache"), this.$_setFlag("artifact", x);
        }
        cast(x) {
          return n(x === !1 || typeof x == "string", "Invalid to value"), n(x === !1 || this._definition.cast[x], "Type", this.type, "does not support casting to", x), this.$_setFlag("cast", x === !1 ? void 0 : x);
        }
        default(x, k) {
          return this._default("default", x, k);
        }
        description(x) {
          return n(x && typeof x == "string", "Description must be a non-empty string"), this.$_setFlag("description", x);
        }
        empty(x) {
          const k = this.clone();
          return x !== void 0 && (x = k.$_compile(x, { override: !1 })), k.$_setFlag("empty", x, { clone: !1 });
        }
        error(x) {
          return n(x, "Missing error"), n(x instanceof Error || typeof x == "function", "Must provide a valid Error object or a function"), this.$_setFlag("error", x);
        }
        example(x, k = {}) {
          return n(x !== void 0, "Missing example"), c.assertOptions(k, ["override"]), this._inner("examples", x, { single: !0, override: k.override });
        }
        external(x, k) {
          return typeof x == "object" && (n(!k, "Cannot combine options with description"), k = x.description, x = x.method), n(typeof x == "function", "Method must be a function"), n(k === void 0 || k && typeof k == "string", "Description must be a non-empty string"), this._inner("externals", { method: x, description: k }, { single: !0 });
        }
        failover(x, k) {
          return this._default("failover", x, k);
        }
        forbidden() {
          return this.presence("forbidden");
        }
        id(x) {
          return x ? (n(typeof x == "string", "id must be a non-empty string"), n(/^[^\.]+$/.test(x), "id cannot contain period character"), this.$_setFlag("id", x)) : this.$_setFlag("id", void 0);
        }
        invalid(...x) {
          return this._values(x, "_invalids");
        }
        label(x) {
          return n(x && typeof x == "string", "Label name must be a non-empty string"), this.$_setFlag("label", x);
        }
        meta(x) {
          return n(x !== void 0, "Meta cannot be undefined"), this._inner("metas", x, { single: !0 });
        }
        note(...x) {
          n(x.length, "Missing notes");
          for (const k of x) n(k && typeof k == "string", "Notes must be non-empty strings");
          return this._inner("notes", x);
        }
        only(x = !0) {
          return n(typeof x == "boolean", "Invalid mode:", x), this.$_setFlag("only", x);
        }
        optional() {
          return this.presence("optional");
        }
        prefs(x) {
          n(x, "Missing preferences"), n(x.context === void 0, "Cannot override context"), n(x.externals === void 0, "Cannot override externals"), n(x.warnings === void 0, "Cannot override warnings"), n(x.debug === void 0, "Cannot override debug"), c.checkPreferences(x);
          const k = this.clone();
          return k._preferences = c.preferences(k._preferences, x), k;
        }
        presence(x) {
          return n(["optional", "required", "forbidden"].includes(x), "Unknown presence mode", x), this.$_setFlag("presence", x);
        }
        raw(x = !0) {
          return this.$_setFlag("result", x ? "raw" : void 0);
        }
        result(x) {
          return n(["raw", "strip"].includes(x), "Unknown result mode", x), this.$_setFlag("result", x);
        }
        required() {
          return this.presence("required");
        }
        strict(x) {
          const k = this.clone(), _ = x !== void 0 && !x;
          return k._preferences = c.preferences(k._preferences, { convert: _ }), k;
        }
        strip(x = !0) {
          return this.$_setFlag("result", x ? "strip" : void 0);
        }
        tag(...x) {
          n(x.length, "Missing tags");
          for (const k of x) n(k && typeof k == "string", "Tags must be non-empty strings");
          return this._inner("tags", x);
        }
        unit(x) {
          return n(x && typeof x == "string", "Unit name must be a non-empty string"), this.$_setFlag("unit", x);
        }
        valid(...x) {
          c.verifyFlat(x, "valid");
          const k = this.allow(...x);
          return k.$_setFlag("only", !!k._valids, { clone: !1 }), k;
        }
        when(x, k) {
          const _ = this.clone();
          _.$_terms.whens || (_.$_terms.whens = []);
          const L = l.when(_, x, k);
          if (!["any", "link"].includes(_.type)) {
            const N = L.is ? [L] : L.switch;
            for (const O of N) n(!O.then || O.then.type === "any" || O.then.type === _.type, "Cannot combine", _.type, "with", O.then && O.then.type), n(!O.otherwise || O.otherwise.type === "any" || O.otherwise.type === _.type, "Cannot combine", _.type, "with", O.otherwise && O.otherwise.type);
          }
          return _.$_terms.whens.push(L), _.$_mutateRebuild();
        }
        cache(x) {
          n(!this._inRuleset(), "Cannot set caching inside a ruleset"), n(!this._cache, "Cannot override schema cache"), n(this._flags.artifact === void 0, "Cannot cache a rule with an artifact");
          const k = this.clone();
          return k._cache = x || o.provider.provision(), k.$_temp.ruleset = !1, k;
        }
        clone() {
          const x = Object.create(Object.getPrototypeOf(this));
          return this._assign(x);
        }
        concat(x) {
          n(c.isSchema(x), "Invalid schema object"), n(this.type === "any" || x.type === "any" || x.type === this.type, "Cannot merge type", this.type, "with another type:", x.type), n(!this._inRuleset(), "Cannot concatenate onto a schema with open ruleset"), n(!x._inRuleset(), "Cannot concatenate a schema with open ruleset");
          let k = this.clone();
          if (this.type === "any" && x.type !== "any") {
            const _ = x.clone();
            for (const L of Object.keys(k)) L !== "type" && (_[L] = k[L]);
            k = _;
          }
          k._ids.concat(x._ids), k._refs.register(x, v.toSibling), k._preferences = k._preferences ? c.preferences(k._preferences, x._preferences) : x._preferences, k._valids = E.merge(k._valids, x._valids, x._invalids), k._invalids = E.merge(k._invalids, x._invalids, x._valids);
          for (const _ of x._singleRules.keys()) k._singleRules.has(_) && (k._rules = k._rules.filter((L) => L.keep || L.name !== _), k._singleRules.delete(_));
          for (const _ of x._rules) x._definition.rules[_.method].multi || k._singleRules.set(_.name, _), k._rules.push(_);
          if (k._flags.empty && x._flags.empty) {
            k._flags.empty = k._flags.empty.concat(x._flags.empty);
            const _ = Object.assign({}, x._flags);
            delete _.empty, g(k._flags, _);
          } else if (x._flags.empty) {
            k._flags.empty = x._flags.empty;
            const _ = Object.assign({}, x._flags);
            delete _.empty, g(k._flags, _);
          } else g(k._flags, x._flags);
          for (const _ in x.$_terms) {
            const L = x.$_terms[_];
            L ? k.$_terms[_] ? k.$_terms[_] = k.$_terms[_].concat(L) : k.$_terms[_] = L.slice() : k.$_terms[_] || (k.$_terms[_] = L);
          }
          return this.$_root._tracer && this.$_root._tracer._combine(k, [this, x]), k.$_mutateRebuild();
        }
        extend(x) {
          return n(!x.base, "Cannot extend type with another base"), s.type(this, x);
        }
        extract(x) {
          return x = Array.isArray(x) ? x : x.split("."), this._ids.reach(x);
        }
        fork(x, k) {
          n(!this._inRuleset(), "Cannot fork inside a ruleset");
          let _ = this;
          for (let L of [].concat(x)) L = Array.isArray(L) ? L : L.split("."), _ = _._ids.fork(L, k, _);
          return _.$_temp.ruleset = !1, _;
        }
        rule(x) {
          const k = this._definition;
          c.assertOptions(x, Object.keys(k.modifiers)), n(this.$_temp.ruleset !== !1, "Cannot apply rules to empty ruleset or the last rule added does not support rule properties");
          const _ = this.$_temp.ruleset === null ? this._rules.length - 1 : this.$_temp.ruleset;
          n(_ >= 0 && _ < this._rules.length, "Cannot apply rules to empty ruleset");
          const L = this.clone();
          for (let N = _; N < L._rules.length; ++N) {
            const O = L._rules[N], j = b(O);
            for (const G in x) k.modifiers[G](j, x[G]), n(j.name === O.name, "Cannot change rule name");
            L._rules[N] = j, L._singleRules.get(j.name) === O && L._singleRules.set(j.name, j);
          }
          return L.$_temp.ruleset = !1, L.$_mutateRebuild();
        }
        get ruleset() {
          n(!this._inRuleset(), "Cannot start a new ruleset without closing the previous one");
          const x = this.clone();
          return x.$_temp.ruleset = x._rules.length, x;
        }
        get $() {
          return this.ruleset;
        }
        tailor(x) {
          x = [].concat(x), n(!this._inRuleset(), "Cannot tailor inside a ruleset");
          let k = this;
          if (this.$_terms.alterations) for (const { target: _, adjuster: L } of this.$_terms.alterations) x.includes(_) && (k = L(k), n(c.isSchema(k), "Alteration adjuster for", _, "failed to return a schema object"));
          return k = k.$_modify({ each: (_) => _.tailor(x), ref: !1 }), k.$_temp.ruleset = !1, k.$_mutateRebuild();
        }
        tracer() {
          return S.location ? S.location(this) : this;
        }
        validate(x, k) {
          return I.entry(x, this, k);
        }
        validateAsync(x, k) {
          return I.entryAsync(x, this, k);
        }
        $_addRule(x) {
          typeof x == "string" && (x = { name: x }), n(x && typeof x == "object", "Invalid options"), n(x.name && typeof x.name == "string", "Invalid rule name");
          for (const O in x) n(O[0] !== "_", "Cannot set private rule properties");
          const k = Object.assign({}, x);
          k._resolve = [], k.method = k.method || k.name;
          const _ = this._definition.rules[k.method], L = k.args;
          n(_, "Unknown rule", k.method);
          const N = this.clone();
          if (L) {
            n(Object.keys(L).length === 1 || Object.keys(L).length === this._definition.rules[k.name].args.length, "Invalid rule definition for", this.type, k.name);
            for (const O in L) {
              let j = L[O];
              if (_.argsByName) {
                const G = _.argsByName.get(O);
                if (G.ref && c.isResolvable(j)) k._resolve.push(O), N.$_mutateRegister(j);
                else if (G.normalize && (j = G.normalize(j), L[O] = j), G.assert) {
                  const W = c.validateArg(j, O, G);
                  n(!W, W, "or reference");
                }
              }
              j !== void 0 ? L[O] = j : delete L[O];
            }
          }
          return _.multi || (N._ruleRemove(k.name, { clone: !1 }), N._singleRules.set(k.name, k)), N.$_temp.ruleset === !1 && (N.$_temp.ruleset = null), _.priority ? N._rules.unshift(k) : N._rules.push(k), N;
        }
        $_compile(x, k) {
          return l.schema(this.$_root, x, k);
        }
        $_createError(x, k, _, L, N, O = {}) {
          const j = O.flags !== !1 ? this._flags : {}, G = O.messages ? d.merge(this._definition.messages, O.messages) : this._definition.messages;
          return new a.Report(x, k, _, j, G, L, N);
        }
        $_getFlag(x) {
          return this._flags[x];
        }
        $_getRule(x) {
          return this._singleRules.get(x);
        }
        $_mapLabels(x) {
          return x = Array.isArray(x) ? x : x.split("."), this._ids.labels(x);
        }
        $_match(x, k, _, L) {
          (_ = Object.assign({}, _)).abortEarly = !0, _._externals = !1, k.snapshot();
          const N = !I.validate(x, this, k, _, L).errors;
          return k.restore(), N;
        }
        $_modify(x) {
          return c.assertOptions(x, ["each", "once", "ref", "schema"]), y.schema(this, x) || this;
        }
        $_mutateRebuild() {
          return n(!this._inRuleset(), "Cannot add this rule inside a ruleset"), this._refs.reset(), this._ids.reset(), this.$_modify({ each: (x, { source: k, name: _, path: L, key: N }) => {
            const O = this._definition[k][_] && this._definition[k][_].register;
            O !== !1 && this.$_mutateRegister(x, { family: O, key: N });
          } }), this._definition.rebuild && this._definition.rebuild(this), this.$_temp.ruleset = !1, this;
        }
        $_mutateRegister(x, { family: k, key: _ } = {}) {
          this._refs.register(x, k), this._ids.register(x, { key: _ });
        }
        $_property(x) {
          return this._definition.properties[x];
        }
        $_reach(x) {
          return this._ids.reach(x);
        }
        $_rootReferences() {
          return this._refs.roots();
        }
        $_setFlag(x, k, _ = {}) {
          n(x[0] === "_" || !this._inRuleset(), "Cannot set flag inside a ruleset");
          const L = this._definition.flags[x] || {};
          if (h(k, L.default) && (k = void 0), h(k, this._flags[x])) return this;
          const N = _.clone !== !1 ? this.clone() : this;
          return k !== void 0 ? (N._flags[x] = k, N.$_mutateRegister(k)) : delete N._flags[x], x[0] !== "_" && (N.$_temp.ruleset = !1), N;
        }
        $_parent(x, ...k) {
          return this[x][c.symbols.parent].call(this, ...k);
        }
        $_validate(x, k, _) {
          return I.validate(x, this, k, _);
        }
        _assign(x) {
          x.type = this.type, x.$_root = this.$_root, x.$_temp = Object.assign({}, this.$_temp), x.$_temp.whens = {}, x._ids = this._ids.clone(), x._preferences = this._preferences, x._valids = this._valids && this._valids.clone(), x._invalids = this._invalids && this._invalids.clone(), x._rules = this._rules.slice(), x._singleRules = b(this._singleRules, { shallow: !0 }), x._refs = this._refs.clone(), x._flags = Object.assign({}, this._flags), x._cache = null, x.$_terms = {};
          for (const k in this.$_terms) x.$_terms[k] = this.$_terms[k] ? this.$_terms[k].slice() : null;
          x.$_super = {};
          for (const k in this.$_super) x.$_super[k] = this._super[k].bind(x);
          return x;
        }
        _bare() {
          const x = this.clone();
          x._reset();
          const k = x._definition.terms;
          for (const _ in k) {
            const L = k[_];
            x.$_terms[_] = L.init;
          }
          return x.$_mutateRebuild();
        }
        _default(x, k, _ = {}) {
          return c.assertOptions(_, "literal"), n(k !== void 0, "Missing", x, "value"), n(typeof k == "function" || !_.literal, "Only function value supports literal option"), typeof k == "function" && _.literal && (k = { [c.symbols.literal]: !0, literal: k }), this.$_setFlag(x, k);
        }
        _generate(x, k, _) {
          if (!this.$_terms.whens) return { schema: this };
          const L = [], N = [];
          for (let G = 0; G < this.$_terms.whens.length; ++G) {
            const W = this.$_terms.whens[G];
            if (W.concat) {
              L.push(W.concat), N.push("".concat(G, ".concat"));
              continue;
            }
            const F = W.ref ? W.ref.resolve(x, k, _) : x, V = W.is ? [W] : W.switch, X = N.length;
            for (let B = 0; B < V.length; ++B) {
              const { is: $, then: z, otherwise: q } = V[B], ee = "".concat(G).concat(W.switch ? "." + B : "");
              if ($.$_match(F, k.nest($, "".concat(ee, ".is")), _)) {
                if (z) {
                  const te = k.localize([...k.path, "".concat(ee, ".then")], k.ancestors, k.schemas), { schema: le, id: ye } = z._generate(x, te, _);
                  L.push(le), N.push("".concat(ee, ".then").concat(ye ? "(".concat(ye, ")") : ""));
                  break;
                }
              } else if (q) {
                const te = k.localize([...k.path, "".concat(ee, ".otherwise")], k.ancestors, k.schemas), { schema: le, id: ye } = q._generate(x, te, _);
                L.push(le), N.push("".concat(ee, ".otherwise").concat(ye ? "(".concat(ye, ")") : ""));
                break;
              }
            }
            if (W.break && N.length > X) break;
          }
          const O = N.join(", ");
          if (k.mainstay.tracer.debug(k, "rule", "when", O), !O) return { schema: this };
          if (!k.mainstay.tracer.active && this.$_temp.whens[O]) return { schema: this.$_temp.whens[O], id: O };
          let j = this;
          this._definition.generate && (j = this._definition.generate(this, x, k, _));
          for (const G of L) j = j.concat(G);
          return this.$_root._tracer && this.$_root._tracer._combine(j, [this, ...L]), this.$_temp.whens[O] = j, { schema: j, id: O };
        }
        _inner(x, k, _ = {}) {
          n(!this._inRuleset(), "Cannot set ".concat(x, " inside a ruleset"));
          const L = this.clone();
          return L.$_terms[x] && !_.override || (L.$_terms[x] = []), _.single ? L.$_terms[x].push(k) : L.$_terms[x].push(...k), L.$_temp.ruleset = !1, L;
        }
        _inRuleset() {
          return this.$_temp.ruleset !== null && this.$_temp.ruleset !== !1;
        }
        _ruleRemove(x, k = {}) {
          if (!this._singleRules.has(x)) return this;
          const _ = k.clone !== !1 ? this.clone() : this;
          _._singleRules.delete(x);
          const L = [];
          for (let N = 0; N < _._rules.length; ++N) {
            const O = _._rules[N];
            O.name !== x || O.keep ? L.push(O) : _._inRuleset() && N < _.$_temp.ruleset && --_.$_temp.ruleset;
          }
          return _._rules = L, _;
        }
        _values(x, k) {
          c.verifyFlat(x, k.slice(1, -1));
          const _ = this.clone(), L = x[0] === c.symbols.override;
          if (L && (x = x.slice(1)), !_[k] && x.length ? _[k] = new E() : L && (_[k] = x.length ? new E() : null, _.$_mutateRebuild()), !_[k]) return _;
          L && _[k].override();
          for (const N of x) {
            n(N !== void 0, "Cannot call allow/valid/invalid with undefined"), n(N !== c.symbols.override, "Override must be the first value");
            const O = k === "_invalids" ? "_valids" : "_invalids";
            _[O] && (_[O].remove(N), _[O].length || (n(k === "_valids" || !_._flags.only, "Setting invalid value", N, "leaves schema rejecting all values due to previous valid rule"), _[O] = null)), _[k].add(N, _._refs);
          }
          return _;
        }
      } };
      T.Base.prototype[c.symbols.any] = { version: c.version, compile: l.compile, root: "$_root" }, T.Base.prototype.isImmutable = !0, T.Base.prototype.deny = T.Base.prototype.invalid, T.Base.prototype.disallow = T.Base.prototype.invalid, T.Base.prototype.equal = T.Base.prototype.valid, T.Base.prototype.exist = T.Base.prototype.required, T.Base.prototype.not = T.Base.prototype.invalid, T.Base.prototype.options = T.Base.prototype.prefs, T.Base.prototype.preferences = T.Base.prototype.prefs, u.exports = new T.Base();
    }, 8652: (u, m, f) => {
      const n = f(375), b = f(8571), h = f(8160), g = { max: 1e3, supported: /* @__PURE__ */ new Set(["undefined", "boolean", "number", "string"]) };
      m.provider = { provision: (o) => new g.Cache(o) }, g.Cache = class {
        constructor(o = {}) {
          h.assertOptions(o, ["max"]), n(o.max === void 0 || o.max && o.max > 0 && isFinite(o.max), "Invalid max cache size"), this._max = o.max || g.max, this._map = /* @__PURE__ */ new Map(), this._list = new g.List();
        }
        get length() {
          return this._map.size;
        }
        set(o, c) {
          if (o !== null && !g.supported.has(typeof o)) return;
          let l = this._map.get(o);
          if (l) return l.value = c, void this._list.first(l);
          l = this._list.unshift({ key: o, value: c }), this._map.set(o, l), this._compact();
        }
        get(o) {
          const c = this._map.get(o);
          if (c) return this._list.first(c), b(c.value);
        }
        _compact() {
          if (this._map.size > this._max) {
            const o = this._list.pop();
            this._map.delete(o.key);
          }
        }
      }, g.List = class {
        constructor() {
          this.tail = null, this.head = null;
        }
        unshift(o) {
          return o.next = null, o.prev = this.head, this.head && (this.head.next = o), this.head = o, this.tail || (this.tail = o), o;
        }
        first(o) {
          o !== this.head && (this._remove(o), this.unshift(o));
        }
        pop() {
          return this._remove(this.tail);
        }
        _remove(o) {
          const { next: c, prev: l } = o;
          return c.prev = l, l && (l.next = c), o === this.tail && (this.tail = c), o.prev = null, o.next = null, o;
        }
      };
    }, 8160: (u, m, f) => {
      const n = f(375), b = f(7916), h = f(5934);
      let g, o;
      const c = { isoDate: /^(?:[-+]\d{2})?(?:\d{4}(?!\d{2}\b))(?:(-?)(?:(?:0[1-9]|1[0-2])(?:\1(?:[12]\d|0[1-9]|3[01]))?|W(?:[0-4]\d|5[0-2])(?:-?[1-7])?|(?:00[1-9]|0[1-9]\d|[12]\d{2}|3(?:[0-5]\d|6[1-6])))(?![T]$|[T][\d]+Z$)(?:[T\s](?:(?:(?:[01]\d|2[0-3])(?:(:?)[0-5]\d)?|24\:?00)(?:[.,]\d+(?!:))?)(?:\2[0-5]\d(?:[.,]\d+)?)?(?:[Z]|(?:[+-])(?:[01]\d|2[0-3])(?::?[0-5]\d)?)?)?)?$/ };
      m.version = h.version, m.defaults = { abortEarly: !0, allowUnknown: !1, artifacts: !1, cache: !0, context: null, convert: !0, dateFormat: "iso", errors: { escapeHtml: !1, label: "path", language: null, render: !0, stack: !1, wrap: { label: '"', array: "[]" } }, externals: !0, messages: {}, nonEnumerables: !1, noDefaults: !1, presence: "optional", skipFunctions: !1, stripUnknown: !1, warnings: !1 }, m.symbols = { any: Symbol.for("@hapi/joi/schema"), arraySingle: Symbol("arraySingle"), deepDefault: Symbol("deepDefault"), errors: Symbol("errors"), literal: Symbol("literal"), override: Symbol("override"), parent: Symbol("parent"), prefs: Symbol("prefs"), ref: Symbol("ref"), template: Symbol("template"), values: Symbol("values") }, m.assertOptions = function(l, a, s = "Options") {
        n(l && typeof l == "object" && !Array.isArray(l), "Options must be of type object");
        const p = Object.keys(l).filter((d) => !a.includes(d));
        n(p.length === 0, "".concat(s, " contain unknown keys: ").concat(p));
      }, m.checkPreferences = function(l) {
        o = o || f(3378);
        const a = o.preferences.validate(l);
        if (a.error) throw new b([a.error.details[0].message]);
      }, m.compare = function(l, a, s) {
        switch (s) {
          case "=":
            return l === a;
          case ">":
            return l > a;
          case "<":
            return l < a;
          case ">=":
            return l >= a;
          case "<=":
            return l <= a;
        }
      }, m.default = function(l, a) {
        return l === void 0 ? a : l;
      }, m.isIsoDate = function(l) {
        return c.isoDate.test(l);
      }, m.isNumber = function(l) {
        return typeof l == "number" && !isNaN(l);
      }, m.isResolvable = function(l) {
        return !!l && (l[m.symbols.ref] || l[m.symbols.template]);
      }, m.isSchema = function(l, a = {}) {
        const s = l && l[m.symbols.any];
        return !!s && (n(a.legacy || s.version === m.version, "Cannot mix different versions of joi schemas"), !0);
      }, m.isValues = function(l) {
        return l[m.symbols.values];
      }, m.limit = function(l) {
        return Number.isSafeInteger(l) && l >= 0;
      }, m.preferences = function(l, a) {
        g = g || f(6914), l = l || {}, a = a || {};
        const s = Object.assign({}, l, a);
        return a.errors && l.errors && (s.errors = Object.assign({}, l.errors, a.errors), s.errors.wrap = Object.assign({}, l.errors.wrap, a.errors.wrap)), a.messages && (s.messages = g.compile(a.messages, l.messages)), delete s[m.symbols.prefs], s;
      }, m.tryWithPath = function(l, a, s = {}) {
        try {
          return l();
        } catch (p) {
          throw p.path !== void 0 ? p.path = a + "." + p.path : p.path = a, s.append && (p.message = "".concat(p.message, " (").concat(p.path, ")")), p;
        }
      }, m.validateArg = function(l, a, { assert: s, message: p }) {
        if (m.isSchema(s)) {
          const d = s.validate(l);
          return d.error ? d.error.message : void 0;
        }
        if (!s(l)) return a ? "".concat(a, " ").concat(p) : p;
      }, m.verifyFlat = function(l, a) {
        for (const s of l) n(!Array.isArray(s), "Method no longer accepts array arguments:", a);
      };
    }, 3292: (u, m, f) => {
      const n = f(375), b = f(8160), h = f(6133), g = {};
      m.schema = function(o, c, l = {}) {
        b.assertOptions(l, ["appendPath", "override"]);
        try {
          return g.schema(o, c, l);
        } catch (a) {
          throw l.appendPath && a.path !== void 0 && (a.message = "".concat(a.message, " (").concat(a.path, ")")), a;
        }
      }, g.schema = function(o, c, l) {
        n(c !== void 0, "Invalid undefined schema"), Array.isArray(c) && (n(c.length, "Invalid empty array schema"), c.length === 1 && (c = c[0]));
        const a = (s, ...p) => l.override !== !1 ? s.valid(o.override, ...p) : s.valid(...p);
        if (g.simple(c)) return a(o, c);
        if (typeof c == "function") return o.custom(c);
        if (n(typeof c == "object", "Invalid schema content:", typeof c), b.isResolvable(c)) return a(o, c);
        if (b.isSchema(c)) return c;
        if (Array.isArray(c)) {
          for (const s of c) if (!g.simple(s)) return o.alternatives().try(...c);
          return a(o, ...c);
        }
        return c instanceof RegExp ? o.string().regex(c) : c instanceof Date ? a(o.date(), c) : (n(Object.getPrototypeOf(c) === Object.getPrototypeOf({}), "Schema can only contain plain objects"), o.object().keys(c));
      }, m.ref = function(o, c) {
        return h.isRef(o) ? o : h.create(o, c);
      }, m.compile = function(o, c, l = {}) {
        b.assertOptions(l, ["legacy"]);
        const a = c && c[b.symbols.any];
        if (a) return n(l.legacy || a.version === b.version, "Cannot mix different versions of joi schemas:", a.version, b.version), c;
        if (typeof c != "object" || !l.legacy) return m.schema(o, c, { appendPath: !0 });
        const s = g.walk(c);
        return s ? s.compile(s.root, c) : m.schema(o, c, { appendPath: !0 });
      }, g.walk = function(o) {
        if (typeof o != "object") return null;
        if (Array.isArray(o)) {
          for (const l of o) {
            const a = g.walk(l);
            if (a) return a;
          }
          return null;
        }
        const c = o[b.symbols.any];
        if (c) return { root: o[c.root], compile: c.compile };
        n(Object.getPrototypeOf(o) === Object.getPrototypeOf({}), "Schema can only contain plain objects");
        for (const l in o) {
          const a = g.walk(o[l]);
          if (a) return a;
        }
        return null;
      }, g.simple = function(o) {
        return o === null || ["boolean", "string", "number"].includes(typeof o);
      }, m.when = function(o, c, l) {
        if (l === void 0 && (n(c && typeof c == "object", "Missing options"), l = c, c = h.create(".")), Array.isArray(l) && (l = { switch: l }), b.assertOptions(l, ["is", "not", "then", "otherwise", "switch", "break"]), b.isSchema(c)) return n(l.is === void 0, '"is" can not be used with a schema condition'), n(l.not === void 0, '"not" can not be used with a schema condition'), n(l.switch === void 0, '"switch" can not be used with a schema condition'), g.condition(o, { is: c, then: l.then, otherwise: l.otherwise, break: l.break });
        if (n(h.isRef(c) || typeof c == "string", "Invalid condition:", c), n(l.not === void 0 || l.is === void 0, 'Cannot combine "is" with "not"'), l.switch === void 0) {
          let s = l;
          l.not !== void 0 && (s = { is: l.not, then: l.otherwise, otherwise: l.then, break: l.break });
          let p = s.is !== void 0 ? o.$_compile(s.is) : o.$_root.invalid(null, !1, 0, "").required();
          return n(s.then !== void 0 || s.otherwise !== void 0, 'options must have at least one of "then", "otherwise", or "switch"'), n(s.break === void 0 || s.then === void 0 || s.otherwise === void 0, "Cannot specify then, otherwise, and break all together"), l.is === void 0 || h.isRef(l.is) || b.isSchema(l.is) || (p = p.required()), g.condition(o, { ref: m.ref(c), is: p, then: s.then, otherwise: s.otherwise, break: s.break });
        }
        n(Array.isArray(l.switch), '"switch" must be an array'), n(l.is === void 0, 'Cannot combine "switch" with "is"'), n(l.not === void 0, 'Cannot combine "switch" with "not"'), n(l.then === void 0, 'Cannot combine "switch" with "then"');
        const a = { ref: m.ref(c), switch: [], break: l.break };
        for (let s = 0; s < l.switch.length; ++s) {
          const p = l.switch[s], d = s === l.switch.length - 1;
          b.assertOptions(p, d ? ["is", "then", "otherwise"] : ["is", "then"]), n(p.is !== void 0, 'Switch statement missing "is"'), n(p.then !== void 0, 'Switch statement missing "then"');
          const y = { is: o.$_compile(p.is), then: o.$_compile(p.then) };
          if (h.isRef(p.is) || b.isSchema(p.is) || (y.is = y.is.required()), d) {
            n(l.otherwise === void 0 || p.otherwise === void 0, 'Cannot specify "otherwise" inside and outside a "switch"');
            const v = l.otherwise !== void 0 ? l.otherwise : p.otherwise;
            v !== void 0 && (n(a.break === void 0, "Cannot specify both otherwise and break"), y.otherwise = o.$_compile(v));
          }
          a.switch.push(y);
        }
        return a;
      }, g.condition = function(o, c) {
        for (const l of ["then", "otherwise"]) c[l] === void 0 ? delete c[l] : c[l] = o.$_compile(c[l]);
        return c;
      };
    }, 6354: (u, m, f) => {
      const n = f(5688), b = f(8160), h = f(3328);
      m.Report = class {
        constructor(g, o, c, l, a, s, p) {
          if (this.code = g, this.flags = l, this.messages = a, this.path = s.path, this.prefs = p, this.state = s, this.value = o, this.message = null, this.template = null, this.local = c || {}, this.local.label = m.label(this.flags, this.state, this.prefs, this.messages), this.value === void 0 || this.local.hasOwnProperty("value") || (this.local.value = this.value), this.path.length) {
            const d = this.path[this.path.length - 1];
            typeof d != "object" && (this.local.key = d);
          }
        }
        _setTemplate(g) {
          if (this.template = g, !this.flags.label && this.path.length === 0) {
            const o = this._template(this.template, "root");
            o && (this.local.label = o);
          }
        }
        toString() {
          if (this.message) return this.message;
          const g = this.code;
          if (!this.prefs.errors.render) return this.code;
          const o = this._template(this.template) || this._template(this.prefs.messages) || this._template(this.messages);
          return o === void 0 ? 'Error code "'.concat(g, '" is not defined, your custom type is missing the correct messages definition') : (this.message = o.render(this.value, this.state, this.prefs, this.local, { errors: this.prefs.errors, messages: [this.prefs.messages, this.messages] }), this.prefs.errors.label || (this.message = this.message.replace(/^"" /, "").trim()), this.message);
        }
        _template(g, o) {
          return m.template(this.value, g, o || this.code, this.state, this.prefs);
        }
      }, m.path = function(g) {
        let o = "";
        for (const c of g) typeof c != "object" && (typeof c == "string" ? (o && (o += "."), o += c) : o += "[".concat(c, "]"));
        return o;
      }, m.template = function(g, o, c, l, a) {
        if (!o) return;
        if (h.isTemplate(o)) return c !== "root" ? o : null;
        let s = a.errors.language;
        if (b.isResolvable(s) && (s = s.resolve(g, l, a)), s && o[s]) {
          if (o[s][c] !== void 0) return o[s][c];
          if (o[s]["*"] !== void 0) return o[s]["*"];
        }
        return o[c] ? o[c] : o["*"];
      }, m.label = function(g, o, c, l) {
        if (!c.errors.label) return "";
        if (g.label) return g.label;
        let a = o.path;
        return c.errors.label === "key" && o.path.length > 1 && (a = o.path.slice(-1)), m.path(a) || m.template(null, c.messages, "root", o, c) || l && m.template(null, l, "root", o, c) || "value";
      }, m.process = function(g, o, c) {
        if (!g) return null;
        const { override: l, message: a, details: s } = m.details(g);
        if (l) return l;
        if (c.errors.stack) return new m.ValidationError(a, s, o);
        const p = Error.stackTraceLimit;
        Error.stackTraceLimit = 0;
        const d = new m.ValidationError(a, s, o);
        return Error.stackTraceLimit = p, d;
      }, m.details = function(g, o = {}) {
        let c = [];
        const l = [];
        for (const a of g) {
          if (a instanceof Error) {
            if (o.override !== !1) return { override: a };
            const p = a.toString();
            c.push(p), l.push({ message: p, type: "override", context: { error: a } });
            continue;
          }
          const s = a.toString();
          c.push(s), l.push({ message: s, path: a.path.filter((p) => typeof p != "object"), type: a.code, context: a.local });
        }
        return c.length > 1 && (c = [...new Set(c)]), { message: c.join(". "), details: l };
      }, m.ValidationError = class extends Error {
        constructor(g, o, c) {
          super(g), this._original = c, this.details = o;
        }
        static isError(g) {
          return g instanceof m.ValidationError;
        }
      }, m.ValidationError.prototype.isJoi = !0, m.ValidationError.prototype.name = "ValidationError", m.ValidationError.prototype.annotate = n.error;
    }, 8901: (u, m, f) => {
      const n = f(375), b = f(8571), h = f(8160), g = f(6914), o = {};
      m.type = function(c, l) {
        const a = Object.getPrototypeOf(c), s = b(a), p = c._assign(Object.create(s)), d = Object.assign({}, l);
        delete d.base, s._definition = d;
        const y = a._definition || {};
        d.messages = g.merge(y.messages, d.messages), d.properties = Object.assign({}, y.properties, d.properties), p.type = d.type, d.flags = Object.assign({}, y.flags, d.flags);
        const v = Object.assign({}, y.terms);
        if (d.terms) for (const T in d.terms) {
          const x = d.terms[T];
          n(p.$_terms[T] === void 0, "Invalid term override for", d.type, T), p.$_terms[T] = x.init, v[T] = x;
        }
        d.terms = v, d.args || (d.args = y.args), d.prepare = o.prepare(d.prepare, y.prepare), d.coerce && (typeof d.coerce == "function" && (d.coerce = { method: d.coerce }), d.coerce.from && !Array.isArray(d.coerce.from) && (d.coerce = { method: d.coerce.method, from: [].concat(d.coerce.from) })), d.coerce = o.coerce(d.coerce, y.coerce), d.validate = o.validate(d.validate, y.validate);
        const S = Object.assign({}, y.rules);
        if (d.rules) for (const T in d.rules) {
          const x = d.rules[T];
          n(typeof x == "object", "Invalid rule definition for", d.type, T);
          let k = x.method;
          if (k === void 0 && (k = function() {
            return this.$_addRule(T);
          }), k && (n(!s[T], "Rule conflict in", d.type, T), s[T] = k), n(!S[T], "Rule conflict in", d.type, T), S[T] = x, x.alias) {
            const _ = [].concat(x.alias);
            for (const L of _) s[L] = x.method;
          }
          x.args && (x.argsByName = /* @__PURE__ */ new Map(), x.args = x.args.map((_) => (typeof _ == "string" && (_ = { name: _ }), n(!x.argsByName.has(_.name), "Duplicated argument name", _.name), h.isSchema(_.assert) && (_.assert = _.assert.strict().label(_.name)), x.argsByName.set(_.name, _), _)));
        }
        d.rules = S;
        const I = Object.assign({}, y.modifiers);
        if (d.modifiers) for (const T in d.modifiers) {
          n(!s[T], "Rule conflict in", d.type, T);
          const x = d.modifiers[T];
          n(typeof x == "function", "Invalid modifier definition for", d.type, T);
          const k = function(_) {
            return this.rule({ [T]: _ });
          };
          s[T] = k, I[T] = x;
        }
        if (d.modifiers = I, d.overrides) {
          s._super = a, p.$_super = {};
          for (const T in d.overrides) n(a[T], "Cannot override missing", T), d.overrides[T][h.symbols.parent] = a[T], p.$_super[T] = a[T].bind(p);
          Object.assign(s, d.overrides);
        }
        d.cast = Object.assign({}, y.cast, d.cast);
        const E = Object.assign({}, y.manifest, d.manifest);
        return E.build = o.build(d.manifest && d.manifest.build, y.manifest && y.manifest.build), d.manifest = E, d.rebuild = o.rebuild(d.rebuild, y.rebuild), p;
      }, o.build = function(c, l) {
        return c && l ? function(a, s) {
          return l(c(a, s), s);
        } : c || l;
      }, o.coerce = function(c, l) {
        return c && l ? { from: c.from && l.from ? [.../* @__PURE__ */ new Set([...c.from, ...l.from])] : null, method(a, s) {
          let p;
          if ((!l.from || l.from.includes(typeof a)) && (p = l.method(a, s), p)) {
            if (p.errors || p.value === void 0) return p;
            a = p.value;
          }
          if (!c.from || c.from.includes(typeof a)) {
            const d = c.method(a, s);
            if (d) return d;
          }
          return p;
        } } : c || l;
      }, o.prepare = function(c, l) {
        return c && l ? function(a, s) {
          const p = c(a, s);
          if (p) {
            if (p.errors || p.value === void 0) return p;
            a = p.value;
          }
          return l(a, s) || p;
        } : c || l;
      }, o.rebuild = function(c, l) {
        return c && l ? function(a) {
          l(a), c(a);
        } : c || l;
      }, o.validate = function(c, l) {
        return c && l ? function(a, s) {
          const p = l(a, s);
          if (p) {
            if (p.errors && (!Array.isArray(p.errors) || p.errors.length)) return p;
            a = p.value;
          }
          return c(a, s) || p;
        } : c || l;
      };
    }, 5107: (u, m, f) => {
      const n = f(375), b = f(8571), h = f(8652), g = f(8160), o = f(3292), c = f(6354), l = f(8901), a = f(9708), s = f(6133), p = f(3328), d = f(1152);
      let y;
      const v = { types: { alternatives: f(4946), any: f(8068), array: f(546), boolean: f(4937), date: f(7500), function: f(390), link: f(8785), number: f(3832), object: f(8966), string: f(7417), symbol: f(8826) }, aliases: { alt: "alternatives", bool: "boolean", func: "function" }, root: function() {
        const S = { _types: new Set(Object.keys(v.types)) };
        for (const I of S._types) S[I] = function(...E) {
          return n(!E.length || ["alternatives", "link", "object"].includes(I), "The", I, "type does not allow arguments"), v.generate(this, v.types[I], E);
        };
        for (const I of ["allow", "custom", "disallow", "equal", "exist", "forbidden", "invalid", "not", "only", "optional", "options", "prefs", "preferences", "required", "strip", "valid", "when"]) S[I] = function(...E) {
          return this.any()[I](...E);
        };
        Object.assign(S, v.methods);
        for (const I in v.aliases) {
          const E = v.aliases[I];
          S[I] = S[E];
        }
        return S.x = S.expression, d.setup && d.setup(S), S;
      } };
      v.methods = { ValidationError: c.ValidationError, version: g.version, cache: h.provider, assert(S, I, ...E) {
        v.assert(S, I, !0, E);
      }, attempt: (S, I, ...E) => v.assert(S, I, !1, E), build(S) {
        return n(typeof a.build == "function", "Manifest functionality disabled"), a.build(this, S);
      }, checkPreferences(S) {
        g.checkPreferences(S);
      }, compile(S, I) {
        return o.compile(this, S, I);
      }, defaults(S) {
        n(typeof S == "function", "modifier must be a function");
        const I = Object.assign({}, this);
        for (const E of I._types) {
          const T = S(I[E]());
          n(g.isSchema(T), "modifier must return a valid schema object"), I[E] = function(...x) {
            return v.generate(this, T, x);
          };
        }
        return I;
      }, expression: (...S) => new p(...S), extend(...S) {
        g.verifyFlat(S, "extend"), y = y || f(3378), n(S.length, "You need to provide at least one extension"), this.assert(S, y.extensions);
        const I = Object.assign({}, this);
        I._types = new Set(I._types);
        for (let E of S) {
          typeof E == "function" && (E = E(I)), this.assert(E, y.extension);
          const T = v.expandExtension(E, I);
          for (const x of T) {
            n(I[x.type] === void 0 || I._types.has(x.type), "Cannot override name", x.type);
            const k = x.base || this.any(), _ = l.type(k, x);
            I._types.add(x.type), I[x.type] = function(...L) {
              return v.generate(this, _, L);
            };
          }
        }
        return I;
      }, isError: c.ValidationError.isError, isExpression: p.isTemplate, isRef: s.isRef, isSchema: g.isSchema, in: (...S) => s.in(...S), override: g.symbols.override, ref: (...S) => s.create(...S), types() {
        const S = {};
        for (const I of this._types) S[I] = this[I]();
        for (const I in v.aliases) S[I] = this[I]();
        return S;
      } }, v.assert = function(S, I, E, T) {
        const x = T[0] instanceof Error || typeof T[0] == "string" ? T[0] : null, k = x !== null ? T[1] : T[0], _ = I.validate(S, g.preferences({ errors: { stack: !0 } }, k || {}));
        let L = _.error;
        if (!L) return _.value;
        if (x instanceof Error) throw x;
        const N = E && typeof L.annotate == "function" ? L.annotate() : L.message;
        throw L instanceof c.ValidationError == 0 && (L = b(L)), L.message = x ? "".concat(x, " ").concat(N) : N, L;
      }, v.generate = function(S, I, E) {
        return n(S, "Must be invoked on a Joi instance."), I.$_root = S, I._definition.args && E.length ? I._definition.args(I, ...E) : I;
      }, v.expandExtension = function(S, I) {
        if (typeof S.type == "string") return [S];
        const E = [];
        for (const T of I._types) if (S.type.test(T)) {
          const x = Object.assign({}, S);
          x.type = T, x.base = I[T](), E.push(x);
        }
        return E;
      }, u.exports = v.root();
    }, 6914: (u, m, f) => {
      const n = f(375), b = f(8571), h = f(3328);
      m.compile = function(g, o) {
        if (typeof g == "string") return n(!o, "Cannot set single message string"), new h(g);
        if (h.isTemplate(g)) return n(!o, "Cannot set single message template"), g;
        n(typeof g == "object" && !Array.isArray(g), "Invalid message options"), o = o ? b(o) : {};
        for (let c in g) {
          const l = g[c];
          if (c === "root" || h.isTemplate(l)) {
            o[c] = l;
            continue;
          }
          if (typeof l == "string") {
            o[c] = new h(l);
            continue;
          }
          n(typeof l == "object" && !Array.isArray(l), "Invalid message for", c);
          const a = c;
          for (c in o[a] = o[a] || {}, l) {
            const s = l[c];
            c === "root" || h.isTemplate(s) ? o[a][c] = s : (n(typeof s == "string", "Invalid message for", c, "in", a), o[a][c] = new h(s));
          }
        }
        return o;
      }, m.decompile = function(g) {
        const o = {};
        for (let c in g) {
          const l = g[c];
          if (c === "root") {
            o.root = l;
            continue;
          }
          if (h.isTemplate(l)) {
            o[c] = l.describe({ compact: !0 });
            continue;
          }
          const a = c;
          for (c in o[a] = {}, l) {
            const s = l[c];
            c !== "root" ? o[a][c] = s.describe({ compact: !0 }) : o[a].root = s;
          }
        }
        return o;
      }, m.merge = function(g, o) {
        if (!g) return m.compile(o);
        if (!o) return g;
        if (typeof o == "string") return new h(o);
        if (h.isTemplate(o)) return o;
        const c = b(g);
        for (let l in o) {
          const a = o[l];
          if (l === "root" || h.isTemplate(a)) {
            c[l] = a;
            continue;
          }
          if (typeof a == "string") {
            c[l] = new h(a);
            continue;
          }
          n(typeof a == "object" && !Array.isArray(a), "Invalid message for", l);
          const s = l;
          for (l in c[s] = c[s] || {}, a) {
            const p = a[l];
            l === "root" || h.isTemplate(p) ? c[s][l] = p : (n(typeof p == "string", "Invalid message for", l, "in", s), c[s][l] = new h(p));
          }
        }
        return c;
      };
    }, 2294: (u, m, f) => {
      const n = f(375), b = f(8160), h = f(6133), g = {};
      m.Ids = g.Ids = class {
        constructor() {
          this._byId = /* @__PURE__ */ new Map(), this._byKey = /* @__PURE__ */ new Map(), this._schemaChain = !1;
        }
        clone() {
          const o = new g.Ids();
          return o._byId = new Map(this._byId), o._byKey = new Map(this._byKey), o._schemaChain = this._schemaChain, o;
        }
        concat(o) {
          o._schemaChain && (this._schemaChain = !0);
          for (const [c, l] of o._byId.entries()) n(!this._byKey.has(c), "Schema id conflicts with existing key:", c), this._byId.set(c, l);
          for (const [c, l] of o._byKey.entries()) n(!this._byId.has(c), "Schema key conflicts with existing id:", c), this._byKey.set(c, l);
        }
        fork(o, c, l) {
          const a = this._collect(o);
          a.push({ schema: l });
          const s = a.shift();
          let p = { id: s.id, schema: c(s.schema) };
          n(b.isSchema(p.schema), "adjuster function failed to return a joi schema type");
          for (const d of a) p = { id: d.id, schema: g.fork(d.schema, p.id, p.schema) };
          return p.schema;
        }
        labels(o, c = []) {
          const l = o[0], a = this._get(l);
          if (!a) return [...c, ...o].join(".");
          const s = o.slice(1);
          return c = [...c, a.schema._flags.label || l], s.length ? a.schema._ids.labels(s, c) : c.join(".");
        }
        reach(o, c = []) {
          const l = o[0], a = this._get(l);
          n(a, "Schema does not contain path", [...c, ...o].join("."));
          const s = o.slice(1);
          return s.length ? a.schema._ids.reach(s, [...c, l]) : a.schema;
        }
        register(o, { key: c } = {}) {
          if (!o || !b.isSchema(o)) return;
          (o.$_property("schemaChain") || o._ids._schemaChain) && (this._schemaChain = !0);
          const l = o._flags.id;
          if (l) {
            const a = this._byId.get(l);
            n(!a || a.schema === o, "Cannot add different schemas with the same id:", l), n(!this._byKey.has(l), "Schema id conflicts with existing key:", l), this._byId.set(l, { schema: o, id: l });
          }
          c && (n(!this._byKey.has(c), "Schema already contains key:", c), n(!this._byId.has(c), "Schema key conflicts with existing id:", c), this._byKey.set(c, { schema: o, id: c }));
        }
        reset() {
          this._byId = /* @__PURE__ */ new Map(), this._byKey = /* @__PURE__ */ new Map(), this._schemaChain = !1;
        }
        _collect(o, c = [], l = []) {
          const a = o[0], s = this._get(a);
          n(s, "Schema does not contain path", [...c, ...o].join(".")), l = [s, ...l];
          const p = o.slice(1);
          return p.length ? s.schema._ids._collect(p, [...c, a], l) : l;
        }
        _get(o) {
          return this._byId.get(o) || this._byKey.get(o);
        }
      }, g.fork = function(o, c, l) {
        const a = m.schema(o, { each: (s, { key: p }) => {
          if (c === (s._flags.id || p)) return l;
        }, ref: !1 });
        return a ? a.$_mutateRebuild() : o;
      }, m.schema = function(o, c) {
        let l;
        for (const a in o._flags) {
          if (a[0] === "_") continue;
          const s = g.scan(o._flags[a], { source: "flags", name: a }, c);
          s !== void 0 && (l = l || o.clone(), l._flags[a] = s);
        }
        for (let a = 0; a < o._rules.length; ++a) {
          const s = o._rules[a], p = g.scan(s.args, { source: "rules", name: s.name }, c);
          if (p !== void 0) {
            l = l || o.clone();
            const d = Object.assign({}, s);
            d.args = p, l._rules[a] = d, l._singleRules.get(s.name) === s && l._singleRules.set(s.name, d);
          }
        }
        for (const a in o.$_terms) {
          if (a[0] === "_") continue;
          const s = g.scan(o.$_terms[a], { source: "terms", name: a }, c);
          s !== void 0 && (l = l || o.clone(), l.$_terms[a] = s);
        }
        return l;
      }, g.scan = function(o, c, l, a, s) {
        const p = a || [];
        if (o === null || typeof o != "object") return;
        let d;
        if (Array.isArray(o)) {
          for (let y = 0; y < o.length; ++y) {
            const v = c.source === "terms" && c.name === "keys" && o[y].key, S = g.scan(o[y], c, l, [y, ...p], v);
            S !== void 0 && (d = d || o.slice(), d[y] = S);
          }
          return d;
        }
        if (l.schema !== !1 && b.isSchema(o) || l.ref !== !1 && h.isRef(o)) {
          const y = l.each(o, we(J({}, c), { path: p, key: s }));
          return y === o ? void 0 : y;
        }
        for (const y in o) {
          if (y[0] === "_") continue;
          const v = g.scan(o[y], c, l, [y, ...p], s);
          v !== void 0 && (d = d || Object.assign({}, o), d[y] = v);
        }
        return d;
      };
    }, 6133: (u, m, f) => {
      const n = f(375), b = f(8571), h = f(9621), g = f(8160);
      let o;
      const c = { symbol: Symbol("ref"), defaults: { adjust: null, in: !1, iterables: null, map: null, separator: ".", type: "value" } };
      m.create = function(l, a = {}) {
        n(typeof l == "string", "Invalid reference key:", l), g.assertOptions(a, ["adjust", "ancestor", "in", "iterables", "map", "prefix", "render", "separator"]), n(!a.prefix || typeof a.prefix == "object", "options.prefix must be of type object");
        const s = Object.assign({}, c.defaults, a);
        delete s.prefix;
        const p = s.separator, d = c.context(l, p, a.prefix);
        if (s.type = d.type, l = d.key, s.type === "value") if (d.root && (n(!p || l[0] !== p, "Cannot specify relative path with root prefix"), s.ancestor = "root", l || (l = null)), p && p === l) l = null, s.ancestor = 0;
        else if (s.ancestor !== void 0) n(!p || !l || l[0] !== p, "Cannot combine prefix with ancestor option");
        else {
          const [y, v] = c.ancestor(l, p);
          v && (l = l.slice(v)) === "" && (l = null), s.ancestor = y;
        }
        return s.path = p ? l === null ? [] : l.split(p) : [l], new c.Ref(s);
      }, m.in = function(l, a = {}) {
        return m.create(l, we(J({}, a), { in: !0 }));
      }, m.isRef = function(l) {
        return !!l && !!l[g.symbols.ref];
      }, c.Ref = class {
        constructor(l) {
          n(typeof l == "object", "Invalid reference construction"), g.assertOptions(l, ["adjust", "ancestor", "in", "iterables", "map", "path", "render", "separator", "type", "depth", "key", "root", "display"]), n([!1, void 0].includes(l.separator) || typeof l.separator == "string" && l.separator.length === 1, "Invalid separator"), n(!l.adjust || typeof l.adjust == "function", "options.adjust must be a function"), n(!l.map || Array.isArray(l.map), "options.map must be an array"), n(!l.map || !l.adjust, "Cannot set both map and adjust options"), Object.assign(this, c.defaults, l), n(this.type === "value" || this.ancestor === void 0, "Non-value references cannot reference ancestors"), Array.isArray(this.map) && (this.map = new Map(this.map)), this.depth = this.path.length, this.key = this.path.length ? this.path.join(this.separator) : null, this.root = this.path[0], this.updateDisplay();
        }
        resolve(l, a, s, p, d = {}) {
          return n(!this.in || d.in, "Invalid in() reference usage"), this.type === "global" ? this._resolve(s.context, a, d) : this.type === "local" ? this._resolve(p, a, d) : this.ancestor ? this.ancestor === "root" ? this._resolve(a.ancestors[a.ancestors.length - 1], a, d) : (n(this.ancestor <= a.ancestors.length, "Invalid reference exceeds the schema root:", this.display), this._resolve(a.ancestors[this.ancestor - 1], a, d)) : this._resolve(l, a, d);
        }
        _resolve(l, a, s) {
          let p;
          if (this.type === "value" && a.mainstay.shadow && s.shadow !== !1 && (p = a.mainstay.shadow.get(this.absolute(a))), p === void 0 && (p = h(l, this.path, { iterables: this.iterables, functions: !0 })), this.adjust && (p = this.adjust(p)), this.map) {
            const d = this.map.get(p);
            d !== void 0 && (p = d);
          }
          return a.mainstay && a.mainstay.tracer.resolve(a, this, p), p;
        }
        toString() {
          return this.display;
        }
        absolute(l) {
          return [...l.path.slice(0, -this.ancestor), ...this.path];
        }
        clone() {
          return new c.Ref(this);
        }
        describe() {
          const l = { path: this.path };
          this.type !== "value" && (l.type = this.type), this.separator !== "." && (l.separator = this.separator), this.type === "value" && this.ancestor !== 1 && (l.ancestor = this.ancestor), this.map && (l.map = [...this.map]);
          for (const a of ["adjust", "iterables", "render"]) this[a] !== null && this[a] !== void 0 && (l[a] = this[a]);
          return this.in !== !1 && (l.in = !0), { ref: l };
        }
        updateDisplay() {
          const l = this.key !== null ? this.key : "";
          if (this.type !== "value") return void (this.display = "ref:".concat(this.type, ":").concat(l));
          if (!this.separator) return void (this.display = "ref:".concat(l));
          if (!this.ancestor) return void (this.display = "ref:".concat(this.separator).concat(l));
          if (this.ancestor === "root") return void (this.display = "ref:root:".concat(l));
          if (this.ancestor === 1) return void (this.display = "ref:".concat(l || ".."));
          const a = new Array(this.ancestor + 1).fill(this.separator).join("");
          this.display = "ref:".concat(a).concat(l || "");
        }
      }, c.Ref.prototype[g.symbols.ref] = !0, m.build = function(l) {
        return (l = Object.assign({}, c.defaults, l)).type === "value" && l.ancestor === void 0 && (l.ancestor = 1), new c.Ref(l);
      }, c.context = function(l, a, s = {}) {
        if (l = l.trim(), s) {
          const p = s.global === void 0 ? "$" : s.global;
          if (p !== a && l.startsWith(p)) return { key: l.slice(p.length), type: "global" };
          const d = s.local === void 0 ? "#" : s.local;
          if (d !== a && l.startsWith(d)) return { key: l.slice(d.length), type: "local" };
          const y = s.root === void 0 ? "/" : s.root;
          if (y !== a && l.startsWith(y)) return { key: l.slice(y.length), type: "value", root: !0 };
        }
        return { key: l, type: "value" };
      }, c.ancestor = function(l, a) {
        if (!a) return [1, 0];
        if (l[0] !== a) return [1, 0];
        if (l[1] !== a) return [0, 1];
        let s = 2;
        for (; l[s] === a; ) ++s;
        return [s - 1, s];
      }, m.toSibling = 0, m.toParent = 1, m.Manager = class {
        constructor() {
          this.refs = [];
        }
        register(l, a) {
          if (l) if (a = a === void 0 ? m.toParent : a, Array.isArray(l)) for (const s of l) this.register(s, a);
          else if (g.isSchema(l)) for (const s of l._refs.refs) s.ancestor - a >= 0 && this.refs.push({ ancestor: s.ancestor - a, root: s.root });
          else m.isRef(l) && l.type === "value" && l.ancestor - a >= 0 && this.refs.push({ ancestor: l.ancestor - a, root: l.root }), o = o || f(3328), o.isTemplate(l) && this.register(l.refs(), a);
        }
        get length() {
          return this.refs.length;
        }
        clone() {
          const l = new m.Manager();
          return l.refs = b(this.refs), l;
        }
        reset() {
          this.refs = [];
        }
        roots() {
          return this.refs.filter((l) => !l.ancestor).map((l) => l.root);
        }
      };
    }, 3378: (u, m, f) => {
      const n = f(5107), b = {};
      b.wrap = n.string().min(1).max(2).allow(!1), m.preferences = n.object({ allowUnknown: n.boolean(), abortEarly: n.boolean(), artifacts: n.boolean(), cache: n.boolean(), context: n.object(), convert: n.boolean(), dateFormat: n.valid("date", "iso", "string", "time", "utc"), debug: n.boolean(), errors: { escapeHtml: n.boolean(), label: n.valid("path", "key", !1), language: [n.string(), n.object().ref()], render: n.boolean(), stack: n.boolean(), wrap: { label: b.wrap, array: b.wrap, string: b.wrap } }, externals: n.boolean(), messages: n.object(), noDefaults: n.boolean(), nonEnumerables: n.boolean(), presence: n.valid("required", "optional", "forbidden"), skipFunctions: n.boolean(), stripUnknown: n.object({ arrays: n.boolean(), objects: n.boolean() }).or("arrays", "objects").allow(!0, !1), warnings: n.boolean() }).strict(), b.nameRx = /^[a-zA-Z0-9]\w*$/, b.rule = n.object({ alias: n.array().items(n.string().pattern(b.nameRx)).single(), args: n.array().items(n.string(), n.object({ name: n.string().pattern(b.nameRx).required(), ref: n.boolean(), assert: n.alternatives([n.function(), n.object().schema()]).conditional("ref", { is: !0, then: n.required() }), normalize: n.function(), message: n.string().when("assert", { is: n.function(), then: n.required() }) })), convert: n.boolean(), manifest: n.boolean(), method: n.function().allow(!1), multi: n.boolean(), validate: n.function() }), m.extension = n.object({ type: n.alternatives([n.string(), n.object().regex()]).required(), args: n.function(), cast: n.object().pattern(b.nameRx, n.object({ from: n.function().maxArity(1).required(), to: n.function().minArity(1).maxArity(2).required() })), base: n.object().schema().when("type", { is: n.object().regex(), then: n.forbidden() }), coerce: [n.function().maxArity(3), n.object({ method: n.function().maxArity(3).required(), from: n.array().items(n.string()).single() })], flags: n.object().pattern(b.nameRx, n.object({ setter: n.string(), default: n.any() })), manifest: { build: n.function().arity(2) }, messages: [n.object(), n.string()], modifiers: n.object().pattern(b.nameRx, n.function().minArity(1).maxArity(2)), overrides: n.object().pattern(b.nameRx, n.function()), prepare: n.function().maxArity(3), rebuild: n.function().arity(1), rules: n.object().pattern(b.nameRx, b.rule), terms: n.object().pattern(b.nameRx, n.object({ init: n.array().allow(null).required(), manifest: n.object().pattern(/.+/, [n.valid("schema", "single"), n.object({ mapped: n.object({ from: n.string().required(), to: n.string().required() }).required() })]) })), validate: n.function().maxArity(3) }).strict(), m.extensions = n.array().items(n.object(), n.function().arity(1)).strict(), b.desc = { buffer: n.object({ buffer: n.string() }), func: n.object({ function: n.function().required(), options: { literal: !0 } }), override: n.object({ override: !0 }), ref: n.object({ ref: n.object({ type: n.valid("value", "global", "local"), path: n.array().required(), separator: n.string().length(1).allow(!1), ancestor: n.number().min(0).integer().allow("root"), map: n.array().items(n.array().length(2)).min(1), adjust: n.function(), iterables: n.boolean(), in: n.boolean(), render: n.boolean() }).required() }), regex: n.object({ regex: n.string().min(3) }), special: n.object({ special: n.valid("deep").required() }), template: n.object({ template: n.string().required(), options: n.object() }), value: n.object({ value: n.alternatives([n.object(), n.array()]).required() }) }, b.desc.entity = n.alternatives([n.array().items(n.link("...")), n.boolean(), n.function(), n.number(), n.string(), b.desc.buffer, b.desc.func, b.desc.ref, b.desc.regex, b.desc.special, b.desc.template, b.desc.value, n.link("/")]), b.desc.values = n.array().items(null, n.boolean(), n.function(), n.number().allow(1 / 0, -1 / 0), n.string().allow(""), n.symbol(), b.desc.buffer, b.desc.func, b.desc.override, b.desc.ref, b.desc.regex, b.desc.template, b.desc.value), b.desc.messages = n.object().pattern(/.+/, [n.string(), b.desc.template, n.object().pattern(/.+/, [n.string(), b.desc.template])]), m.description = n.object({ type: n.string().required(), flags: n.object({ cast: n.string(), default: n.any(), description: n.string(), empty: n.link("/"), failover: b.desc.entity, id: n.string(), label: n.string(), only: !0, presence: ["optional", "required", "forbidden"], result: ["raw", "strip"], strip: n.boolean(), unit: n.string() }).unknown(), preferences: { allowUnknown: n.boolean(), abortEarly: n.boolean(), artifacts: n.boolean(), cache: n.boolean(), convert: n.boolean(), dateFormat: ["date", "iso", "string", "time", "utc"], errors: { escapeHtml: n.boolean(), label: ["path", "key"], language: [n.string(), b.desc.ref], wrap: { label: b.wrap, array: b.wrap } }, externals: n.boolean(), messages: b.desc.messages, noDefaults: n.boolean(), nonEnumerables: n.boolean(), presence: ["required", "optional", "forbidden"], skipFunctions: n.boolean(), stripUnknown: n.object({ arrays: n.boolean(), objects: n.boolean() }).or("arrays", "objects").allow(!0, !1), warnings: n.boolean() }, allow: b.desc.values, invalid: b.desc.values, rules: n.array().min(1).items({ name: n.string().required(), args: n.object().min(1), keep: n.boolean(), message: [n.string(), b.desc.messages], warn: n.boolean() }), keys: n.object().pattern(/.*/, n.link("/")), link: b.desc.ref }).pattern(/^[a-z]\w*$/, n.any());
    }, 493: (u, m, f) => {
      const n = f(8571), b = f(9621), h = f(8160), g = { value: Symbol("value") };
      u.exports = g.State = class {
        constructor(o, c, l) {
          this.path = o, this.ancestors = c, this.mainstay = l.mainstay, this.schemas = l.schemas, this.debug = null;
        }
        localize(o, c = null, l = null) {
          const a = new g.State(o, c, this);
          return l && a.schemas && (a.schemas = [g.schemas(l), ...a.schemas]), a;
        }
        nest(o, c) {
          const l = new g.State(this.path, this.ancestors, this);
          return l.schemas = l.schemas && [g.schemas(o), ...l.schemas], l.debug = c, l;
        }
        shadow(o, c) {
          this.mainstay.shadow = this.mainstay.shadow || new g.Shadow(), this.mainstay.shadow.set(this.path, o, c);
        }
        snapshot() {
          this.mainstay.shadow && (this._snapshot = n(this.mainstay.shadow.node(this.path))), this.mainstay.snapshot();
        }
        restore() {
          this.mainstay.shadow && (this.mainstay.shadow.override(this.path, this._snapshot), this._snapshot = void 0), this.mainstay.restore();
        }
        commit() {
          this.mainstay.shadow && (this.mainstay.shadow.override(this.path, this._snapshot), this._snapshot = void 0), this.mainstay.commit();
        }
      }, g.schemas = function(o) {
        return h.isSchema(o) ? { schema: o } : o;
      }, g.Shadow = class {
        constructor() {
          this._values = null;
        }
        set(o, c, l) {
          if (!o.length || l === "strip" && typeof o[o.length - 1] == "number") return;
          this._values = this._values || /* @__PURE__ */ new Map();
          let a = this._values;
          for (let s = 0; s < o.length; ++s) {
            const p = o[s];
            let d = a.get(p);
            d || (d = /* @__PURE__ */ new Map(), a.set(p, d)), a = d;
          }
          a[g.value] = c;
        }
        get(o) {
          const c = this.node(o);
          if (c) return c[g.value];
        }
        node(o) {
          if (this._values) return b(this._values, o, { iterables: !0 });
        }
        override(o, c) {
          if (!this._values) return;
          const l = o.slice(0, -1), a = o[o.length - 1], s = b(this._values, l, { iterables: !0 });
          c ? s.set(a, c) : s && s.delete(a);
        }
      };
    }, 3328: (u, m, f) => {
      const n = f(375), b = f(8571), h = f(5277), g = f(1447), o = f(8160), c = f(6354), l = f(6133), a = { symbol: Symbol("template"), opens: new Array(1e3).join("\0"), closes: new Array(1e3).join(""), dateFormat: { date: Date.prototype.toDateString, iso: Date.prototype.toISOString, string: Date.prototype.toString, time: Date.prototype.toTimeString, utc: Date.prototype.toUTCString } };
      u.exports = a.Template = class {
        constructor(s, p) {
          if (n(typeof s == "string", "Template source must be a string"), n(!s.includes("\0") && !s.includes(""), "Template source cannot contain reserved control characters"), this.source = s, this.rendered = s, this._template = null, p) {
            const d = p, { functions: y } = d, v = Ye(d, ["functions"]);
            this._settings = Object.keys(v).length ? b(v) : void 0, this._functions = y, this._functions && (n(Object.keys(this._functions).every((S) => typeof S == "string"), "Functions keys must be strings"), n(Object.values(this._functions).every((S) => typeof S == "function"), "Functions values must be functions"));
          } else this._settings = void 0, this._functions = void 0;
          this._parse();
        }
        _parse() {
          if (!this.source.includes("{")) return;
          const s = a.encode(this.source), p = a.split(s);
          let d = !1;
          const y = [], v = p.shift();
          v && y.push(v);
          for (const S of p) {
            const I = S[0] !== "{", E = I ? "}" : "}}", T = S.indexOf(E);
            if (T === -1 || S[1] === "{") {
              y.push("{".concat(a.decode(S)));
              continue;
            }
            let x = S.slice(I ? 0 : 1, T);
            const k = x[0] === ":";
            k && (x = x.slice(1));
            const _ = this._ref(a.decode(x), { raw: I, wrapped: k });
            y.push(_), typeof _ != "string" && (d = !0);
            const L = S.slice(T + E.length);
            L && y.push(a.decode(L));
          }
          d ? this._template = y : this.rendered = y.join("");
        }
        static date(s, p) {
          return a.dateFormat[p.dateFormat].call(s);
        }
        describe(s = {}) {
          if (!this._settings && s.compact) return this.source;
          const p = { template: this.source };
          return this._settings && (p.options = this._settings), this._functions && (p.functions = this._functions), p;
        }
        static build(s) {
          return new a.Template(s.template, s.options || s.functions ? we(J({}, s.options), { functions: s.functions }) : void 0);
        }
        isDynamic() {
          return !!this._template;
        }
        static isTemplate(s) {
          return !!s && !!s[o.symbols.template];
        }
        refs() {
          if (!this._template) return;
          const s = [];
          for (const p of this._template) typeof p != "string" && s.push(...p.refs);
          return s;
        }
        resolve(s, p, d, y) {
          return this._template && this._template.length === 1 ? this._part(this._template[0], s, p, d, y, {}) : this.render(s, p, d, y);
        }
        _part(s, ...p) {
          return s.ref ? s.ref.resolve(...p) : s.formula.evaluate(p);
        }
        render(s, p, d, y, v = {}) {
          if (!this.isDynamic()) return this.rendered;
          const S = [];
          for (const I of this._template) if (typeof I == "string") S.push(I);
          else {
            const E = this._part(I, s, p, d, y, v), T = a.stringify(E, s, p, d, y, v);
            if (T !== void 0) {
              const x = I.raw || (v.errors && v.errors.escapeHtml) === !1 ? T : h(T);
              S.push(a.wrap(x, I.wrapped && d.errors.wrap.label));
            }
          }
          return S.join("");
        }
        _ref(s, { raw: p, wrapped: d }) {
          const y = [], v = (I) => {
            const E = l.create(I, this._settings);
            return y.push(E), (T) => {
              const x = E.resolve(...T);
              return x !== void 0 ? x : null;
            };
          };
          try {
            const I = this._functions ? J(J({}, a.functions), this._functions) : a.functions;
            var S = new g.Parser(s, { reference: v, functions: I, constants: a.constants });
          } catch (I) {
            throw I.message = 'Invalid template variable "'.concat(s, '" fails due to: ').concat(I.message), I;
          }
          if (S.single) {
            if (S.single.type === "reference") {
              const I = y[0];
              return { ref: I, raw: p, refs: y, wrapped: d || I.type === "local" && I.key === "label" };
            }
            return a.stringify(S.single.value);
          }
          return { formula: S, raw: p, refs: y };
        }
        toString() {
          return this.source;
        }
      }, a.Template.prototype[o.symbols.template] = !0, a.Template.prototype.isImmutable = !0, a.encode = function(s) {
        return s.replace(/\\(\{+)/g, (p, d) => a.opens.slice(0, d.length)).replace(/\\(\}+)/g, (p, d) => a.closes.slice(0, d.length));
      }, a.decode = function(s) {
        return s.replace(/\u0000/g, "{").replace(/\u0001/g, "}");
      }, a.split = function(s) {
        const p = [];
        let d = "";
        for (let y = 0; y < s.length; ++y) {
          const v = s[y];
          if (v === "{") {
            let S = "";
            for (; y + 1 < s.length && s[y + 1] === "{"; ) S += "{", ++y;
            p.push(d), d = S;
          } else d += v;
        }
        return p.push(d), p;
      }, a.wrap = function(s, p) {
        return p ? p.length === 1 ? "".concat(p).concat(s).concat(p) : "".concat(p[0]).concat(s).concat(p[1]) : s;
      }, a.stringify = function(s, p, d, y, v, S = {}) {
        const I = typeof s, E = y && y.errors && y.errors.wrap || {};
        let T = !1;
        if (l.isRef(s) && s.render && (T = s.in, s = s.resolve(p, d, y, v, J({ in: s.in }, S))), s === null) return "null";
        if (I === "string") return a.wrap(s, S.arrayItems && E.string);
        if (I === "number" || I === "function" || I === "symbol") return s.toString();
        if (I !== "object") return JSON.stringify(s);
        if (s instanceof Date) return a.Template.date(s, y);
        if (s instanceof Map) {
          const k = [];
          for (const [_, L] of s.entries()) k.push("".concat(_.toString(), " -> ").concat(L.toString()));
          s = k;
        }
        if (!Array.isArray(s)) return s.toString();
        const x = [];
        for (const k of s) x.push(a.stringify(k, p, d, y, v, J({ arrayItems: !0 }, S)));
        return a.wrap(x.join(", "), !T && E.array);
      }, a.constants = { true: !0, false: !1, null: null, second: 1e3, minute: 6e4, hour: 36e5, day: 864e5 }, a.functions = { if: (s, p, d) => s ? p : d, length: (s) => typeof s == "string" ? s.length : s && typeof s == "object" ? Array.isArray(s) ? s.length : Object.keys(s).length : null, msg(s) {
        const [p, d, y, v, S] = this, I = S.messages;
        if (!I) return "";
        const E = c.template(p, I[0], s, d, y) || c.template(p, I[1], s, d, y);
        return E ? E.render(p, d, y, v, S) : "";
      }, number: (s) => typeof s == "number" ? s : typeof s == "string" ? parseFloat(s) : typeof s == "boolean" ? s ? 1 : 0 : s instanceof Date ? s.getTime() : null };
    }, 4946: (u, m, f) => {
      const n = f(375), b = f(1687), h = f(8068), g = f(8160), o = f(3292), c = f(6354), l = f(6133), a = {};
      u.exports = h.extend({ type: "alternatives", flags: { match: { default: "any" } }, terms: { matches: { init: [], register: l.toSibling } }, args: (s, ...p) => p.length === 1 && Array.isArray(p[0]) ? s.try(...p[0]) : s.try(...p), validate(s, p) {
        const { schema: d, error: y, state: v, prefs: S } = p;
        if (d._flags.match) {
          const E = [], T = [];
          for (let k = 0; k < d.$_terms.matches.length; ++k) {
            const _ = d.$_terms.matches[k], L = v.nest(_.schema, "match.".concat(k));
            L.snapshot();
            const N = _.schema.$_validate(s, L, S);
            N.errors ? (T.push(N.errors), L.restore()) : (E.push(N.value), L.commit());
          }
          if (E.length === 0) return { errors: y("alternatives.any", { details: T.map((k) => c.details(k, { override: !1 })) }) };
          if (d._flags.match === "one") return E.length === 1 ? { value: E[0] } : { errors: y("alternatives.one") };
          if (E.length !== d.$_terms.matches.length) return { errors: y("alternatives.all", { details: T.map((k) => c.details(k, { override: !1 })) }) };
          const x = (k) => k.$_terms.matches.some((_) => _.schema.type === "object" || _.schema.type === "alternatives" && x(_.schema));
          return x(d) ? { value: E.reduce((k, _) => b(k, _, { mergeArrays: !1 })) } : { value: E[E.length - 1] };
        }
        const I = [];
        for (let E = 0; E < d.$_terms.matches.length; ++E) {
          const T = d.$_terms.matches[E];
          if (T.schema) {
            const _ = v.nest(T.schema, "match.".concat(E));
            _.snapshot();
            const L = T.schema.$_validate(s, _, S);
            if (!L.errors) return _.commit(), L;
            _.restore(), I.push({ schema: T.schema, reports: L.errors });
            continue;
          }
          const x = T.ref ? T.ref.resolve(s, v, S) : s, k = T.is ? [T] : T.switch;
          for (let _ = 0; _ < k.length; ++_) {
            const L = k[_], { is: N, then: O, otherwise: j } = L, G = "match.".concat(E).concat(T.switch ? "." + _ : "");
            if (N.$_match(x, v.nest(N, "".concat(G, ".is")), S)) {
              if (O) return O.$_validate(s, v.nest(O, "".concat(G, ".then")), S);
            } else if (j) return j.$_validate(s, v.nest(j, "".concat(G, ".otherwise")), S);
          }
        }
        return a.errors(I, p);
      }, rules: { conditional: { method(s, p) {
        n(!this._flags._endedSwitch, "Unreachable condition"), n(!this._flags.match, "Cannot combine match mode", this._flags.match, "with conditional rule"), n(p.break === void 0, "Cannot use break option with alternatives conditional");
        const d = this.clone(), y = o.when(d, s, p), v = y.is ? [y] : y.switch;
        for (const S of v) if (S.then && S.otherwise) {
          d.$_setFlag("_endedSwitch", !0, { clone: !1 });
          break;
        }
        return d.$_terms.matches.push(y), d.$_mutateRebuild();
      } }, match: { method(s) {
        if (n(["any", "one", "all"].includes(s), "Invalid alternatives match mode", s), s !== "any") for (const p of this.$_terms.matches) n(p.schema, "Cannot combine match mode", s, "with conditional rules");
        return this.$_setFlag("match", s);
      } }, try: { method(...s) {
        n(s.length, "Missing alternative schemas"), g.verifyFlat(s, "try"), n(!this._flags._endedSwitch, "Unreachable condition");
        const p = this.clone();
        for (const d of s) p.$_terms.matches.push({ schema: p.$_compile(d) });
        return p.$_mutateRebuild();
      } } }, overrides: { label(s) {
        return this.$_parent("label", s).$_modify({ each: (p, d) => d.path[0] !== "is" && typeof p._flags.label != "string" ? p.label(s) : void 0, ref: !1 });
      } }, rebuild(s) {
        s.$_modify({ each: (p) => {
          g.isSchema(p) && p.type === "array" && s.$_setFlag("_arrayItems", !0, { clone: !1 });
        } });
      }, manifest: { build(s, p) {
        if (p.matches) for (const d of p.matches) {
          const { schema: y, ref: v, is: S, not: I, then: E, otherwise: T } = d;
          s = y ? s.try(y) : v ? s.conditional(v, { is: S, then: E, not: I, otherwise: T, switch: d.switch }) : s.conditional(S, { then: E, otherwise: T });
        }
        return s;
      } }, messages: { "alternatives.all": "{{#label}} does not match all of the required types", "alternatives.any": "{{#label}} does not match any of the allowed types", "alternatives.match": "{{#label}} does not match any of the allowed types", "alternatives.one": "{{#label}} matches more than one allowed type", "alternatives.types": "{{#label}} must be one of {{#types}}" } }), a.errors = function(s, { error: p, state: d }) {
        if (!s.length) return { errors: p("alternatives.any") };
        if (s.length === 1) return { errors: s[0].reports };
        const y = /* @__PURE__ */ new Set(), v = [];
        for (const { reports: S, schema: I } of s) {
          if (S.length > 1) return a.unmatched(s, p);
          const E = S[0];
          if (E instanceof c.Report == 0) return a.unmatched(s, p);
          if (E.state.path.length !== d.path.length) {
            v.push({ type: I.type, report: E });
            continue;
          }
          if (E.code === "any.only") {
            for (const k of E.local.valids) y.add(k);
            continue;
          }
          const [T, x] = E.code.split(".");
          x !== "base" ? v.push({ type: I.type, report: E }) : E.code === "object.base" ? y.add(E.local.type) : y.add(T);
        }
        return v.length ? v.length === 1 ? { errors: v[0].report } : a.unmatched(s, p) : { errors: p("alternatives.types", { types: [...y] }) };
      }, a.unmatched = function(s, p) {
        const d = [];
        for (const y of s) d.push(...y.reports);
        return { errors: p("alternatives.match", c.details(d, { override: !1 })) };
      };
    }, 8068: (u, m, f) => {
      const n = f(375), b = f(7629), h = f(8160), g = f(6914);
      u.exports = b.extend({ type: "any", flags: { only: { default: !1 } }, terms: { alterations: { init: null }, examples: { init: null }, externals: { init: null }, metas: { init: [] }, notes: { init: [] }, shared: { init: null }, tags: { init: [] }, whens: { init: null } }, rules: { custom: { method(o, c) {
        return n(typeof o == "function", "Method must be a function"), n(c === void 0 || c && typeof c == "string", "Description must be a non-empty string"), this.$_addRule({ name: "custom", args: { method: o, description: c } });
      }, validate(o, c, { method: l }) {
        try {
          return l(o, c);
        } catch (a) {
          return c.error("any.custom", { error: a });
        }
      }, args: ["method", "description"], multi: !0 }, messages: { method(o) {
        return this.prefs({ messages: o });
      } }, shared: { method(o) {
        n(h.isSchema(o) && o._flags.id, "Schema must be a schema with an id");
        const c = this.clone();
        return c.$_terms.shared = c.$_terms.shared || [], c.$_terms.shared.push(o), c.$_mutateRegister(o), c;
      } }, warning: { method(o, c) {
        return n(o && typeof o == "string", "Invalid warning code"), this.$_addRule({ name: "warning", args: { code: o, local: c }, warn: !0 });
      }, validate: (o, c, { code: l, local: a }) => c.error(l, a), args: ["code", "local"], multi: !0 } }, modifiers: { keep(o, c = !0) {
        o.keep = c;
      }, message(o, c) {
        o.message = g.compile(c);
      }, warn(o, c = !0) {
        o.warn = c;
      } }, manifest: { build(o, c) {
        for (const l in c) {
          const a = c[l];
          if (["examples", "externals", "metas", "notes", "tags"].includes(l)) for (const s of a) o = o[l.slice(0, -1)](s);
          else if (l !== "alterations") if (l !== "whens") {
            if (l === "shared") for (const s of a) o = o.shared(s);
          } else for (const s of a) {
            const { ref: p, is: d, not: y, then: v, otherwise: S, concat: I } = s;
            o = I ? o.concat(I) : p ? o.when(p, { is: d, not: y, then: v, otherwise: S, switch: s.switch, break: s.break }) : o.when(d, { then: v, otherwise: S, break: s.break });
          }
          else {
            const s = {};
            for (const { target: p, adjuster: d } of a) s[p] = d;
            o = o.alter(s);
          }
        }
        return o;
      } }, messages: { "any.custom": "{{#label}} failed custom validation because {{#error.message}}", "any.default": "{{#label}} threw an error when running default method", "any.failover": "{{#label}} threw an error when running failover method", "any.invalid": "{{#label}} contains an invalid value", "any.only": '{{#label}} must be {if(#valids.length == 1, "", "one of ")}{{#valids}}', "any.ref": "{{#label}} {{#arg}} references {{:#ref}} which {{#reason}}", "any.required": "{{#label}} is required", "any.unknown": "{{#label}} is not allowed" } });
    }, 546: (u, m, f) => {
      const n = f(375), b = f(9474), h = f(9621), g = f(8068), o = f(8160), c = f(3292), l = {};
      u.exports = g.extend({ type: "array", flags: { single: { default: !1 }, sparse: { default: !1 } }, terms: { items: { init: [], manifest: "schema" }, ordered: { init: [], manifest: "schema" }, _exclusions: { init: [] }, _inclusions: { init: [] }, _requireds: { init: [] } }, coerce: { from: "object", method(a, { schema: s, state: p, prefs: d }) {
        if (!Array.isArray(a)) return;
        const y = s.$_getRule("sort");
        return y ? l.sort(s, a, y.args.options, p, d) : void 0;
      } }, validate(a, { schema: s, error: p }) {
        if (!Array.isArray(a)) {
          if (s._flags.single) {
            const d = [a];
            return d[o.symbols.arraySingle] = !0, { value: d };
          }
          return { errors: p("array.base") };
        }
        if (s.$_getRule("items") || s.$_terms.externals) return { value: a.slice() };
      }, rules: { has: { method(a) {
        a = this.$_compile(a, { appendPath: !0 });
        const s = this.$_addRule({ name: "has", args: { schema: a } });
        return s.$_mutateRegister(a), s;
      }, validate(a, { state: s, prefs: p, error: d }, { schema: y }) {
        const v = [a, ...s.ancestors];
        for (let I = 0; I < a.length; ++I) {
          const E = s.localize([...s.path, I], v, y);
          if (y.$_match(a[I], E, p)) return a;
        }
        const S = y._flags.label;
        return S ? d("array.hasKnown", { patternLabel: S }) : d("array.hasUnknown", null);
      }, multi: !0 }, items: { method(...a) {
        o.verifyFlat(a, "items");
        const s = this.$_addRule("items");
        for (let p = 0; p < a.length; ++p) {
          const d = o.tryWithPath(() => this.$_compile(a[p]), p, { append: !0 });
          s.$_terms.items.push(d);
        }
        return s.$_mutateRebuild();
      }, validate(a, { schema: s, error: p, state: d, prefs: y, errorsArray: v }) {
        const S = s.$_terms._requireds.slice(), I = s.$_terms.ordered.slice(), E = [...s.$_terms._inclusions, ...S], T = !a[o.symbols.arraySingle];
        delete a[o.symbols.arraySingle];
        const x = v();
        let k = a.length;
        for (let _ = 0; _ < k; ++_) {
          const L = a[_];
          let N = !1, O = !1;
          const j = T ? _ : new Number(_), G = [...d.path, j];
          if (!s._flags.sparse && L === void 0) {
            if (x.push(p("array.sparse", { key: j, path: G, pos: _, value: void 0 }, d.localize(G))), y.abortEarly) return x;
            I.shift();
            continue;
          }
          const W = [a, ...d.ancestors];
          for (const B of s.$_terms._exclusions) if (B.$_match(L, d.localize(G, W, B), y, { presence: "ignore" })) {
            if (x.push(p("array.excludes", { pos: _, value: L }, d.localize(G))), y.abortEarly) return x;
            N = !0, I.shift();
            break;
          }
          if (N) continue;
          if (s.$_terms.ordered.length) {
            if (I.length) {
              const B = I.shift(), $ = B.$_validate(L, d.localize(G, W, B), y);
              if ($.errors) {
                if (x.push(...$.errors), y.abortEarly) return x;
              } else if (B._flags.result === "strip") l.fastSplice(a, _), --_, --k;
              else {
                if (!s._flags.sparse && $.value === void 0) {
                  if (x.push(p("array.sparse", { key: j, path: G, pos: _, value: void 0 }, d.localize(G))), y.abortEarly) return x;
                  continue;
                }
                a[_] = $.value;
              }
              continue;
            }
            if (!s.$_terms.items.length) {
              if (x.push(p("array.orderedLength", { pos: _, limit: s.$_terms.ordered.length })), y.abortEarly) return x;
              break;
            }
          }
          const F = [];
          let V = S.length;
          for (let B = 0; B < V; ++B) {
            const $ = d.localize(G, W, S[B]);
            $.snapshot();
            const z = S[B].$_validate(L, $, y);
            if (F[B] = z, !z.errors) {
              if ($.commit(), a[_] = z.value, O = !0, l.fastSplice(S, B), --B, --V, !s._flags.sparse && z.value === void 0 && (x.push(p("array.sparse", { key: j, path: G, pos: _, value: void 0 }, d.localize(G))), y.abortEarly)) return x;
              break;
            }
            $.restore();
          }
          if (O) continue;
          const X = y.stripUnknown && !!y.stripUnknown.arrays || !1;
          V = E.length;
          for (const B of E) {
            let $;
            const z = S.indexOf(B);
            if (z !== -1) $ = F[z];
            else {
              const q = d.localize(G, W, B);
              if (q.snapshot(), $ = B.$_validate(L, q, y), !$.errors) {
                q.commit(), B._flags.result === "strip" ? (l.fastSplice(a, _), --_, --k) : s._flags.sparse || $.value !== void 0 ? a[_] = $.value : (x.push(p("array.sparse", { key: j, path: G, pos: _, value: void 0 }, d.localize(G))), N = !0), O = !0;
                break;
              }
              q.restore();
            }
            if (V === 1) {
              if (X) {
                l.fastSplice(a, _), --_, --k, O = !0;
                break;
              }
              if (x.push(...$.errors), y.abortEarly) return x;
              N = !0;
              break;
            }
          }
          if (!N && (s.$_terms._inclusions.length || s.$_terms._requireds.length) && !O) {
            if (X) {
              l.fastSplice(a, _), --_, --k;
              continue;
            }
            if (x.push(p("array.includes", { pos: _, value: L }, d.localize(G))), y.abortEarly) return x;
          }
        }
        return S.length && l.fillMissedErrors(s, x, S, a, d, y), I.length && (l.fillOrderedErrors(s, x, I, a, d, y), x.length || l.fillDefault(I, a, d, y)), x.length ? x : a;
      }, priority: !0, manifest: !1 }, length: { method(a) {
        return this.$_addRule({ name: "length", args: { limit: a }, operator: "=" });
      }, validate: (a, s, { limit: p }, { name: d, operator: y, args: v }) => o.compare(a.length, p, y) ? a : s.error("array." + d, { limit: v.limit, value: a }), args: [{ name: "limit", ref: !0, assert: o.limit, message: "must be a positive integer" }] }, max: { method(a) {
        return this.$_addRule({ name: "max", method: "length", args: { limit: a }, operator: "<=" });
      } }, min: { method(a) {
        return this.$_addRule({ name: "min", method: "length", args: { limit: a }, operator: ">=" });
      } }, ordered: { method(...a) {
        o.verifyFlat(a, "ordered");
        const s = this.$_addRule("items");
        for (let p = 0; p < a.length; ++p) {
          const d = o.tryWithPath(() => this.$_compile(a[p]), p, { append: !0 });
          l.validateSingle(d, s), s.$_mutateRegister(d), s.$_terms.ordered.push(d);
        }
        return s.$_mutateRebuild();
      } }, single: { method(a) {
        const s = a === void 0 || !!a;
        return n(!s || !this._flags._arrayItems, "Cannot specify single rule when array has array items"), this.$_setFlag("single", s);
      } }, sort: { method(a = {}) {
        o.assertOptions(a, ["by", "order"]);
        const s = { order: a.order || "ascending" };
        return a.by && (s.by = c.ref(a.by, { ancestor: 0 }), n(!s.by.ancestor, "Cannot sort by ancestor")), this.$_addRule({ name: "sort", args: { options: s } });
      }, validate(a, { error: s, state: p, prefs: d, schema: y }, { options: v }) {
        const { value: S, errors: I } = l.sort(y, a, v, p, d);
        if (I) return I;
        for (let E = 0; E < a.length; ++E) if (a[E] !== S[E]) return s("array.sort", { order: v.order, by: v.by ? v.by.key : "value" });
        return a;
      }, convert: !0 }, sparse: { method(a) {
        const s = a === void 0 || !!a;
        return this._flags.sparse === s ? this : (s ? this.clone() : this.$_addRule("items")).$_setFlag("sparse", s, { clone: !1 });
      } }, unique: { method(a, s = {}) {
        n(!a || typeof a == "function" || typeof a == "string", "comparator must be a function or a string"), o.assertOptions(s, ["ignoreUndefined", "separator"]);
        const p = { name: "unique", args: { options: s, comparator: a } };
        if (a) if (typeof a == "string") {
          const d = o.default(s.separator, ".");
          p.path = d ? a.split(d) : [a];
        } else p.comparator = a;
        return this.$_addRule(p);
      }, validate(a, { state: s, error: p, schema: d }, { comparator: y, options: v }, { comparator: S, path: I }) {
        const E = { string: /* @__PURE__ */ Object.create(null), number: /* @__PURE__ */ Object.create(null), undefined: /* @__PURE__ */ Object.create(null), boolean: /* @__PURE__ */ Object.create(null), bigint: /* @__PURE__ */ Object.create(null), object: /* @__PURE__ */ new Map(), function: /* @__PURE__ */ new Map(), custom: /* @__PURE__ */ new Map() }, T = S || b, x = v.ignoreUndefined;
        for (let k = 0; k < a.length; ++k) {
          const _ = I ? h(a[k], I) : a[k], L = S ? E.custom : E[typeof _];
          if (n(L, "Failed to find unique map container for type", typeof _), L instanceof Map) {
            const N = L.entries();
            let O;
            for (; !(O = N.next()).done; ) if (T(O.value[0], _)) {
              const j = s.localize([...s.path, k], [a, ...s.ancestors]), G = { pos: k, value: a[k], dupePos: O.value[1], dupeValue: a[O.value[1]] };
              return I && (G.path = y), p("array.unique", G, j);
            }
            L.set(_, k);
          } else {
            if ((!x || _ !== void 0) && L[_] !== void 0) {
              const N = { pos: k, value: a[k], dupePos: L[_], dupeValue: a[L[_]] };
              return I && (N.path = y), p("array.unique", N, s.localize([...s.path, k], [a, ...s.ancestors]));
            }
            L[_] = k;
          }
        }
        return a;
      }, args: ["comparator", "options"], multi: !0 } }, cast: { set: { from: Array.isArray, to: (a, s) => new Set(a) } }, rebuild(a) {
        a.$_terms._inclusions = [], a.$_terms._exclusions = [], a.$_terms._requireds = [];
        for (const s of a.$_terms.items) l.validateSingle(s, a), s._flags.presence === "required" ? a.$_terms._requireds.push(s) : s._flags.presence === "forbidden" ? a.$_terms._exclusions.push(s) : a.$_terms._inclusions.push(s);
        for (const s of a.$_terms.ordered) l.validateSingle(s, a);
      }, manifest: { build: (a, s) => (s.items && (a = a.items(...s.items)), s.ordered && (a = a.ordered(...s.ordered)), a) }, messages: { "array.base": "{{#label}} must be an array", "array.excludes": "{{#label}} contains an excluded value", "array.hasKnown": "{{#label}} does not contain at least one required match for type {:#patternLabel}", "array.hasUnknown": "{{#label}} does not contain at least one required match", "array.includes": "{{#label}} does not match any of the allowed types", "array.includesRequiredBoth": "{{#label}} does not contain {{#knownMisses}} and {{#unknownMisses}} other required value(s)", "array.includesRequiredKnowns": "{{#label}} does not contain {{#knownMisses}}", "array.includesRequiredUnknowns": "{{#label}} does not contain {{#unknownMisses}} required value(s)", "array.length": "{{#label}} must contain {{#limit}} items", "array.max": "{{#label}} must contain less than or equal to {{#limit}} items", "array.min": "{{#label}} must contain at least {{#limit}} items", "array.orderedLength": "{{#label}} must contain at most {{#limit}} items", "array.sort": "{{#label}} must be sorted in {#order} order by {{#by}}", "array.sort.mismatching": "{{#label}} cannot be sorted due to mismatching types", "array.sort.unsupported": "{{#label}} cannot be sorted due to unsupported type {#type}", "array.sparse": "{{#label}} must not be a sparse array item", "array.unique": "{{#label}} contains a duplicate value" } }), l.fillMissedErrors = function(a, s, p, d, y, v) {
        const S = [];
        let I = 0;
        for (const E of p) {
          const T = E._flags.label;
          T ? S.push(T) : ++I;
        }
        S.length ? I ? s.push(a.$_createError("array.includesRequiredBoth", d, { knownMisses: S, unknownMisses: I }, y, v)) : s.push(a.$_createError("array.includesRequiredKnowns", d, { knownMisses: S }, y, v)) : s.push(a.$_createError("array.includesRequiredUnknowns", d, { unknownMisses: I }, y, v));
      }, l.fillOrderedErrors = function(a, s, p, d, y, v) {
        const S = [];
        for (const I of p) I._flags.presence === "required" && S.push(I);
        S.length && l.fillMissedErrors(a, s, S, d, y, v);
      }, l.fillDefault = function(a, s, p, d) {
        const y = [];
        let v = !0;
        for (let S = a.length - 1; S >= 0; --S) {
          const I = a[S], E = [s, ...p.ancestors], T = I.$_validate(void 0, p.localize(p.path, E, I), d).value;
          if (v) {
            if (T === void 0) continue;
            v = !1;
          }
          y.unshift(T);
        }
        y.length && s.push(...y);
      }, l.fastSplice = function(a, s) {
        let p = s;
        for (; p < a.length; ) a[p++] = a[p];
        --a.length;
      }, l.validateSingle = function(a, s) {
        (a.type === "array" || a._flags._arrayItems) && (n(!s._flags.single, "Cannot specify array item with single rule enabled"), s.$_setFlag("_arrayItems", !0, { clone: !1 }));
      }, l.sort = function(a, s, p, d, y) {
        const v = p.order === "ascending" ? 1 : -1, S = -1 * v, I = v, E = (T, x) => {
          let k = l.compare(T, x, S, I);
          if (k !== null || (p.by && (T = p.by.resolve(T, d, y), x = p.by.resolve(x, d, y)), k = l.compare(T, x, S, I), k !== null)) return k;
          const _ = typeof T;
          if (_ !== typeof x) throw a.$_createError("array.sort.mismatching", s, null, d, y);
          if (_ !== "number" && _ !== "string") throw a.$_createError("array.sort.unsupported", s, { type: _ }, d, y);
          return _ === "number" ? (T - x) * v : T < x ? S : I;
        };
        try {
          return { value: s.slice().sort(E) };
        } catch (T) {
          return { errors: T };
        }
      }, l.compare = function(a, s, p, d) {
        return a === s ? 0 : a === void 0 ? 1 : s === void 0 ? -1 : a === null ? d : s === null ? p : null;
      };
    }, 4937: (u, m, f) => {
      const n = f(375), b = f(8068), h = f(8160), g = f(2036), o = { isBool: function(c) {
        return typeof c == "boolean";
      } };
      u.exports = b.extend({ type: "boolean", flags: { sensitive: { default: !1 } }, terms: { falsy: { init: null, manifest: "values" }, truthy: { init: null, manifest: "values" } }, coerce(c, { schema: l }) {
        if (typeof c != "boolean") {
          if (typeof c == "string") {
            const a = l._flags.sensitive ? c : c.toLowerCase();
            c = a === "true" || a !== "false" && c;
          }
          return typeof c != "boolean" && (c = l.$_terms.truthy && l.$_terms.truthy.has(c, null, null, !l._flags.sensitive) || (!l.$_terms.falsy || !l.$_terms.falsy.has(c, null, null, !l._flags.sensitive)) && c), { value: c };
        }
      }, validate(c, { error: l }) {
        if (typeof c != "boolean") return { value: c, errors: l("boolean.base") };
      }, rules: { truthy: { method(...c) {
        h.verifyFlat(c, "truthy");
        const l = this.clone();
        l.$_terms.truthy = l.$_terms.truthy || new g();
        for (let a = 0; a < c.length; ++a) {
          const s = c[a];
          n(s !== void 0, "Cannot call truthy with undefined"), l.$_terms.truthy.add(s);
        }
        return l;
      } }, falsy: { method(...c) {
        h.verifyFlat(c, "falsy");
        const l = this.clone();
        l.$_terms.falsy = l.$_terms.falsy || new g();
        for (let a = 0; a < c.length; ++a) {
          const s = c[a];
          n(s !== void 0, "Cannot call falsy with undefined"), l.$_terms.falsy.add(s);
        }
        return l;
      } }, sensitive: { method(c = !0) {
        return this.$_setFlag("sensitive", c);
      } } }, cast: { number: { from: o.isBool, to: (c, l) => c ? 1 : 0 }, string: { from: o.isBool, to: (c, l) => c ? "true" : "false" } }, manifest: { build: (c, l) => (l.truthy && (c = c.truthy(...l.truthy)), l.falsy && (c = c.falsy(...l.falsy)), c) }, messages: { "boolean.base": "{{#label}} must be a boolean" } });
    }, 7500: (u, m, f) => {
      const n = f(375), b = f(8068), h = f(8160), g = f(3328), o = { isDate: function(c) {
        return c instanceof Date;
      } };
      u.exports = b.extend({ type: "date", coerce: { from: ["number", "string"], method: (c, { schema: l }) => ({ value: o.parse(c, l._flags.format) || c }) }, validate(c, { schema: l, error: a, prefs: s }) {
        if (c instanceof Date && !isNaN(c.getTime())) return;
        const p = l._flags.format;
        return s.convert && p && typeof c == "string" ? { value: c, errors: a("date.format", { format: p }) } : { value: c, errors: a("date.base") };
      }, rules: { compare: { method: !1, validate(c, l, { date: a }, { name: s, operator: p, args: d }) {
        const y = a === "now" ? Date.now() : a.getTime();
        return h.compare(c.getTime(), y, p) ? c : l.error("date." + s, { limit: d.date, value: c });
      }, args: [{ name: "date", ref: !0, normalize: (c) => c === "now" ? c : o.parse(c), assert: (c) => c !== null, message: "must have a valid date format" }] }, format: { method(c) {
        return n(["iso", "javascript", "unix"].includes(c), "Unknown date format", c), this.$_setFlag("format", c);
      } }, greater: { method(c) {
        return this.$_addRule({ name: "greater", method: "compare", args: { date: c }, operator: ">" });
      } }, iso: { method() {
        return this.format("iso");
      } }, less: { method(c) {
        return this.$_addRule({ name: "less", method: "compare", args: { date: c }, operator: "<" });
      } }, max: { method(c) {
        return this.$_addRule({ name: "max", method: "compare", args: { date: c }, operator: "<=" });
      } }, min: { method(c) {
        return this.$_addRule({ name: "min", method: "compare", args: { date: c }, operator: ">=" });
      } }, timestamp: { method(c = "javascript") {
        return n(["javascript", "unix"].includes(c), '"type" must be one of "javascript, unix"'), this.format(c);
      } } }, cast: { number: { from: o.isDate, to: (c, l) => c.getTime() }, string: { from: o.isDate, to: (c, { prefs: l }) => g.date(c, l) } }, messages: { "date.base": "{{#label}} must be a valid date", "date.format": '{{#label}} must be in {msg("date.format." + #format) || #format} format', "date.greater": "{{#label}} must be greater than {{:#limit}}", "date.less": "{{#label}} must be less than {{:#limit}}", "date.max": "{{#label}} must be less than or equal to {{:#limit}}", "date.min": "{{#label}} must be greater than or equal to {{:#limit}}", "date.format.iso": "ISO 8601 date", "date.format.javascript": "timestamp or number of milliseconds", "date.format.unix": "timestamp or number of seconds" } }), o.parse = function(c, l) {
        if (c instanceof Date) return c;
        if (typeof c != "string" && (isNaN(c) || !isFinite(c)) || /^\s*$/.test(c)) return null;
        if (l === "iso") return h.isIsoDate(c) ? o.date(c.toString()) : null;
        const a = c;
        if (typeof c == "string" && /^[+-]?\d+(\.\d+)?$/.test(c) && (c = parseFloat(c)), l) {
          if (l === "javascript") return o.date(1 * c);
          if (l === "unix") return o.date(1e3 * c);
          if (typeof a == "string") return null;
        }
        return o.date(c);
      }, o.date = function(c) {
        const l = new Date(c);
        return isNaN(l.getTime()) ? null : l;
      };
    }, 390: (u, m, f) => {
      const n = f(375), b = f(7824);
      u.exports = b.extend({ type: "function", properties: { typeof: "function" }, rules: { arity: { method(h) {
        return n(Number.isSafeInteger(h) && h >= 0, "n must be a positive integer"), this.$_addRule({ name: "arity", args: { n: h } });
      }, validate: (h, g, { n: o }) => h.length === o ? h : g.error("function.arity", { n: o }) }, class: { method() {
        return this.$_addRule("class");
      }, validate: (h, g) => /^\s*class\s/.test(h.toString()) ? h : g.error("function.class", { value: h }) }, minArity: { method(h) {
        return n(Number.isSafeInteger(h) && h > 0, "n must be a strict positive integer"), this.$_addRule({ name: "minArity", args: { n: h } });
      }, validate: (h, g, { n: o }) => h.length >= o ? h : g.error("function.minArity", { n: o }) }, maxArity: { method(h) {
        return n(Number.isSafeInteger(h) && h >= 0, "n must be a positive integer"), this.$_addRule({ name: "maxArity", args: { n: h } });
      }, validate: (h, g, { n: o }) => h.length <= o ? h : g.error("function.maxArity", { n: o }) } }, messages: { "function.arity": "{{#label}} must have an arity of {{#n}}", "function.class": "{{#label}} must be a class", "function.maxArity": "{{#label}} must have an arity lesser or equal to {{#n}}", "function.minArity": "{{#label}} must have an arity greater or equal to {{#n}}" } });
    }, 7824: (u, m, f) => {
      const n = f(978), b = f(375), h = f(8571), g = f(3652), o = f(8068), c = f(8160), l = f(3292), a = f(6354), s = f(6133), p = f(3328), d = { renameDefaults: { alias: !1, multiple: !1, override: !1 } };
      u.exports = o.extend({ type: "_keys", properties: { typeof: "object" }, flags: { unknown: { default: void 0 } }, terms: { dependencies: { init: null }, keys: { init: null, manifest: { mapped: { from: "schema", to: "key" } } }, patterns: { init: null }, renames: { init: null } }, args: (y, v) => y.keys(v), validate(y, { schema: v, error: S, state: I, prefs: E }) {
        if (!y || typeof y !== v.$_property("typeof") || Array.isArray(y)) return { value: y, errors: S("object.base", { type: v.$_property("typeof") }) };
        if (!(v.$_terms.renames || v.$_terms.dependencies || v.$_terms.keys || v.$_terms.patterns || v.$_terms.externals)) return;
        y = d.clone(y, E);
        const T = [];
        if (v.$_terms.renames && !d.rename(v, y, I, E, T)) return { value: y, errors: T };
        if (!v.$_terms.keys && !v.$_terms.patterns && !v.$_terms.dependencies) return { value: y, errors: T };
        const x = new Set(Object.keys(y));
        if (v.$_terms.keys) {
          const k = [y, ...I.ancestors];
          for (const _ of v.$_terms.keys) {
            const L = _.key, N = y[L];
            x.delete(L);
            const O = I.localize([...I.path, L], k, _), j = _.schema.$_validate(N, O, E);
            if (j.errors) {
              if (E.abortEarly) return { value: y, errors: j.errors };
              j.value !== void 0 && (y[L] = j.value), T.push(...j.errors);
            } else _.schema._flags.result === "strip" || j.value === void 0 && N !== void 0 ? delete y[L] : j.value !== void 0 && (y[L] = j.value);
          }
        }
        if (x.size || v._flags._hasPatternMatch) {
          const k = d.unknown(v, y, x, T, I, E);
          if (k) return k;
        }
        if (v.$_terms.dependencies) for (const k of v.$_terms.dependencies) {
          if (k.key !== null && d.isPresent(k.options)(k.key.resolve(y, I, E, null, { shadow: !1 })) === !1) continue;
          const _ = d.dependencies[k.rel](v, k, y, I, E);
          if (_) {
            const L = v.$_createError(_.code, y, _.context, I, E);
            if (E.abortEarly) return { value: y, errors: L };
            T.push(L);
          }
        }
        return { value: y, errors: T };
      }, rules: { and: { method(...y) {
        return c.verifyFlat(y, "and"), d.dependency(this, "and", null, y);
      } }, append: { method(y) {
        return y == null || Object.keys(y).length === 0 ? this : this.keys(y);
      } }, assert: { method(y, v, S) {
        p.isTemplate(y) || (y = l.ref(y)), b(S === void 0 || typeof S == "string", "Message must be a string"), v = this.$_compile(v, { appendPath: !0 });
        const I = this.$_addRule({ name: "assert", args: { subject: y, schema: v, message: S } });
        return I.$_mutateRegister(y), I.$_mutateRegister(v), I;
      }, validate(y, { error: v, prefs: S, state: I }, { subject: E, schema: T, message: x }) {
        const k = E.resolve(y, I, S), _ = s.isRef(E) ? E.absolute(I) : [];
        return T.$_match(k, I.localize(_, [y, ...I.ancestors], T), S) ? y : v("object.assert", { subject: E, message: x });
      }, args: ["subject", "schema", "message"], multi: !0 }, instance: { method(y, v) {
        return b(typeof y == "function", "constructor must be a function"), v = v || y.name, this.$_addRule({ name: "instance", args: { constructor: y, name: v } });
      }, validate: (y, v, { constructor: S, name: I }) => y instanceof S ? y : v.error("object.instance", { type: I, value: y }), args: ["constructor", "name"] }, keys: { method(y) {
        b(y === void 0 || typeof y == "object", "Object schema must be a valid object"), b(!c.isSchema(y), "Object schema cannot be a joi schema");
        const v = this.clone();
        if (y) if (Object.keys(y).length) {
          v.$_terms.keys = v.$_terms.keys ? v.$_terms.keys.filter((S) => !y.hasOwnProperty(S.key)) : new d.Keys();
          for (const S in y) c.tryWithPath(() => v.$_terms.keys.push({ key: S, schema: this.$_compile(y[S]) }), S);
        } else v.$_terms.keys = new d.Keys();
        else v.$_terms.keys = null;
        return v.$_mutateRebuild();
      } }, length: { method(y) {
        return this.$_addRule({ name: "length", args: { limit: y }, operator: "=" });
      }, validate: (y, v, { limit: S }, { name: I, operator: E, args: T }) => c.compare(Object.keys(y).length, S, E) ? y : v.error("object." + I, { limit: T.limit, value: y }), args: [{ name: "limit", ref: !0, assert: c.limit, message: "must be a positive integer" }] }, max: { method(y) {
        return this.$_addRule({ name: "max", method: "length", args: { limit: y }, operator: "<=" });
      } }, min: { method(y) {
        return this.$_addRule({ name: "min", method: "length", args: { limit: y }, operator: ">=" });
      } }, nand: { method(...y) {
        return c.verifyFlat(y, "nand"), d.dependency(this, "nand", null, y);
      } }, or: { method(...y) {
        return c.verifyFlat(y, "or"), d.dependency(this, "or", null, y);
      } }, oxor: { method(...y) {
        return d.dependency(this, "oxor", null, y);
      } }, pattern: { method(y, v, S = {}) {
        const I = y instanceof RegExp;
        I || (y = this.$_compile(y, { appendPath: !0 })), b(v !== void 0, "Invalid rule"), c.assertOptions(S, ["fallthrough", "matches"]), I && b(!y.flags.includes("g") && !y.flags.includes("y"), "pattern should not use global or sticky mode"), v = this.$_compile(v, { appendPath: !0 });
        const E = this.clone();
        E.$_terms.patterns = E.$_terms.patterns || [];
        const T = { [I ? "regex" : "schema"]: y, rule: v };
        return S.matches && (T.matches = this.$_compile(S.matches), T.matches.type !== "array" && (T.matches = T.matches.$_root.array().items(T.matches)), E.$_mutateRegister(T.matches), E.$_setFlag("_hasPatternMatch", !0, { clone: !1 })), S.fallthrough && (T.fallthrough = !0), E.$_terms.patterns.push(T), E.$_mutateRegister(v), E;
      } }, ref: { method() {
        return this.$_addRule("ref");
      }, validate: (y, v) => s.isRef(y) ? y : v.error("object.refType", { value: y }) }, regex: { method() {
        return this.$_addRule("regex");
      }, validate: (y, v) => y instanceof RegExp ? y : v.error("object.regex", { value: y }) }, rename: { method(y, v, S = {}) {
        b(typeof y == "string" || y instanceof RegExp, "Rename missing the from argument"), b(typeof v == "string" || v instanceof p, "Invalid rename to argument"), b(v !== y, "Cannot rename key to same name:", y), c.assertOptions(S, ["alias", "ignoreUndefined", "override", "multiple"]);
        const I = this.clone();
        I.$_terms.renames = I.$_terms.renames || [];
        for (const E of I.$_terms.renames) b(E.from !== y, "Cannot rename the same key multiple times");
        return v instanceof p && I.$_mutateRegister(v), I.$_terms.renames.push({ from: y, to: v, options: n(d.renameDefaults, S) }), I;
      } }, schema: { method(y = "any") {
        return this.$_addRule({ name: "schema", args: { type: y } });
      }, validate: (y, v, { type: S }) => !c.isSchema(y) || S !== "any" && y.type !== S ? v.error("object.schema", { type: S }) : y }, unknown: { method(y) {
        return this.$_setFlag("unknown", y !== !1);
      } }, with: { method(y, v, S = {}) {
        return d.dependency(this, "with", y, v, S);
      } }, without: { method(y, v, S = {}) {
        return d.dependency(this, "without", y, v, S);
      } }, xor: { method(...y) {
        return c.verifyFlat(y, "xor"), d.dependency(this, "xor", null, y);
      } } }, overrides: { default(y, v) {
        return y === void 0 && (y = c.symbols.deepDefault), this.$_parent("default", y, v);
      } }, rebuild(y) {
        if (y.$_terms.keys) {
          const v = new g.Sorter();
          for (const S of y.$_terms.keys) c.tryWithPath(() => v.add(S, { after: S.schema.$_rootReferences(), group: S.key }), S.key);
          y.$_terms.keys = new d.Keys(...v.nodes);
        }
      }, manifest: { build(y, v) {
        if (v.keys && (y = y.keys(v.keys)), v.dependencies) for (const { rel: S, key: I = null, peers: E, options: T } of v.dependencies) y = d.dependency(y, S, I, E, T);
        if (v.patterns) for (const { regex: S, schema: I, rule: E, fallthrough: T, matches: x } of v.patterns) y = y.pattern(S || I, E, { fallthrough: T, matches: x });
        if (v.renames) for (const { from: S, to: I, options: E } of v.renames) y = y.rename(S, I, E);
        return y;
      } }, messages: { "object.and": "{{#label}} contains {{#presentWithLabels}} without its required peers {{#missingWithLabels}}", "object.assert": '{{#label}} is invalid because {if(#subject.key, `"` + #subject.key + `" failed to ` + (#message || "pass the assertion test"), #message || "the assertion failed")}', "object.base": "{{#label}} must be of type {{#type}}", "object.instance": "{{#label}} must be an instance of {{:#type}}", "object.length": '{{#label}} must have {{#limit}} key{if(#limit == 1, "", "s")}', "object.max": '{{#label}} must have less than or equal to {{#limit}} key{if(#limit == 1, "", "s")}', "object.min": '{{#label}} must have at least {{#limit}} key{if(#limit == 1, "", "s")}', "object.missing": "{{#label}} must contain at least one of {{#peersWithLabels}}", "object.nand": "{{:#mainWithLabel}} must not exist simultaneously with {{#peersWithLabels}}", "object.oxor": "{{#label}} contains a conflict between optional exclusive peers {{#peersWithLabels}}", "object.pattern.match": "{{#label}} keys failed to match pattern requirements", "object.refType": "{{#label}} must be a Joi reference", "object.regex": "{{#label}} must be a RegExp object", "object.rename.multiple": "{{#label}} cannot rename {{:#from}} because multiple renames are disabled and another key was already renamed to {{:#to}}", "object.rename.override": "{{#label}} cannot rename {{:#from}} because override is disabled and target {{:#to}} exists", "object.schema": "{{#label}} must be a Joi schema of {{#type}} type", "object.unknown": "{{#label}} is not allowed", "object.with": "{{:#mainWithLabel}} missing required peer {{:#peerWithLabel}}", "object.without": "{{:#mainWithLabel}} conflict with forbidden peer {{:#peerWithLabel}}", "object.xor": "{{#label}} contains a conflict between exclusive peers {{#peersWithLabels}}" } }), d.clone = function(y, v) {
        if (typeof y == "object") {
          if (v.nonEnumerables) return h(y, { shallow: !0 });
          const I = Object.create(Object.getPrototypeOf(y));
          return Object.assign(I, y), I;
        }
        const S = function(...I) {
          return y.apply(this, I);
        };
        return S.prototype = h(y.prototype), Object.defineProperty(S, "name", { value: y.name, writable: !1 }), Object.defineProperty(S, "length", { value: y.length, writable: !1 }), Object.assign(S, y), S;
      }, d.dependency = function(y, v, S, I, E) {
        b(S === null || typeof S == "string", v, "key must be a strings"), E || (E = I.length > 1 && typeof I[I.length - 1] == "object" ? I.pop() : {}), c.assertOptions(E, ["separator", "isPresent"]), I = [].concat(I);
        const T = c.default(E.separator, "."), x = [];
        for (const _ of I) b(typeof _ == "string", v, "peers must be strings"), x.push(l.ref(_, { separator: T, ancestor: 0, prefix: !1 }));
        S !== null && (S = l.ref(S, { separator: T, ancestor: 0, prefix: !1 }));
        const k = y.clone();
        return k.$_terms.dependencies = k.$_terms.dependencies || [], k.$_terms.dependencies.push(new d.Dependency(v, S, x, I, E)), k;
      }, d.dependencies = { and(y, v, S, I, E) {
        const T = [], x = [], k = v.peers.length, _ = d.isPresent(v.options);
        for (const L of v.peers) _(L.resolve(S, I, E, null, { shadow: !1 })) === !1 ? T.push(L.key) : x.push(L.key);
        if (T.length !== k && x.length !== k) return { code: "object.and", context: { present: x, presentWithLabels: d.keysToLabels(y, x), missing: T, missingWithLabels: d.keysToLabels(y, T) } };
      }, nand(y, v, S, I, E) {
        const T = [], x = d.isPresent(v.options);
        for (const L of v.peers) x(L.resolve(S, I, E, null, { shadow: !1 })) && T.push(L.key);
        if (T.length !== v.peers.length) return;
        const k = v.paths[0], _ = v.paths.slice(1);
        return { code: "object.nand", context: { main: k, mainWithLabel: d.keysToLabels(y, k), peers: _, peersWithLabels: d.keysToLabels(y, _) } };
      }, or(y, v, S, I, E) {
        const T = d.isPresent(v.options);
        for (const x of v.peers) if (T(x.resolve(S, I, E, null, { shadow: !1 }))) return;
        return { code: "object.missing", context: { peers: v.paths, peersWithLabels: d.keysToLabels(y, v.paths) } };
      }, oxor(y, v, S, I, E) {
        const T = [], x = d.isPresent(v.options);
        for (const _ of v.peers) x(_.resolve(S, I, E, null, { shadow: !1 })) && T.push(_.key);
        if (!T.length || T.length === 1) return;
        const k = { peers: v.paths, peersWithLabels: d.keysToLabels(y, v.paths) };
        return k.present = T, k.presentWithLabels = d.keysToLabels(y, T), { code: "object.oxor", context: k };
      }, with(y, v, S, I, E) {
        const T = d.isPresent(v.options);
        for (const x of v.peers) if (T(x.resolve(S, I, E, null, { shadow: !1 })) === !1) return { code: "object.with", context: { main: v.key.key, mainWithLabel: d.keysToLabels(y, v.key.key), peer: x.key, peerWithLabel: d.keysToLabels(y, x.key) } };
      }, without(y, v, S, I, E) {
        const T = d.isPresent(v.options);
        for (const x of v.peers) if (T(x.resolve(S, I, E, null, { shadow: !1 }))) return { code: "object.without", context: { main: v.key.key, mainWithLabel: d.keysToLabels(y, v.key.key), peer: x.key, peerWithLabel: d.keysToLabels(y, x.key) } };
      }, xor(y, v, S, I, E) {
        const T = [], x = d.isPresent(v.options);
        for (const _ of v.peers) x(_.resolve(S, I, E, null, { shadow: !1 })) && T.push(_.key);
        if (T.length === 1) return;
        const k = { peers: v.paths, peersWithLabels: d.keysToLabels(y, v.paths) };
        return T.length === 0 ? { code: "object.missing", context: k } : (k.present = T, k.presentWithLabels = d.keysToLabels(y, T), { code: "object.xor", context: k });
      } }, d.keysToLabels = function(y, v) {
        return Array.isArray(v) ? v.map((S) => y.$_mapLabels(S)) : y.$_mapLabels(v);
      }, d.isPresent = function(y) {
        return typeof y.isPresent == "function" ? y.isPresent : (v) => v !== void 0;
      }, d.rename = function(y, v, S, I, E) {
        const T = {};
        for (const x of y.$_terms.renames) {
          const k = [], _ = typeof x.from != "string";
          if (_) for (const L in v) {
            if (v[L] === void 0 && x.options.ignoreUndefined || L === x.to) continue;
            const N = x.from.exec(L);
            N && k.push({ from: L, to: x.to, match: N });
          }
          else !Object.prototype.hasOwnProperty.call(v, x.from) || v[x.from] === void 0 && x.options.ignoreUndefined || k.push(x);
          for (const L of k) {
            const N = L.from;
            let O = L.to;
            if (O instanceof p && (O = O.render(v, S, I, L.match)), N !== O) {
              if (!x.options.multiple && T[O] && (E.push(y.$_createError("object.rename.multiple", v, { from: N, to: O, pattern: _ }, S, I)), I.abortEarly) || Object.prototype.hasOwnProperty.call(v, O) && !x.options.override && !T[O] && (E.push(y.$_createError("object.rename.override", v, { from: N, to: O, pattern: _ }, S, I)), I.abortEarly)) return !1;
              v[N] === void 0 ? delete v[O] : v[O] = v[N], T[O] = !0, x.options.alias || delete v[N];
            }
          }
        }
        return !0;
      }, d.unknown = function(y, v, S, I, E, T) {
        if (y.$_terms.patterns) {
          let x = !1;
          const k = y.$_terms.patterns.map((L) => {
            if (L.matches) return x = !0, [];
          }), _ = [v, ...E.ancestors];
          for (const L of S) {
            const N = v[L], O = [...E.path, L];
            for (let j = 0; j < y.$_terms.patterns.length; ++j) {
              const G = y.$_terms.patterns[j];
              if (G.regex) {
                const V = G.regex.test(L);
                if (E.mainstay.tracer.debug(E, "rule", "pattern.".concat(j), V ? "pass" : "error"), !V) continue;
              } else if (!G.schema.$_match(L, E.nest(G.schema, "pattern.".concat(j)), T)) continue;
              S.delete(L);
              const W = E.localize(O, _, { schema: G.rule, key: L }), F = G.rule.$_validate(N, W, T);
              if (F.errors) {
                if (T.abortEarly) return { value: v, errors: F.errors };
                I.push(...F.errors);
              }
              if (G.matches && k[j].push(L), v[L] = F.value, !G.fallthrough) break;
            }
          }
          if (x) for (let L = 0; L < k.length; ++L) {
            const N = k[L];
            if (!N) continue;
            const O = y.$_terms.patterns[L].matches, j = E.localize(E.path, _, O), G = O.$_validate(N, j, T);
            if (G.errors) {
              const W = a.details(G.errors, { override: !1 });
              W.matches = N;
              const F = y.$_createError("object.pattern.match", v, W, E, T);
              if (T.abortEarly) return { value: v, errors: F };
              I.push(F);
            }
          }
        }
        if (S.size && (y.$_terms.keys || y.$_terms.patterns)) {
          if (T.stripUnknown && y._flags.unknown === void 0 || T.skipFunctions) {
            const x = !(!T.stripUnknown || T.stripUnknown !== !0 && !T.stripUnknown.objects);
            for (const k of S) x ? (delete v[k], S.delete(k)) : typeof v[k] == "function" && S.delete(k);
          }
          if (!c.default(y._flags.unknown, T.allowUnknown)) for (const x of S) {
            const k = E.localize([...E.path, x], []), _ = y.$_createError("object.unknown", v[x], { child: x }, k, T, { flags: !1 });
            if (T.abortEarly) return { value: v, errors: _ };
            I.push(_);
          }
        }
      }, d.Dependency = class {
        constructor(y, v, S, I, E) {
          this.rel = y, this.key = v, this.peers = S, this.paths = I, this.options = E;
        }
        describe() {
          const y = { rel: this.rel, peers: this.paths };
          return this.key !== null && (y.key = this.key.key), this.peers[0].separator !== "." && (y.options = we(J({}, y.options), { separator: this.peers[0].separator })), this.options.isPresent && (y.options = we(J({}, y.options), { isPresent: this.options.isPresent })), y;
        }
      }, d.Keys = class extends Array {
        concat(y) {
          const v = this.slice(), S = /* @__PURE__ */ new Map();
          for (let I = 0; I < v.length; ++I) S.set(v[I].key, I);
          for (const I of y) {
            const E = I.key, T = S.get(E);
            T !== void 0 ? v[T] = { key: E, schema: v[T].schema.concat(I.schema) } : v.push(I);
          }
          return v;
        }
      };
    }, 8785: (u, m, f) => {
      const n = f(375), b = f(8068), h = f(8160), g = f(3292), o = f(6354), c = {};
      u.exports = b.extend({ type: "link", properties: { schemaChain: !0 }, terms: { link: { init: null, manifest: "single", register: !1 } }, args: (l, a) => l.ref(a), validate(l, { schema: a, state: s, prefs: p }) {
        n(a.$_terms.link, "Uninitialized link schema");
        const d = c.generate(a, l, s, p), y = a.$_terms.link[0].ref;
        return d.$_validate(l, s.nest(d, "link:".concat(y.display, ":").concat(d.type)), p);
      }, generate: (l, a, s, p) => c.generate(l, a, s, p), rules: { ref: { method(l) {
        n(!this.$_terms.link, "Cannot reinitialize schema"), l = g.ref(l), n(l.type === "value" || l.type === "local", "Invalid reference type:", l.type), n(l.type === "local" || l.ancestor === "root" || l.ancestor > 0, "Link cannot reference itself");
        const a = this.clone();
        return a.$_terms.link = [{ ref: l }], a;
      } }, relative: { method(l = !0) {
        return this.$_setFlag("relative", l);
      } } }, overrides: { concat(l) {
        n(this.$_terms.link, "Uninitialized link schema"), n(h.isSchema(l), "Invalid schema object"), n(l.type !== "link", "Cannot merge type link with another link");
        const a = this.clone();
        return a.$_terms.whens || (a.$_terms.whens = []), a.$_terms.whens.push({ concat: l }), a.$_mutateRebuild();
      } }, manifest: { build: (l, a) => (n(a.link, "Invalid link description missing link"), l.ref(a.link)) } }), c.generate = function(l, a, s, p) {
        let d = s.mainstay.links.get(l);
        if (d) return d._generate(a, s, p).schema;
        const y = l.$_terms.link[0].ref, { perspective: v, path: S } = c.perspective(y, s);
        c.assert(v, "which is outside of schema boundaries", y, l, s, p);
        try {
          d = S.length ? v.$_reach(S) : v;
        } catch (I) {
          c.assert(!1, "to non-existing schema", y, l, s, p);
        }
        return c.assert(d.type !== "link", "which is another link", y, l, s, p), l._flags.relative || s.mainstay.links.set(l, d), d._generate(a, s, p).schema;
      }, c.perspective = function(l, a) {
        if (l.type === "local") {
          for (const { schema: s, key: p } of a.schemas) {
            if ((s._flags.id || p) === l.path[0]) return { perspective: s, path: l.path.slice(1) };
            if (s.$_terms.shared) {
              for (const d of s.$_terms.shared) if (d._flags.id === l.path[0]) return { perspective: d, path: l.path.slice(1) };
            }
          }
          return { perspective: null, path: null };
        }
        return l.ancestor === "root" ? { perspective: a.schemas[a.schemas.length - 1].schema, path: l.path } : { perspective: a.schemas[l.ancestor] && a.schemas[l.ancestor].schema, path: l.path };
      }, c.assert = function(l, a, s, p, d, y) {
        l || n(!1, '"'.concat(o.label(p._flags, d, y), '" contains link reference "').concat(s.display, '" ').concat(a));
      };
    }, 3832: (u, m, f) => {
      const n = f(375), b = f(8068), h = f(8160), g = { numberRx: /^\s*[+-]?(?:(?:\d+(?:\.\d*)?)|(?:\.\d+))(?:e([+-]?\d+))?\s*$/i, precisionRx: /(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/, exponentialPartRegex: /[eE][+-]?\d+$/, leadingSignAndZerosRegex: /^[+-]?(0*)?/, dotRegex: /\./, trailingZerosRegex: /0+$/, decimalPlaces(o) {
        const c = o.toString(), l = c.indexOf("."), a = c.indexOf("e");
        return (l < 0 ? 0 : (a < 0 ? c.length : a) - l - 1) + (a < 0 ? 0 : Math.max(0, -parseInt(c.slice(a + 1))));
      } };
      u.exports = b.extend({ type: "number", flags: { unsafe: { default: !1 } }, coerce: { from: "string", method(o, { schema: c, error: l }) {
        if (!o.match(g.numberRx)) return;
        o = o.trim();
        const a = { value: parseFloat(o) };
        if (a.value === 0 && (a.value = 0), !c._flags.unsafe) if (o.match(/e/i)) {
          if (g.extractSignificantDigits(o) !== g.extractSignificantDigits(String(a.value))) return a.errors = l("number.unsafe"), a;
        } else {
          const s = a.value.toString();
          if (s.match(/e/i)) return a;
          if (s !== g.normalizeDecimal(o)) return a.errors = l("number.unsafe"), a;
        }
        return a;
      } }, validate(o, { schema: c, error: l, prefs: a }) {
        if (o === 1 / 0 || o === -1 / 0) return { value: o, errors: l("number.infinity") };
        if (!h.isNumber(o)) return { value: o, errors: l("number.base") };
        const s = { value: o };
        if (a.convert) {
          const p = c.$_getRule("precision");
          if (p) {
            const d = Math.pow(10, p.args.limit);
            s.value = Math.round(s.value * d) / d;
          }
        }
        return s.value === 0 && (s.value = 0), !c._flags.unsafe && (o > Number.MAX_SAFE_INTEGER || o < Number.MIN_SAFE_INTEGER) && (s.errors = l("number.unsafe")), s;
      }, rules: { compare: { method: !1, validate: (o, c, { limit: l }, { name: a, operator: s, args: p }) => h.compare(o, l, s) ? o : c.error("number." + a, { limit: p.limit, value: o }), args: [{ name: "limit", ref: !0, assert: h.isNumber, message: "must be a number" }] }, greater: { method(o) {
        return this.$_addRule({ name: "greater", method: "compare", args: { limit: o }, operator: ">" });
      } }, integer: { method() {
        return this.$_addRule("integer");
      }, validate: (o, c) => Math.trunc(o) - o == 0 ? o : c.error("number.integer") }, less: { method(o) {
        return this.$_addRule({ name: "less", method: "compare", args: { limit: o }, operator: "<" });
      } }, max: { method(o) {
        return this.$_addRule({ name: "max", method: "compare", args: { limit: o }, operator: "<=" });
      } }, min: { method(o) {
        return this.$_addRule({ name: "min", method: "compare", args: { limit: o }, operator: ">=" });
      } }, multiple: { method(o) {
        const c = typeof o == "number" ? g.decimalPlaces(o) : null, l = Math.pow(10, c);
        return this.$_addRule({ name: "multiple", args: { base: o, baseDecimalPlace: c, pfactor: l } });
      }, validate: (o, c, { base: l, baseDecimalPlace: a, pfactor: s }, p) => g.decimalPlaces(o) > a ? c.error("number.multiple", { multiple: p.args.base, value: o }) : Math.round(s * o) % Math.round(s * l) == 0 ? o : c.error("number.multiple", { multiple: p.args.base, value: o }), args: [{ name: "base", ref: !0, assert: (o) => typeof o == "number" && isFinite(o) && o > 0, message: "must be a positive number" }, "baseDecimalPlace", "pfactor"], multi: !0 }, negative: { method() {
        return this.sign("negative");
      } }, port: { method() {
        return this.$_addRule("port");
      }, validate: (o, c) => Number.isSafeInteger(o) && o >= 0 && o <= 65535 ? o : c.error("number.port") }, positive: { method() {
        return this.sign("positive");
      } }, precision: { method(o) {
        return n(Number.isSafeInteger(o), "limit must be an integer"), this.$_addRule({ name: "precision", args: { limit: o } });
      }, validate(o, c, { limit: l }) {
        const a = o.toString().match(g.precisionRx);
        return Math.max((a[1] ? a[1].length : 0) - (a[2] ? parseInt(a[2], 10) : 0), 0) <= l ? o : c.error("number.precision", { limit: l, value: o });
      }, convert: !0 }, sign: { method(o) {
        return n(["negative", "positive"].includes(o), "Invalid sign", o), this.$_addRule({ name: "sign", args: { sign: o } });
      }, validate: (o, c, { sign: l }) => l === "negative" && o < 0 || l === "positive" && o > 0 ? o : c.error("number.".concat(l)) }, unsafe: { method(o = !0) {
        return n(typeof o == "boolean", "enabled must be a boolean"), this.$_setFlag("unsafe", o);
      } } }, cast: { string: { from: (o) => typeof o == "number", to: (o, c) => o.toString() } }, messages: { "number.base": "{{#label}} must be a number", "number.greater": "{{#label}} must be greater than {{#limit}}", "number.infinity": "{{#label}} cannot be infinity", "number.integer": "{{#label}} must be an integer", "number.less": "{{#label}} must be less than {{#limit}}", "number.max": "{{#label}} must be less than or equal to {{#limit}}", "number.min": "{{#label}} must be greater than or equal to {{#limit}}", "number.multiple": "{{#label}} must be a multiple of {{#multiple}}", "number.negative": "{{#label}} must be a negative number", "number.port": "{{#label}} must be a valid port", "number.positive": "{{#label}} must be a positive number", "number.precision": "{{#label}} must have no more than {{#limit}} decimal places", "number.unsafe": "{{#label}} must be a safe number" } }), g.extractSignificantDigits = function(o) {
        return o.replace(g.exponentialPartRegex, "").replace(g.dotRegex, "").replace(g.trailingZerosRegex, "").replace(g.leadingSignAndZerosRegex, "");
      }, g.normalizeDecimal = function(o) {
        return (o = o.replace(/^\+/, "").replace(/\.0*$/, "").replace(/^(-?)\.([^\.]*)$/, "$10.$2").replace(/^(-?)0+([0-9])/, "$1$2")).includes(".") && o.endsWith("0") && (o = o.replace(/0+$/, "")), o === "-0" ? "0" : o;
      };
    }, 8966: (u, m, f) => {
      const n = f(7824);
      u.exports = n.extend({ type: "object", cast: { map: { from: (b) => b && typeof b == "object", to: (b, h) => new Map(Object.entries(b)) } } });
    }, 7417: (u, m, f) => {
      const n = f(375), b = f(5380), h = f(1745), g = f(9959), o = f(6064), c = f(9926), l = f(5752), a = f(8068), s = f(8160), p = { tlds: c instanceof Set && { tlds: { allow: c, deny: null } }, base64Regex: { true: { true: /^(?:[\w\-]{2}[\w\-]{2})*(?:[\w\-]{2}==|[\w\-]{3}=)?$/, false: /^(?:[A-Za-z0-9+\/]{2}[A-Za-z0-9+\/]{2})*(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=)?$/ }, false: { true: /^(?:[\w\-]{2}[\w\-]{2})*(?:[\w\-]{2}(==)?|[\w\-]{3}=?)?$/, false: /^(?:[A-Za-z0-9+\/]{2}[A-Za-z0-9+\/]{2})*(?:[A-Za-z0-9+\/]{2}(==)?|[A-Za-z0-9+\/]{3}=?)?$/ } }, dataUriRegex: /^data:[\w+.-]+\/[\w+.-]+;((charset=[\w-]+|base64),)?(.*)$/, hexRegex: { withPrefix: /^0x[0-9a-f]+$/i, withOptionalPrefix: /^(?:0x)?[0-9a-f]+$/i, withoutPrefix: /^[0-9a-f]+$/i }, ipRegex: g.regex({ cidr: "forbidden" }).regex, isoDurationRegex: /^P(?!$)(\d+Y)?(\d+M)?(\d+W)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+S)?)?$/, guidBrackets: { "{": "}", "[": "]", "(": ")", "": "" }, guidVersions: { uuidv1: "1", uuidv2: "2", uuidv3: "3", uuidv4: "4", uuidv5: "5", uuidv6: "6", uuidv7: "7", uuidv8: "8" }, guidSeparators: /* @__PURE__ */ new Set([void 0, !0, !1, "-", ":"]), normalizationForms: ["NFC", "NFD", "NFKC", "NFKD"] };
      u.exports = a.extend({ type: "string", flags: { insensitive: { default: !1 }, truncate: { default: !1 } }, terms: { replacements: { init: null } }, coerce: { from: "string", method(d, { schema: y, state: v, prefs: S }) {
        const I = y.$_getRule("normalize");
        I && (d = d.normalize(I.args.form));
        const E = y.$_getRule("case");
        E && (d = E.args.direction === "upper" ? d.toLocaleUpperCase() : d.toLocaleLowerCase());
        const T = y.$_getRule("trim");
        if (T && T.args.enabled && (d = d.trim()), y.$_terms.replacements) for (const k of y.$_terms.replacements) d = d.replace(k.pattern, k.replacement);
        const x = y.$_getRule("hex");
        if (x && x.args.options.byteAligned && d.length % 2 != 0 && (d = "0".concat(d)), y.$_getRule("isoDate")) {
          const k = p.isoDate(d);
          k && (d = k);
        }
        if (y._flags.truncate) {
          const k = y.$_getRule("max");
          if (k) {
            let _ = k.args.limit;
            if (s.isResolvable(_) && (_ = _.resolve(d, v, S), !s.limit(_))) return { value: d, errors: y.$_createError("any.ref", _, { ref: k.args.limit, arg: "limit", reason: "must be a positive integer" }, v, S) };
            d = d.slice(0, _);
          }
        }
        return { value: d };
      } }, validate(d, { schema: y, error: v }) {
        if (typeof d != "string") return { value: d, errors: v("string.base") };
        if (d === "") {
          const S = y.$_getRule("min");
          return S && S.args.limit === 0 ? void 0 : { value: d, errors: v("string.empty") };
        }
      }, rules: { alphanum: { method() {
        return this.$_addRule("alphanum");
      }, validate: (d, y) => /^[a-zA-Z0-9]+$/.test(d) ? d : y.error("string.alphanum") }, base64: { method(d = {}) {
        return s.assertOptions(d, ["paddingRequired", "urlSafe"]), d = J({ urlSafe: !1, paddingRequired: !0 }, d), n(typeof d.paddingRequired == "boolean", "paddingRequired must be boolean"), n(typeof d.urlSafe == "boolean", "urlSafe must be boolean"), this.$_addRule({ name: "base64", args: { options: d } });
      }, validate: (d, y, { options: v }) => p.base64Regex[v.paddingRequired][v.urlSafe].test(d) ? d : y.error("string.base64") }, case: { method(d) {
        return n(["lower", "upper"].includes(d), "Invalid case:", d), this.$_addRule({ name: "case", args: { direction: d } });
      }, validate: (d, y, { direction: v }) => v === "lower" && d === d.toLocaleLowerCase() || v === "upper" && d === d.toLocaleUpperCase() ? d : y.error("string.".concat(v, "case")), convert: !0 }, creditCard: { method() {
        return this.$_addRule("creditCard");
      }, validate(d, y) {
        let v = d.length, S = 0, I = 1;
        for (; v--; ) {
          const E = d.charAt(v) * I;
          S += E - 9 * (E > 9), I ^= 3;
        }
        return S > 0 && S % 10 == 0 ? d : y.error("string.creditCard");
      } }, dataUri: { method(d = {}) {
        return s.assertOptions(d, ["paddingRequired"]), d = J({ paddingRequired: !0 }, d), n(typeof d.paddingRequired == "boolean", "paddingRequired must be boolean"), this.$_addRule({ name: "dataUri", args: { options: d } });
      }, validate(d, y, { options: v }) {
        const S = d.match(p.dataUriRegex);
        return S && (!S[2] || S[2] !== "base64" || p.base64Regex[v.paddingRequired].false.test(S[3])) ? d : y.error("string.dataUri");
      } }, domain: { method(d) {
        d && s.assertOptions(d, ["allowFullyQualified", "allowUnicode", "maxDomainSegments", "minDomainSegments", "tlds"]);
        const y = p.addressOptions(d);
        return this.$_addRule({ name: "domain", args: { options: d }, address: y });
      }, validate: (d, y, v, { address: S }) => b.isValid(d, S) ? d : y.error("string.domain") }, email: { method(d = {}) {
        s.assertOptions(d, ["allowFullyQualified", "allowUnicode", "ignoreLength", "maxDomainSegments", "minDomainSegments", "multiple", "separator", "tlds"]), n(d.multiple === void 0 || typeof d.multiple == "boolean", "multiple option must be an boolean");
        const y = p.addressOptions(d), v = new RegExp("\\s*[".concat(d.separator ? o(d.separator) : ",", "]\\s*"));
        return this.$_addRule({ name: "email", args: { options: d }, regex: v, address: y });
      }, validate(d, y, { options: v }, { regex: S, address: I }) {
        const E = v.multiple ? d.split(S) : [d], T = [];
        for (const x of E) h.isValid(x, I) || T.push(x);
        return T.length ? y.error("string.email", { value: d, invalids: T }) : d;
      } }, guid: { alias: "uuid", method(d = {}) {
        s.assertOptions(d, ["version", "separator"]);
        let y = "";
        if (d.version) {
          const I = [].concat(d.version);
          n(I.length >= 1, "version must have at least 1 valid version specified");
          const E = /* @__PURE__ */ new Set();
          for (let T = 0; T < I.length; ++T) {
            const x = I[T];
            n(typeof x == "string", "version at position " + T + " must be a string");
            const k = p.guidVersions[x.toLowerCase()];
            n(k, "version at position " + T + " must be one of " + Object.keys(p.guidVersions).join(", ")), n(!E.has(k), "version at position " + T + " must not be a duplicate"), y += k, E.add(k);
          }
        }
        n(p.guidSeparators.has(d.separator), 'separator must be one of true, false, "-", or ":"');
        const v = d.separator === void 0 ? "[:-]?" : d.separator === !0 ? "[:-]" : d.separator === !1 ? "[]?" : "\\".concat(d.separator), S = new RegExp("^([\\[{\\(]?)[0-9A-F]{8}(".concat(v, ")[0-9A-F]{4}\\2?[").concat(y || "0-9A-F", "][0-9A-F]{3}\\2?[").concat(y ? "89AB" : "0-9A-F", "][0-9A-F]{3}\\2?[0-9A-F]{12}([\\]}\\)]?)$"), "i");
        return this.$_addRule({ name: "guid", args: { options: d }, regex: S });
      }, validate(d, y, v, { regex: S }) {
        const I = S.exec(d);
        return I ? p.guidBrackets[I[1]] !== I[I.length - 1] ? y.error("string.guid") : d : y.error("string.guid");
      } }, hex: { method(d = {}) {
        return s.assertOptions(d, ["byteAligned", "prefix"]), d = J({ byteAligned: !1, prefix: !1 }, d), n(typeof d.byteAligned == "boolean", "byteAligned must be boolean"), n(typeof d.prefix == "boolean" || d.prefix === "optional", 'prefix must be boolean or "optional"'), this.$_addRule({ name: "hex", args: { options: d } });
      }, validate: (d, y, { options: v }) => (v.prefix === "optional" ? p.hexRegex.withOptionalPrefix : v.prefix === !0 ? p.hexRegex.withPrefix : p.hexRegex.withoutPrefix).test(d) ? v.byteAligned && d.length % 2 != 0 ? y.error("string.hexAlign") : d : y.error("string.hex") }, hostname: { method() {
        return this.$_addRule("hostname");
      }, validate: (d, y) => b.isValid(d, { minDomainSegments: 1 }) || p.ipRegex.test(d) ? d : y.error("string.hostname") }, insensitive: { method() {
        return this.$_setFlag("insensitive", !0);
      } }, ip: { method(d = {}) {
        s.assertOptions(d, ["cidr", "version"]);
        const { cidr: y, versions: v, regex: S } = g.regex(d), I = d.version ? v : void 0;
        return this.$_addRule({ name: "ip", args: { options: { cidr: y, version: I } }, regex: S });
      }, validate: (d, y, { options: v }, { regex: S }) => S.test(d) ? d : v.version ? y.error("string.ipVersion", { value: d, cidr: v.cidr, version: v.version }) : y.error("string.ip", { value: d, cidr: v.cidr }) }, isoDate: { method() {
        return this.$_addRule("isoDate");
      }, validate: (d, { error: y }) => p.isoDate(d) ? d : y("string.isoDate") }, isoDuration: { method() {
        return this.$_addRule("isoDuration");
      }, validate: (d, y) => p.isoDurationRegex.test(d) ? d : y.error("string.isoDuration") }, length: { method(d, y) {
        return p.length(this, "length", d, "=", y);
      }, validate(d, y, { limit: v, encoding: S }, { name: I, operator: E, args: T }) {
        const x = !S && d.length;
        return s.compare(x, v, E) ? d : y.error("string." + I, { limit: T.limit, value: d, encoding: S });
      }, args: [{ name: "limit", ref: !0, assert: s.limit, message: "must be a positive integer" }, "encoding"] }, lowercase: { method() {
        return this.case("lower");
      } }, max: { method(d, y) {
        return p.length(this, "max", d, "<=", y);
      }, args: ["limit", "encoding"] }, min: { method(d, y) {
        return p.length(this, "min", d, ">=", y);
      }, args: ["limit", "encoding"] }, normalize: { method(d = "NFC") {
        return n(p.normalizationForms.includes(d), "normalization form must be one of " + p.normalizationForms.join(", ")), this.$_addRule({ name: "normalize", args: { form: d } });
      }, validate: (d, { error: y }, { form: v }) => d === d.normalize(v) ? d : y("string.normalize", { value: d, form: v }), convert: !0 }, pattern: { alias: "regex", method(d, y = {}) {
        n(d instanceof RegExp, "regex must be a RegExp"), n(!d.flags.includes("g") && !d.flags.includes("y"), "regex should not use global or sticky mode"), typeof y == "string" && (y = { name: y }), s.assertOptions(y, ["invert", "name"]);
        const v = ["string.pattern", y.invert ? ".invert" : "", y.name ? ".name" : ".base"].join("");
        return this.$_addRule({ name: "pattern", args: { regex: d, options: y }, errorCode: v });
      }, validate: (d, y, { regex: v, options: S }, { errorCode: I }) => v.test(d) ^ S.invert ? d : y.error(I, { name: S.name, regex: v, value: d }), args: ["regex", "options"], multi: !0 }, replace: { method(d, y) {
        typeof d == "string" && (d = new RegExp(o(d), "g")), n(d instanceof RegExp, "pattern must be a RegExp"), n(typeof y == "string", "replacement must be a String");
        const v = this.clone();
        return v.$_terms.replacements || (v.$_terms.replacements = []), v.$_terms.replacements.push({ pattern: d, replacement: y }), v;
      } }, token: { method() {
        return this.$_addRule("token");
      }, validate: (d, y) => /^\w+$/.test(d) ? d : y.error("string.token") }, trim: { method(d = !0) {
        return n(typeof d == "boolean", "enabled must be a boolean"), this.$_addRule({ name: "trim", args: { enabled: d } });
      }, validate: (d, y, { enabled: v }) => v && d !== d.trim() ? y.error("string.trim") : d, convert: !0 }, truncate: { method(d = !0) {
        return n(typeof d == "boolean", "enabled must be a boolean"), this.$_setFlag("truncate", d);
      } }, uppercase: { method() {
        return this.case("upper");
      } }, uri: { method(d = {}) {
        s.assertOptions(d, ["allowRelative", "allowQuerySquareBrackets", "domain", "relativeOnly", "scheme", "encodeUri"]), d.domain && s.assertOptions(d.domain, ["allowFullyQualified", "allowUnicode", "maxDomainSegments", "minDomainSegments", "tlds"]);
        const { regex: y, scheme: v } = l.regex(d), S = d.domain ? p.addressOptions(d.domain) : null;
        return this.$_addRule({ name: "uri", args: { options: d }, regex: y, domain: S, scheme: v });
      }, validate(d, y, { options: v }, { regex: S, domain: I, scheme: E }) {
        if (["http:/", "https:/"].includes(d)) return y.error("string.uri");
        let T = S.exec(d);
        if (!T && y.prefs.convert && v.encodeUri) {
          const x = encodeURI(d);
          T = S.exec(x), T && (d = x);
        }
        if (T) {
          const x = T[1] || T[2];
          return !I || v.allowRelative && !x || b.isValid(x, I) ? d : y.error("string.domain", { value: x });
        }
        return v.relativeOnly ? y.error("string.uriRelativeOnly") : v.scheme ? y.error("string.uriCustomScheme", { scheme: E, value: d }) : y.error("string.uri");
      } } }, manifest: { build(d, y) {
        if (y.replacements) for (const { pattern: v, replacement: S } of y.replacements) d = d.replace(v, S);
        return d;
      } }, messages: { "string.alphanum": "{{#label}} must only contain alpha-numeric characters", "string.base": "{{#label}} must be a string", "string.base64": "{{#label}} must be a valid base64 string", "string.creditCard": "{{#label}} must be a credit card", "string.dataUri": "{{#label}} must be a valid dataUri string", "string.domain": "{{#label}} must contain a valid domain name", "string.email": "{{#label}} must be a valid email", "string.empty": "{{#label}} is not allowed to be empty", "string.guid": "{{#label}} must be a valid GUID", "string.hex": "{{#label}} must only contain hexadecimal characters", "string.hexAlign": "{{#label}} hex decoded representation must be byte aligned", "string.hostname": "{{#label}} must be a valid hostname", "string.ip": "{{#label}} must be a valid ip address with a {{#cidr}} CIDR", "string.ipVersion": "{{#label}} must be a valid ip address of one of the following versions {{#version}} with a {{#cidr}} CIDR", "string.isoDate": "{{#label}} must be in iso format", "string.isoDuration": "{{#label}} must be a valid ISO 8601 duration", "string.length": "{{#label}} length must be {{#limit}} characters long", "string.lowercase": "{{#label}} must only contain lowercase characters", "string.max": "{{#label}} length must be less than or equal to {{#limit}} characters long", "string.min": "{{#label}} length must be at least {{#limit}} characters long", "string.normalize": "{{#label}} must be unicode normalized in the {{#form}} form", "string.token": "{{#label}} must only contain alpha-numeric and underscore characters", "string.pattern.base": "{{#label}} with value {:[.]} fails to match the required pattern: {{#regex}}", "string.pattern.name": "{{#label}} with value {:[.]} fails to match the {{#name}} pattern", "string.pattern.invert.base": "{{#label}} with value {:[.]} matches the inverted pattern: {{#regex}}", "string.pattern.invert.name": "{{#label}} with value {:[.]} matches the inverted {{#name}} pattern", "string.trim": "{{#label}} must not have leading or trailing whitespace", "string.uri": "{{#label}} must be a valid uri", "string.uriCustomScheme": "{{#label}} must be a valid uri with a scheme matching the {{#scheme}} pattern", "string.uriRelativeOnly": "{{#label}} must be a valid relative uri", "string.uppercase": "{{#label}} must only contain uppercase characters" } }), p.addressOptions = function(d) {
        if (!d) return p.tlds || d;
        if (n(d.minDomainSegments === void 0 || Number.isSafeInteger(d.minDomainSegments) && d.minDomainSegments > 0, "minDomainSegments must be a positive integer"), n(d.maxDomainSegments === void 0 || Number.isSafeInteger(d.maxDomainSegments) && d.maxDomainSegments > 0, "maxDomainSegments must be a positive integer"), d.tlds === !1) return d;
        if (d.tlds === !0 || d.tlds === void 0) return n(p.tlds, "Built-in TLD list disabled"), Object.assign({}, d, p.tlds);
        n(typeof d.tlds == "object", "tlds must be true, false, or an object");
        const y = d.tlds.deny;
        if (y) return Array.isArray(y) && (d = Object.assign({}, d, { tlds: { deny: new Set(y) } })), n(d.tlds.deny instanceof Set, "tlds.deny must be an array, Set, or boolean"), n(!d.tlds.allow, "Cannot specify both tlds.allow and tlds.deny lists"), p.validateTlds(d.tlds.deny, "tlds.deny"), d;
        const v = d.tlds.allow;
        return v ? v === !0 ? (n(p.tlds, "Built-in TLD list disabled"), Object.assign({}, d, p.tlds)) : (Array.isArray(v) && (d = Object.assign({}, d, { tlds: { allow: new Set(v) } })), n(d.tlds.allow instanceof Set, "tlds.allow must be an array, Set, or boolean"), p.validateTlds(d.tlds.allow, "tlds.allow"), d) : d;
      }, p.validateTlds = function(d, y) {
        for (const v of d) n(b.isValid(v, { minDomainSegments: 1, maxDomainSegments: 1 }), "".concat(y, " must contain valid top level domain names"));
      }, p.isoDate = function(d) {
        if (!s.isIsoDate(d)) return null;
        /.*T.*[+-]\d\d$/.test(d) && (d += "00");
        const y = new Date(d);
        return isNaN(y.getTime()) ? null : y.toISOString();
      }, p.length = function(d, y, v, S, I) {
        return n(!I || !1, "Invalid encoding:", I), d.$_addRule({ name: y, method: "length", args: { limit: v, encoding: I }, operator: S });
      };
    }, 8826: (u, m, f) => {
      const n = f(375), b = f(8068), h = {};
      h.Map = class extends Map {
        slice() {
          return new h.Map(this);
        }
      }, u.exports = b.extend({ type: "symbol", terms: { map: { init: new h.Map() } }, coerce: { method(g, { schema: o, error: c }) {
        const l = o.$_terms.map.get(g);
        return l && (g = l), o._flags.only && typeof g != "symbol" ? { value: g, errors: c("symbol.map", { map: o.$_terms.map }) } : { value: g };
      } }, validate(g, { error: o }) {
        if (typeof g != "symbol") return { value: g, errors: o("symbol.base") };
      }, rules: { map: { method(g) {
        g && !g[Symbol.iterator] && typeof g == "object" && (g = Object.entries(g)), n(g && g[Symbol.iterator], "Iterable must be an iterable or object");
        const o = this.clone(), c = [];
        for (const l of g) {
          n(l && l[Symbol.iterator], "Entry must be an iterable");
          const [a, s] = l;
          n(typeof a != "object" && typeof a != "function" && typeof a != "symbol", "Key must not be of type object, function, or Symbol"), n(typeof s == "symbol", "Value must be a Symbol"), o.$_terms.map.set(a, s), c.push(s);
        }
        return o.valid(...c);
      } } }, manifest: { build: (g, o) => (o.map && (g = g.map(o.map)), g) }, messages: { "symbol.base": "{{#label}} must be a symbol", "symbol.map": "{{#label}} must be one of {{#map}}" } });
    }, 8863: (u, m, f) => {
      const n = f(375), b = f(8571), h = f(738), g = f(9621), o = f(8160), c = f(6354), l = f(493), a = { result: Symbol("result") };
      m.entry = function(s, p, d) {
        let y = o.defaults;
        d && (n(d.warnings === void 0, "Cannot override warnings preference in synchronous validation"), n(d.artifacts === void 0, "Cannot override artifacts preference in synchronous validation"), y = o.preferences(o.defaults, d));
        const v = a.entry(s, p, y);
        n(!v.mainstay.externals.length, "Schema with external rules must use validateAsync()");
        const S = { value: v.value };
        return v.error && (S.error = v.error), v.mainstay.warnings.length && (S.warning = c.details(v.mainstay.warnings)), v.mainstay.debug && (S.debug = v.mainstay.debug), v.mainstay.artifacts && (S.artifacts = v.mainstay.artifacts), S;
      }, m.entryAsync = async function(s, p, d) {
        let y = o.defaults;
        d && (y = o.preferences(o.defaults, d));
        const v = a.entry(s, p, y), S = v.mainstay;
        if (v.error) throw S.debug && (v.error.debug = S.debug), v.error;
        if (S.externals.length) {
          let E = v.value;
          const T = [];
          for (const x of S.externals) {
            const k = x.state.path, _ = x.schema.type === "link" ? S.links.get(x.schema) : null;
            let L, N, O = E;
            const j = k.length ? [E] : [], G = k.length ? g(s, k) : s;
            if (k.length) {
              L = k[k.length - 1];
              let W = E;
              for (const F of k.slice(0, -1)) W = W[F], j.unshift(W);
              N = j[0], O = N[L];
            }
            try {
              const W = (V, X) => (_ || x.schema).$_createError(V, O, X, x.state, y), F = await x.method(O, { schema: x.schema, linked: _, state: x.state, prefs: d, original: G, error: W, errorsArray: a.errorsArray, warn: (V, X) => S.warnings.push((_ || x.schema).$_createError(V, O, X, x.state, y)), message: (V, X) => (_ || x.schema).$_createError("external", O, X, x.state, y, { messages: V }) });
              if (F === void 0 || F === O) continue;
              if (F instanceof c.Report) {
                if (S.tracer.log(x.schema, x.state, "rule", "external", "error"), T.push(F), y.abortEarly) break;
                continue;
              }
              if (Array.isArray(F) && F[o.symbols.errors]) {
                if (S.tracer.log(x.schema, x.state, "rule", "external", "error"), T.push(...F), y.abortEarly) break;
                continue;
              }
              N ? (S.tracer.value(x.state, "rule", O, F, "external"), N[L] = F) : (S.tracer.value(x.state, "rule", E, F, "external"), E = F);
            } catch (W) {
              throw y.errors.label && (W.message += " (".concat(x.label, ")")), W;
            }
          }
          if (v.value = E, T.length) throw v.error = c.process(T, s, y), S.debug && (v.error.debug = S.debug), v.error;
        }
        if (!y.warnings && !y.debug && !y.artifacts) return v.value;
        const I = { value: v.value };
        return S.warnings.length && (I.warning = c.details(S.warnings)), S.debug && (I.debug = S.debug), S.artifacts && (I.artifacts = S.artifacts), I;
      }, a.Mainstay = class {
        constructor(s, p, d) {
          this.externals = [], this.warnings = [], this.tracer = s, this.debug = p, this.links = d, this.shadow = null, this.artifacts = null, this._snapshots = [];
        }
        snapshot() {
          this._snapshots.push({ externals: this.externals.slice(), warnings: this.warnings.slice() });
        }
        restore() {
          const s = this._snapshots.pop();
          this.externals = s.externals, this.warnings = s.warnings;
        }
        commit() {
          this._snapshots.pop();
        }
      }, a.entry = function(s, p, d) {
        const { tracer: y, cleanup: v } = a.tracer(p, d), S = d.debug ? [] : null, I = p._ids._schemaChain ? /* @__PURE__ */ new Map() : null, E = new a.Mainstay(y, S, I), T = p._ids._schemaChain ? [{ schema: p }] : null, x = new l([], [], { mainstay: E, schemas: T }), k = m.validate(s, p, x, d);
        v && p.$_root.untrace();
        const _ = c.process(k.errors, s, d);
        return { value: k.value, error: _, mainstay: E };
      }, a.tracer = function(s, p) {
        return s.$_root._tracer ? { tracer: s.$_root._tracer._register(s) } : p.debug ? (n(s.$_root.trace, "Debug mode not supported"), { tracer: s.$_root.trace()._register(s), cleanup: !0 }) : { tracer: a.ignore };
      }, m.validate = function(s, p, d, y, v = {}) {
        if (p.$_terms.whens && (p = p._generate(s, d, y).schema), p._preferences && (y = a.prefs(p, y)), p._cache && y.cache) {
          const _ = p._cache.get(s);
          if (d.mainstay.tracer.debug(d, "validate", "cached", !!_), _) return _;
        }
        const S = (_, L, N) => p.$_createError(_, s, L, N || d, y), I = { original: s, prefs: y, schema: p, state: d, error: S, errorsArray: a.errorsArray, warn: (_, L, N) => d.mainstay.warnings.push(S(_, L, N)), message: (_, L) => p.$_createError("custom", s, L, d, y, { messages: _ }) };
        d.mainstay.tracer.entry(p, d);
        const E = p._definition;
        if (E.prepare && s !== void 0 && y.convert) {
          const _ = E.prepare(s, I);
          if (_) {
            if (d.mainstay.tracer.value(d, "prepare", s, _.value), _.errors) return a.finalize(_.value, [].concat(_.errors), I);
            s = _.value;
          }
        }
        if (E.coerce && s !== void 0 && y.convert && (!E.coerce.from || E.coerce.from.includes(typeof s))) {
          const _ = E.coerce.method(s, I);
          if (_) {
            if (d.mainstay.tracer.value(d, "coerced", s, _.value), _.errors) return a.finalize(_.value, [].concat(_.errors), I);
            s = _.value;
          }
        }
        const T = p._flags.empty;
        T && T.$_match(a.trim(s, p), d.nest(T), o.defaults) && (d.mainstay.tracer.value(d, "empty", s, void 0), s = void 0);
        const x = v.presence || p._flags.presence || (p._flags._endedSwitch ? null : y.presence);
        if (s === void 0) {
          if (x === "forbidden") return a.finalize(s, null, I);
          if (x === "required") return a.finalize(s, [p.$_createError("any.required", s, null, d, y)], I);
          if (x === "optional") {
            if (p._flags.default !== o.symbols.deepDefault) return a.finalize(s, null, I);
            d.mainstay.tracer.value(d, "default", s, {}), s = {};
          }
        } else if (x === "forbidden") return a.finalize(s, [p.$_createError("any.unknown", s, null, d, y)], I);
        const k = [];
        if (p._valids) {
          const _ = p._valids.get(s, d, y, p._flags.insensitive);
          if (_) return y.convert && (d.mainstay.tracer.value(d, "valids", s, _.value), s = _.value), d.mainstay.tracer.filter(p, d, "valid", _), a.finalize(s, null, I);
          if (p._flags.only) {
            const L = p.$_createError("any.only", s, { valids: p._valids.values({ display: !0 }) }, d, y);
            if (y.abortEarly) return a.finalize(s, [L], I);
            k.push(L);
          }
        }
        if (p._invalids) {
          const _ = p._invalids.get(s, d, y, p._flags.insensitive);
          if (_) {
            d.mainstay.tracer.filter(p, d, "invalid", _);
            const L = p.$_createError("any.invalid", s, { invalids: p._invalids.values({ display: !0 }) }, d, y);
            if (y.abortEarly) return a.finalize(s, [L], I);
            k.push(L);
          }
        }
        if (E.validate) {
          const _ = E.validate(s, I);
          if (_ && (d.mainstay.tracer.value(d, "base", s, _.value), s = _.value, _.errors)) {
            if (!Array.isArray(_.errors)) return k.push(_.errors), a.finalize(s, k, I);
            if (_.errors.length) return k.push(..._.errors), a.finalize(s, k, I);
          }
        }
        return p._rules.length ? a.rules(s, k, I) : a.finalize(s, k, I);
      }, a.rules = function(s, p, d) {
        const { schema: y, state: v, prefs: S } = d;
        for (const I of y._rules) {
          const E = y._definition.rules[I.method];
          if (E.convert && S.convert) {
            v.mainstay.tracer.log(y, v, "rule", I.name, "full");
            continue;
          }
          let T, x = I.args;
          if (I._resolve.length) {
            x = Object.assign({}, x);
            for (const _ of I._resolve) {
              const L = E.argsByName.get(_), N = x[_].resolve(s, v, S), O = L.normalize ? L.normalize(N) : N, j = o.validateArg(O, null, L);
              if (j) {
                T = y.$_createError("any.ref", N, { arg: _, ref: x[_], reason: j }, v, S);
                break;
              }
              x[_] = O;
            }
          }
          T = T || E.validate(s, d, x, I);
          const k = a.rule(T, I);
          if (k.errors) {
            if (v.mainstay.tracer.log(y, v, "rule", I.name, "error"), I.warn) {
              v.mainstay.warnings.push(...k.errors);
              continue;
            }
            if (S.abortEarly) return a.finalize(s, k.errors, d);
            p.push(...k.errors);
          } else v.mainstay.tracer.log(y, v, "rule", I.name, "pass"), v.mainstay.tracer.value(v, "rule", s, k.value, I.name), s = k.value;
        }
        return a.finalize(s, p, d);
      }, a.rule = function(s, p) {
        return s instanceof c.Report ? (a.error(s, p), { errors: [s], value: null }) : Array.isArray(s) && s[o.symbols.errors] ? (s.forEach((d) => a.error(d, p)), { errors: s, value: null }) : { errors: null, value: s };
      }, a.error = function(s, p) {
        return p.message && s._setTemplate(p.message), s;
      }, a.finalize = function(s, p, d) {
        p = p || [];
        const { schema: y, state: v, prefs: S } = d;
        if (p.length) {
          const E = a.default("failover", void 0, p, d);
          E !== void 0 && (v.mainstay.tracer.value(v, "failover", s, E), s = E, p = []);
        }
        if (p.length && y._flags.error) if (typeof y._flags.error == "function") {
          p = y._flags.error(p), Array.isArray(p) || (p = [p]);
          for (const E of p) n(E instanceof Error || E instanceof c.Report, "error() must return an Error object");
        } else p = [y._flags.error];
        if (s === void 0) {
          const E = a.default("default", s, p, d);
          v.mainstay.tracer.value(v, "default", s, E), s = E;
        }
        if (y._flags.cast && s !== void 0) {
          const E = y._definition.cast[y._flags.cast];
          if (E.from(s)) {
            const T = E.to(s, d);
            v.mainstay.tracer.value(v, "cast", s, T, y._flags.cast), s = T;
          }
        }
        if (y.$_terms.externals && S.externals && S._externals !== !1) for (const { method: E } of y.$_terms.externals) v.mainstay.externals.push({ method: E, schema: y, state: v, label: c.label(y._flags, v, S) });
        const I = { value: s, errors: p.length ? p : null };
        return y._flags.result && (I.value = y._flags.result === "strip" ? void 0 : d.original, v.mainstay.tracer.value(v, y._flags.result, s, I.value), v.shadow(s, y._flags.result)), y._cache && S.cache !== !1 && !y._refs.length && y._cache.set(d.original, I), s === void 0 || I.errors || y._flags.artifact === void 0 || (v.mainstay.artifacts = v.mainstay.artifacts || /* @__PURE__ */ new Map(), v.mainstay.artifacts.has(y._flags.artifact) || v.mainstay.artifacts.set(y._flags.artifact, []), v.mainstay.artifacts.get(y._flags.artifact).push(v.path)), I;
      }, a.prefs = function(s, p) {
        const d = p === o.defaults;
        return d && s._preferences[o.symbols.prefs] ? s._preferences[o.symbols.prefs] : (p = o.preferences(p, s._preferences), d && (s._preferences[o.symbols.prefs] = p), p);
      }, a.default = function(s, p, d, y) {
        const { schema: v, state: S, prefs: I } = y, E = v._flags[s];
        if (I.noDefaults || E === void 0) return p;
        if (S.mainstay.tracer.log(v, S, "rule", s, "full"), !E) return E;
        if (typeof E == "function") {
          const T = E.length ? [b(S.ancestors[0]), y] : [];
          try {
            return E(...T);
          } catch (x) {
            return void d.push(v.$_createError("any.".concat(s), null, { error: x }, S, I));
          }
        }
        return typeof E != "object" ? E : E[o.symbols.literal] ? E.literal : o.isResolvable(E) ? E.resolve(p, S, I) : b(E);
      }, a.trim = function(s, p) {
        if (typeof s != "string") return s;
        const d = p.$_getRule("trim");
        return d && d.args.enabled ? s.trim() : s;
      }, a.ignore = { active: !1, debug: h, entry: h, filter: h, log: h, resolve: h, value: h }, a.errorsArray = function() {
        const s = [];
        return s[o.symbols.errors] = !0, s;
      };
    }, 2036: (u, m, f) => {
      const n = f(375), b = f(9474), h = f(8160), g = {};
      u.exports = g.Values = class {
        constructor(o, c) {
          this._values = new Set(o), this._refs = new Set(c), this._lowercase = g.lowercases(o), this._override = !1;
        }
        get length() {
          return this._values.size + this._refs.size;
        }
        add(o, c) {
          h.isResolvable(o) ? this._refs.has(o) || (this._refs.add(o), c && c.register(o)) : this.has(o, null, null, !1) || (this._values.add(o), typeof o == "string" && this._lowercase.set(o.toLowerCase(), o));
        }
        static merge(o, c, l) {
          if (o = o || new g.Values(), c) {
            if (c._override) return c.clone();
            for (const a of [...c._values, ...c._refs]) o.add(a);
          }
          if (l) for (const a of [...l._values, ...l._refs]) o.remove(a);
          return o.length ? o : null;
        }
        remove(o) {
          h.isResolvable(o) ? this._refs.delete(o) : (this._values.delete(o), typeof o == "string" && this._lowercase.delete(o.toLowerCase()));
        }
        has(o, c, l, a) {
          return !!this.get(o, c, l, a);
        }
        get(o, c, l, a) {
          if (!this.length) return !1;
          if (this._values.has(o)) return { value: o };
          if (typeof o == "string" && o && a) {
            const s = this._lowercase.get(o.toLowerCase());
            if (s) return { value: s };
          }
          if (!this._refs.size && typeof o != "object") return !1;
          if (typeof o == "object") {
            for (const s of this._values) if (b(s, o)) return { value: s };
          }
          if (c) for (const s of this._refs) {
            const p = s.resolve(o, c, l, null, { in: !0 });
            if (p === void 0) continue;
            const d = s.in && typeof p == "object" ? Array.isArray(p) ? p : Object.keys(p) : [p];
            for (const y of d) if (typeof y == typeof o) {
              if (a && o && typeof o == "string") {
                if (y.toLowerCase() === o.toLowerCase()) return { value: y, ref: s };
              } else if (b(y, o)) return { value: y, ref: s };
            }
          }
          return !1;
        }
        override() {
          this._override = !0;
        }
        values(o) {
          if (o && o.display) {
            const c = [];
            for (const l of [...this._values, ...this._refs]) l !== void 0 && c.push(l);
            return c;
          }
          return Array.from([...this._values, ...this._refs]);
        }
        clone() {
          const o = new g.Values(this._values, this._refs);
          return o._override = this._override, o;
        }
        concat(o) {
          n(!o._override, "Cannot concat override set of values");
          const c = new g.Values([...this._values, ...o._values], [...this._refs, ...o._refs]);
          return c._override = this._override, c;
        }
        describe() {
          const o = [];
          this._override && o.push({ override: !0 });
          for (const c of this._values.values()) o.push(c && typeof c == "object" ? { value: c } : c);
          for (const c of this._refs.values()) o.push(c.describe());
          return o;
        }
      }, g.Values.prototype[h.symbols.values] = !0, g.Values.prototype.slice = g.Values.prototype.clone, g.lowercases = function(o) {
        const c = /* @__PURE__ */ new Map();
        if (o) for (const l of o) typeof l == "string" && c.set(l.toLowerCase(), l);
        return c;
      };
    }, 978: (u, m, f) => {
      const n = f(375), b = f(8571), h = f(1687), g = f(9621), o = {};
      u.exports = function(c, l, a = {}) {
        if (n(c && typeof c == "object", "Invalid defaults value: must be an object"), n(!l || l === !0 || typeof l == "object", "Invalid source value: must be true, falsy or an object"), n(typeof a == "object", "Invalid options: must be an object"), !l) return null;
        if (a.shallow) return o.applyToDefaultsWithShallow(c, l, a);
        const s = b(c);
        if (l === !0) return s;
        const p = a.nullOverride !== void 0 && a.nullOverride;
        return h(s, l, { nullOverride: p, mergeArrays: !1 });
      }, o.applyToDefaultsWithShallow = function(c, l, a) {
        const s = a.shallow;
        n(Array.isArray(s), "Invalid keys");
        const p = /* @__PURE__ */ new Map(), d = l === !0 ? null : /* @__PURE__ */ new Set();
        for (let S of s) {
          S = Array.isArray(S) ? S : S.split(".");
          const I = g(c, S);
          I && typeof I == "object" ? p.set(I, d && g(l, S) || I) : d && d.add(S);
        }
        const y = b(c, {}, p);
        if (!d) return y;
        for (const S of d) o.reachCopy(y, l, S);
        const v = a.nullOverride !== void 0 && a.nullOverride;
        return h(y, l, { nullOverride: v, mergeArrays: !1 });
      }, o.reachCopy = function(c, l, a) {
        for (const d of a) {
          if (!(d in l)) return;
          const y = l[d];
          if (typeof y != "object" || y === null) return;
          l = y;
        }
        const s = l;
        let p = c;
        for (let d = 0; d < a.length - 1; ++d) {
          const y = a[d];
          typeof p[y] != "object" && (p[y] = {}), p = p[y];
        }
        p[a[a.length - 1]] = s;
      };
    }, 375: (u, m, f) => {
      const n = f(7916);
      u.exports = function(b, ...h) {
        if (!b)
          throw h.length === 1 && h[0] instanceof Error ? h[0] : new n(h);
      };
    }, 8571: (u, m, f) => {
      const n = f(9621), b = f(4277), h = f(7043), g = { needsProtoHack: /* @__PURE__ */ new Set([b.set, b.map, b.weakSet, b.weakMap]) };
      u.exports = g.clone = function(o, c = {}, l = null) {
        if (typeof o != "object" || o === null) return o;
        let a = g.clone, s = l;
        if (c.shallow) {
          if (c.shallow !== !0) return g.cloneWithShallow(o, c);
          a = (v) => v;
        } else if (s) {
          const v = s.get(o);
          if (v) return v;
        } else s = /* @__PURE__ */ new Map();
        const p = b.getInternalProto(o);
        if (p === b.buffer) return !1;
        if (p === b.date) return new Date(o.getTime());
        if (p === b.regex) return new RegExp(o);
        const d = g.base(o, p, c);
        if (d === o) return o;
        if (s && s.set(o, d), p === b.set) for (const v of o) d.add(a(v, c, s));
        else if (p === b.map) for (const [v, S] of o) d.set(v, a(S, c, s));
        const y = h.keys(o, c);
        for (const v of y) {
          if (v === "__proto__") continue;
          if (p === b.array && v === "length") {
            d.length = o.length;
            continue;
          }
          const S = Object.getOwnPropertyDescriptor(o, v);
          S ? S.get || S.set ? Object.defineProperty(d, v, S) : S.enumerable ? d[v] = a(o[v], c, s) : Object.defineProperty(d, v, { enumerable: !1, writable: !0, configurable: !0, value: a(o[v], c, s) }) : Object.defineProperty(d, v, { enumerable: !0, writable: !0, configurable: !0, value: a(o[v], c, s) });
        }
        return d;
      }, g.cloneWithShallow = function(o, c) {
        const l = c.shallow;
        (c = Object.assign({}, c)).shallow = !1;
        const a = /* @__PURE__ */ new Map();
        for (const s of l) {
          const p = n(o, s);
          typeof p != "object" && typeof p != "function" || a.set(p, p);
        }
        return g.clone(o, c, a);
      }, g.base = function(o, c, l) {
        if (l.prototype === !1) return g.needsProtoHack.has(c) ? new c.constructor() : c === b.array ? [] : {};
        const a = Object.getPrototypeOf(o);
        if (a && a.isImmutable) return o;
        if (c === b.array) {
          const s = [];
          return a !== c && Object.setPrototypeOf(s, a), s;
        }
        if (g.needsProtoHack.has(c)) {
          const s = new a.constructor();
          return a !== c && Object.setPrototypeOf(s, a), s;
        }
        return Object.create(a);
      };
    }, 9474: (u, m, f) => {
      const n = f(4277), b = { mismatched: null };
      u.exports = function(h, g, o) {
        return o = Object.assign({ prototype: !0 }, o), !!b.isDeepEqual(h, g, o, []);
      }, b.isDeepEqual = function(h, g, o, c) {
        if (h === g) return h !== 0 || 1 / h == 1 / g;
        const l = typeof h;
        if (l !== typeof g || h === null || g === null) return !1;
        if (l === "function") {
          if (!o.deepFunction || h.toString() !== g.toString()) return !1;
        } else if (l !== "object") return h != h && g != g;
        const a = b.getSharedType(h, g, !!o.prototype);
        switch (a) {
          case n.buffer:
            return !1;
          case n.promise:
            return h === g;
          case n.regex:
            return h.toString() === g.toString();
          case b.mismatched:
            return !1;
        }
        for (let s = c.length - 1; s >= 0; --s) if (c[s].isSame(h, g)) return !0;
        c.push(new b.SeenEntry(h, g));
        try {
          return !!b.isDeepEqualObj(a, h, g, o, c);
        } finally {
          c.pop();
        }
      }, b.getSharedType = function(h, g, o) {
        if (o) return Object.getPrototypeOf(h) !== Object.getPrototypeOf(g) ? b.mismatched : n.getInternalProto(h);
        const c = n.getInternalProto(h);
        return c !== n.getInternalProto(g) ? b.mismatched : c;
      }, b.valueOf = function(h) {
        const g = h.valueOf;
        if (g === void 0) return h;
        try {
          return g.call(h);
        } catch (o) {
          return o;
        }
      }, b.hasOwnEnumerableProperty = function(h, g) {
        return Object.prototype.propertyIsEnumerable.call(h, g);
      }, b.isSetSimpleEqual = function(h, g) {
        for (const o of Set.prototype.values.call(h)) if (!Set.prototype.has.call(g, o)) return !1;
        return !0;
      }, b.isDeepEqualObj = function(h, g, o, c, l) {
        const { isDeepEqual: a, valueOf: s, hasOwnEnumerableProperty: p } = b, { keys: d, getOwnPropertySymbols: y } = Object;
        if (h === n.array) {
          if (!c.part) {
            if (g.length !== o.length) return !1;
            for (let T = 0; T < g.length; ++T) if (!a(g[T], o[T], c, l)) return !1;
            return !0;
          }
          for (const T of g) for (const x of o) if (a(T, x, c, l)) return !0;
        } else if (h === n.set) {
          if (g.size !== o.size) return !1;
          if (!b.isSetSimpleEqual(g, o)) {
            const T = new Set(Set.prototype.values.call(o));
            for (const x of Set.prototype.values.call(g)) {
              if (T.delete(x)) continue;
              let k = !1;
              for (const _ of T) if (a(x, _, c, l)) {
                T.delete(_), k = !0;
                break;
              }
              if (!k) return !1;
            }
          }
        } else if (h === n.map) {
          if (g.size !== o.size) return !1;
          for (const [T, x] of Map.prototype.entries.call(g))
            if (x === void 0 && !Map.prototype.has.call(o, T) || !a(x, Map.prototype.get.call(o, T), c, l)) return !1;
        } else if (h === n.error && (g.name !== o.name || g.message !== o.message)) return !1;
        const v = s(g), S = s(o);
        if ((g !== v || o !== S) && !a(v, S, c, l)) return !1;
        const I = d(g);
        if (!c.part && I.length !== d(o).length && !c.skip) return !1;
        let E = 0;
        for (const T of I) if (c.skip && c.skip.includes(T)) o[T] === void 0 && ++E;
        else if (!p(o, T) || !a(g[T], o[T], c, l)) return !1;
        if (!c.part && I.length - E !== d(o).length) return !1;
        if (c.symbols !== !1) {
          const T = y(g), x = new Set(y(o));
          for (const k of T) {
            if (!c.skip || !c.skip.includes(k)) {
              if (p(g, k)) {
                if (!p(o, k) || !a(g[k], o[k], c, l)) return !1;
              } else if (p(o, k)) return !1;
            }
            x.delete(k);
          }
          for (const k of x) if (p(o, k)) return !1;
        }
        return !0;
      }, b.SeenEntry = class {
        constructor(h, g) {
          this.obj = h, this.ref = g;
        }
        isSame(h, g) {
          return this.obj === h && this.ref === g;
        }
      };
    }, 7916: (u, m, f) => {
      const n = f(8761);
      u.exports = class extends Error {
        constructor(b) {
          super(b.filter((h) => h !== "").map((h) => typeof h == "string" ? h : h instanceof Error ? h.message : n(h)).join(" ") || "Unknown error"), typeof Error.captureStackTrace == "function" && Error.captureStackTrace(this, m.assert);
        }
      };
    }, 5277: (u) => {
      const m = {};
      u.exports = function(f) {
        if (!f) return "";
        let n = "";
        for (let b = 0; b < f.length; ++b) {
          const h = f.charCodeAt(b);
          m.isSafe(h) ? n += f[b] : n += m.escapeHtmlChar(h);
        }
        return n;
      }, m.escapeHtmlChar = function(f) {
        return m.namedHtml.get(f) || (f >= 256 ? "&#" + f + ";" : "&#x".concat(f.toString(16).padStart(2, "0"), ";"));
      }, m.isSafe = function(f) {
        return m.safeCharCodes.has(f);
      }, m.namedHtml = /* @__PURE__ */ new Map([[38, "&amp;"], [60, "&lt;"], [62, "&gt;"], [34, "&quot;"], [160, "&nbsp;"], [162, "&cent;"], [163, "&pound;"], [164, "&curren;"], [169, "&copy;"], [174, "&reg;"]]), m.safeCharCodes = function() {
        const f = /* @__PURE__ */ new Set();
        for (let n = 32; n < 123; ++n) (n >= 97 || n >= 65 && n <= 90 || n >= 48 && n <= 57 || n === 32 || n === 46 || n === 44 || n === 45 || n === 58 || n === 95) && f.add(n);
        return f;
      }();
    }, 6064: (u) => {
      u.exports = function(m) {
        return m.replace(/[\^\$\.\*\+\-\?\=\!\:\|\\\/\(\)\[\]\{\}\,]/g, "\\$&");
      };
    }, 738: (u) => {
      u.exports = function() {
      };
    }, 1687: (u, m, f) => {
      const n = f(375), b = f(8571), h = f(7043), g = {};
      u.exports = g.merge = function(o, c, l) {
        if (n(o && typeof o == "object", "Invalid target value: must be an object"), n(c == null || typeof c == "object", "Invalid source value: must be null, undefined, or an object"), !c) return o;
        if (l = Object.assign({ nullOverride: !0, mergeArrays: !0 }, l), Array.isArray(c)) {
          n(Array.isArray(o), "Cannot merge array onto an object"), l.mergeArrays || (o.length = 0);
          for (let s = 0; s < c.length; ++s) o.push(b(c[s], { symbols: l.symbols }));
          return o;
        }
        const a = h.keys(c, l);
        for (let s = 0; s < a.length; ++s) {
          const p = a[s];
          if (p === "__proto__" || !Object.prototype.propertyIsEnumerable.call(c, p)) continue;
          const d = c[p];
          if (d && typeof d == "object") {
            if (o[p] === d) continue;
            !o[p] || typeof o[p] != "object" || Array.isArray(o[p]) !== Array.isArray(d) || d instanceof Date || d instanceof RegExp ? o[p] = b(d, { symbols: l.symbols }) : g.merge(o[p], d, l);
          } else (d != null || l.nullOverride) && (o[p] = d);
        }
        return o;
      };
    }, 9621: (u, m, f) => {
      const n = f(375), b = {};
      u.exports = function(h, g, o) {
        if (g === !1 || g == null) return h;
        typeof (o = o || {}) == "string" && (o = { separator: o });
        const c = Array.isArray(g);
        n(!c || !o.separator, "Separator option is not valid for array-based chain");
        const l = c ? g : g.split(o.separator || ".");
        let a = h;
        for (let s = 0; s < l.length; ++s) {
          let p = l[s];
          const d = o.iterables && b.iterables(a);
          if (Array.isArray(a) || d === "set") {
            const y = Number(p);
            Number.isInteger(y) && (p = y < 0 ? a.length + y : y);
          }
          if (!a || typeof a == "function" && o.functions === !1 || !d && a[p] === void 0) {
            n(!o.strict || s + 1 === l.length, "Missing segment", p, "in reach path ", g), n(typeof a == "object" || o.functions === !0 || typeof a != "function", "Invalid segment", p, "in reach path ", g), a = o.default;
            break;
          }
          a = d ? d === "set" ? [...a][p] : a.get(p) : a[p];
        }
        return a;
      }, b.iterables = function(h) {
        return h instanceof Set ? "set" : h instanceof Map ? "map" : void 0;
      };
    }, 8761: (u) => {
      u.exports = function(...m) {
        try {
          return JSON.stringify(...m);
        } catch (f) {
          return "[Cannot display object: " + f.message + "]";
        }
      };
    }, 4277: (u, m) => {
      const f = {};
      m = u.exports = { array: Array.prototype, buffer: !1, date: Date.prototype, error: Error.prototype, generic: Object.prototype, map: Map.prototype, promise: Promise.prototype, regex: RegExp.prototype, set: Set.prototype, weakMap: WeakMap.prototype, weakSet: WeakSet.prototype }, f.typeMap = /* @__PURE__ */ new Map([["[object Error]", m.error], ["[object Map]", m.map], ["[object Promise]", m.promise], ["[object Set]", m.set], ["[object WeakMap]", m.weakMap], ["[object WeakSet]", m.weakSet]]), m.getInternalProto = function(n) {
        if (Array.isArray(n)) return m.array;
        if (n instanceof Date) return m.date;
        if (n instanceof RegExp) return m.regex;
        if (n instanceof Error) return m.error;
        const b = Object.prototype.toString.call(n);
        return f.typeMap.get(b) || m.generic;
      };
    }, 7043: (u, m) => {
      m.keys = function(f, n = {}) {
        return n.symbols !== !1 ? Reflect.ownKeys(f) : Object.getOwnPropertyNames(f);
      };
    }, 3652: (u, m, f) => {
      const n = f(375), b = {};
      m.Sorter = class {
        constructor() {
          this._items = [], this.nodes = [];
        }
        add(h, g) {
          const o = [].concat((g = g || {}).before || []), c = [].concat(g.after || []), l = g.group || "?", a = g.sort || 0;
          n(!o.includes(l), "Item cannot come before itself: ".concat(l)), n(!o.includes("?"), "Item cannot come before unassociated items"), n(!c.includes(l), "Item cannot come after itself: ".concat(l)), n(!c.includes("?"), "Item cannot come after unassociated items"), Array.isArray(h) || (h = [h]);
          for (const s of h) {
            const p = { seq: this._items.length, sort: a, before: o, after: c, group: l, node: s };
            this._items.push(p);
          }
          if (!g.manual) {
            const s = this._sort();
            n(s, "item", l !== "?" ? "added into group ".concat(l) : "", "created a dependencies error");
          }
          return this.nodes;
        }
        merge(h) {
          Array.isArray(h) || (h = [h]);
          for (const o of h) if (o) for (const c of o._items) this._items.push(Object.assign({}, c));
          this._items.sort(b.mergeSort);
          for (let o = 0; o < this._items.length; ++o) this._items[o].seq = o;
          const g = this._sort();
          return n(g, "merge created a dependencies error"), this.nodes;
        }
        sort() {
          const h = this._sort();
          return n(h, "sort created a dependencies error"), this.nodes;
        }
        _sort() {
          const h = {}, g = /* @__PURE__ */ Object.create(null), o = /* @__PURE__ */ Object.create(null);
          for (const p of this._items) {
            const d = p.seq, y = p.group;
            o[y] = o[y] || [], o[y].push(d), h[d] = p.before;
            for (const v of p.after) g[v] = g[v] || [], g[v].push(d);
          }
          for (const p in h) {
            const d = [];
            for (const y in h[p]) {
              const v = h[p][y];
              o[v] = o[v] || [], d.push(...o[v]);
            }
            h[p] = d;
          }
          for (const p in g) if (o[p]) for (const d of o[p]) h[d].push(...g[p]);
          const c = {};
          for (const p in h) {
            const d = h[p];
            for (const y of d) c[y] = c[y] || [], c[y].push(p);
          }
          const l = {}, a = [];
          for (let p = 0; p < this._items.length; ++p) {
            let d = p;
            if (c[p]) {
              d = null;
              for (let y = 0; y < this._items.length; ++y) {
                if (l[y] === !0) continue;
                c[y] || (c[y] = []);
                const v = c[y].length;
                let S = 0;
                for (let I = 0; I < v; ++I) l[c[y][I]] && ++S;
                if (S === v) {
                  d = y;
                  break;
                }
              }
            }
            d !== null && (l[d] = !0, a.push(d));
          }
          if (a.length !== this._items.length) return !1;
          const s = {};
          for (const p of this._items) s[p.seq] = p;
          this._items = [], this.nodes = [];
          for (const p of a) {
            const d = s[p];
            this.nodes.push(d.node), this._items.push(d);
          }
          return !0;
        }
      }, b.mergeSort = (h, g) => h.sort === g.sort ? 0 : h.sort < g.sort ? -1 : 1;
    }, 5380: (u, m, f) => {
      const n = f(443), b = f(2178), h = { minDomainSegments: 2, nonAsciiRx: /[^\x00-\x7f]/, domainControlRx: /[\x00-\x20@\:\/\\#!\$&\'\(\)\*\+,;=\?]/, tldSegmentRx: /^[a-zA-Z](?:[a-zA-Z0-9\-]*[a-zA-Z0-9])?$/, domainSegmentRx: /^[a-zA-Z0-9](?:[a-zA-Z0-9\-]*[a-zA-Z0-9])?$/, URL: n.URL || URL };
      m.analyze = function(g, o = {}) {
        if (!g) return b.code("DOMAIN_NON_EMPTY_STRING");
        if (typeof g != "string") throw new Error("Invalid input: domain must be a string");
        if (g.length > 256) return b.code("DOMAIN_TOO_LONG");
        if (h.nonAsciiRx.test(g)) {
          if (o.allowUnicode === !1) return b.code("DOMAIN_INVALID_UNICODE_CHARS");
          g = g.normalize("NFC");
        }
        if (h.domainControlRx.test(g)) return b.code("DOMAIN_INVALID_CHARS");
        g = h.punycode(g), o.allowFullyQualified && g[g.length - 1] === "." && (g = g.slice(0, -1));
        const c = o.minDomainSegments || h.minDomainSegments, l = g.split(".");
        if (l.length < c) return b.code("DOMAIN_SEGMENTS_COUNT");
        if (o.maxDomainSegments && l.length > o.maxDomainSegments) return b.code("DOMAIN_SEGMENTS_COUNT_MAX");
        const a = o.tlds;
        if (a) {
          const s = l[l.length - 1].toLowerCase();
          if (a.deny && a.deny.has(s) || a.allow && !a.allow.has(s)) return b.code("DOMAIN_FORBIDDEN_TLDS");
        }
        for (let s = 0; s < l.length; ++s) {
          const p = l[s];
          if (!p.length) return b.code("DOMAIN_EMPTY_SEGMENT");
          if (p.length > 63) return b.code("DOMAIN_LONG_SEGMENT");
          if (s < l.length - 1) {
            if (!h.domainSegmentRx.test(p)) return b.code("DOMAIN_INVALID_CHARS");
          } else if (!h.tldSegmentRx.test(p)) return b.code("DOMAIN_INVALID_TLDS_CHARS");
        }
        return null;
      }, m.isValid = function(g, o) {
        return !m.analyze(g, o);
      }, h.punycode = function(g) {
        g.includes("%") && (g = g.replace(/%/g, "%25"));
        try {
          return new h.URL("http://".concat(g)).host;
        } catch (o) {
          return g;
        }
      };
    }, 1745: (u, m, f) => {
      const n = f(9848), b = f(5380), h = f(2178), g = { nonAsciiRx: /[^\x00-\x7f]/, encoder: new (n.TextEncoder || TextEncoder)() };
      m.analyze = function(o, c) {
        return g.email(o, c);
      }, m.isValid = function(o, c) {
        return !g.email(o, c);
      }, g.email = function(o, c = {}) {
        if (typeof o != "string") throw new Error("Invalid input: email must be a string");
        if (!o) return h.code("EMPTY_STRING");
        const l = !g.nonAsciiRx.test(o);
        if (!l) {
          if (c.allowUnicode === !1) return h.code("FORBIDDEN_UNICODE");
          o = o.normalize("NFC");
        }
        const a = o.split("@");
        if (a.length !== 2) return a.length > 2 ? h.code("MULTIPLE_AT_CHAR") : h.code("MISSING_AT_CHAR");
        const [s, p] = a;
        if (!s) return h.code("EMPTY_LOCAL");
        if (!c.ignoreLength) {
          if (o.length > 254) return h.code("ADDRESS_TOO_LONG");
          if (g.encoder.encode(s).length > 64) return h.code("LOCAL_TOO_LONG");
        }
        return g.local(s, l) || b.analyze(p, c);
      }, g.local = function(o, c) {
        const l = o.split(".");
        for (const a of l) {
          if (!a.length) return h.code("EMPTY_LOCAL_SEGMENT");
          if (c) {
            if (!g.atextRx.test(a)) return h.code("INVALID_LOCAL_CHARS");
          } else for (const s of a) {
            if (g.atextRx.test(s)) continue;
            const p = g.binary(s);
            if (!g.atomRx.test(p)) return h.code("INVALID_LOCAL_CHARS");
          }
        }
      }, g.binary = function(o) {
        return Array.from(g.encoder.encode(o)).map((c) => String.fromCharCode(c)).join("");
      }, g.atextRx = /^[\w!#\$%&'\*\+\-/=\?\^`\{\|\}~]+$/, g.atomRx = new RegExp(["(?:[\\xc2-\\xdf][\\x80-\\xbf])", "(?:\\xe0[\\xa0-\\xbf][\\x80-\\xbf])|(?:[\\xe1-\\xec][\\x80-\\xbf]{2})|(?:\\xed[\\x80-\\x9f][\\x80-\\xbf])|(?:[\\xee-\\xef][\\x80-\\xbf]{2})", "(?:\\xf0[\\x90-\\xbf][\\x80-\\xbf]{2})|(?:[\\xf1-\\xf3][\\x80-\\xbf]{3})|(?:\\xf4[\\x80-\\x8f][\\x80-\\xbf]{2})"].join("|"));
    }, 2178: (u, m) => {
      m.codes = { EMPTY_STRING: "Address must be a non-empty string", FORBIDDEN_UNICODE: "Address contains forbidden Unicode characters", MULTIPLE_AT_CHAR: "Address cannot contain more than one @ character", MISSING_AT_CHAR: "Address must contain one @ character", EMPTY_LOCAL: "Address local part cannot be empty", ADDRESS_TOO_LONG: "Address too long", LOCAL_TOO_LONG: "Address local part too long", EMPTY_LOCAL_SEGMENT: "Address local part contains empty dot-separated segment", INVALID_LOCAL_CHARS: "Address local part contains invalid character", DOMAIN_NON_EMPTY_STRING: "Domain must be a non-empty string", DOMAIN_TOO_LONG: "Domain too long", DOMAIN_INVALID_UNICODE_CHARS: "Domain contains forbidden Unicode characters", DOMAIN_INVALID_CHARS: "Domain contains invalid character", DOMAIN_INVALID_TLDS_CHARS: "Domain contains invalid tld character", DOMAIN_SEGMENTS_COUNT: "Domain lacks the minimum required number of segments", DOMAIN_SEGMENTS_COUNT_MAX: "Domain contains too many segments", DOMAIN_FORBIDDEN_TLDS: "Domain uses forbidden TLD", DOMAIN_EMPTY_SEGMENT: "Domain contains empty dot-separated segment", DOMAIN_LONG_SEGMENT: "Domain contains dot-separated segment that is too long" }, m.code = function(f) {
        return { code: f, error: m.codes[f] };
      };
    }, 9959: (u, m, f) => {
      const n = f(375), b = f(5752);
      m.regex = function(h = {}) {
        n(h.cidr === void 0 || typeof h.cidr == "string", "options.cidr must be a string");
        const g = h.cidr ? h.cidr.toLowerCase() : "optional";
        n(["required", "optional", "forbidden"].includes(g), "options.cidr must be one of required, optional, forbidden"), n(h.version === void 0 || typeof h.version == "string" || Array.isArray(h.version), "options.version must be a string or an array of string");
        let o = h.version || ["ipv4", "ipv6", "ipvfuture"];
        Array.isArray(o) || (o = [o]), n(o.length >= 1, "options.version must have at least 1 version specified");
        for (let a = 0; a < o.length; ++a) n(typeof o[a] == "string", "options.version must only contain strings"), o[a] = o[a].toLowerCase(), n(["ipv4", "ipv6", "ipvfuture"].includes(o[a]), "options.version contains unknown version " + o[a] + " - must be one of ipv4, ipv6, ipvfuture");
        o = Array.from(new Set(o));
        const c = "(?:".concat(o.map((a) => {
          if (g === "forbidden") return b.ip[a];
          const s = "\\/".concat(a === "ipv4" ? b.ip.v4Cidr : b.ip.v6Cidr);
          return g === "required" ? "".concat(b.ip[a]).concat(s) : "".concat(b.ip[a], "(?:").concat(s, ")?");
        }).join("|"), ")"), l = new RegExp("^".concat(c, "$"));
        return { cidr: g, versions: o, regex: l, raw: c };
      };
    }, 5752: (u, m, f) => {
      const n = f(375), b = f(6064), h = { generate: function() {
        const g = {}, o = "\\dA-Fa-f", c = "[" + o + "]", l = "\\w-\\.~", a = "!\\$&'\\(\\)\\*\\+,;=", s = "%" + o, p = l + s + a + ":@", d = "[" + p + "]", y = "(?:0{0,2}\\d|0?[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])";
        g.ipv4address = "(?:" + y + "\\.){3}" + y;
        const v = c + "{1,4}", S = "(?:" + v + ":" + v + "|" + g.ipv4address + ")", I = "(?:" + v + ":){6}" + S, E = "::(?:" + v + ":){5}" + S, T = "(?:" + v + ")?::(?:" + v + ":){4}" + S, x = "(?:(?:" + v + ":){0,1}" + v + ")?::(?:" + v + ":){3}" + S, k = "(?:(?:" + v + ":){0,2}" + v + ")?::(?:" + v + ":){2}" + S, _ = "(?:(?:" + v + ":){0,3}" + v + ")?::" + v + ":" + S, L = "(?:(?:" + v + ":){0,4}" + v + ")?::" + S, N = "(?:(?:" + v + ":){0,5}" + v + ")?::" + v, O = "(?:(?:" + v + ":){0,6}" + v + ")?::";
        g.ipv4Cidr = "(?:\\d|[1-2]\\d|3[0-2])", g.ipv6Cidr = "(?:0{0,2}\\d|0?[1-9]\\d|1[01]\\d|12[0-8])", g.ipv6address = "(?:" + I + "|" + E + "|" + T + "|" + x + "|" + k + "|" + _ + "|" + L + "|" + N + "|" + O + ")", g.ipvFuture = "v" + c + "+\\.[" + l + a + ":]+", g.scheme = "[a-zA-Z][a-zA-Z\\d+-\\.]*", g.schemeRegex = new RegExp(g.scheme);
        const j = "[" + l + s + a + ":]*", G = "[" + l + s + a + "]{1,255}", W = "(?:\\[(?:" + g.ipv6address + "|" + g.ipvFuture + ")\\]|" + g.ipv4address + "|" + G + ")", F = "(?:" + j + "@)?" + W + "(?::\\d*)?", V = "(?:" + j + "@)?(" + W + ")(?::\\d*)?", X = d + "*", B = d + "+", $ = "(?:\\/" + X + ")*", z = "\\/(?:" + B + $ + ")?", q = B + $, ee = "[" + l + s + a + "@]+" + $, te = "(?:\\/\\/\\/" + X + $ + ")";
        return g.hierPart = "(?:(?:\\/\\/" + F + $ + ")|" + z + "|" + q + "|" + te + ")", g.hierPartCapture = "(?:(?:\\/\\/" + V + $ + ")|" + z + "|" + q + ")", g.relativeRef = "(?:(?:\\/\\/" + F + $ + ")|" + z + "|" + ee + "|)", g.relativeRefCapture = "(?:(?:\\/\\/" + V + $ + ")|" + z + "|" + ee + "|)", g.query = "[" + p + "\\/\\?]*(?=#|$)", g.queryWithSquareBrackets = "[" + p + "\\[\\]\\/\\?]*(?=#|$)", g.fragment = "[" + p + "\\/\\?]*", g;
      } };
      h.rfc3986 = h.generate(), m.ip = { v4Cidr: h.rfc3986.ipv4Cidr, v6Cidr: h.rfc3986.ipv6Cidr, ipv4: h.rfc3986.ipv4address, ipv6: h.rfc3986.ipv6address, ipvfuture: h.rfc3986.ipvFuture }, h.createRegex = function(g) {
        const o = h.rfc3986, c = "(?:\\?" + (g.allowQuerySquareBrackets ? o.queryWithSquareBrackets : o.query) + ")?(?:#" + o.fragment + ")?", l = g.domain ? o.relativeRefCapture : o.relativeRef;
        if (g.relativeOnly) return h.wrap(l + c);
        let a = "";
        if (g.scheme) {
          n(g.scheme instanceof RegExp || typeof g.scheme == "string" || Array.isArray(g.scheme), "scheme must be a RegExp, String, or Array");
          const d = [].concat(g.scheme);
          n(d.length >= 1, "scheme must have at least 1 scheme specified");
          const y = [];
          for (let v = 0; v < d.length; ++v) {
            const S = d[v];
            n(S instanceof RegExp || typeof S == "string", "scheme at position " + v + " must be a RegExp or String"), S instanceof RegExp ? y.push(S.source.toString()) : (n(o.schemeRegex.test(S), "scheme at position " + v + " must be a valid scheme"), y.push(b(S)));
          }
          a = y.join("|");
        }
        const s = "(?:" + (a ? "(?:" + a + ")" : o.scheme) + ":" + (g.domain ? o.hierPartCapture : o.hierPart) + ")", p = g.allowRelative ? "(?:" + s + "|" + l + ")" : s;
        return h.wrap(p + c, a);
      }, h.wrap = function(g, o) {
        return { raw: g = "(?=.)(?!https?:/(?:$|[^/]))(?!https?:///)(?!https?:[^/])".concat(g), regex: new RegExp("^".concat(g, "$")), scheme: o };
      }, h.uriRegex = h.createRegex({}), m.regex = function(g = {}) {
        return g.scheme || g.allowRelative || g.relativeOnly || g.allowQuerySquareBrackets || g.domain ? h.createRegex(g) : h.uriRegex;
      };
    }, 1447: (u, m) => {
      const f = { operators: ["!", "^", "*", "/", "%", "+", "-", "<", "<=", ">", ">=", "==", "!=", "&&", "||", "??"], operatorCharacters: ["!", "^", "*", "/", "%", "+", "-", "<", "=", ">", "&", "|", "?"], operatorsOrder: [["^"], ["*", "/", "%"], ["+", "-"], ["<", "<=", ">", ">="], ["==", "!="], ["&&"], ["||", "??"]], operatorsPrefix: ["!", "n"], literals: { '"': '"', "`": "`", "'": "'", "[": "]" }, numberRx: /^(?:[0-9]*(\.[0-9]*)?){1}$/, tokenRx: /^[\w\$\#\.\@\:\{\}]+$/, symbol: Symbol("formula"), settings: Symbol("settings") };
      m.Parser = class {
        constructor(n, b = {}) {
          if (!b[f.settings] && b.constants) for (const h in b.constants) {
            const g = b.constants[h];
            if (g !== null && !["boolean", "number", "string"].includes(typeof g)) throw new Error("Formula constant ".concat(h, " contains invalid ").concat(typeof g, " value type"));
          }
          this.settings = b[f.settings] ? b : Object.assign({ [f.settings]: !0, constants: {}, functions: {} }, b), this.single = null, this._parts = null, this._parse(n);
        }
        _parse(n) {
          let b = [], h = "", g = 0, o = !1;
          const c = (a) => {
            if (g) throw new Error("Formula missing closing parenthesis");
            const s = b.length ? b[b.length - 1] : null;
            if (o || h || a) {
              if (s && s.type === "reference" && a === ")") return s.type = "function", s.value = this._subFormula(h, s.value), void (h = "");
              if (a === ")") {
                const p = new m.Parser(h, this.settings);
                b.push({ type: "segment", value: p });
              } else if (o) {
                if (o === "]") return b.push({ type: "reference", value: h }), void (h = "");
                b.push({ type: "literal", value: h });
              } else if (f.operatorCharacters.includes(h)) s && s.type === "operator" && f.operators.includes(s.value + h) ? s.value += h : b.push({ type: "operator", value: h });
              else if (h.match(f.numberRx)) b.push({ type: "constant", value: parseFloat(h) });
              else if (this.settings.constants[h] !== void 0) b.push({ type: "constant", value: this.settings.constants[h] });
              else {
                if (!h.match(f.tokenRx)) throw new Error("Formula contains invalid token: ".concat(h));
                b.push({ type: "reference", value: h });
              }
              h = "";
            }
          };
          for (const a of n) o ? a === o ? (c(), o = !1) : h += a : g ? a === "(" ? (h += a, ++g) : a === ")" ? (--g, g ? h += a : c(a)) : h += a : a in f.literals ? o = f.literals[a] : a === "(" ? (c(), ++g) : f.operatorCharacters.includes(a) ? (c(), h = a, c()) : a !== " " ? h += a : c();
          c(), b = b.map((a, s) => a.type !== "operator" || a.value !== "-" || s && b[s - 1].type !== "operator" ? a : { type: "operator", value: "n" });
          let l = !1;
          for (const a of b) {
            if (a.type === "operator") {
              if (f.operatorsPrefix.includes(a.value)) continue;
              if (!l) throw new Error("Formula contains an operator in invalid position");
              if (!f.operators.includes(a.value)) throw new Error("Formula contains an unknown operator ".concat(a.value));
            } else if (l) throw new Error("Formula missing expected operator");
            l = !l;
          }
          if (!l) throw new Error("Formula contains invalid trailing operator");
          b.length === 1 && ["reference", "literal", "constant"].includes(b[0].type) && (this.single = { type: b[0].type === "reference" ? "reference" : "value", value: b[0].value }), this._parts = b.map((a) => {
            if (a.type === "operator") return f.operatorsPrefix.includes(a.value) ? a : a.value;
            if (a.type !== "reference") return a.value;
            if (this.settings.tokenRx && !this.settings.tokenRx.test(a.value)) throw new Error("Formula contains invalid reference ".concat(a.value));
            return this.settings.reference ? this.settings.reference(a.value) : f.reference(a.value);
          });
        }
        _subFormula(n, b) {
          const h = this.settings.functions[b];
          if (typeof h != "function") throw new Error("Formula contains unknown function ".concat(b));
          let g = [];
          if (n) {
            let o = "", c = 0, l = !1;
            const a = () => {
              if (!o) throw new Error("Formula contains function ".concat(b, " with invalid arguments ").concat(n));
              g.push(o), o = "";
            };
            for (let s = 0; s < n.length; ++s) {
              const p = n[s];
              l ? (o += p, p === l && (l = !1)) : p in f.literals && !c ? (o += p, l = f.literals[p]) : p !== "," || c ? (o += p, p === "(" ? ++c : p === ")" && --c) : a();
            }
            a();
          }
          return g = g.map((o) => new m.Parser(o, this.settings)), function(o) {
            const c = [];
            for (const l of g) c.push(l.evaluate(o));
            return h.call(o, ...c);
          };
        }
        evaluate(n) {
          const b = this._parts.slice();
          for (let h = b.length - 2; h >= 0; --h) {
            const g = b[h];
            if (g && g.type === "operator") {
              const o = b[h + 1];
              b.splice(h + 1, 1);
              const c = f.evaluate(o, n);
              b[h] = f.single(g.value, c);
            }
          }
          return f.operatorsOrder.forEach((h) => {
            for (let g = 1; g < b.length - 1; ) if (h.includes(b[g])) {
              const o = b[g], c = f.evaluate(b[g - 1], n), l = f.evaluate(b[g + 1], n);
              b.splice(g, 2);
              const a = f.calculate(o, c, l);
              b[g - 1] = a === 0 ? 0 : a;
            } else g += 2;
          }), f.evaluate(b[0], n);
        }
      }, m.Parser.prototype[f.symbol] = !0, f.reference = function(n) {
        return function(b) {
          return b && b[n] !== void 0 ? b[n] : null;
        };
      }, f.evaluate = function(n, b) {
        return n === null ? null : typeof n == "function" ? n(b) : n[f.symbol] ? n.evaluate(b) : n;
      }, f.single = function(n, b) {
        if (n === "!") return !b;
        const h = -b;
        return h === 0 ? 0 : h;
      }, f.calculate = function(n, b, h) {
        if (n === "??") return f.exists(b) ? b : h;
        if (typeof b == "string" || typeof h == "string") {
          if (n === "+") return (b = f.exists(b) ? b : "") + (f.exists(h) ? h : "");
        } else switch (n) {
          case "^":
            return Math.pow(b, h);
          case "*":
            return b * h;
          case "/":
            return b / h;
          case "%":
            return b % h;
          case "+":
            return b + h;
          case "-":
            return b - h;
        }
        switch (n) {
          case "<":
            return b < h;
          case "<=":
            return b <= h;
          case ">":
            return b > h;
          case ">=":
            return b >= h;
          case "==":
            return b === h;
          case "!=":
            return b !== h;
          case "&&":
            return b && h;
          case "||":
            return b || h;
        }
        return null;
      }, f.exists = function(n) {
        return n != null;
      };
    }, 9926: () => {
    }, 5688: () => {
    }, 9708: () => {
    }, 1152: () => {
    }, 443: () => {
    }, 9848: () => {
    }, 5934: (u) => {
      u.exports = JSON.parse('{"version":"17.13.3"}');
    } }, i = {}, function u(m) {
      var f = i[m];
      if (f !== void 0) return f.exports;
      var n = i[m] = { exports: {} };
      return t[m](n, n.exports, u), n.exports;
    }(5107);
    var t, i;
  });
})(hi);
var fa = hi.exports;
const de = /* @__PURE__ */ wt(fa);
let dt;
const ha = 32e3, ss = 1e3;
class mi extends vr {
  constructor(e, t, i) {
    if (super(), dt = t, !e)
      throw dt.error("Token generator is required to construct this module."), new Error("Token generator is required to construct this module.");
    this.webRTCPeer = new qe(), this.signaling = null, this.autoReconnect = i, this.reconnectionInterval = ss, this.alreadyDisconnected = !1, this.firstReconnection = !0, this.stopReconnection = !1, this.isReconnecting = !1, this.tokenGenerator = e, this.options = null;
  }
  /**
   * Get current RTC peer connection.
   * @returns {RTCPeerConnection} Object which represents the RTCPeerConnection.
   */
  getRTCPeerConnection() {
    return this.webRTCPeer ? this.webRTCPeer.getRTCPeer() : null;
  }
  /**
   * Stops connection.
   */
  stop() {
    var e;
    dt.info("Stopping"), this.webRTCPeer.closeRTCPeer(), (e = this.signaling) == null || e.close(), this.signaling = null, this.stopReconnection = !0, this.webRTCPeer = new qe();
  }
  /**
   * Get if the current connection is active.
   * @returns {Boolean} - True if connected, false if not.
   */
  isActive() {
    const e = this.webRTCPeer.getRTCPeerStatus();
    return dt.info("Broadcast status: ", e || "not_established"), e === "connected";
  }
  /**
   * Sets reconnection if autoReconnect is enabled.
   */
  setReconnect() {
    var e, t;
    (e = this.signaling) == null || e.on("migrate", () => this.replaceConnection()), this.autoReconnect && ((t = this.signaling) == null || t.on($e.connectionError, () => {
      (this.firstReconnection || !this.alreadyDisconnected) && (this.firstReconnection = !1, this.reconnect({ error: new Error("Signaling error: wsConnectionError") }));
    }), this.webRTCPeer.on(Ue.connectionStateChange, (i) => {
      Ie.setConnectionState(i), i === "connected" && Ie.setConnectionTime((/* @__PURE__ */ new Date()).getTime()), (i === "failed" || i === "disconnected" && this.alreadyDisconnected) && this.firstReconnection ? (this.firstReconnection = !1, this.reconnect({ error: new Error("Connection state change: RTCPeerConnectionState disconnected") })) : i === "disconnected" ? (this.alreadyDisconnected = !0, setTimeout(
        () => this.reconnect({
          error: new Error("Connection state change: RTCPeerConnectionState disconnected")
        }),
        1500
      )) : this.alreadyDisconnected = !1;
    }));
  }
  /**
   * Reconnects to last broadcast.
   * @fires BaseWebRTC#reconnect
   * @param {ReconnectData} [data] - This object contains the error property. It may be expanded to contain more information in the future.
   * @property {String} error - The value sent in the first [reconnect event]{@link BaseWebRTC#event:reconnect} within the error key of the payload
   */
  async reconnect(e) {
    try {
      dt.info("Attempting to reconnect..."), !this.isActive() && !this.stopReconnection && !this.isReconnecting && (this.stop(), this.emit("reconnect", {
        timeout: is(this.reconnectionInterval),
        error: e != null && e.error ? e == null ? void 0 : e.error : new Error("Attempting to reconnect")
      }), this.isReconnecting = !0, await this.connect(this.options), this.alreadyDisconnected = !1, this.reconnectionInterval = ss, this.firstReconnection = !0, this.isReconnecting = !1);
    } catch (t) {
      this.isReconnecting = !1, this.reconnectionInterval = is(this.reconnectionInterval), dt.error("Reconnection failed, retrying in ".concat(this.reconnectionInterval, "ms. "), t), setTimeout(() => this.reconnect({ error: t }), this.reconnectionInterval);
    }
  }
  async replaceConnection() {
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async connect(e) {
  }
}
const is = (r) => r < ha ? r * 2 : r;
class Mr {
  constructor(e) {
    this.bitOffset = 0, this.data = e;
  }
  readBits(e) {
    if (this.bitOffset + e > this.data.length * 8)
      throw new Error("Attempted to read past the end of the bitstream");
    let t = 0;
    for (let i = 0; i < e; i++) {
      const u = Math.floor(this.bitOffset / 8), m = 7 - this.bitOffset % 8, f = this.data[u] >> m & 1;
      t |= f << e - 1 - i, this.bitOffset++;
    }
    return t;
  }
  skip(e) {
    this.bitOffset += e;
  }
  readExpGolombUnsigned() {
    let e = -1;
    for (let t = 0; t === 0; e++)
      t = this.readBits(1);
    return (1 << e) - 1 + this.readBits(e);
  }
  readExpGolombSigned() {
    const e = this.readExpGolombUnsigned();
    return e % 2 === 0 ? -(e / 2) : (e + 1) / 2;
  }
}
const ma = "d40e38ea-d419-4c62-94ed-20ac37b4e4fa";
class pa {
  constructor(e = ge.H264) {
    this.sps = /* @__PURE__ */ new Map(), this.pps = /* @__PURE__ */ new Map(), this.activeSPS = null, this.codec = e;
  }
  collectPPS(e) {
    this.codec === ge.H264 ? this.collectH264PPS(e) : this.collectH265PPS(e);
  }
  collectSPS(e) {
    this.codec === ge.H264 ? this.collectH264SPS(e) : this.collectH265SPS(e);
  }
  collectH264SPS(e) {
    const t = new Mr(e), i = t.readBits(8), u = [100, 110, 122, 244, 44, 83, 86, 118, 128, 138, 139, 134, 135];
    t.skip(8), t.skip(8);
    const m = t.readExpGolombUnsigned();
    if (m > 31 || m < 0)
      throw new Error("Invalid seq_parameter_set_id");
    if (u.includes(i)) {
      const b = t.readExpGolombUnsigned();
      if (b === 3 && t.skip(1), t.readExpGolombUnsigned(), t.readExpGolombUnsigned(), t.skip(1), t.readBits(1)) {
        const g = b !== 3 ? 8 : 12;
        for (let o = 0; o < g; o++)
          if (t.readBits(1)) {
            const c = o < 6 ? 16 : 64;
            let l = 8, a = 8;
            for (let s = 0; s < c; s++) {
              if (a !== 0) {
                const p = t.readExpGolombSigned();
                a = (l + p + 256) % 256;
              }
              l = a === 0 ? l : a;
            }
          }
      }
    }
    t.readExpGolombUnsigned();
    const f = t.readExpGolombUnsigned();
    if (f === 0)
      t.readExpGolombUnsigned();
    else if (f === 1) {
      t.skip(1), t.readExpGolombSigned(), t.readExpGolombSigned();
      const b = t.readExpGolombUnsigned();
      for (let h = 0; h < b; h++)
        t.readExpGolombSigned();
    }
    t.readExpGolombUnsigned(), t.skip(1), t.readExpGolombUnsigned(), t.readExpGolombUnsigned(), t.readBits(1) === 0 && t.skip(1), t.skip(1), t.readBits(1) && (t.readExpGolombUnsigned(), t.readExpGolombUnsigned(), t.readExpGolombUnsigned(), t.readExpGolombUnsigned());
    let n;
    if (t.readBits(1)) {
      t.readBits(1) && t.readBits(8) === 255 && (t.skip(16), t.skip(16)), t.readBits(1) && t.skip(1), t.readBits(1) && (t.skip(3), t.skip(1), t.readBits(1) && t.skip(24)), t.readBits(1) && (t.readExpGolombUnsigned(), t.readExpGolombUnsigned());
      const b = t.readBits(1) ? {
        num_units_in_tick: t.readBits(32),
        time_scale: t.readBits(32),
        fixed_frame_rate_flag: t.readBits(1)
      } : void 0, h = (l) => {
        const a = l.readExpGolombUnsigned();
        l.skip(4), l.skip(4);
        for (let y = 0; y <= a; y++)
          l.readExpGolombUnsigned(), l.readExpGolombUnsigned(), l.skip(1);
        l.skip(5);
        const s = l.readBits(5), p = l.readBits(5), d = l.readBits(5);
        return {
          cpb_removal_delay_length_minus1: s,
          dpb_output_delay_length_minus1: p,
          time_offset_length: d
        };
      }, g = t.readBits(1) ? h(t) : void 0, o = t.readBits(1) ? h(t) : void 0;
      (g || o) && t.skip(1);
      const c = t.readBits(1);
      n = {
        timing_info: b,
        nal_hrd_parameters: g,
        vcl_hrd_parameters: o,
        pic_struct_present_flag: c
      };
    }
    this.sps.set(m, {
      vui_parameters: n
    });
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  collectH265SPS(e) {
  }
  collectH264PPS(e) {
    const t = new Mr(e), i = t.readExpGolombUnsigned();
    if (i > 255 || i < 0)
      throw new Error("Invalid pic_parameter_set_id");
    const u = t.readExpGolombUnsigned();
    this.pps.set(i, {
      seq_parameter_set_id: u
    });
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  collectH265PPS(e) {
  }
  findActiveSPS(e) {
    const t = new Mr(e);
    t.readExpGolombUnsigned(), t.readExpGolombUnsigned();
    const i = t.readExpGolombUnsigned(), u = this.pps.get(i);
    if (u) {
      const m = this.sps.get(u.seq_parameter_set_id);
      if (m) {
        this.activeSPS = m;
        return;
      }
    }
    throw new Error("Cannot find the active SPS");
  }
}
new pa();
const Kr = window.RTCRtpSender && !!window.RTCRtpSender.prototype.createEncodedStreams && typeof window.RTCRtpSender.prototype.createEncodedStreams == "function" && window.RTCRtpReceiver && !!window.RTCRtpReceiver.prototype.createEncodedStreams, pi = "RTCRtpScriptTransform" in window, gi = "KGZ1bmN0aW9uKCl7InVzZSBzdHJpY3QiO3ZhciBqPXR5cGVvZiBnbG9iYWxUaGlzPCJ1Ij9nbG9iYWxUaGlzOnR5cGVvZiB3aW5kb3c8InUiP3dpbmRvdzp0eXBlb2YgZ2xvYmFsPCJ1Ij9nbG9iYWw6dHlwZW9mIHNlbGY8InUiP3NlbGY6e307ZnVuY3Rpb24gcShuKXtyZXR1cm4gbiYmbi5fX2VzTW9kdWxlJiZPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwobiwiZGVmYXVsdCIpP24uZGVmYXVsdDpufXZhciBSPXtleHBvcnRzOnt9fTsvKiEKICoganMtbG9nZ2VyIC0gaHR0cDovL2dpdGh1Yi5jb20vam9ubnlyZWV2ZXMvanMtbG9nZ2VyCiAqIEpvbm55IFJlZXZlcywgaHR0cDovL2pvbm55cmVldmVzLmNvLnVrLwogKiBqcy1sb2dnZXIgbWF5IGJlIGZyZWVseSBkaXN0cmlidXRlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuCiAqLyhmdW5jdGlvbihuKXsoZnVuY3Rpb24odCl7dmFyIGU9e307ZS5WRVJTSU9OPSIxLjYuMSI7dmFyIHMscj17fSxvPWZ1bmN0aW9uKGksdSl7cmV0dXJuIGZ1bmN0aW9uKCl7cmV0dXJuIHUuYXBwbHkoaSxhcmd1bWVudHMpfX0sYT1mdW5jdGlvbigpe3ZhciBpPWFyZ3VtZW50cyx1PWlbMF0sXyxjO2ZvcihjPTE7YzxpLmxlbmd0aDtjKyspZm9yKF8gaW4gaVtjXSkhKF8gaW4gdSkmJmlbY10uaGFzT3duUHJvcGVydHkoXykmJih1W19dPWlbY11bX10pO3JldHVybiB1fSxkPWZ1bmN0aW9uKGksdSl7cmV0dXJue3ZhbHVlOmksbmFtZTp1fX07ZS5UUkFDRT1kKDEsIlRSQUNFIiksZS5ERUJVRz1kKDIsIkRFQlVHIiksZS5JTkZPPWQoMywiSU5GTyIpLGUuVElNRT1kKDQsIlRJTUUiKSxlLldBUk49ZCg1LCJXQVJOIiksZS5FUlJPUj1kKDgsIkVSUk9SIiksZS5PRkY9ZCg5OSwiT0ZGIik7dmFyIGw9ZnVuY3Rpb24oaSl7dGhpcy5jb250ZXh0PWksdGhpcy5zZXRMZXZlbChpLmZpbHRlckxldmVsKSx0aGlzLmxvZz10aGlzLmluZm99O2wucHJvdG90eXBlPXtzZXRMZXZlbDpmdW5jdGlvbihpKXtpJiYidmFsdWUiaW4gaSYmKHRoaXMuY29udGV4dC5maWx0ZXJMZXZlbD1pKX0sZ2V0TGV2ZWw6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5jb250ZXh0LmZpbHRlckxldmVsfSxlbmFibGVkRm9yOmZ1bmN0aW9uKGkpe3ZhciB1PXRoaXMuY29udGV4dC5maWx0ZXJMZXZlbDtyZXR1cm4gaS52YWx1ZT49dS52YWx1ZX0sdHJhY2U6ZnVuY3Rpb24oKXt0aGlzLmludm9rZShlLlRSQUNFLGFyZ3VtZW50cyl9LGRlYnVnOmZ1bmN0aW9uKCl7dGhpcy5pbnZva2UoZS5ERUJVRyxhcmd1bWVudHMpfSxpbmZvOmZ1bmN0aW9uKCl7dGhpcy5pbnZva2UoZS5JTkZPLGFyZ3VtZW50cyl9LHdhcm46ZnVuY3Rpb24oKXt0aGlzLmludm9rZShlLldBUk4sYXJndW1lbnRzKX0sZXJyb3I6ZnVuY3Rpb24oKXt0aGlzLmludm9rZShlLkVSUk9SLGFyZ3VtZW50cyl9LHRpbWU6ZnVuY3Rpb24oaSl7dHlwZW9mIGk9PSJzdHJpbmciJiZpLmxlbmd0aD4wJiZ0aGlzLmludm9rZShlLlRJTUUsW2ksInN0YXJ0Il0pfSx0aW1lRW5kOmZ1bmN0aW9uKGkpe3R5cGVvZiBpPT0ic3RyaW5nIiYmaS5sZW5ndGg+MCYmdGhpcy5pbnZva2UoZS5USU1FLFtpLCJlbmQiXSl9LGludm9rZTpmdW5jdGlvbihpLHUpe3MmJnRoaXMuZW5hYmxlZEZvcihpKSYmcyh1LGEoe2xldmVsOml9LHRoaXMuY29udGV4dCkpfX07dmFyIGY9bmV3IGwoe2ZpbHRlckxldmVsOmUuT0ZGfSk7KGZ1bmN0aW9uKCl7dmFyIGk9ZTtpLmVuYWJsZWRGb3I9byhmLGYuZW5hYmxlZEZvciksaS50cmFjZT1vKGYsZi50cmFjZSksaS5kZWJ1Zz1vKGYsZi5kZWJ1ZyksaS50aW1lPW8oZixmLnRpbWUpLGkudGltZUVuZD1vKGYsZi50aW1lRW5kKSxpLmluZm89byhmLGYuaW5mbyksaS53YXJuPW8oZixmLndhcm4pLGkuZXJyb3I9byhmLGYuZXJyb3IpLGkubG9nPWkuaW5mb30pKCksZS5zZXRIYW5kbGVyPWZ1bmN0aW9uKGkpe3M9aX0sZS5zZXRMZXZlbD1mdW5jdGlvbihpKXtmLnNldExldmVsKGkpO2Zvcih2YXIgdSBpbiByKXIuaGFzT3duUHJvcGVydHkodSkmJnJbdV0uc2V0TGV2ZWwoaSl9LGUuZ2V0TGV2ZWw9ZnVuY3Rpb24oKXtyZXR1cm4gZi5nZXRMZXZlbCgpfSxlLmdldD1mdW5jdGlvbihpKXtyZXR1cm4gcltpXXx8KHJbaV09bmV3IGwoYSh7bmFtZTppfSxmLmNvbnRleHQpKSl9LGUuY3JlYXRlRGVmYXVsdEhhbmRsZXI9ZnVuY3Rpb24oaSl7aT1pfHx7fSxpLmZvcm1hdHRlcj1pLmZvcm1hdHRlcnx8ZnVuY3Rpb24ocCxnKXtnLm5hbWUmJnAudW5zaGlmdCgiWyIrZy5uYW1lKyJdIil9O3ZhciB1PXt9LF89ZnVuY3Rpb24oYyxwKXtGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHkuY2FsbChjLGNvbnNvbGUscCl9O3JldHVybiB0eXBlb2YgY29uc29sZT4idSI/ZnVuY3Rpb24oKXt9OmZ1bmN0aW9uKGMscCl7Yz1BcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChjKTt2YXIgZz1jb25zb2xlLmxvZyxoO3AubGV2ZWw9PT1lLlRJTUU/KGg9KHAubmFtZT8iWyIrcC5uYW1lKyJdICI6IiIpK2NbMF0sY1sxXT09PSJzdGFydCI/Y29uc29sZS50aW1lP2NvbnNvbGUudGltZShoKTp1W2hdPW5ldyBEYXRlKCkuZ2V0VGltZSgpOmNvbnNvbGUudGltZUVuZD9jb25zb2xlLnRpbWVFbmQoaCk6XyhnLFtoKyI6ICIrKG5ldyBEYXRlKCkuZ2V0VGltZSgpLXVbaF0pKyJtcyJdKSk6KHAubGV2ZWw9PT1lLldBUk4mJmNvbnNvbGUud2Fybj9nPWNvbnNvbGUud2FybjpwLmxldmVsPT09ZS5FUlJPUiYmY29uc29sZS5lcnJvcj9nPWNvbnNvbGUuZXJyb3I6cC5sZXZlbD09PWUuSU5GTyYmY29uc29sZS5pbmZvP2c9Y29uc29sZS5pbmZvOnAubGV2ZWw9PT1lLkRFQlVHJiZjb25zb2xlLmRlYnVnP2c9Y29uc29sZS5kZWJ1ZzpwLmxldmVsPT09ZS5UUkFDRSYmY29uc29sZS50cmFjZSYmKGc9Y29uc29sZS50cmFjZSksaS5mb3JtYXR0ZXIoYyxwKSxfKGcsYykpfX0sZS51c2VEZWZhdWx0cz1mdW5jdGlvbihpKXtlLnNldExldmVsKGkmJmkuZGVmYXVsdExldmVsfHxlLkRFQlVHKSxlLnNldEhhbmRsZXIoZS5jcmVhdGVEZWZhdWx0SGFuZGxlcihpKSl9LGUuc2V0RGVmYXVsdHM9ZS51c2VEZWZhdWx0cyxuLmV4cG9ydHM/bi5leHBvcnRzPWU6KGUuX3ByZXZMb2dnZXI9dC5Mb2dnZXIsZS5ub0NvbmZsaWN0PWZ1bmN0aW9uKCl7cmV0dXJuIHQuTG9nZ2VyPWUuX3ByZXZMb2dnZXIsZX0sdC5Mb2dnZXI9ZSl9KShqKX0pKFIpO3ZhciBWPVIuZXhwb3J0cyxHPXEoVik7Y2xhc3MgVXtjb25zdHJ1Y3Rvcih0KXt0aGlzLmJpdE9mZnNldD0wLHRoaXMuZGF0YT10fXJlYWRCaXRzKHQpe2lmKHRoaXMuYml0T2Zmc2V0K3Q+dGhpcy5kYXRhLmxlbmd0aCo4KXRocm93IG5ldyBFcnJvcigiQXR0ZW1wdGVkIHRvIHJlYWQgcGFzdCB0aGUgZW5kIG9mIHRoZSBiaXRzdHJlYW0iKTtsZXQgZT0wO2ZvcihsZXQgcz0wO3M8dDtzKyspe2NvbnN0IHI9TWF0aC5mbG9vcih0aGlzLmJpdE9mZnNldC84KSxvPTctdGhpcy5iaXRPZmZzZXQlOCxhPXRoaXMuZGF0YVtyXT4+byYxO2V8PWE8PHQtMS1zLHRoaXMuYml0T2Zmc2V0Kyt9cmV0dXJuIGV9c2tpcCh0KXt0aGlzLmJpdE9mZnNldCs9dH1yZWFkRXhwR29sb21iVW5zaWduZWQoKXtsZXQgdD0tMTtmb3IobGV0IGU9MDtlPT09MDt0KyspZT10aGlzLnJlYWRCaXRzKDEpO3JldHVybigxPDx0KS0xK3RoaXMucmVhZEJpdHModCl9cmVhZEV4cEdvbG9tYlNpZ25lZCgpe2NvbnN0IHQ9dGhpcy5yZWFkRXhwR29sb21iVW5zaWduZWQoKTtyZXR1cm4gdCUyPT09MD8tKHQvMik6KHQrMSkvMn19dmFyIHk9KG49PihuLlZQOD0idnA4IixuLlZQOT0idnA5IixuLkgyNjQ9ImgyNjQiLG4uQVYxPSJhdjEiLG4uSDI2NT0iaDI2NSIsbikpKHl8fHt9KTtjb25zdCBFPXtTTElDRV9OT05fSURSOjEsU0xJQ0VfUEFSVElUSU9OX0E6MixTTElDRV9JRFI6NSxTRUlfSDI2NDo2LFNFSV9IMjY1X1BSRUZJWDozOSxTRUlfSDI2NV9TVUZGSVg6NDAsU1BTX0gyNjQ6NyxTUFNfSDI2NTozMyxQUFNfSDI2NDo4LFBQU19IMjY1OjM0fSxPPXtQSUNfVElNSU5HOjEsVVNFUl9EQVRBX1VOUkVHSVNURVJFRDo1fSxTPXtMRUdBQ1k6MSxORVc6MixUSU1FQ09ERTozLE9USEVSOjR9LFk9IjZlOWNmZDJhLTU5MDctNDlmZi1iMzYzLTg5NzhhNmU4MzQwZSIsWD0iOWEyMWYzYmUtMzFmMC00Yjc4LWIwYmUtYzdmN2RiYjk3MjUwIixrPSJkNDBlMzhlYS1kNDE5LTRjNjItOTRlZC0yMGFjMzdiNGU0ZmEiO2NsYXNzICR7Y29uc3RydWN0b3IodD15LkgyNjQpe3RoaXMuc3BzPW5ldyBNYXAsdGhpcy5wcHM9bmV3IE1hcCx0aGlzLmFjdGl2ZVNQUz1udWxsLHRoaXMuY29kZWM9dH1jb2xsZWN0UFBTKHQpe3RoaXMuY29kZWM9PT15LkgyNjQ/dGhpcy5jb2xsZWN0SDI2NFBQUyh0KTp0aGlzLmNvbGxlY3RIMjY1UFBTKHQpfWNvbGxlY3RTUFModCl7dGhpcy5jb2RlYz09PXkuSDI2ND90aGlzLmNvbGxlY3RIMjY0U1BTKHQpOnRoaXMuY29sbGVjdEgyNjVTUFModCl9Y29sbGVjdEgyNjRTUFModCl7Y29uc3QgZT1uZXcgVSh0KSxzPWUucmVhZEJpdHMoOCkscj1bMTAwLDExMCwxMjIsMjQ0LDQ0LDgzLDg2LDExOCwxMjgsMTM4LDEzOSwxMzQsMTM1XTtlLnNraXAoOCksZS5za2lwKDgpO2NvbnN0IG89ZS5yZWFkRXhwR29sb21iVW5zaWduZWQoKTtpZihvPjMxfHxvPDApdGhyb3cgbmV3IEVycm9yKCJJbnZhbGlkIHNlcV9wYXJhbWV0ZXJfc2V0X2lkIik7aWYoci5pbmNsdWRlcyhzKSl7Y29uc3QgbD1lLnJlYWRFeHBHb2xvbWJVbnNpZ25lZCgpO2lmKGw9PT0zJiZlLnNraXAoMSksZS5yZWFkRXhwR29sb21iVW5zaWduZWQoKSxlLnJlYWRFeHBHb2xvbWJVbnNpZ25lZCgpLGUuc2tpcCgxKSxlLnJlYWRCaXRzKDEpKXtjb25zdCBpPWwhPT0zPzg6MTI7Zm9yKGxldCB1PTA7dTxpO3UrKylpZihlLnJlYWRCaXRzKDEpKXtjb25zdCBfPXU8Nj8xNjo2NDtsZXQgYz04LHA9ODtmb3IobGV0IGc9MDtnPF87ZysrKXtpZihwIT09MCl7Y29uc3QgaD1lLnJlYWRFeHBHb2xvbWJTaWduZWQoKTtwPShjK2grMjU2KSUyNTZ9Yz1wPT09MD9jOnB9fX19ZS5yZWFkRXhwR29sb21iVW5zaWduZWQoKTtjb25zdCBhPWUucmVhZEV4cEdvbG9tYlVuc2lnbmVkKCk7aWYoYT09PTApZS5yZWFkRXhwR29sb21iVW5zaWduZWQoKTtlbHNlIGlmKGE9PT0xKXtlLnNraXAoMSksZS5yZWFkRXhwR29sb21iU2lnbmVkKCksZS5yZWFkRXhwR29sb21iU2lnbmVkKCk7Y29uc3QgbD1lLnJlYWRFeHBHb2xvbWJVbnNpZ25lZCgpO2ZvcihsZXQgZj0wO2Y8bDtmKyspZS5yZWFkRXhwR29sb21iU2lnbmVkKCl9ZS5yZWFkRXhwR29sb21iVW5zaWduZWQoKSxlLnNraXAoMSksZS5yZWFkRXhwR29sb21iVW5zaWduZWQoKSxlLnJlYWRFeHBHb2xvbWJVbnNpZ25lZCgpLGUucmVhZEJpdHMoMSk9PT0wJiZlLnNraXAoMSksZS5za2lwKDEpLGUucmVhZEJpdHMoMSkmJihlLnJlYWRFeHBHb2xvbWJVbnNpZ25lZCgpLGUucmVhZEV4cEdvbG9tYlVuc2lnbmVkKCksZS5yZWFkRXhwR29sb21iVW5zaWduZWQoKSxlLnJlYWRFeHBHb2xvbWJVbnNpZ25lZCgpKTtsZXQgZDtpZihlLnJlYWRCaXRzKDEpKXtlLnJlYWRCaXRzKDEpJiZlLnJlYWRCaXRzKDgpPT09MjU1JiYoZS5za2lwKDE2KSxlLnNraXAoMTYpKSxlLnJlYWRCaXRzKDEpJiZlLnNraXAoMSksZS5yZWFkQml0cygxKSYmKGUuc2tpcCgzKSxlLnNraXAoMSksZS5yZWFkQml0cygxKSYmZS5za2lwKDI0KSksZS5yZWFkQml0cygxKSYmKGUucmVhZEV4cEdvbG9tYlVuc2lnbmVkKCksZS5yZWFkRXhwR29sb21iVW5zaWduZWQoKSk7Y29uc3QgbD1lLnJlYWRCaXRzKDEpP3tudW1fdW5pdHNfaW5fdGljazplLnJlYWRCaXRzKDMyKSx0aW1lX3NjYWxlOmUucmVhZEJpdHMoMzIpLGZpeGVkX2ZyYW1lX3JhdGVfZmxhZzplLnJlYWRCaXRzKDEpfTp2b2lkIDAsZj1jPT57Y29uc3QgcD1jLnJlYWRFeHBHb2xvbWJVbnNpZ25lZCgpO2Muc2tpcCg0KSxjLnNraXAoNCk7Zm9yKGxldCBEPTA7RDw9cDtEKyspYy5yZWFkRXhwR29sb21iVW5zaWduZWQoKSxjLnJlYWRFeHBHb2xvbWJVbnNpZ25lZCgpLGMuc2tpcCgxKTtjLnNraXAoNSk7Y29uc3QgZz1jLnJlYWRCaXRzKDUpLGg9Yy5yZWFkQml0cyg1KSxBPWMucmVhZEJpdHMoNSk7cmV0dXJue2NwYl9yZW1vdmFsX2RlbGF5X2xlbmd0aF9taW51czE6ZyxkcGJfb3V0cHV0X2RlbGF5X2xlbmd0aF9taW51czE6aCx0aW1lX29mZnNldF9sZW5ndGg6QX19LGk9ZS5yZWFkQml0cygxKT9mKGUpOnZvaWQgMCx1PWUucmVhZEJpdHMoMSk/ZihlKTp2b2lkIDA7KGl8fHUpJiZlLnNraXAoMSk7Y29uc3QgXz1lLnJlYWRCaXRzKDEpO2Q9e3RpbWluZ19pbmZvOmwsbmFsX2hyZF9wYXJhbWV0ZXJzOmksdmNsX2hyZF9wYXJhbWV0ZXJzOnUscGljX3N0cnVjdF9wcmVzZW50X2ZsYWc6X319dGhpcy5zcHMuc2V0KG8se3Z1aV9wYXJhbWV0ZXJzOmR9KX1jb2xsZWN0SDI2NVNQUyh0KXt9Y29sbGVjdEgyNjRQUFModCl7Y29uc3QgZT1uZXcgVSh0KSxzPWUucmVhZEV4cEdvbG9tYlVuc2lnbmVkKCk7aWYocz4yNTV8fHM8MCl0aHJvdyBuZXcgRXJyb3IoIkludmFsaWQgcGljX3BhcmFtZXRlcl9zZXRfaWQiKTtjb25zdCByPWUucmVhZEV4cEdvbG9tYlVuc2lnbmVkKCk7dGhpcy5wcHMuc2V0KHMse3NlcV9wYXJhbWV0ZXJfc2V0X2lkOnJ9KX1jb2xsZWN0SDI2NVBQUyh0KXt9ZmluZEFjdGl2ZVNQUyh0KXtjb25zdCBlPW5ldyBVKHQpO2UucmVhZEV4cEdvbG9tYlVuc2lnbmVkKCksZS5yZWFkRXhwR29sb21iVW5zaWduZWQoKTtjb25zdCBzPWUucmVhZEV4cEdvbG9tYlVuc2lnbmVkKCkscj10aGlzLnBwcy5nZXQocyk7aWYocil7Y29uc3Qgbz10aGlzLnNwcy5nZXQoci5zZXFfcGFyYW1ldGVyX3NldF9pZCk7aWYobyl7dGhpcy5hY3RpdmVTUFM9bztyZXR1cm59fXRocm93IG5ldyBFcnJvcigiQ2Fubm90IGZpbmQgdGhlIGFjdGl2ZSBTUFMiKX19Y29uc3QgYj1uZXcgJDtmdW5jdGlvbiBIKG4sdCl7Zm9yKDt0PG4uYnl0ZUxlbmd0aC00Oyl7aWYoblt0XT09PTAmJm5bdCsxXT09PTAmJihuW3QrMl09PT0xfHxuW3QrMl09PT0wJiZuW3QrM109PT0xKSlyZXR1cm4gdDt0Kz0xfXJldHVybi0xfWZ1bmN0aW9uIFAobil7Y29uc3QgdD1uZXcgVWludDhBcnJheShuLmJ5dGVMZW5ndGgpO2xldCBlPTAscz0wO2ZvcihsZXQgcj0yO3I8bi5ieXRlTGVuZ3RoO3IrKyluW3JdPT09MyYmbltyLTFdPT09MCYmbltyLTJdPT09MCYmKHQuc2V0KG4uc3ViYXJyYXkocyxyKSxlKSxlKz1yLXMscz1yKzEpO3JldHVybiBzPG4uYnl0ZUxlbmd0aCYmdC5zZXQobi5zdWJhcnJheShzKSxlKSx0fWZ1bmN0aW9uIEoobix0KXtsZXQgZT0wO2NvbnN0IHM9dD09PXkuSDI2ND8xOjIscj1bXTtmb3IoO2U8bi5ieXRlTGVuZ3RoLTQ7KXtjb25zdCBvPUgobixlKTtpZihvPj1lKXtjb25zdCBhPW5bbysyXT09PTE/Mzo0LGQ9SChuLG8rYStzKTtpZihkPm8pci5wdXNoKG4uc3ViYXJyYXkobyxkKSksZT1kO2Vsc2V7ci5wdXNoKG4uc3ViYXJyYXkobykpO2JyZWFrfX1lbHNlIGJyZWFrfXJldHVybiByfWZ1bmN0aW9uIEsobix0KXtsZXQgZT0hMDtyZXR1cm4gSihuLHQpLmZpbHRlcihzPT57Y29uc3Qgcj1zWzJdPT09MT8zOjQsbz10PT09eS5IMjY0PzE6MixhPXNbcl0sZD10PT09eS5IMjY0P2EmMzE6YT4+MSY2MztpZihlKXN3aXRjaChkKXtjYXNlIEUuUFBTX0gyNjQ6Y2FzZSBFLlBQU19IMjY1OmIuY29sbGVjdFBQUyhQKHMuc3ViYXJyYXkocitvKSkpO2JyZWFrO2Nhc2UgRS5TUFNfSDI2NDpjYXNlIEUuU1BTX0gyNjU6Yi5jb2xsZWN0U1BTKFAocy5zdWJhcnJheShyK28pKSk7YnJlYWs7Y2FzZSBFLlNMSUNFX0lEUjpjYXNlIEUuU0xJQ0VfTk9OX0lEUjpjYXNlIEUuU0xJQ0VfUEFSVElUSU9OX0E6dHJ5e2IuZmluZEFjdGl2ZVNQUyhQKHMuc3ViYXJyYXkocitvKSkpLGU9ITF9Y2F0Y2gobCl7Y29uc29sZS5pbmZvKCJGYWlsZWQgdG8gZmluZCBhY3RpdmUgU1BTLiBXaWxsIG5vdCBiZSBhYmxlIHRvIGV4dHJhY3QgUElDIHRpbWluZyBtZXRhZGF0YSIpfWJyZWFrfXJldHVybltFLlNFSV9IMjY0LEUuU0VJX0gyNjVfUFJFRklYLEUuU0VJX0gyNjVfU1VGRklYXS5pbmNsdWRlcyhkKX0pfWZ1bmN0aW9uIFoobil7bGV0IHQ9MCxlPTA7Zm9yKDtuW2VdPT09MjU1Oyl0Kz0yNTUsZSsrO3QrPW5bZV0sZSsrO2xldCBzPTA7Zm9yKDtuW2VdPT09MjU1OylzKz0yNTUsZSsrO3JldHVybiBzKz1uW2VdLGUrKyx7dHlwZTp0LGNvbnRlbnQ6bi5zdWJhcnJheShlLGUrcyl9fWZ1bmN0aW9uIFEobil7Y29uc3QgdD1uZXcgVWludDhBcnJheShMKFgpKSxlPW5ldyBVaW50OEFycmF5KEwoWSkpLHM9bmV3IFVpbnQ4QXJyYXkoTChrKSk7cmV0dXJuIHQuZXZlcnkoKHIsbyk9PnI9PT1uW29dKT9TLlRJTUVDT0RFOmUuZXZlcnkoKHIsbyk9PnI9PT1uW29dKT9TLkxFR0FDWTpzLmV2ZXJ5KChyLG8pPT5yPT09bltvXSk/Uy5ORVc6Uy5PVEhFUn1mdW5jdGlvbiBlZShuLHQpe2xldCBlPTA7bi51dWlkPXQuc3ViYXJyYXkoZSxlKzE2KSxlKz0xNjtjb25zdCBzPVEobi51dWlkKSxyPXQuc3ViYXJyYXkoZSk7c3dpdGNoKHMpe2Nhc2UgUy5MRUdBQ1k6Y2FzZSBTLk9USEVSOm4udW5yZWdpc3RlcmVkPXI7YnJlYWs7Y2FzZSBTLlRJTUVDT0RFOm4udGltZWNvZGU9QyhyKTticmVhaztjYXNlIFMuTkVXOntsZXQgbz0wO2NvbnN0IGE9TShEYXRlLm5vdygpKS5sZW5ndGgsZD1yLnN1YmFycmF5KG8sYSk7bys9YTtjb25zdCBsPXIuc3ViYXJyYXkobyk7bi50aW1lY29kZT1DKGQpLG4udW5yZWdpc3RlcmVkPWw7YnJlYWt9fX1mdW5jdGlvbiBDKG4pe2NvbnN0IHQ9bi5yZWR1Y2UoKG8sYSk9PihvPDxCaWdJbnQoOCkpK0JpZ0ludChhKSxCaWdJbnQoMCkpLGU9TnVtYmVyKHQpLHM9bmV3IERhdGUoZSk7cmV0dXJuIG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShzLnRvSVNPU3RyaW5nKCkpfWZ1bmN0aW9uIHRlKG4sdCl7dmFyIGYsaSx1LF8sYyxwLGcsaDtpZighYi5hY3RpdmVTUFMpe2NvbnNvbGUud2FybigiQ2Fubm90IGZpbmQgdGhlIGFjdGl2ZSBTUFMiKTtyZXR1cm59Y29uc3QgZT0odT0oZj1iLmFjdGl2ZVNQUy52dWlfcGFyYW1ldGVycyk9PW51bGw/dm9pZCAwOmYubmFsX2hyZF9wYXJhbWV0ZXJzKSE9bnVsbD91OihpPWIuYWN0aXZlU1BTLnZ1aV9wYXJhbWV0ZXJzKT09bnVsbD92b2lkIDA6aS52Y2xfaHJkX3BhcmFtZXRlcnMscz17Y3BiX2RwYl9kZWxheXNfcHJlc2VudF9mbGFnOmU/MTowLGNwYl9yZW1vdmFsX2RlbGF5X2xlbmd0aF9taW51czE6KF89ZT09bnVsbD92b2lkIDA6ZS5jcGJfcmVtb3ZhbF9kZWxheV9sZW5ndGhfbWludXMxKSE9bnVsbD9fOjIzLGRwYl9vdXRwdXRfZGVsYXlfbGVuZ3RoX21pbnVzMTooYz1lPT1udWxsP3ZvaWQgMDplLmRwYl9vdXRwdXRfZGVsYXlfbGVuZ3RoX21pbnVzMSkhPW51bGw/YzoyMyx0aW1lX29mZnNldF9sZW5ndGg6ZT8ocD1lLnRpbWVfb2Zmc2V0X2xlbmd0aCkhPW51bGw/cDoyNDp2b2lkIDAscGljX3N0cnVjdF9wcmVzZW50X2ZsYWc6KGg9KGc9Yi5hY3RpdmVTUFMudnVpX3BhcmFtZXRlcnMpPT1udWxsP3ZvaWQgMDpnLnBpY19zdHJ1Y3RfcHJlc2VudF9mbGFnKSE9bnVsbD9oOjB9O2lmKCFzLnBpY19zdHJ1Y3RfcHJlc2VudF9mbGFnKXtjb25zb2xlLndhcm4oInBpY19zdHJ1Y3RfcHJlc2VudF9mbGFnIGlzIG5vdCBwcmVzZW50Iik7cmV0dXJufWNvbnN0IHI9bmV3IFUodCk7cy5jcGJfZHBiX2RlbGF5c19wcmVzZW50X2ZsYWcmJihyLnNraXAocy5jcGJfcmVtb3ZhbF9kZWxheV9sZW5ndGhfbWludXMxKzEpLHIuc2tpcChzLmRwYl9vdXRwdXRfZGVsYXlfbGVuZ3RoX21pbnVzMSsxKSk7Y29uc3Qgbz1bMSwxLDEsMiwyLDMsMywyLDNdLGE9ci5yZWFkQml0cyg0KTtpZihhPj1vLmxlbmd0aCl0aHJvdyBuZXcgRXJyb3IoIkludmFsaWQgcGljX3N0cnVjdCIpO2NvbnN0IGQ9b1thXSxsPVtdO2ZvcihsZXQgQT0wO0E8ZDtBKyspaWYoci5yZWFkQml0cygxKSl7Y29uc3QgbT17bl9mcmFtZXM6MCxzZWNvbmRzX3ZhbHVlOjAsbWludXRlc192YWx1ZTowLGhvdXJzX3ZhbHVlOjAsdGltZV9vZmZzZXQ6MH07ci5za2lwKDIpLHIuc2tpcCgxKSxyLnNraXAoNSk7Y29uc3QgZmU9ci5yZWFkQml0cygxKTtpZihyLnNraXAoMiksbS5uX2ZyYW1lcz1yLnJlYWRCaXRzKDgpLGZlPyhtLnNlY29uZHNfdmFsdWU9ci5yZWFkQml0cyg2KSxtLm1pbnV0ZXNfdmFsdWU9ci5yZWFkQml0cyg2KSxtLmhvdXJzX3ZhbHVlPXIucmVhZEJpdHMoNSkpOnIucmVhZEJpdHMoMSkmJihtLnNlY29uZHNfdmFsdWU9ci5yZWFkQml0cyg2KSxyLnJlYWRCaXRzKDEpJiYobS5taW51dGVzX3ZhbHVlPXIucmVhZEJpdHMoNiksci5yZWFkQml0cygxKSYmKG0uaG91cnNfdmFsdWU9ci5yZWFkQml0cyg1KSkpKSxzLnRpbWVfb2Zmc2V0X2xlbmd0aCl0cnl7bS50aW1lX29mZnNldD1yLnJlYWRCaXRzKHMudGltZV9vZmZzZXRfbGVuZ3RoKX1jYXRjaCh6KXtjb25zb2xlLmVycm9yKCJGYWlsZWQgdG8gcmVhZCB0aW1lX29mZnNldCIseiksbS50aW1lX29mZnNldD0wfWVsc2UgbS50aW1lX29mZnNldD0wO2wucHVzaChtKX1uLnNlaVBpY1RpbWluZ1RpbWVDb2RlQXJyYXk9bH1mdW5jdGlvbiBuZShuLHQpe2lmKHQhPT15LkgyNjQmJnQhPT15LkgyNjUpdGhyb3cgbmV3IEVycm9yKCJVbnN1cHBvcnRlZCBjb2RlYyAiLmNvbmNhdCh0KSk7Y29uc3QgZT17c2VpUGljVGltaW5nVGltZUNvZGVBcnJheTpbXX07cmV0dXJuIGIuY29kZWM9dCxLKG5ldyBVaW50OEFycmF5KG4uZGF0YSksdCkuZm9yRWFjaChzPT57Y29uc3Qgcj1zWzJdPT09MT8zOjQsbz10PT09eS5IMjY0PzE6MixhPVAocy5zdWJhcnJheShyK28pKSxkPVooYSk7c3dpdGNoKGQudHlwZSl7Y2FzZSBPLlBJQ19USU1JTkc6dGUoZSxkLmNvbnRlbnQpO2JyZWFrO2Nhc2UgTy5VU0VSX0RBVEFfVU5SRUdJU1RFUkVEOmVlKGUsZC5jb250ZW50KTticmVha319KSxlfWZ1bmN0aW9uIHJlKG4pe3JldHVybi9eWzAtOWEtZkEtRl17OH0tWzAtOWEtZkEtRl17NH0tWzAtOWEtZkEtRl17NH0tWzAtOWEtZkEtRl17NH0tWzAtOWEtZkEtRl17MTJ9JC8udGVzdChuKX1mdW5jdGlvbiBMKG4pe2NvbnN0IHQ9bi5yZXBsYWNlKC8tL2csIiIpLm1hdGNoKC8uezEsMn0vZyk7aWYoIXQpdGhyb3cgbmV3IEVycm9yKCJJbnZhbGlkIFVVSUQgZm9ybWF0Iik7cmV0dXJuIHQubWFwKGU9PnBhcnNlSW50KGUsMTYpKX1mdW5jdGlvbiBzZShuLHQsZSl7Y29uc3Qgcz1uZXcgVWludDhBcnJheShMKG4pKSxyPU0oZSksbz1uZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoSlNPTi5zdHJpbmdpZnkodCkpLGE9bmV3IFVpbnQ4QXJyYXkocy5sZW5ndGgrci5sZW5ndGgrby5sZW5ndGgpO3JldHVybiBhLnNldChzKSxhLnNldChyLHMubGVuZ3RoKSxhLnNldChvLHIubGVuZ3RoK3MubGVuZ3RoKSxhfWZ1bmN0aW9uIGllKG4pe2NvbnN0IHQ9W10sZT1NYXRoLmZsb29yKG4uYnl0ZUxlbmd0aC8yNTUpLHM9bi5ieXRlTGVuZ3RoJTI1NTtmb3IobGV0IHI9MDtyPGU7cisrKXQucHVzaCgyNTUpO3JldHVybiB0LnB1c2gocyksbmV3IFVpbnQ4QXJyYXkoWzUsLi4udF0pfWZ1bmN0aW9uIG9lKG4pe2NvbnN0IHQ9W107Zm9yKGxldCBlPTA7ZTxuLmJ5dGVMZW5ndGg7ZSsrKWUrMjxuLmJ5dGVMZW5ndGgmJlswLDEsMiwzXS5pbmNsdWRlcyhuW2UrMl0pJiZuW2VdPT09MCYmbltlKzFdPT09MD8odC5wdXNoKG5bZV0pLHQucHVzaChuW2UrMV0pLGUrPTIsdC5wdXNoKDMpKTp0LnB1c2gobltlXSk7cmV0dXJuIHQucHVzaCgxMjgpLG5ldyBVaW50OEFycmF5KHQpfWZ1bmN0aW9uIE0obil7Y29uc3QgdD1bXTtpZighaXNOYU4obikpe2NvbnN0IGU9QmlnSW50KG4pO2ZvcihsZXQgcz0wO3M8TWF0aC5jZWlsKE1hdGguZmxvb3IoTWF0aC5sb2cyKG4pKzEpLzgpO3MrKyl0LnVuc2hpZnQoZT4+QmlnSW50KDgqcykmQmlnSW50KDI1NSkpfXJldHVybiBuZXcgVWludDhBcnJheSh0KX1mdW5jdGlvbiBhZSh7dXVpZDpuLHBheWxvYWQ6dCx0aW1lY29kZTplPURhdGUubm93KCl9KXtjb25zdCBzPVswLDAsMCwxXSxyPVsxMDJdLG89c2Uobix0LGUpLGE9aWUobyksZD1vZShvKSxsPW5ldyBVaW50OEFycmF5KHMubGVuZ3RoK3IubGVuZ3RoK2EubGVuZ3RoK2QubGVuZ3RoKTtyZXR1cm4gbC5zZXQocyksbC5zZXQocixzLmxlbmd0aCksbC5zZXQoYSxzLmxlbmd0aCtyLmxlbmd0aCksbC5zZXQoZCxzLmxlbmd0aCtyLmxlbmd0aCthLmxlbmd0aCksbH1mdW5jdGlvbiBjZSh7dXVpZDpuLHBheWxvYWQ6dCx0aW1lY29kZTplfSxzKXtpZihuPT09IiJ8fCF0KXRocm93IG5ldyBFcnJvcigidXVpZCBhbmQgcGF5bG9hZCBjYW5ub3QgYmUgZW1wdHkiKTtuJiZ0eXBlb2Ygbj09InN0cmluZyImJiFyZShuKSYmKGNvbnNvbGUud2FybigiSW52YWxpZCBVVUlELiBVc2luZyBkZWZhdWx0IFVVSUQuIiksbj1rKTtjb25zdCByPWFlKHt1dWlkOm4scGF5bG9hZDp0LHRpbWVjb2RlOmV9KSxvPW5ldyBEYXRhVmlldyhzLmRhdGEpLGE9bmV3IEFycmF5QnVmZmVyKHMuZGF0YS5ieXRlTGVuZ3RoK3IuYnl0ZUxlbmd0aCksZD1uZXcgRGF0YVZpZXcoYSk7Zm9yKGxldCBsPTA7bDxzLmRhdGEuYnl0ZUxlbmd0aDtsKyspZC5zZXRVaW50OChsLG8uZ2V0VWludDgobCkpO2ZvcihsZXQgbD0wO2w8ci5ieXRlTGVuZ3RoO2wrKylkLnNldFVpbnQ4KHMuZGF0YS5ieXRlTGVuZ3RoK2wscltsXSk7cy5kYXRhPWF9Ry5nZXQoIlRyYW5zZm9ybVdvcmtlciIpLnNldExldmVsKEcuREVCVUcpO2NvbnN0IGxlPTJlMyx2PVtdO2xldCBJPSIiLEI9e307Y29uc3QgVD17fTtsZXQgdz1bXTtmdW5jdGlvbiBOKG4pe3JldHVybiBuZXcgVHJhbnNmb3JtU3RyZWFtKHtzdGFydCgpe30sZmx1c2goKXt9LGFzeW5jIHRyYW5zZm9ybSh0LGUpe3ZhciBzO2lmKHQgaW5zdGFuY2VvZiBSVENFbmNvZGVkVmlkZW9GcmFtZSl7Y29uc3Qgcj10LmdldE1ldGFkYXRhKCkucGF5bG9hZFR5cGUsbz1yP0Jbcl06STtpZihvPT09IkgyNjQiKXtjb25zdCBhPW5lKHQsbyk7KGEudGltZWNvZGV8fGEudW5yZWdpc3RlcmVkfHxhLnNlaVBpY1RpbWluZ1RpbWVDb2RlQXJyYXkmJigocz1hLnNlaVBpY1RpbWluZ1RpbWVDb2RlQXJyYXkpPT1udWxsP3ZvaWQgMDpzLmxlbmd0aCk+MCkmJnNlbGYucG9zdE1lc3NhZ2Uoe2V2ZW50OiJtZXRhZGF0YSIsbWlkOm4sbWV0YWRhdGE6YX0pfXNlbGYucG9zdE1lc3NhZ2Uoe2V2ZW50OiJjb21wbGV0ZSIsZnJhbWU6e3R5cGU6dC50eXBlLHRpbWVzdGFtcDp0LnRpbWVzdGFtcCxkYXRhOnQuZGF0YX19KX1lLmVucXVldWUodCl9fSl9ZnVuY3Rpb24gRigpe09iamVjdC5rZXlzKFQpLnNvcnQoKS5qb2luKCk9PT13LnNvcnQoKS5qb2luKCkmJih2LnNoaWZ0KCksdz1bXSl9ZnVuY3Rpb24gZGUobil7Y29uc3QgdD1uZXcgRGF0ZSgpLmdldFRpbWUoKTtUW25dPXQsT2JqZWN0LmtleXMoVCkuZmlsdGVyKHM9PnQtVFtzXT5sZSkuZm9yRWFjaChzPT57ZGVsZXRlIFRbc10sZGVsZXRlIHdbcGFyc2VJbnQocyldfSksRigpfWZ1bmN0aW9uIFcoKXtyZXR1cm4gbmV3IFRyYW5zZm9ybVN0cmVhbSh7c3RhcnQoKXt9LGZsdXNoKCl7fSxhc3luYyB0cmFuc2Zvcm0obix0KXtpZihuIGluc3RhbmNlb2YgUlRDRW5jb2RlZFZpZGVvRnJhbWUpe2NvbnN0IHM9bi5nZXRNZXRhZGF0YSgpLnN5bmNocm9uaXphdGlvblNvdXJjZTtpZihkZShzKSwhdy5pbmNsdWRlcyhzKSYmdi5sZW5ndGgpdHJ5e2lmKCEvKGgyNls0XSkvLnRlc3QoSSkpdGhyb3cgbmV3IEVycm9yKCJTZW5kaW5nIG1ldGFkYXRhIGlzIG5vdCBzdXBwb3J0ZWQgd2l0aCBhbnkgb3RoZXIgY29kZWMgb3RoZXIgdGhhbiBILjI2NCIpO3ZbMF0udXVpZD09PWsmJih2WzBdLnRpbWVjb2RlPURhdGUubm93KCkpLGNlKHZbMF0sbiksdy5wdXNoKHMpfWNhdGNoKHIpe2NvbnNvbGUuZXJyb3Iocil9ZmluYWxseXtGKCl9fXQuZW5xdWV1ZShuKX19KX1mdW5jdGlvbiB4KHtyZWFkYWJsZTpuLHdyaXRhYmxlOnR9LGUpe24ucGlwZVRocm91Z2goZSkucGlwZVRvKHQpfWFkZEV2ZW50TGlzdGVuZXIoInJ0Y3RyYW5zZm9ybSIsbj0+e2NvbnN0IHQ9bjtsZXQgZTtpZih0LnRyYW5zZm9ybWVyLm9wdGlvbnMubmFtZT09PSJzZW5kZXJUcmFuc2Zvcm0iKUk9dC50cmFuc2Zvcm1lci5vcHRpb25zLmNvZGVjLGU9VygpO2Vsc2UgaWYodC50cmFuc2Zvcm1lci5vcHRpb25zLm5hbWU9PT0icmVjZWl2ZXJUcmFuc2Zvcm0iKUI9dC50cmFuc2Zvcm1lci5vcHRpb25zLnBheWxvYWRUeXBlQ29kZWN8fHt9LEk9dC50cmFuc2Zvcm1lci5vcHRpb25zLmNvZGVjfHwiIixlPU4odC50cmFuc2Zvcm1lci5vcHRpb25zLm1pZCk7ZWxzZSByZXR1cm47eCh0LnRyYW5zZm9ybWVyLGUpfSksYWRkRXZlbnRMaXN0ZW5lcigibWVzc2FnZSIsbj0+e2NvbnN0e2FjdGlvbjp0fT1uLmRhdGE7c3dpdGNoKHQpe2Nhc2UiaW5zZXJ0YWJsZS1zdHJlYW1zLXNlbmRlciI6ST1uLmRhdGEuY29kZWMseChuLmRhdGEsVygpKTticmVhaztjYXNlImluc2VydGFibGUtc3RyZWFtcy1yZWNlaXZlciI6Qj1uLmRhdGEucGF5bG9hZFR5cGVDb2RlY3x8e30sST1uLmRhdGEuY29kZWN8fCIiLHgobi5kYXRhLE4obi5kYXRhLm1pZCkpO2JyZWFrO2Nhc2UibWV0YWRhdGEtc2VpLXVzZXItZGF0YS11bnJlZ2lzdGVyZWQiOnYucHVzaCh7dXVpZDpuLmRhdGEudXVpZCxwYXlsb2FkOm4uZGF0YS5wYXlsb2FkfSk7YnJlYWt9fSl9KSgpOwo=", ga = (r) => Uint8Array.from(atob(r), (e) => e.charCodeAt(0)), os = typeof self < "u" && self.Blob && new Blob([ga(gi)], { type: "text/javascript;charset=utf-8" });
function Hr(r) {
  let e;
  try {
    if (e = os && (self.URL || self.webkitURL).createObjectURL(os), !e) throw "";
    const t = new Worker(e, {
      name: r == null ? void 0 : r.name
    });
    return t.addEventListener("error", () => {
      (self.URL || self.webkitURL).revokeObjectURL(e);
    }), t;
  } catch (t) {
    return new Worker(
      "data:text/javascript;base64," + gi,
      {
        name: r == null ? void 0 : r.name
      }
    );
  } finally {
    e && (self.URL || self.webkitURL).revokeObjectURL(e);
  }
}
const Re = Fe.get("Publish"), sr = {
  sourceId: null,
  mediaStream: null,
  bandwidth: 0,
  metadata: !1,
  disableVideo: !1,
  disableAudio: !1,
  codec: ge.H264,
  simulcast: !1,
  scalabilityMode: null,
  peerConfig: {
    autoInitStats: !0,
    statsIntervalMs: 1e3
  }
};
class qa extends mi {
  constructor(e, t = !0) {
    super(e, Re, t), this.recordingAvailable = !1, this.worker = null, this.streamName = "", this.stopReemitingWebRTCPeerInstanceEvents = null, this.stopReemitingSignalingInstanceEvents = null, this.options = sr;
  }
  /**
   * Starts broadcast to an existing stream name.
   *
   * In the example, `getYourMediaStream` and `getYourPublisherConnection` is your own implementation.
   * @param {Object} options - General broadcast options.
   * @param {String} options.sourceId - Source unique id. Only avialable if stream is multisource.
   * @param {Boolean} [options.stereo = false] - True to modify SDP for support stereo. Otherwise False.
   * @param {Boolean} [options.dtx = false] - True to modify SDP for supporting dtx in opus. Otherwise False.
   * @param {Boolean} [options.absCaptureTime = false] - True to modify SDP for supporting absolute capture time header extension. Otherwise False.
   * @param {Boolean} [options.dependencyDescriptor = false] - True to modify SDP for supporting aom dependency descriptor header extension. Otherwise False.
   * @param {MediaStream|Array<MediaStreamTrack>} options.mediaStream - MediaStream to offer in a stream. This object must have
   * 1 audio track and 1 video track, or at least one of them. Alternative you can provide both tracks in an array.
   * @param {Number} [options.bandwidth = 0] - Broadcast bandwidth. 0 for unlimited.
   * @param {Boolean} [options.metadata = false] - Enable metadata insertion if stream is compatible.
   * @param {Boolean} [options.disableVideo = false] - Disable the opportunity to send video stream.
   * @param {Boolean} [options.disableAudio = false] - Disable the opportunity to send audio stream.
   * @param {VideoCodec} [options.codec = 'h264'] - Codec for publish stream.
   * @param {Boolean} [options.simulcast = false] - Enable simulcast. **Only available in Chromium based browsers and with H.264 or VP8 video codecs.**
   * @param {String} [options.scalabilityMode = null] - Selected scalability mode. You can get the available capabilities using <a href="PeerConnection#.getCapabilities">PeerConnection.getCapabilities</a> method.
   * **Only available in Google Chrome.**
   * @param {RTCConfiguration} [options.peerConfig = null] - Options to configure the new RTCPeerConnection.
   * @param {Boolean} [options.record = false ] - Enable stream recording. If record is not provided, use default Token configuration. **Only available in Tokens with recording enabled.**
   * @param {Array<String>} [options.events = null] - Specify which events will be delivered by the server (any of "active" | "inactive" | "viewercount").*
   * @param {Number} [options.priority = null] - When multiple ingest streams are provided by the customer, add the ability to specify a priority between all ingest streams. Decimal integer between the range [-2^31, +2^31 - 1]. For more information, visit [our documentation](https://docs.dolby.io/streaming-apis/docs/backup-publishing).
   * @returns {Promise<void>} Promise object which resolves when the broadcast started successfully.
   * @fires PeerConnection#connectionStateChange
   * @fires Signaling#broadcastEvent
   * @example await publish.connect(options)
   * @example
   * import Publish from '@millicast/sdk'
   *
   * //Define callback for generate new token
   * const tokenGenerator = () => getYourPublisherConnection(token, streamName)
   *
   * //Create a new instance
   * const millicastPublish = new Publish(tokenGenerator)
   *
   * //Get MediaStream
   * const mediaStream = getYourMediaStream()
   *
   * //Options
   * const broadcastOptions = {
   *    mediaStream: mediaStream
   *  }
   *
   * //Start broadcast
   * try {
   *  await millicastPublish.connect(broadcastOptions)
   * } catch (e) {
   *  console.log('Connection failed, handle error', e)
   * }
   */
  async connect(e = sr) {
    const t = de.object({
      sourceId: de.string(),
      stereo: de.boolean(),
      dtx: de.boolean(),
      absCaptureTime: de.boolean(),
      dependencyDescriptor: de.boolean(),
      mediaStream: de.alternatives().try(de.array().items(de.object()), de.object()),
      bandwidth: de.number(),
      metadata: de.boolean(),
      disableVideo: de.boolean(),
      disableAudio: de.boolean(),
      codec: de.string().valid(...Object.values(ge)),
      simulcast: de.boolean(),
      scalabilityMode: de.string(),
      peerConfig: de.object(),
      record: de.boolean(),
      events: de.array().items(de.string().valid("active", "inactive", "viewercount")),
      priority: de.number()
    }), { error: i, value: u } = t.validate(e);
    i && Re.warn(i, u), this.options = we(J(J({}, sr), e), {
      peerConfig: J(J({}, sr.peerConfig), e.peerConfig),
      setSDPToPeer: !1
    }), this.options && (this.options.metadata = this.options.metadata && this.options.codec === ge.H264 && !this.options.disableVideo), await this.initConnection({ migrate: !1 });
  }
  async reconnect(e) {
    var t, i;
    this.options.mediaStream = (i = (t = this.webRTCPeer) == null ? void 0 : t.getTracks()) != null ? i : this.options.mediaStream, super.reconnect(e);
  }
  async replaceConnection() {
    var e, t;
    Re.info("Migrating current connection"), this.options.mediaStream = (t = (e = this.webRTCPeer) == null ? void 0 : e.getTracks()) != null ? t : this.options.mediaStream, await this.initConnection({ migrate: !0 });
  }
  /**
   * Initialize recording in an active stream and change the current record option.
   */
  async record() {
    var e;
    this.recordingAvailable ? (this.options.record = !0, await ((e = this.signaling) == null ? void 0 : e.cmd("record")), Re.info("Broadcaster start recording")) : Re.error("Record not available");
  }
  /**
   * Finalize recording in an active stream and change the current record option.
   */
  async unrecord() {
    var e;
    this.recordingAvailable ? (this.options.record = !1, await ((e = this.signaling) == null ? void 0 : e.cmd("unrecord")), Re.info("Broadcaster stop recording")) : Re.error("Unrecord not available");
  }
  stop() {
    var e;
    super.stop(), (e = this.worker) == null || e.terminate(), this.worker = null;
  }
  async initConnection(e) {
    var s, p, d, y;
    Re.debug("Broadcast option values: ", this.options), this.stopReconnection = !1;
    let t;
    if (!this.options.mediaStream)
      throw Re.error("Error while broadcasting. MediaStream required"), new Error("MediaStream required");
    if (!e.migrate && this.isActive())
      throw Re.warn("Broadcast currently working"), new Error("Broadcast currently working");
    let i;
    try {
      i = await this.tokenGenerator(), this.options.peerConfig && (this.options.peerConfig.iceServers = i == null ? void 0 : i.iceServers, this.options.peerConfig.encodedInsertableStreams = this.options.metadata);
    } catch (v) {
      throw Re.error("Error generating token."), v instanceof pr && (v.status === 401 || !this.autoReconnect ? this.stopReconnection = !0 : this.reconnect()), v;
    }
    if (!i)
      throw Re.error("Error while broadcasting. Publisher data required"), new Error("Publisher data required");
    const u = fi(i.jwt);
    if (this.streamName = u.millicast.streamName, this.recordingAvailable = u[da("bWlsbGljYXN0")].record, this.options.record && !this.recordingAvailable)
      throw Re.error("Error while broadcasting. Record option detected but recording is not available"), new Error("Record option detected but recording is not available");
    const m = new di({
      streamName: this.streamName,
      url: "".concat(i.urls[0], "?token=").concat(i.jwt)
    }), f = e.migrate ? new qe() : this.webRTCPeer;
    await f.createRTCPeer(this.options.peerConfig, ur.Publisher), (s = this.stopReemitingWebRTCPeerInstanceEvents) == null || s.call(this), (p = this.stopReemitingSignalingInstanceEvents) == null || p.call(this), this.stopReemitingWebRTCPeerInstanceEvents = fr(f, this, [
      Ue.connectionStateChange
    ]), this.stopReemitingSignalingInstanceEvents = fr(m, this, [
      $e.broadcastEvent
    ]);
    const n = f.getRTCLocalSDP(this.options), b = m.connect();
    t = await Promise.all([n, b]);
    const h = t[0];
    if (this.options.metadata) {
      this.worker || (this.worker = new Hr());
      const v = (d = this.getRTCPeerConnection()) == null ? void 0 : d.getSenders();
      v == null || v.forEach((S) => {
        var I;
        if (pi && this.worker)
          S.transform = new RTCRtpScriptTransform(this.worker, {
            name: "senderTransform",
            codec: this.options.codec
          });
        else if (Kr) {
          const { readable: E, writable: T } = S.createEncodedStreams();
          (I = this.worker) == null || I.postMessage(
            {
              action: "insertable-streams-sender",
              codec: this.options.codec,
              readable: E,
              writable: T
            },
            [E, T]
          );
        }
      });
    }
    let g = this.signaling;
    this.signaling = m;
    const o = this.signaling.publish(h, this.options), c = (y = f.peer) == null ? void 0 : y.setLocalDescription(
      f.sessionDescription
    );
    t = await Promise.all([o, c]);
    let l = t[0];
    !this.options.disableVideo && this.options.bandwidth && this.options.bandwidth > 0 && (l = f.updateBandwidthRestriction(l, this.options.bandwidth)), await f.setRTCRemoteSDP(l), Re.info("Broadcasting to streamName: ", this.streamName);
    let a = this.webRTCPeer;
    this.webRTCPeer = f, this.setReconnect(), e.migrate && this.webRTCPeer.on(Ue.connectionStateChange, (v) => {
      var S, I;
      ["connected", "disconnected", "failed", "closed"].includes(v) && ((S = g == null ? void 0 : g.close) == null || S.call(g), (I = a == null ? void 0 : a.closeRTCPeer) == null || I.call(a), g = a = null);
    });
  }
  /**
   * Send SEI user unregistered data as part of the frame being streamed. Only available for H.264 codec.
   * @param {SEIUserUnregisteredData} message The data to be sent as SEI user unregistered data.
   * @param {String} [uuid="d40e38ea-d419-4c62-94ed-20ac37b4e4fa"] String with UUID format as hex digit (XXXX-XX-XX-XX-XXXXXX).
   */
  sendMetadata(e, t = ma) {
    var i;
    if ((i = this.options) != null && i.metadata && this.worker)
      this.worker.postMessage({
        action: "metadata-sei-user-data-unregistered",
        uuid: t,
        payload: e
      });
    else {
      let u = "Could not send metadata due to:";
      this.options ? this.options.metadata ? this.worker || (u += "\n- Stream not being published.") : (u += "\n- Metadata option is not enabled.", this.options.codec !== ge.H264 && (u += "\n- Incompatible codec. Only H264 available."), this.options.disableVideo && (u += "\n- Video disabled.")) : u += "\n- Stream not being published.", Re.warn(u);
    }
  }
}
function as(r) {
  if (!r)
    return new Uint8Array();
  const e = r.length, t = new Uint8Array(e / 2);
  for (let i = 0; i < e; i += 2)
    t[i / 2] = parseInt(r.substr(i, 2), 16);
  return t;
}
function cs(r, e, t) {
  if (Object.prototype.hasOwnProperty.call(r, t) && Object.prototype.hasOwnProperty.call(e, t)) {
    const i = r[t];
    r[t] = e[t], e[t] = i;
  } else
    console.error('One or both objects do not have the property "'.concat(String(t), '"'));
}
function wn(r, e, t, i) {
  return new (t || (t = Promise))(function(u, m) {
    function f(h) {
      try {
        b(i.next(h));
      } catch (g) {
        m(g);
      }
    }
    function n(h) {
      try {
        b(i.throw(h));
      } catch (g) {
        m(g);
      }
    }
    function b(h) {
      var g;
      h.done ? u(h.value) : (g = h.value, g instanceof t ? g : new t(function(o) {
        o(g);
      })).then(f, n);
    }
    b((i = i.apply(r, e || [])).next());
  });
}
const M = Rn;
(function() {
  const r = Rn, e = Sn();
  for (; ; ) try {
    if (-parseInt(r(572)) / 1 * (-parseInt(r(584)) / 2) + parseInt(r(713)) / 3 * (parseInt(r(594)) / 4) + -parseInt(r(683)) / 5 * (-parseInt(r(473)) / 6) + -parseInt(r(614)) / 7 * (parseInt(r(480)) / 8) + -parseInt(r(638)) / 9 * (parseInt(r(656)) / 10) + -parseInt(r(640)) / 11 * (parseInt(r(576)) / 12) + parseInt(r(603)) / 13 === 204686) break;
    e.push(e.shift());
  } catch (t) {
    e.push(e.shift());
  }
})();
const ya = navigator[M(587)][M(450)]("Apple");
function Jr(r, e) {
  const t = M;
  let i = new Uint8Array((0 | r[t(751)]) + (0 | e.byteLength));
  return i[t(644)](r, 0), i[t(644)](e, 0 | r.byteLength), i;
}
const ba = (r, e, t, i) => {
  const u = M, m = i[u(730)] || 1;
  e *= m, t *= m;
  const f = (h = r) instanceof ArrayBuffer ? h : h[M(711)], n = (r[u(735)] || 0) + r.byteLength, b = (r[u(735)] || 0) + e;
  var h;
  let g = Math.max(0, Math[u(497)](b, n)), o = Math[u(497)](g + Math.max(t, 0), n);
  return g /= m, o /= m, new i(f, g, o - g);
};
function Qr(r, e = 0, t = 1 / 0) {
  return ba(r, e, t, Uint8Array);
}
function va(r) {
  const e = function(t) {
    const i = M;
    let u = "";
    for (let m = 0; m < t[i(552)]; m += 16e3) {
      const f = t[i(499)](m, m + 16e3);
      u += String[i(479)][i(561)](null, f);
    }
    return u;
  }(Qr(r));
  return btoa(e);
}
window.downloadToFile = (r, e, t = M(571)) => {
  const i = M, u = document[i(478)]("a"), m = new Blob([r], { type: t });
  u[i(592)] = URL.createObjectURL(m), u.download = e, u[i(739)](), URL[i(534)](u[i(592)]);
};
class ae {
  static get [M(637)]() {
    return 1;
  }
  static get IDR() {
    return 5;
  }
  static get [M(500)]() {
    return 6;
  }
  static get [M(511)]() {
    return 7;
  }
  static get [M(669)]() {
    return 8;
  }
  static get AUD() {
    return 9;
  }
  static get TYPES() {
    const e = M;
    return { [ae[e(709)]]: e(709), [ae[e(500)]]: e(500), [ae[e(511)]]: "SPS", [ae[e(669)]]: e(669), [ae.NDR]: e(637), [ae[e(487)]]: e(487) };
  }
  static type(e) {
    const t = M;
    return e[t(540)] in ae[t(490)] ? ae[t(490)][e[t(540)]] : t(456);
  }
  constructor(e) {
    const t = M;
    this.payload = e, this.nri = (96 & this[t(463)][0]) >> 5, this.ntype = 31 & this[t(463)][0], this[t(515)] = this.ntype == 1 || this[t(540)] == 5, this.stype = "", this[t(666)] = !1;
  }
  [M(691)]() {
    const e = M;
    return ae.type(this) + ": NRI: " + this[e(521)]();
  }
  [M(521)]() {
    return this[M(763)];
  }
  [M(593)]() {
    return this[M(540)];
  }
  isKeyframe() {
    return this[M(540)] === ae.IDR;
  }
  [M(754)]() {
    return this[M(463)];
  }
  getPayloadSize() {
    const e = M;
    return this[e(463)][e(751)];
  }
  [M(458)]() {
    return 4 + this[M(625)]();
  }
  [M(526)]() {
    const e = M, t = new Uint8Array(this.getSize());
    return new DataView(t[e(711)])[e(559)](0, this[e(458)]() - 4), t[e(644)](this[e(754)](), 4), t;
  }
}
class ls {
  constructor(e) {
    const t = M;
    this[t(717)] = e, this[t(498)] = 0, this.bitLength = 8 * e[t(751)];
  }
  setData(e) {
    const t = M;
    this[t(717)] = e, this[t(498)] = 0, this.bitLength = 8 * e[t(751)];
  }
  get bitsAvailable() {
    const e = M;
    return this[e(523)] - this[e(498)];
  }
  [M(655)](e) {
    const t = M;
    if (this[t(649)] < e) return !1;
    this[t(498)] += e;
  }
  [M(565)](e, t = !0) {
    const i = M;
    return this[i(659)](e, this[i(498)], t);
  }
  getBits(e, t, i = !0) {
    const u = M;
    if (this[u(649)] < e) return 0;
    const m = t % 8, f = this[u(717)][t / 8 | 0] & 255 >>> m, n = 8 - m;
    if (n >= e) return i && (this[u(498)] += e), f >> n - e;
    {
      i && (this.index += n);
      const b = e - n;
      return f << b | this[u(659)](b, t + n, i);
    }
  }
  [M(522)]() {
    const e = M;
    let t;
    for (t = 0; t < this[e(523)] - this[e(498)]; ++t) if (this[e(659)](1, this.index + t, !1) !== 0) return this[e(498)] += t, t;
    return t;
  }
  [M(507)]() {
    this[M(655)](1 + this.skipLZ());
  }
  [M(670)]() {
    const e = M;
    this.skipBits(1 + this[e(522)]());
  }
  [M(533)]() {
    const e = M, t = this.skipLZ();
    return this[e(565)](t + 1) - 1;
  }
  [M(671)]() {
    const e = this[M(533)]();
    return 1 & e ? 1 + e >>> 1 : -1 * (e >>> 1);
  }
  [M(549)]() {
    return this[M(565)](1) === 1;
  }
  [M(612)](e = 1) {
    return this[M(565)](8 * e);
  }
  [M(743)]() {
    return this[M(565)](16);
  }
  [M(504)]() {
    return this[M(565)](32);
  }
}
function Sn() {
  const r = ["readUShort", "STTS", "keySystem", "len", "saio", "onMSEClose", "box", "initialized", "byteLength", "videoSampleAuxInfo", "concat", "getPayload", "listener", "mp4a", "minf", "open", "VMHD", "Received ", "volume", "systemID", "nri", "trak", "includes", "isNonSync", "prototype", "map", "clRtcDrmDebugLog", "encv", "UNKNOWN", "track", "getSize", "disableRemotePlayback", "getVideoFrames", "isReset", '<KID ALGID="AESCTR" ', "payload", "appendBufferError", "[H264Parser] No VCL NALUs found", "remuxController", "endOfStream", "mp4track", "tracks", "sourceBuffer", "nextDts", "sampleAuxInfo", "2022CxgyPJ", "bind", "isTypeSupported", "[H264Parser] IDR without SPS/PPS, not suitable for recovery", "substring", "createElement", "fromCharCode", "23216vbejGZ", "stbl", "parsePPS", "enca", "mse", "STSZ", "[H264Parser] Both IDR and non-IDR VCL NALUs found in the same frame", "AUD", "skipScalingList", "setUint16", "TYPES", "keyId", "STCO", "getUint8", "assign", "tencIvRecord", "h264", "min", "index", "subarray", "SEI", "com.widevine", "stts", "webkitsourceclose", "readUInt", "schm", "patchSampleAuxinfo", "skipUEG", "initSegment", "Num frames in chunk: ", "seq", "SPS", "encrypted", "addSourceBuffer", "mdhd", "isvcl", "POSITIVE_INFINITY", "warn", "removeSourceBuffer", "ready", '/mp4; codecs="', "getNri", "skipLZ", "bitLength", "STSD", "flush", "getData", "smhd", "stype", "readyToDecode", "mvhd", "dOps", "licenseUrl", "readUEG", "revokeObjectURL", "</LA_URL>", "mediaDuration", "codec", "[MSE] source buffer error", "parseNAL", "ntype", 'VALUE="', "</WRMHEADER>", "endMSE", "</DATA>", "[MSE] buffer error:", "shift", "url", "getFramePayload", "readBoolean", " samples - expected 1", "frma", "length", "Checking codec", "mfhd", "mseReady", "duration", "http://schemas.microsoft.com/DRM/2007/03/PlayReadyHeader", "trun", "setUint32", "No A/V data", "apply", '<WRMHEADER xmlns="', "push", "traf", "readBits", "trex", "channelCount", "call", "cryptPattern", "trackTypes", "application/octet-stream", "63977XHTQGK", "ftyp", "error", "info", "338484HHqdUw", "isKeyframe", "nalus", "no video element were found to render, provide a valid video element", "size", "sourceclose", "addEventListener", "Buffered range ", "4XltwlN", "queue", "createBuffer", "vendor", "<KIDS>", "esds", "mediaSource", "isDependedOn", "href", "type", "5280ETJYkA", "start", '" version="', "remuxer", "mseEnded", "options", "frameCounter", "join", "createObjectURL", "6688357kkipZQ", "hdlr", "getTrackID", "dbgQueue", "mp4", "dispatch", "charCodeAt", "readSPS", "MediaSource", "readUByte", "buffer error", "889kclXTz", "video", "setupMSE", "senc", "mdia", "toISOString", "onError", "<DATA>", "offAll", "audio", "both", "getPayloadSize", "function", "SMHD", "com.microsoft.playready.recommendation", " (remove)", "tkhd", "feed", "</PROTECTINFO>", "pps", "isReady", "timestamp", "encryptionScheme", "NDR", "1591281LjClYN", "audioSampleAuxInfo", "22TBXYsR", "HDLR_TYPES", "reportDiscontinuity", "config", "set", "replaceAll", "stsd", "timescale", "readyState", "bitsAvailable", "message", "saiIvSize", "resetTrack", "ceil", "remove", "skipBits", "20OvfYWx", "irrecoverableError", "onBuffer", "getBits", "ended", "remux", "keyFrame", "node", "vmhd", "com.apple.fps", "isfmb", "height", "dref", "PPS", "skipEG", "readEG", "schi", "src", "onMSEOpen", "DINF", "org.w3.clearkey", "end", "buffered", "tenc", "ManagedMediaSource", "audiosamplerate", "clRtcDrmCreateMediaDump", "2785LQsmut", "sdtp", "slice", "calculateExpectedSizeFromSai", "downloadToFile", "off", "isSupported", "<LA_URL>", "toString", "mvex", "onBufferError", "STSC", "jmuxer", " - ", "dts", "units", "waitingForIdr", "moof", "[MSE] sourceopen", "string", "mdat", "samples", "flags", "onReady", "destroy", "FTYP", "IDR", "timestamp gap: ", "buffer", "drm", "348HnTPGS", "types", "addTrack", "indexOf", "data", "reduce", "moov", "saiz", "tfdt", "sinf", "updating", "mediasource is not available to end: ", "4.3.0.0", "releaseBuffer", "videoElement", "[MSE] error: ", "bufferControllers", "BYTES_PER_ELEMENT", "initBrowser", "Opus", "dependsOn", "sourceopen", "byteOffset", "Browser does not support codec", "doAppend", "pssh", "click", "width", "sps", "extractNALUs"];
  return (Sn = function() {
    return r;
  })();
}
class et {
  static [M(742)](e, t) {
    const i = M;
    let u = [], m = !1, f = !1, n = !1, b = !1, h = 0, g = 0, o = 0, c = [];
    for (; h <= e.byteLength; ) {
      if (h < e.byteLength) {
        const s = e[h++];
        s !== 0 ? (s === 1 && g > 1 && (o = g > 2 ? 4 : 3, c.push(h)), g = 0) : ++g;
      } else o = 0, c.push(h++);
      if (c.length > 1) {
        const s = c.shift(), p = c[0] - o;
        if (s < p) {
          let d = !1;
          const y = 31 & e[s];
          if (y === ae.NDR ? f = !0 : y === ae.IDR ? m = !0 : y === ae.SPS ? (d = n, n = !0) : y === ae.PPS && (d = b, b = !0), !d) if (!t || y !== ae.NDR && y !== ae.IDR) u.push(e.subarray(s, p));
          else {
            const v = new Uint8Array(p - s);
            let S = 0;
            for (h = s, g = 0; h < p; ) {
              let I = e[h++];
              g > 1 && I === 3 && (g = 0, I = e[h++]), I !== 0 ? g = 0 : ++g, v[S++] = I;
            }
            u.push(v.subarray(0, S));
          }
        }
      }
    }
    let l = !0, a = !1;
    return f || m ? f && m && (console[i(517)](i(486)), l = !1) : (console[i(517)](i(465)), l = !1), m && (n && b ? a = !0 : console[i(517)](i(476))), { valid: l, idr: a, nalus: u };
  }
  static [M(488)](e, t) {
    const i = M;
    let u, m = 8, f = 8;
    for (let n = 0; n < t; n++) f !== 0 && (u = e[i(671)](), f = (m + u + 256) % 256), m = f === 0 ? m : f;
  }
  static [M(610)](e) {
    const t = M;
    let i, u, m, f, n, b, h = new ls(e), g = 0, o = 0, c = 0, l = 0, a = 1;
    if (h[t(612)](), i = h[t(612)](), h[t(565)](5), h[t(655)](3), h[t(612)](), h[t(507)](), i === 100 || i === 110 || i === 122 || i === 244 || i === 44 || i === 83 || i === 86 || i === 118 || i === 128) {
      var s = h[t(533)]();
      if (s === 3 && h[t(655)](1), h[t(507)](), h.skipUEG(), h[t(655)](1), h[t(549)]()) {
        b = s !== 3 ? 8 : 12;
        for (let d = 0; d < b; ++d) h[t(549)]() && (d < 6 ? et[t(488)](h, 16) : et[t(488)](h, 64));
      }
    }
    h.skipUEG();
    var p = h.readUEG();
    if (p === 0) h[t(533)]();
    else if (p === 1) {
      h[t(655)](1), h[t(670)](), h[t(670)](), u = h[t(533)]();
      for (let d = 0; d < u; ++d) h[t(670)]();
    }
    if (h[t(507)](), h[t(655)](1), m = h[t(533)](), f = h[t(533)](), n = h.readBits(1), n === 0 && h[t(655)](1), h[t(655)](1), h.readBoolean() && (g = h[t(533)](), o = h.readUEG(), c = h[t(533)](), l = h.readUEG()), h[t(549)]()) {
      if (h.readBoolean()) {
        let d;
        switch (h[t(612)]()) {
          case 1:
            d = [1, 1];
            break;
          case 2:
            d = [12, 11];
            break;
          case 3:
            d = [10, 11];
            break;
          case 4:
            d = [16, 11];
            break;
          case 5:
            d = [40, 33];
            break;
          case 6:
            d = [24, 11];
            break;
          case 7:
            d = [20, 11];
            break;
          case 8:
            d = [32, 11];
            break;
          case 9:
            d = [80, 33];
            break;
          case 10:
            d = [18, 11];
            break;
          case 11:
            d = [15, 11];
            break;
          case 12:
            d = [64, 33];
            break;
          case 13:
            d = [160, 99];
            break;
          case 14:
            d = [4, 3];
            break;
          case 15:
            d = [3, 2];
            break;
          case 16:
            d = [2, 1];
            break;
          case 255:
            d = [h.readUByte() << 8 | h.readUByte(), h.readUByte() << 8 | h[t(612)]()];
        }
        d && d[0] > 0 && d[1] > 0 && (a = d[0] / d[1]);
      }
      h.readBoolean() && h[t(655)](1), h[t(549)]() && (h[t(655)](4), h[t(549)]() && h[t(655)](24)), h[t(549)]() && (h[t(507)](), h[t(507)]()), h.readBoolean() && (h.readUInt(), h[t(504)](), h.readBoolean());
    }
    return { width: Math[t(653)]((16 * (m + 1) - 2 * g - 2 * o) * a), height: (2 - n) * (f + 1) * 16 - (n ? 2 : 4) * (c + l) };
  }
  static parseHeader(e) {
    const t = M;
    let i = new ls(e[t(754)]());
    i[t(612)](), e[t(666)] = i[t(533)]() === 0, e[t(528)] = i[t(533)]();
  }
  constructor(e) {
    this[M(597)] = e, this.track = e.mp4track;
  }
  parseSPS(e) {
    const t = M;
    var i = et[t(610)](new Uint8Array(e));
    this[t(457)][t(740)] = i[t(740)], this[t(457)].height = i.height, this.track[t(741)] = [new Uint8Array(e)], this[t(457)][t(537)] = "avc1.";
    let u = new DataView(e[t(711)], e[t(735)] + 1, 4);
    for (let f = 0; f < 3; ++f) {
      var m = u[t(493)](f)[t(691)](16);
      m[t(552)] < 2 && (m = "0" + m), this[t(457)][t(537)] += m;
    }
  }
  [M(482)](e) {
    const t = M;
    this[t(457)][t(633)] = [new Uint8Array(e)];
  }
  [M(539)](e) {
    const t = M;
    if (!e) return !1;
    let i = !1;
    switch (e[t(593)]()) {
      case ae[t(709)]:
      case ae[t(637)]:
        i = !0;
        break;
      case ae[t(669)]:
        !this.track[t(633)] && (this.parsePPS(e.getPayload()), !this[t(597)].readyToDecode && this[t(457)].pps && this[t(457)][t(741)] && (this[t(597)][t(529)] = !0)), i = !0;
        break;
      case ae[t(511)]:
        !this[t(457)][t(741)] && (this.parseSPS(e[t(754)]()), !this[t(597)][t(529)] && this[t(457)][t(633)] && this[t(457)][t(741)] && (this.remuxer[t(529)] = !0)), i = !0;
        break;
      case ae.AUD:
        break;
      case ae[t(500)]:
        i = !0;
    }
    return i;
  }
}
class xn {
  constructor(e) {
    this[M(755)] = {}, this.type = "" | e;
  }
  on(e, t) {
    const i = M;
    return !this.listener[e] && (this.listener[e] = []), this[i(755)][e][i(563)](t), !0;
  }
  [M(688)](e, t) {
    const i = M;
    if (this[i(755)][e]) {
      var u = this[i(755)][e][i(716)](t);
      return u > -1 && this[i(755)][e].splice(u, 1), !0;
    }
    return !1;
  }
  [M(622)]() {
    this.listener = {};
  }
  [M(608)](e, t) {
    const i = M;
    return !!this[i(755)][e] && (this[i(755)][e][i(453)]((u) => {
      u[i(561)](null, [t]);
    }), !0);
  }
}
class U {
  constructor(e) {
    const t = M;
    this.drm = e, U[t(714)] = { avc1: [], encv: [], avcC: [], btrt: [], dinf: [], dref: [], esds: [], ftyp: [], hdlr: [], mdat: [], mdhd: [], mdia: [], mfhd: [], minf: [], moof: [], moov: [], mp4a: [], Opus: [], dOps: [], enca: [], mvex: [], mvhd: [], sdtp: [], stbl: [], stco: [], stsc: [], stsd: [], stsz: [], stts: [], tfdt: [], tfhd: [], traf: [], trak: [], trun: [], trex: [], tkhd: [], vmhd: [], smhd: [], pssh: [], sinf: [], frma: [], schm: [], schi: [], tenc: [], saiz: [], saio: [], senc: [] };
    for (let g in U[t(714)]) U.types[g] = [g[t(609)](0), g[t(609)](1), g[t(609)](2), g[t(609)](3)];
    const i = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 118, 105, 100, 101, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 86, 105, 100, 101, 111, 72, 97, 110, 100, 108, 101, 114, 0]), u = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 115, 111, 117, 110, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 83, 111, 117, 110, 100, 72, 97, 110, 100, 108, 101, 114, 0]);
    U[t(641)] = { video: i, audio: u };
    const m = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 12, 117, 114, 108, 32, 0, 0, 0, 1]), f = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0]);
    U.STTS = U.STSC = U[t(492)] = f, U.STSZ = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]), U[t(759)] = new Uint8Array([0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0]), U[t(627)] = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0]), U[t(524)] = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 1]);
    const n = new Uint8Array([105, 115, 111, 109]), b = new Uint8Array([97, 118, 99, 49]), h = new Uint8Array([0, 0, 0, 1]);
    U[t(708)] = U[t(749)](U[t(714)][t(573)], n, h, n, b), U.DINF = U[t(749)](U.types.dinf, U.box(U[t(714)][t(668)], m));
  }
  static [M(749)](e, ...t) {
    const i = M;
    let u, m = 8, f = t[i(552)], n = f;
    for (; f--; ) t[f] && (m += t[f][i(751)]);
    for (u = new Uint8Array(m), u[0] = m >>> 24, u[1] = m >>> 16 & 255, u[2] = m >>> 8 & 255, u[3] = 255 & m, u.set(e, 4), f = 0, m = 8; f < n; ++f) t[f] && (u[i(644)](t[f], m), m += t[f][i(751)]);
    return u;
  }
  [M(604)](e) {
    const t = M;
    return U.box(U[t(714)][t(604)], U[t(641)][e]);
  }
  [M(703)](e) {
    const t = M;
    return U[t(749)](U[t(714)][t(703)], e);
  }
  mdhd(e, t) {
    const i = M;
    return U.box(U[i(714)][i(514)], new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, e >>> 24, e >>> 16 & 255, e >>> 8 & 255, 255 & e, 0, 0, 0, 0, 85, 196, 0, 0]));
  }
  [M(618)](e) {
    const t = M;
    return U[t(749)](U[t(714)][t(618)], this[t(514)](e[t(647)], e.duration), this[t(604)](e[t(593)]), this[t(757)](e));
  }
  [M(554)](e) {
    const t = M;
    return U.box(U.types[t(554)], new Uint8Array([0, 0, 0, 0, e >>> 24, e >>> 16 & 255, e >>> 8 & 255, 255 & e]));
  }
  minf(e) {
    const t = M;
    return e[t(593)] === t(623) ? U[t(749)](U.types[t(757)], U[t(749)](U[t(714)][t(527)], U[t(627)]), U[t(675)], this[t(481)](e)) : U.box(U[t(714)][t(757)], U[t(675)], this[t(481)](e), U[t(749)](U[t(714)][t(664)], U[t(759)]));
  }
  [M(700)](e, t, i) {
    const u = M;
    return U[u(749)](U[u(714)][u(700)], this[u(554)](e), this[u(564)](i, t));
  }
  [M(719)](e, t, i) {
    const u = M;
    let m = e.length, f = [];
    for (; m--; ) f[m] = this[u(764)](e[m]);
    return U[u(749)][u(561)](null, [U[u(714)][u(719)], this[u(530)](i, t), this.pssh(e)][u(753)](f).concat(this[u(692)](e)));
  }
  [M(692)](e) {
    const t = M;
    let i = e[t(552)], u = [];
    for (; i--; ) u[i] = this.trex(e[i]);
    return U[t(749)][t(561)](null, [U[t(714)][t(692)]][t(753)](u));
  }
  mvhd(e, t) {
    const i = M;
    let u = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, e >>> 24, e >>> 16 & 255, e >>> 8 & 255, 255 & e, t >>> 24, t >>> 16 & 255, t >>> 8 & 255, 255 & t, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255]);
    return U[i(749)](U[i(714)].mvhd, u);
  }
  [M(684)](e) {
    const t = M;
    let i = e.samples || [], u = new Uint8Array(4 + i[t(552)]);
    for (let m = 0; m < i[t(552)]; m++) {
      const f = i[m][t(705)];
      u[m + 4] = f[t(733)] << 4 | f[t(591)] << 2 | f.hasRedundancy;
    }
    return U[t(749)](U[t(714)][t(684)], u);
  }
  [M(481)](e) {
    const t = M;
    return U[t(749)](U.types.stbl, this.stsd(e), U[t(749)](U[t(714)][t(502)], U[t(744)]), U[t(749)](U[t(714)].stsc, U[t(694)]), U[t(749)](U.types.stsz, U[t(485)]), U[t(749)](U[t(714)].stco, U[t(492)]));
  }
  [M(455)](e) {
    const t = M;
    let i, u, m, f = [], n = [];
    for (i = 0; i < e[t(741)][t(552)]; i++) u = e[t(741)][i], m = u[t(751)], f[t(563)](m >>> 8 & 255), f.push(255 & m), f = f[t(753)](Array[t(452)][t(685)][t(568)](u));
    for (i = 0; i < e[t(633)][t(552)]; i++) u = e[t(633)][i], m = u[t(751)], n[t(563)](m >>> 8 & 255), n.push(255 & m), n = n[t(753)](Array[t(452)][t(685)][t(568)](u));
    const b = U[t(749)](U.types.avcC, new Uint8Array([1, f[3], f[4], f[5], 255, 224 | e[t(741)][t(552)]][t(753)](f).concat([e[t(633)][t(552)]])[t(753)](n))), h = e[t(740)], g = e[t(667)], o = U.box(U[t(714)][t(722)], U[t(749)](U[t(714)][t(551)], new Uint8Array([97, 118, 99, 49])), U.box(U[t(714)][t(505)], new Uint8Array([0, 0, 0, 0, ...this[t(712)][t(615)][t(636)], 0, 1, 0, 0])), U[t(749)](U[t(714)][t(672)], this[t(679)](t(615))));
    return U[t(749)](U[t(714)].encv, new Uint8Array([0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, h >>> 8 & 255, 255 & h, g >>> 8 & 255, 255 & g, 0, 72, 0, 0, 0, 72, 0, 0, 0, 0, 0, 0, 0, 1, 18, 65, 86, 67, 32, 67, 111, 100, 105, 110, 103, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 24, 255, 255]), b, o);
  }
  esds(e) {
    const t = M;
    let i = e[t(643)][t(751)], u = new Uint8Array(26 + i + 3);
    return u.set([0, 0, 0, 0, 3, 23 + i, 0, 1, 0, 4, 15 + i, 64, 21, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, i]), u[t(644)](e.config, 26), u[t(644)]([6, 1, 2], 26 + i), u;
  }
  [M(756)](e) {
    const t = M, i = e[t(681)];
    return U[t(749)](U.types[t(756)], new Uint8Array([0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, e[t(567)], 0, 16, 0, 0, 0, 0, i >>> 8 & 255, 255 & i, 0, 0]), U[t(749)](U[t(714)][t(589)], this[t(589)](e)));
  }
  [M(531)](e) {
    const t = e[M(681)];
    return new Uint8Array([0, e.channelCount, 1, 56, 0, 0, t >>> 8 & 255, 255 & t, 0, 0, 0]);
  }
  [M(732)](e) {
    const t = M, i = e[t(681)];
    return U.box(U[t(714)][t(732)], new Uint8Array([0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, e[t(567)], 0, 16, 0, 0, 0, 0, i >>> 8 & 255, 255 & i, 0, 0]), U[t(749)](U.types[t(531)], this[t(531)](e)));
  }
  [M(483)](e) {
    const t = M, i = U.box(U[t(714)][t(531)], this[t(531)](e)), u = U[t(749)](U[t(714)][t(722)], U[t(749)](U.types[t(551)], new Uint8Array([79, 112, 117, 115])), U[t(749)](U[t(714)][t(505)], new Uint8Array([0, 0, 0, 0, ...this[t(712)][t(623)].encryptionScheme, 0, 1, 0, 0])), U[t(749)](U.types.schi, this[t(679)](t(623)))), m = e.audiosamplerate;
    return U[t(749)](U[t(714)].enca, new Uint8Array([0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, e[t(567)], 0, 16, 0, 0, 0, 0, m >>> 8 & 255, 255 & m, 0, 0]), i, u);
  }
  [M(646)](e) {
    const t = M;
    return e[t(593)] === "audio" ? U[t(749)](U.types.stsd, U[t(524)], e[t(512)] ? this.enca(e) : this[t(732)](e)) : U[t(749)](U[t(714)][t(646)], U.STSD, this[t(455)](e));
  }
  tkhd(e) {
    const t = M, i = e.id, u = e.duration, m = e.width, f = e.height, n = e[t(761)];
    return U[t(749)](U[t(714)][t(630)], new Uint8Array([0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, i >>> 24, i >>> 16 & 255, i >>> 8 & 255, 255 & i, 0, 0, 0, 0, u >>> 24, u >>> 16 & 255, u >>> 8 & 255, 255 & u, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255 & n, n % 1 * 10 & 255, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, m >>> 8 & 255, 255 & m, 0, 0, f >>> 8 & 255, 255 & f, 0, 0]));
  }
  [M(564)](e, t) {
    const i = M, u = e.id, m = e[i(704)][0][i(580)], f = e[i(704)][0][i(556)], n = e[i(704)][0].flags, b = U[i(749)](U[i(714)].tfhd, new Uint8Array([0, 2, 0, 58, u >>> 24, u >>> 16 & 255, u >>> 8 & 255, 255 & u, 0, 0, 0, 1, f >>> 24, u >>> 16 & 255, f >>> 8 & 255, 255 & f, m >>> 24, m >>> 16 & 255, m >>> 8 & 255, 255 & m, 0, n[i(451)], 0, 0])), h = U[i(749)](U[i(714)][i(721)], new Uint8Array([0, 0, 0, 0, t >>> 24, t >>> 16 & 255, t >>> 8 & 255, 255 & t]));
    if (e.encrypted) {
      let g, o;
      if (e[i(593)] === i(615) ? (g = !0, o = this.drm[i(615)].saiIvSize + 8) : (g = !1, o = this[i(712)][i(623)][i(651)]), o > 0) {
        const c = this[i(720)](o), l = this[i(617)](e[i(704)], g), a = c.length + 20 + l[i(552)] + b[i(552)] + h[i(552)] + 8 + 16 + 8 + 8, s = this[i(558)](e, a);
        return U.box(U[i(714)][i(564)], b, h, s, c, this[i(747)](a - l[i(552)] + s[i(552)] + 8), l);
      }
      {
        const c = this[i(617)](null, !1), l = c[i(552)] + b.length + h[i(552)] + 8 + 16 + 8 + 8, a = this.trun(e, l);
        return U.box(U.types.traf, b, h, a, c);
      }
    }
    return U[i(749)](U[i(714)][i(564)], b, h, this.trun(e, b[i(552)] + h[i(552)] + 8 + 16 + 8 + 8));
  }
  [M(764)](e) {
    const t = M;
    return e[t(556)] = e[t(556)] || 4294967295, U[t(749)](U[t(714)].trak, this.tkhd(e), this[t(618)](e));
  }
  [M(566)](e) {
    const t = M, i = e.id;
    return U.box(U[t(714)].trex, new Uint8Array([0, 0, 0, 0, i >>> 24, i >>> 16 & 255, i >>> 8 & 255, 255 & i, 0, 0, 0, 1, 0, 0, 0, 16, 0, 0, 0, 0, 0, 0, 0, 0]));
  }
  [M(558)](e, t) {
    const i = M;
    let u = (e.samples || [])[i(552)], m = new Uint8Array(12);
    return t += 20, m.set([0, 0, 0, 1, u >>> 24, u >>> 16 & 255, u >>> 8 & 255, 255 & u, t >>> 24, t >>> 16 & 255, t >>> 8 & 255, 255 & t], 0), U[i(749)](U[i(714)].trun, m);
  }
  generatePlayReadyHeader(e, t) {
    const i = M, u = i(725), m = i(557), f = va(function(n) {
      const b = M, h = [];
      return h[b(563)](n[3]), h[b(563)](n[2]), h.push(n[1]), h[b(563)](n[0]), h[b(563)](n[5]), h[b(563)](n[4]), h[b(563)](n[7]), h[b(563)](n[6]), (n = Qr(n))[b(644)](h, 0), n;
    }(e));
    return Qr(function(n, b) {
      const h = M, g = new Uint8Array(2 * n.length), o = new DataView(g.buffer);
      for (let c = 0; c < n[h(552)]; ++c) {
        const l = n[h(609)](c);
        o[h(489)](2 * c, l, b);
      }
      return g[h(711)];
    }([i(562) + m + i(596) + u + '">', i(621), "<PROTECTINFO>", i(588), i(462), i(541) + f + '"', ">", "</KID>", "</KIDS>", i(632), t ? i(690) + t + i(535) : "", i(544), i(542)][i(601)](""), !0));
  }
  [M(738)](e) {
    const t = M;
    if (this.drm[t(745)].startsWith(t(501))) return U[t(749)](U[t(714)][t(738)], new Uint8Array([0, 0, 0, 0, ...this[t(712)][t(762)], 0, 0, 0, 18, 18, 16, ...this[t(712)][e[0][t(593)]][t(491)]]));
    if (this[t(712)][t(745)] === t(628)) {
      const i = this.generatePlayReadyHeader(this[t(712)][e[0].type].keyId, this[t(712)][t(532)]), u = i[t(751)];
      return U[t(749)](U.types[t(738)], new Uint8Array([0, 0, 0, 0, ...this.drm[t(762)], u >>> 24, u >>> 16 & 255, u >>> 8 & 255, 255 & u, ...i]));
    }
    return this.drm[t(745)] === t(676) ? U[t(749)](U[t(714)][t(738)], new Uint8Array([1, 0, 0, 0, ...this[t(712)].systemID, 0, 0, 0, 1, ...this[t(712)][e[0].type][t(491)], 0, 0, 0, 0])) : this.drm[t(745)] === t(665) ? null : void console[t(574)]("Unsupported DRM type " + this[t(712)].keySystem);
  }
  [M(679)](e) {
    const t = M;
    return U[t(749)](U[t(714)][t(679)], new Uint8Array([1, 0, 0, 0, 0, this[t(712)][e][t(569)], 1, this[t(712)][e][t(651)], ...this[t(712)][e][t(491)], ...this[t(712)][e][t(495)]]));
  }
  [M(720)](e) {
    const t = M;
    return U[t(749)](U[t(714)][t(720)], new Uint8Array([0, 0, 0, 0, e, 0, 0, 0, 1]));
  }
  saio(e) {
    const t = M;
    return U.box(U[t(714)][t(747)], new Uint8Array([0, 0, 0, 0, 0, 0, 0, 1, e >>> 24, e >>> 16 & 255, e >>> 8 & 255, 255 & e]));
  }
  [M(617)](e, t) {
    const i = M;
    let u = null;
    return e && (e[i(552)] !== 1 && console[i(574)](i(760) + e[i(552)] + i(550)), u = e[0][i(472)]), u && u[i(751)] ? U[i(749)](U[i(714)].senc, new Uint8Array([0, 0, 0, t ? 2 : 0, 0, 0, 0, 1, ...u])) : U[i(749)](U[i(714)][i(617)], new Uint8Array([0, 0, 0, 0, 0, 0, 0, 1]));
  }
  initSegment(e, t, i) {
    const u = M, m = this[u(719)](e, t, i);
    let f = new Uint8Array(U[u(708)][u(751)] + m[u(751)]);
    return f[u(644)](U[u(708)]), f[u(644)](m, U[u(708)].byteLength), f;
  }
}
let wa = 1;
class yr {
  constructor() {
    this.seq = 1;
  }
  static [M(605)]() {
    return wa++;
  }
  [M(525)]() {
    const e = M;
    this.mp4track[e(746)] = 0, this[e(468)][e(704)] = [];
  }
  [M(634)]() {
    return !(!this[M(529)] || !this.samples.length);
  }
}
function Rn(r, e) {
  const t = Sn();
  return (Rn = function(i, u) {
    return t[i -= 450];
  })(r, e);
}
class Sa extends yr {
  constructor(e) {
    const t = M;
    super(), this[t(529)] = !0, this[t(471)] = 0, this[t(697)] = 0, this[t(468)] = { id: yr[t(605)](), type: t(623), channelCount: 2, audiosamplerate: 48e3, len: 0, fragmented: !0, timescale: e, duration: e, samples: [], codec: "opus", encrypted: !0 }, this.samples = [];
  }
  [M(652)]() {
    this.seq = 1, this.nextDts = 0, this.dts = 0;
  }
  [M(661)](e, t, i) {
    const u = M;
    if (e.length > 0) for (let m = 0; m < e[u(552)]; m++) {
      let f = e[m], n = f[u(698)], b = n.byteLength;
      this[u(704)][u(563)]({ units: n, size: b, duration: f[u(556)], sampleAuxInfo: t, timestamp: i }), this.mp4track[u(746)] += b;
    }
  }
  [M(548)]() {
    const e = M;
    if (!this[e(704)]) return null;
    let t, i = this[e(468)][e(704)];
    for (; this.samples[e(552)]; ) {
      let u = this[e(704)][e(546)](), m = (1e3 * u.timestamp | 0) - this.nextDts | 0;
      m < 5 && (m = 5), this[e(697)] = this[e(471)], this[e(471)] += m, t = { size: u[e(580)], duration: m, cts: 0, flags: { isLeading: 0, isDependedOn: 0, hasRedundancy: 0, degradPrio: 0, dependsOn: 1 }, sampleAuxInfo: u[e(472)] };
      let f = new Uint8Array(u[e(580)]);
      return f.set(u[e(698)], 0), i[e(563)](t), new Uint8Array(f[e(711)], 0, u[e(580)]);
    }
    return null;
  }
}
class xa extends yr {
  constructor(e, t) {
    const i = M;
    super(), this[i(529)] = !1, this[i(471)] = 0, this.dts = 0, this.videoElement = t, this[i(468)] = { id: yr[i(605)](), type: i(615), len: 0, fragmented: !0, sps: "", pps: "", width: 0, height: 0, timescale: e, duration: e, samples: [], encrypted: !0 }, this[i(704)] = [], this[i(496)] = new et(this);
  }
  [M(652)]() {
    const e = M;
    this[e(510)] = 1, this[e(529)] = !1, this[e(468)].sps = "", this[e(468)].pps = "", this[e(471)] = 0, this[e(697)] = 0;
  }
  [M(661)](e, t, i) {
    const u = M;
    for (let m of e) {
      let f = [], n = 0;
      for (let b of m[u(698)]) this[u(496)][u(539)](b) && (f.push(b), n += b.getSize());
      f.length > 0 && this[u(529)] && (this[u(468)][u(746)] += n, this[u(704)][u(563)]({ units: f, size: n, keyFrame: m[u(662)], duration: m.duration, sampleAuxInfo: t, timestamp: i }));
    }
  }
  [M(548)]() {
    const e = M;
    if (!this[e(634)]() || !this[e(704)]) return null;
    let t, i = this[e(468)].samples, u = this[e(704)][e(546)](), m = u[e(698)], f = (1e3 * u[e(635)] | 0) - this[e(471)] | 0;
    f < 5 && (f = 5), window.clRtcDrmDebugLog && f > 5e3 && console[e(575)](e(710) + (f / 1e3 | 0) + " s"), this[e(697)] = this[e(471)], this.nextDts += f, t = { size: u.size, duration: f, cts: 0, flags: { isLeading: 0, isDependedOn: 0, hasRedundancy: 0, degradPrio: 0, isNonSync: u[e(662)] ? 0 : 1, dependsOn: u.keyFrame ? 2 : 1 }, sampleAuxInfo: u[e(472)] };
    let n = 0;
    for (const g of m) n += g.getSize();
    let b = 0, h = new Uint8Array(n);
    for (const g of m) h[e(644)](g[e(526)](), b), b += g[e(458)]();
    return i[e(563)](t), new Uint8Array(h[e(711)], 0, n);
  }
}
class Ra extends xn {
  constructor(e, t) {
    const i = M;
    super(i(597)), this.initialized = !1, this.trackTypes = [], this[i(469)] = {}, this[i(647)] = 1e3, this[i(536)] = 0, this[i(727)] = e, this[i(607)] = t;
  }
  [M(715)](e) {
    const t = M;
    (e === "video" || e === t(624)) && (this[t(469)].video = new xa(this.timescale, this[t(727)]), this[t(570)][t(563)](t(615))), (e === "audio" || e === t(624)) && (this[t(469)].audio = new Sa(this.timescale), this.trackTypes.push(t(623)));
  }
  reset() {
    for (let e of this.trackTypes) this.tracks[e].resetTrack();
    this.initialized = !1;
  }
  destroy() {
    const e = M;
    this[e(469)] = {}, this[e(622)]();
  }
  [M(525)]() {
    const e = M;
    if (this[e(750)]) for (let t of this.trackTypes) {
      let i = this[e(469)][t];
      for (; ; ) {
        let u = i.getFramePayload();
        if (!u || !u[e(751)]) break;
        let m = { type: t, payload: Jr(this[e(607)][e(700)](i.seq++, i[e(697)], i.mp4track), this[e(607)][e(703)](u)), dts: i[e(697)] };
        this.dispatch(e(711), m), i[e(525)]();
      }
    }
    else this[e(634)]() && (this.dispatch(e(519)), this[e(508)](), this[e(750)] = !0, this[e(525)]());
  }
  initSegment() {
    const e = M;
    for (let t of this.trackTypes) {
      let i = this[e(469)][t], u = { type: t, payload: this[e(607)][e(508)]([i[e(468)]], this[e(536)], this[e(647)]) };
      this[e(608)](e(711), u);
    }
  }
  isReady() {
    const e = M;
    for (let t of this.trackTypes) if (!this[e(469)][t].readyToDecode || !this.tracks[t][e(704)][e(552)]) return !1;
    return !0;
  }
  [M(661)](e) {
    const t = M;
    for (let i of this[t(570)]) {
      let u = e[i];
      u[t(552)] > 0 && this[t(469)][i][t(661)](u, i === t(623) ? e[t(639)] : e.videoSampleAuxInfo, e.timestamp);
    }
    this[t(525)]();
  }
}
class Ia extends xn {
  constructor(e, t, i) {
    const u = M;
    super(u(711)), this[u(593)] = t, this.queue = new Uint8Array(), window[u(682)] && (this[u(606)] = new Uint8Array(), this[u(600)] = 0), this.sourceBuffer = e, this[u(484)] = i, this[u(657)] = !1, this[u(470)].addEventListener(u(574), (m) => {
      const f = u;
      console.warn(f(538), m, this.type), this[f(657)] = !0, this[f(608)]("error", { type: this.type, name: f(711), error: f(613) });
    });
  }
  [M(707)]() {
    const e = M;
    this[e(585)] = null, this[e(606)] = null;
    try {
      this[e(470)] && (this[e(470)].abort(), this.mse[e(518)](this[e(470)]), this[e(470)] = null);
    } catch (t) {
    }
    this[e(622)]();
  }
  [M(737)]() {
    const e = M;
    if (this[e(585)][e(552)] && this[e(470)] && !this[e(470)][e(723)]) {
      if (this[e(470)][e(678)][e(552)] > 1) {
        for (let t = 0; t < this.sourceBuffer[e(678)].length; ++t) {
          const i = t < this.sourceBuffer.buffered[e(552)] - 1;
          window[e(454)] && console[e(575)](e(583) + t + (i ? e(629) : "") + ": " + this.sourceBuffer[e(678)][e(595)](t) + e(696) + this[e(470)][e(678)].end(t)), i && this[e(470)][e(654)](this[e(470)].buffered[e(595)](t), this[e(470)][e(678)][e(677)](t));
        }
        if (this.sourceBuffer.updating) return;
      }
      try {
        this[e(470)].appendBuffer(this.queue), this.queue = new Uint8Array();
      } catch (t) {
        this[e(608)](e(574), { type: this[e(593)], name: e(464), error: t });
      }
    }
  }
  [M(631)](e) {
    const t = M;
    if (this[t(606)] && (this[t(606)] = Jr(this.dbgQueue, e), ++this.frameCounter == 100)) {
      const i = (/* @__PURE__ */ new Date())[t(619)]()[t(477)](0, 19)[t(645)](":", "-"), u = this[t(593)] + "-" + i + ".mp4";
      window[t(687)](this[t(606)], u), this[t(606)] = null;
    }
    this[t(657)] || (this[t(585)] = Jr(this[t(585)], e)), this[t(737)]();
  }
}
class In extends xn {
  static isSupported(e) {
    const t = M;
    return window[t(680)] ? window.ManagedMediaSource.isTypeSupported(e) : !!window[t(611)] && window[t(611)][t(475)](e);
  }
  constructor(e) {
    const t = M;
    super(t(695)), this.irrecoverableError = !1, this[t(699)] = !0, this[t(461)] = !1, this.mseReady = !1, this[t(598)] = !1, this.options = Object[t(494)]({}, { node: "", mode: "video", debug: !1, onReady: function() {
    }, onError: function(i) {
    } }, e), this[t(663)] = typeof this[t(599)][t(663)] === t(702) ? document.getElementById(this.options[t(663)]) : this[t(599)][t(663)], this[t(712)] = e[t(712)], this[t(607)] = new U(this.drm), this[t(466)] = new Ra(this[t(663)], this.mp4), this[t(466)][t(715)](this[t(599)].mode), this[t(466)].on(t(711), this[t(658)].bind(this)), this.remuxController.on(t(519), this[t(586)][t(474)](this)), this[t(731)]();
  }
  [M(731)]() {
    const e = M;
    typeof this[e(599)][e(663)] === e(702) && this[e(599)][e(663)] == "" && console[e(574)](e(579)), this[e(555)] = !1, this[e(616)]();
  }
  [M(616)]() {
    const e = M;
    if (!window[e(680)] && !window.MediaSource) throw "Failure: Browser doesn't support MSE/MMS";
    window[e(680)] ? (this[e(663)][e(459)] = !0, this[e(590)] = new ManagedMediaSource()) : this.mediaSource = new MediaSource(), this[e(547)] = URL[e(602)](this.mediaSource), this.node[e(673)] = this[e(547)], this[e(598)] = !1, this[e(590)][e(582)](e(734), this[e(674)].bind(this)), this[e(590)].addEventListener(e(581), this.onMSEClose.bind(this)), this[e(590)][e(582)]("webkitsourceopen", this[e(674)].bind(this)), this.mediaSource.addEventListener(e(503), this[e(748)][e(474)](this)), this[e(590)].addEventListener("error", function(t) {
      const i = e;
      console[i(574)](i(728), t[i(650)]);
    });
  }
  endMSE() {
    const e = M;
    if (!this[e(598)]) try {
      this[e(598)] = !0, this[e(590)].readyState === e(758) && this[e(590)][e(467)]();
    } catch (t) {
      console[e(574)](e(724), t);
    }
  }
  [M(642)]() {
    this[M(699)] = !0;
  }
  [M(631)](e) {
    const t = M;
    let i = { video: [], audio: [] };
    if (this[t(657)] || this[t(598)] || !e || !this[t(466)]) return -1;
    if (e.video) {
      i.timestamp = e[t(635)];
      const u = this[t(686)](e[t(752)], this[t(712)][t(615)][t(651)]), m = u != e[t(615)][t(751)];
      let f = et[t(742)](e[t(615)], m);
      if (!f.valid || f[t(578)][t(552)] < 1) return 0;
      if (this[t(699)]) {
        if (!f.idr) return 0;
        this[t(699)] = !1;
      }
      if (!ya && e[t(752)]) {
        const n = f[t(578)][t(718)]((b, h) => b + 4 + h[t(751)], 0);
        n !== u && this.patchSampleAuxinfo(e[t(752)], this.drm[t(615)].saiIvSize, n - u);
      }
      i[t(615)] = this[t(460)](f[t(578)]), i[t(752)] = e.videoSampleAuxInfo;
    }
    return e[t(623)] && (i.timestamp = e[t(635)], i[t(623)] = [{ units: e.audio }], i[t(639)] = e[t(639)]), e.video || e[t(623)] ? (this[t(466)][t(661)](i), 0) : (console[t(574)](t(560)), 0);
  }
  getVideoFrames(e) {
    const t = M;
    let i = [], u = [], m = !1, f = !1;
    for (let n of e) {
      let b = new ae(n);
      b.type() !== ae[t(709)] && b.type() !== ae[t(637)] || et.parseHeader(b), i[t(552)] && f && (b[t(666)] || !b[t(515)]) && (u[t(563)]({ units: i, keyFrame: m }), i = [], m = !1, f = !1), i.push(b), m = m || b[t(577)](), f = f || b[t(515)];
    }
    if (i[t(552)]) if (f) u[t(563)]({ units: i, keyFrame: m });
    else {
      let n = u[t(552)] - 1;
      n >= 0 && (u[n][t(698)] = u[n][t(698)][t(753)](i));
    }
    return u[t(552)] !== 1 && console[t(517)](t(509) + u.length), u;
  }
  calculateExpectedSizeFromSai(e, t) {
    const i = M;
    if (!e) return 0;
    const u = (e[0] << 8) + e[1], m = t + 2 + 4;
    let f = 0, n = 2;
    for (; 0 < u && n + m <= e[i(751)]; ) {
      n += t;
      const b = (e[n] << 8) + e[n + 1], h = (e[n + 2] << 24) + (e[n + 3] << 16) + (e[n + 4] << 8) + e[n + 5];
      n += 6, f += b + h;
    }
    return f;
  }
  [M(506)](e, t, i) {
    const u = M;
    let m = 2;
    if (0 < (e[0] << 8) + e[1] && m + (t + 2 + 4) <= e[u(751)]) {
      m += t;
      let f = (e[m] << 8) + e[m + 1];
      f += i, f >= 0 && (e[m] = f >>> 8 & 255, e[m + 1] = 255 & f);
    }
    return 0;
  }
  createBuffer() {
    const e = M;
    if (this[e(555)] && this[e(466)] && this[e(466)].isReady() && !this[e(729)]) {
      this.bufferControllers = {};
      for (let t in this[e(466)][e(469)]) {
        let i = this[e(466)][e(469)][t];
        const u = ""[e(753)](t, e(520))[e(753)](i.mp4track[e(537)], '"');
        if (window.clRtcDrmDebugLog && console[e(575)](e(553), u), !In[e(689)](u)) return console[e(574)](e(736)), !1;
        let m = this[e(590)][e(513)](u);
        this[e(729)][t] = new Ia(m, t, this[e(590)]), this[e(729)][t].on(e(574), this.onBufferError.bind(this));
      }
    }
  }
  [M(726)]() {
    const e = M;
    for (let t in this[e(729)]) this[e(729)][t][e(737)]();
  }
  [M(658)](e) {
    const t = M;
    this.mseReady && this[t(729)] && this[t(729)][e.type] && this[t(729)][e[t(593)]][t(631)](e.payload);
  }
  [M(674)]() {
    const e = M;
    window.clRtcDrmDebugLog && console.info(e(701)), this[e(590)][e(648)] !== e(660) && (this.mediaSource[e(556)] = Number[e(516)], this[e(555)] = !0, typeof this.options[e(706)] === e(626) && this[e(599)][e(706)][e(568)](null, this[e(461)]), URL.revokeObjectURL(this[e(547)]), this.createBuffer());
  }
  [M(748)]() {
    const e = M;
    window[e(454)] && console[e(575)]("[MSE] sourceclose"), this[e(555)] = !1, this[e(543)]();
  }
  [M(693)](e) {
    const t = M;
    console[t(517)](t(545), e), this[t(657)] = !0, this[t(543)](), typeof this.options[t(620)] === t(626) && this.options[t(620)][t(568)](null, e);
  }
}
(function() {
  const r = yi, e = kn();
  for (; ; ) try {
    if (-parseInt(r(468)) / 1 + parseInt(r(469)) / 2 + -parseInt(r(474)) / 3 * (parseInt(r(476)) / 4) + -parseInt(r(470)) / 5 + -parseInt(r(479)) / 6 * (-parseInt(r(475)) / 7) + -parseInt(r(473)) / 8 + parseInt(r(478)) / 9 === 324070) break;
    e.push(e.shift());
  } catch (t) {
    e.push(e.shift());
  }
})();
function yi(r, e) {
  const t = kn();
  return (yi = function(i, u) {
    return t[i -= 468];
  })(r, e);
}
function kn() {
  const r = ["2247530sqDpfe", "toISOString", "__dev_time__", "5141376xRhrDH", "3dIbGPs", "1220569KoCmNv", "2523628bGkRGg", "gitVersion", "9626760ldyaKP", "18zktfyS", "134350ptEqvk", "1177528NltpdS"];
  return (kn = function() {
    return r;
  })();
}
function En() {
  const r = ["V382D1oJAM0F/YgCQtNDLz7vTWJ+QskNGi5Dd2qzO4s48Cnx5BLvL4H0xCRSw2Ed6ekHSdrRU", "atob", "Development", "30QEHzUN", "Staging", "https://lic.test.drmtoday.com", "name", "Production", "+vwmV2/NJWxKqHBKdL9JqvOnNiQUF0hDI7Wf8Wb63RYSXKE27Ky31hKgx1wuq7TTWkA+kHnJT", "27eI5MATX39gYtCnn7dDXVxo4/rCYK0A4VemC3HRai2X3pSGcsKY7+6we7h4IycjqtuGtYg8A", "xUuwokpsqVIHZrJfu62ar+BF8UVUKdK5oYQoiTZd9OzK3kr29kqGGk3lSgM0/p499p/FUL8oH", "4865XQMADs", "160538lOHMNt", "91842oBcfpa", "baseUrl", "https://lic.staging.drmtoday.com", "staging", "308KLlRjJ", "7hyskG5ZLAyJMzTvgnV3D8/I5Y6mCFBPb/+/Ri+9bEvquPF3Ff9ip3yEHu9mcQeEYCeGe9zR/", "2698soaNGA", "certificate", "2603512BsHriy", "wyoYOE+M/t1oIbccwlTQ7o+BpV1X6TB7fxFyx1jsBtRsBWphU65w121zqmSiwzZzJ4xsXVQCJ", "development", "RL9KsD0v7ysBQVdUXEbJotcFz71tI5qc3jwr6GjYIPA3VzusD17PN6AGQniMwxJV12z/EgnUo", "production", "4341535HUMKmM", "pQnNI61gzHO42XZOMuxytMm0F6puNHTTqhyY3Z290YqvSDdOB+UY5QJuXJgjhvOUD9+oaLlvT", "532JOmVLc", "2113245bMrvgc", "18VNRfWD", "baigovcoURAZcr1d/G0rpREjLdVLG0Gjqk63Gx688W5gh3TKemsK3R1jV0dOfj3e6uV/kTpsN"];
  return (En = function() {
    return r;
  })();
}
function Cn(r, e) {
  const t = En();
  return (Cn = function(i, u) {
    return t[i -= 431];
  })(r, e);
}
const he = Cn;
(function() {
  const r = Cn, e = En();
  for (; ; ) try {
    if (parseInt(r(434)) / 1 + -parseInt(r(459)) / 2 + parseInt(r(444)) / 3 + parseInt(r(443)) / 4 * (-parseInt(r(458)) / 5) + parseInt(r(460)) / 6 * (-parseInt(r(432)) / 7) + parseInt(r(436)) / 8 * (-parseInt(r(445)) / 9) + -parseInt(r(450)) / 10 * (-parseInt(r(441)) / 11) === 357104) break;
    e.push(e.shift());
  } catch (t) {
    e.push(e.shift());
  }
})();
const ka = "CrsCCAMSEKDc0WAwLAQT1SB2ogyBJEwYv4Tx7gUijgIwggEKAoIBAQC8Xc/GTRwZDtlnBThq8" + he(447) + he(437) + he(442) + he(455) + "UrTEfQxfPR4dJTquE+IDLAi5yeVVxzbAgMBAAE6DGNhc3RsYWJzLmNvbUABEoADMmGXpXg/0q" + he(457) + "HzgsJ7Hajdsyzn0Vs3+VysAgaJAkXZ+k+N6Ka0WBiZlCtcunVJDiHQbz1sF9GvcePUUi2fM/h" + he(433) + he(456) + he(446) + he(439) + "pcFB13osydpD2AaDsgWo5RWJcNf+fzCgtUQx/0Au9+xVm5LQBdv8Ja4f2oiHN3dw", Ea = Uint8Array.from(window[he(448)](ka), (r) => r.charCodeAt(0));
class Me {
  constructor(e) {
    this[he(453)] = e;
  }
  toString() {
    return this[he(453)];
  }
  [he(461)]() {
    const e = he;
    switch (this[e(453)]) {
      case e(431):
        return e(462);
      case e(438):
        return e(452);
      default:
        return "https://lic.drmtoday.com";
    }
  }
  [he(435)]() {
    return Ea;
  }
}
function _n() {
  const r = ["getUint8", "6120990upmYVH", "Unsupported SampleAuxInfo version", "6681904bUZfYM", "1026114stCTGm", "12896056wVeSIV", "2967096INydVk", "20KAUTTd", "SampleAuxInfo corrupted", "5471973chYjQW", "buffer", "cenc", "SampleAuxInfo corrupted (postfix not found)", "error", "data", "getUint16", "7jdHIFn", "334oDWPye", "5737LRtSrK"];
  return (_n = function() {
    return r;
  })();
}
function Ir(r, e) {
  const t = _n();
  return (Ir = function(i, u) {
    return t[i -= 215];
  })(r, e);
}
function Tn(r, e) {
  const t = An();
  return (Tn = function(i, u) {
    return t[i -= 272];
  })(r, e);
}
Me[he(451)] = new Me(he(431)), Me[he(454)] = new Me(he(440)), Me[he(449)] = new Me(he(438)), function() {
  const r = Ir, e = _n();
  for (; ; ) try {
    if (parseInt(r(216)) / 1 * (parseInt(r(215)) / 2) + parseInt(r(221)) / 3 + parseInt(r(220)) / 4 + parseInt(r(218)) / 5 + -parseInt(r(223)) / 6 + -parseInt(r(233)) / 7 * (parseInt(r(222)) / 8) + -parseInt(r(226)) / 9 * (parseInt(r(224)) / 10) === 872274) break;
    e.push(e.shift());
  } catch (t) {
    e.push(e.shift());
  }
}(), function() {
  const r = Tn, e = An();
  for (; ; ) try {
    if (-parseInt(r(272)) / 1 * (-parseInt(r(279)) / 2) + parseInt(r(278)) / 3 * (-parseInt(r(273)) / 4) + parseInt(r(286)) / 5 * (-parseInt(r(274)) / 6) + -parseInt(r(285)) / 7 + -parseInt(r(277)) / 8 + -parseInt(r(280)) / 9 * (parseInt(r(275)) / 10) + parseInt(r(281)) / 11 === 986931) break;
    e.push(e.shift());
  } catch (t) {
    e.push(e.shift());
  }
}();
const Ct = [];
let Pr = null, us = 0;
function Ca(r) {
  return !Pr && function() {
    const e = Tn;
    Pr = new Uint8Array([0, 0, 0, 1, 65, 154, 255, 255])[e(282)], Ct[e(283)](new Uint8Array([0, 0, 0, 1, 39, 100, 0, 13, 172, 87, 5, 6, 100, 0, 0, 0, 1, 40, 238, 60, 176, 0, 0, 0, 1, 37, 184, 32, 0, 203, 255, 38, 29, 217, 24, 192, 161, 96, 0, 0, 12, 229, 174, 166, 6, 7, 20, 3, 84, 0, 247, 96, 193, 181, 229, 128, 0, 32, 32]).buffer), Ct[e(283)](Ct[0][e(284)](0)), new Uint8Array(Ct[1])[e(276)]([16, 0, 50], 27);
  }(), r ? Pr : (us ^= 1, Ct[us]);
}
function An() {
  const r = ["slice", "5566064tgmsuD", "1243390MaHRPo", "7646sSujuI", "35692bVMoZZ", "6ObHRvK", "1956830RCxgWp", "set", "588328HgIwqU", "438iAdZRm", "4nTLwDZ", "54xPzQSc", "50224526zsMUCK", "buffer", "push"];
  return (An = function() {
    return r;
  })();
}
function Ln() {
  const r = ["kids", "559202yiHLhN", "info", "parseFromString", "No init data available!", "nodeValue", "9a04f07998404286ab92e65be0885f95", "961005xHVHlu", "[EME]", "close", "Data has an incorrect length, must be even.", "833396owpUFh", "Failed to reuse previous EME session: ", "persistent-license", "Key ", "push", "buffer", "vendor", "encode", "then", "rtcdrmerror", "internal-error", "load", "324912fiIbxM", "update", "edef8ba979d64acea3c827dcd51d21ed", "delete", "apply", "set", "append", "max", "Apple", "Challenge", "getElementsByTagName", "arrayBuffer", "floor", "Failed to update the session", "status", "bind", "No PR challenge data!", "Data does not seem to be UTF-16 encoded!", "replace", "No media element available!", "BYTES_PER_ELEMENT", "No clear key test key provided!", "[FPS] License fetched:", "fromCharCode", "Content-Type", "Failed to update the session: ", "mediaKeys", "atob", "byteLength", "[PR] License fetched:", "217135Eimdcp", "expired", "3464OUovjJ", "getUint16", "[PR] Challenge node not found", "730116PYhMTN", "keyStatuses", "indexOf", "message", "text/xml", "license", "initData", "json", "13629gXuraF", "Failed to load previous EME session", "oct", "output-restricted", "error", "warn", "No media keys for media element!", "temporary", "New lic will be requested", "CDM error generating license request: ", "log", "addEventListener", "includes", "clRtcDrmDebugLog", "licenseUrl", "License acquisition failed with error ", "target", "childNodes", "dispatchEvent", "onFetch", "usable for decryption (status: ", "stringify", "catch", "length", "btoa", "initDataType", "subarray", " is not ", "text", "min", "decode", "POST", "parse", "keystatuseschange", "get", "A128KW", "createSession"];
  return (Ln = function() {
    return r;
  })();
}
const ir = ve;
(function() {
  const r = ve, e = Ln();
  for (; ; ) try {
    if (-parseInt(r(262)) / 1 + -parseInt(r(210)) / 2 + -parseInt(r(267)) / 3 + -parseInt(r(220)) / 4 + parseInt(r(216)) / 5 + parseInt(r(232)) / 6 + -parseInt(r(275)) / 7 * (-parseInt(r(264)) / 8) === 140947) break;
    e.push(e.shift());
  } catch (t) {
    e.push(e.shift());
  }
})();
let vt = { licenseUrl: "", onFetch: void 0 };
const bi = {}, _a = (r, e, t) => {
  const i = ve, u = Uint8Array[i(252)];
  e *= u, t *= u;
  const m = (b = r) instanceof ArrayBuffer ? b : b[ve(225)], f = r[i(260)], n = e;
  var b;
  let h = Math[i(239)](0, Math[i(304)](n, f)), g = Math.min(h + Math[i(239)](t, 0), f);
  return h /= u, g /= u, new Uint8Array(m, h, g - h);
}, ds = (r, e = 0, t = 1 / 0) => _a(r, e, t);
function ve(r, e) {
  const t = Ln();
  return (ve = function(i, u) {
    return t[i -= 203];
  })(r, e);
}
function Ta(r, e, t = !1) {
  const i = ve;
  if (!r) return "";
  let u = r;
  if (!t && u[i(260)] % 2 != 0) throw console[i(279)](i(219)), new Error(i(249));
  const m = ds(u);
  let f;
  if ((m[0] === 255 && m[1] === 254 || m[0] === 254 && m[1] === 255) && (u = m[i(301)](2)), u instanceof ArrayBuffer) f = u;
  else {
    const g = new Uint8Array(u[i(260)]);
    g[i(237)](ds(u)), f = g.buffer;
  }
  const n = Math[i(244)](u[i(260)] / 2), b = new Uint16Array(n), h = new DataView(f);
  for (let g = 0; g < n; g++) b[g] = h[i(265)](2 * g, e);
  return function(g) {
    const o = ve;
    let c = "";
    for (let l = 0; l < g.length; l += 16e3) {
      const a = g[o(301)](l, l + 16e3);
      c += String[o(255)][o(236)](null, a);
    }
    return c;
  }(b);
}
const fs = (r) => {
  let e = "";
  for (const t of r) {
    let i = t.toString(16);
    i.length == 1 && (i = "0" + i), e += i;
  }
  return e;
};
let qr = null;
const Aa = (r) => {
  const e = ve;
  return window[e(299)](String[e(255)][e(236)](null, r))[e(250)](/\+/g, "-")[e(250)](/\//g, "_")[e(250)](/=*$/, "");
}, La = (r, e) => {
  const t = ve, i = ((u) => {
    const m = ve, f = JSON[m(204)](new TextDecoder()[m(305)](u));
    if (console[m(285)]("CK license request:", f), qr === null) throw new Error(m(253));
    const n = [];
    for (const b of f[m(209)]) {
      const h = { kty: m(277), alg: m(207), kid: b, k: Aa(qr) };
      n[m(224)](h);
    }
    return new TextEncoder()[m(227)](JSON[m(296)]({ keys: n }));
  })(e.message);
  e[t(291)][t(233)](i)[t(297)](function(u) {
    const m = t;
    console[m(279)](m(245), u);
  });
}, Dn = (r) => {
  const e = ve, t = window[e(259)](r[e(250)](/-/g, "+").replace(/_/g, "/")), i = new Uint8Array(t[e(298)]);
  for (let u = 0; u < t[e(298)]; ++u) i[u] = t.charCodeAt(u);
  return i;
}, Mn = (r, e, ...t) => wn(void 0, [r, e, ...t], void 0, function* (i, u, m = !1) {
  const f = ve, n = new Headers(bi);
  m && n[f(238)](f(256), f(271));
  const b = { method: f(203), headers: n, body: u }, h = yield vt[f(294)] ? vt[f(294)](i, b) : fetch(i, b);
  if (!h.ok) throw new Error(f(290) + h[f(246)]);
  return h;
}), Da = (r, e) => {
  const t = ve;
  Mn(vt[t(289)], e[t(270)])[t(228)]((i) => i[t(274)]())[t(228)]((i) => {
    const u = t;
    window.clRtcDrmDebugLog && console.info("[WV] License fetched:", i.license);
    const m = Dn(i[u(272)])[u(225)];
    e[u(291)].update(m)[u(297)]((f) => {
      console.error("Failed to update the session", f);
    });
  })[t(297)]((i) => {
    const u = t;
    r[u(293)](new CustomEvent("rtcdrmerror", { detail: { message: "" + i } })), console[u(279)](i);
  });
}, Ma = (r, e) => {
  const t = ve, i = ((u, m) => {
    const f = ve, n = new DOMParser();
    try {
      const b = Ta(m, !0);
      if (b[f(269)]("<Challenge") > -1) {
        const h = n[f(212)](b, "text/xml")[f(242)](f(241))[0][f(292)][0][f(214)];
        if (h === null) throw new Error(f(248));
        return Dn(h);
      }
      console[f(280)](f(266));
    } catch (b) {
      u.dispatchEvent(new CustomEvent("rtcdrmerror", { detail: { message: "" + b } })), console[f(279)](b);
    }
    return null;
  })(r, e[t(270)]);
  if (i === null) return r[t(293)](new CustomEvent("rtcdrmerror", { detail: { message: t(248) } })), void console[t(279)](t(248));
  Mn(vt.licenseUrl, i[t(225)], !0)[t(228)]((u) => u[t(243)]())[t(228)]((u) => {
    const m = t;
    window[m(288)] && console[m(211)](m(261), u), e[m(291)][m(233)](u)[m(297)](function(f) {
      const n = m;
      r.dispatchEvent(new CustomEvent(n(229), { detail: { message: n(257) + f } })), console[n(279)](n(245), f);
    });
  })[t(297)]((u) => {
    const m = t;
    r[m(293)](new CustomEvent(m(229), { detail: { message: "" + u } })), console.error(u);
  });
}, Pa = (r, e) => {
  const t = ve;
  Mn(vt.licenseUrl, e[t(270)]).then((i) => {
    const u = t, m = i[u(303)]();
    return window.clRtcDrmDebugLog && console[u(211)](u(254), i, m), m;
  })[t(228)]((i) => {
    const u = t;
    e[u(291)][u(233)](Dn(i));
  }).catch((i) => {
    const u = t;
    r.dispatchEvent(new CustomEvent(u(229), { detail: { message: "" + i } })), console[u(279)](i);
  });
}, hs = (r, e) => {
  bi[r] = e;
}, vi = navigator[ir(226)] && navigator[ir(226)][ir(287)](ir(240));
let or = !vi;
const _t = /* @__PURE__ */ new Map();
function Za(r) {
  return wn(this, void 0, void 0, function* () {
    const e = ve;
    if (r[e(273)] === null) throw new Error(e(213));
    const t = r[e(291)];
    if (t === null) throw new Error(e(251));
    const i = t[e(258)];
    if (i === null) throw new Error(e(281));
    const u = fs(new Uint8Array(r.initData)), m = u + t.id;
    let f = null;
    _t.has(m) && (f = _t[e(206)](m), f != null && f[e(218)](), _t[e(235)](m)), window[e(288)] && console[e(211)](e(217), f ? "Previous lic will be reused" : e(283));
    let n = null;
    try {
      n = i[e(208)](or ? e(222) : "temporary");
    } catch (b) {
      console[e(285)]("EME createSession(persistent) failed:", b);
    }
    if (!n && or) {
      or = !1;
      try {
        n = i[e(208)](e(282));
      } catch (b) {
        console[e(279)]("EME createSession(temporary) failed:", b);
      }
    }
    if (n) if (n[e(286)](e(205), (b) => {
      const h = e;
      b[h(291)][h(268)].forEach((g, o) => {
        const c = h;
        (g === c(263) || g === c(278) || g === "output-downscaled" || g === c(230)) && n[c(293)](new CustomEvent(c(229), { detail: { message: c(223) + fs(new Uint8Array(o)) + c(302) + (c(295) + g + ")"), keyId: o } }));
      });
    }), vi ? n[e(286)](e(270), Pa.bind(null, t), !1) : u[e(269)](e(234)) !== -1 ? n.addEventListener("message", Da[e(247)](null, t), !1) : u[e(269)](e(215)) !== -1 ? n.addEventListener(e(270), Ma.bind(null, t), !1) : n[e(286)](e(270), La[e(247)](null, t), !1), f) try {
      (yield n[e(231)](f.sessionId)) ? _t[e(237)](m, n) : t.dispatchEvent(new CustomEvent("rtcdrmerror", { detail: { message: e(276) } }));
    } catch (b) {
      t[e(293)](new CustomEvent(e(229), { detail: { message: e(221) + b } }));
    }
    else n.generateRequest(r[e(300)], r[e(273)])[e(228)](() => {
      or && _t.set(m, n);
    }).catch((b) => {
      const h = e;
      t[h(293)](new CustomEvent(h(229), { detail: { message: h(284) + b } }));
    });
    else t[e(293)](new CustomEvent(e(229), { detail: { message: "EME createSession() failed - no DRM available" } }));
  });
}
const H = kr;
var Zr, Ur, Fr;
(function() {
  const r = kr, e = Un();
  for (; ; ) try {
    if (-parseInt(r(443)) / 1 + -parseInt(r(346)) / 2 * (-parseInt(r(241)) / 3) + parseInt(r(243)) / 4 * (-parseInt(r(393)) / 5) + parseInt(r(453)) / 6 * (parseInt(r(297)) / 7) + parseInt(r(447)) / 8 * (-parseInt(r(417)) / 9) + -parseInt(r(452)) / 10 * (-parseInt(r(481)) / 11) + -parseInt(r(290)) / 12 === 923360) break;
    e.push(e.shift());
  } catch (t) {
    e.push(e.shift());
  }
})();
const ms = !!window.RTCRtpScriptTransform, ot = navigator[H(300)][H(276)]("Firefox"), Ze = !ot && navigator[H(459)][H(276)]("Apple"), Pn = !ot && !Ze && window.navigator[H(300)].includes(H(302)), wi = !ot && !Ze && !Pn && window[H(259)].userAgent[H(276)](H(446)), Si = ((Ur = (Zr = window == null ? void 0 : window[H(259)]) === null || Zr === void 0 ? void 0 : Zr.userAgentData) === null || Ur === void 0 ? void 0 : Ur[H(252)]) || ((Fr = window == null ? void 0 : window[H(259)]) === null || Fr === void 0 ? void 0 : Fr.platform), xi = Si === H(282), Ua = Pn || wi && Si === H(288), Fa = 1e6 * (ot ? 82 : Ze ? 220 : 120), Zn = ot ? 5e3 : 2e3, Na = ot ? 1.5 : 0.5;
class Oa {
  constructor(e) {
    const t = H;
    this[t(409)] = [], this[t(258)] = "", this[t(426)] = "", this[t(416)] = "", this.jmuxer = null, this[t(341)] = -1, this.keyFrameLogCntr = 0, this[t(479)] = Date.now(), this[t(264)] = 0, this[t(380)] = 0, this[t(326)] = -1, this.lastKeyFrameTime = 0, this[t(441)] = 0, this.keyFrameNeeded = !0, this.keyFrameNeededPosted = !1, this[t(322)] = Zn, this[t(240)] = null, this.video = e.video, this.audio = e[t(274)], this[t(371)] = e.merchant, this.environment = e.environment, this[t(438)] = e[t(438)], this[t(381)] = e[t(381)], this.customTransform = e.customTransform, this[t(298)] = e[t(298)], this[t(338)] = e[t(338)], this[t(377)] = e[t(377)], this[t(242)] = e[t(242)], this.sessionId = e[t(266)], this[t(419)] = e[t(419)], this[t(456)] = e.wvCertificateUrl, this[t(263)] = e.wvLicenseUrl, this.prLicenseUrl = e[t(437)], this[t(334)] = e[t(334)], this[t(404)] = e[t(404)], this.fpsLicenseUrl = e[t(365)];
  }
}
const Je = /* @__PURE__ */ new Map(), Va = new Uint8Array([60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60]), ja = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]), Wa = new Uint8Array([213, 251, 214, 184, 46, 217, 62, 78, 249, 138, 228, 9, 49, 238, 51, 183]);
function $a(r, e) {
  const t = H;
  e !== void 0 && (r.mediaBufferMs = e), (r.mediaBufferMs === void 0 || r.mediaBufferMs < 0) && (r[t(341)] = 100, ot ? r[t(341)] = 350 : !Ze && xi && (r[t(338)] === t(463) || r[t(325)]) && (r[t(341)] = 1400));
}
function Ba(r) {
  const e = H;
  let t = !1;
  if ((r[e(375)] && r[e(375)][e(315)] !== "clear" && r[e(375)][e(435)] === "HW" || r[e(274)] && r[e(274)][e(315)] !== "clear" && r.audio[e(435)] === "HW") && (t = !0), r[e(325)] = t, $a(r, r[e(341)]), r.authToken === void 0) {
    r[e(242)] === void 0 && (r[e(242)] = e(355)), r[e(266)] === void 0 && (r.sessionId = e(281));
    const m = window.btoa(JSON[e(464)]({ userId: r[e(242)], sessionId: r[e(266)], merchant: r[e(371)] }));
    hs(e(445), m);
  } else hs(e(428), r[e(377)]);
  for (const m of [r[e(274)], r[e(375)]]) m && m[e(315)] !== e(287) && (!m[e(457)] && (m[e(457)] = ja), !m.iv && (m.iv = Wa), m[e(315)] === e(278) ? (m[e(444)] = new Uint8Array([99, 98, 99, 115]), m[e(398)] = new Uint8Array([16, ...m.iv]), m[e(329)] = 25, m[e(272)] = 0) : (m[e(444)] = new Uint8Array([99, 101, 110, 99]), m[e(398)] = new Uint8Array([]), m[e(329)] = 0, m.saiIvSize = 16));
  r.serverCertificate = void 0, r[e(258)] = "", r[e(426)] = "";
  const i = r[e(307)][e(339)]();
  var u;
  if (r[e(338)] === e(336) ? (r[e(416)] = e(291), r.systemID = new Uint8Array([16, 119, 239, 236, 192, 178, 77, 2, 172, 227, 60, 30, 82, 226, 251, 75]), qr = Va) : r[e(338)] === e(358) ? (r[e(416)] = e(275), xi && t && (r[e(416)] += e(335)), r.systemID = new Uint8Array([237, 239, 139, 169, 121, 214, 74, 206, 163, 200, 39, 220, 213, 29, 33, 237]), r[e(419)] ? r[e(296)] = r[e(419)] : r[e(456)] ? r[e(258)] = r[e(456)] : r[e(296)] = r.environment[e(261)](), r.wvLicenseUrl ? r[e(426)] = r[e(263)] : r.licenseUrl = i + e(430)) : r.type === e(463) ? (r[e(416)] = e(406), r[e(285)] = new Uint8Array([154, 4, 240, 121, 152, 64, 66, 134, 171, 146, 230, 91, 224, 136, 95, 149]), r[e(437)] ? r.licenseUrl = r.prLicenseUrl : r[e(426)] = i + e(388)) : r[e(338)] === e(385) && (r[e(416)] = e(292), r[e(285)] = void 0, r.fpsCertificate ? r[e(296)] = r[e(334)] : r[e(404)] ? r[e(258)] = r[e(404)] : r[e(258)] = i + e(387) + r[e(371)], r.fpsLicenseUrl ? r.licenseUrl = r[e(365)] : r[e(426)] = i + "/license-server-fairplay/"), u = { licenseUrl: r[e(426)], onFetch: r[e(298)] }, vt = u, r.emeConfig = [], r[e(338)] !== e(385)) {
    r[e(409)][e(324)]({ initDataTypes: ["cenc"], sessionTypes: [e(255), e(422)] });
    for (const m of [r.video, r[e(274)]]) if (m && m[e(315)] !== e(287)) {
      const f = m == r.video ? e(375) : "audio";
      let n;
      r[e(338)] === e(358) ? n = m.robustness === "HW" ? e(349) : e(362) : r.type === e(463) && (n = m[e(435)] === "HW" ? "3000" : e(280)), f === "video" ? r[e(409)][0][e(405)] = [{ contentType: e(309), encryptionScheme: m[e(315)] === e(429) ? e(429) : e(473), robustness: n || void 0 }] : r.emeConfig[0].audioCapabilities = [{ contentType: e(301), encryptionScheme: m.encryption === e(429) ? "cenc" : "cbcs-1-9", robustness: n || void 0 }];
    }
  } else r[e(409)] = [{ initDataTypes: [e(449)], videoCapabilities: [{ contentType: "video/mp4", robustness: "" }], distinctiveIdentifier: "not-allowed", persistentState: e(395), sessionTypes: [e(422)] }];
  window[e(410)] && console[e(330)]("DRM config:", r);
}
function Ri(r) {
  const e = H;
  window.clRtcDrmDebugLog && console[e(330)](e(283));
  let t = r.videoElement;
  (!r[e(375)] || r[e(375)][e(315)] === e(287)) && (t = r[e(381)]), r[e(244)] = null;
  const i = !r[e(356)] && r[e(274)] && r.audio[e(315)] !== "clear", u = r[e(375)] && r.video[e(315)] !== e(287);
  r[e(441)] = 0, r[e(368)] = !0, r[e(308)] = !1, r[e(322)] = Zn, r[e(264)] = 0, r[e(380)] = 0, r[e(326)] = -1, r[e(289)] = 0, r[e(244)] = new In({ node: t, mode: i ? e(u ? 286 : 274) : "video", fps: 60, drm: r }), Ze && r[e(438)] && r[e(438)].play().then(() => {
  })[e(253)](() => {
  });
}
function kr(r, e) {
  const t = Un();
  return (kr = function(i, u) {
    return t[i -= 240];
  })(r, e);
}
function Ga(r, e) {
  const t = H;
  r[t(264)] === 0 && (r.videoStartTimestamp = e[t(284)], r[t(322)] = Zn, r[t(479)] = Date[t(475)]() + 2e3);
  let i = null, u = !1;
  if (e[t(369)][t(354)] <= 4) console[t(476)](t(270)), u = !0;
  else {
    const n = new Uint8Array(e[t(369)], 0, 4);
    n[0] != 0 || n[1] != 0 || n[2] != 0 || n[3] != 1 ? (console[t(476)](t(403)), u = !0) : (i = function(b, h) {
      const g = Ir, o = new DataView(b[g(231)]), c = b[g(231)].byteLength - 2, l = o[g(232)](c);
      if (l < c) {
        let a = c - l;
        if (o[g(217)](c - 1) !== 69) return console[g(230)](g(229)), null;
        if (o[g(217)](a++) >>> 4 !== 1) return console.error(g(219)), null;
        const p = new Uint8Array(l - 2);
        let d = 0, y = 0;
        for (; a < c - 1; ) {
          let E = o[g(217)](a++);
          y > 1 && E === 3 && (y = 0, E = o[g(217)](a++)), E !== 0 ? y = 0 : ++y, p[d++] = E;
        }
        const v = new DataView(p[g(227)]), S = h === g(228) ? 16 : 0, I = S + 2 + 6 * v[g(232)](S);
        return I + 2 > d ? (console[g(230)](g(225)), null) : { sai: p.subarray(0, I), offset: c - l, seq: v[g(232)](I) };
      }
      return null;
    }(e, r[t(375)][t(315)]), !i && (console[t(476)](t(448)), u = !0));
  }
  if (i) if (r[t(326)] === -1) {
    if (e.type !== t(378)) return 0;
    r[t(326)] = i[t(461)];
  } else {
    let b = i.seq - r[t(326)];
    if (b < -32767 && (b += 65536), b <= 0) return window[t(410)] && console[t(476)]("Duplicate/reordered frame, prev seq: " + r.prevSeqNum + t(413) + i[t(461)]), 0;
    b > 1 && (u = e.type !== "key", console[t(476)](t(471) + r[t(326)] + t(344) + i.seq + ", restart required: " + u)), r.prevSeqNum = i[t(461)];
  }
  let m = 0;
  u && !r[t(244)].waitingForIdr && (m = -1, r[t(244)][t(265)]());
  const f = (e[t(284)] - r[t(264)]) / 9e4;
  return i && r[t(244)][t(314)]({ video: new Uint8Array(e[t(369)], 0, i[t(295)]), videoSampleAuxInfo: i[t(303)], timestamp: f }) < 0 && (m = -1, console.warn(t(389)), Ri(r)), m >= 0 && e[t(338)] === t(378) && (r[t(289)] = f, console[t(357)]((/* @__PURE__ */ new Date())[t(474)]()[t(246)](11, -1) + t(420) + f + t(352) + r[t(438)][t(331)])), m;
}
function Xa(r) {
  const e = H;
  if (!r[e(438)] || r[e(438)][e(458)][e(267)] < 1 || r[e(438)].paused || r[e(438)][e(331)] < Na) return;
  const t = r[e(438)][e(458)][e(268)](r[e(438)][e(458)][e(267)] - 1), i = 1e3 * (t - r[e(438)].currentTime) | 0;
  if (!r.audioEncrypted && function(u, m) {
    const f = H, n = u.videoElement[f(480)];
    let b;
    b = m < 3 * u.mediaBufferMs >>> 2 ? 0.875 : m <= u.mediaBufferMs ? 1 : m < 7 * u[f(341)] >>> 2 ? 1.125 : m < 9 * u[f(341)] >>> 2 ? 1.25 : m < 11 * u.mediaBufferMs >>> 2 ? 1.375 : 1.5, b !== n && (u[f(438)][f(480)] = b);
  }(r, i), !(i < r[e(341)] + 50 || i < 5 * r.mediaBufferMs >>> 2)) if (r.lastKeyFrameTime > r[e(438)][e(331)] + 0.1) {
    const u = 1e3 * (t - r[e(289)]) | 0;
    u > 40 && u > r.mediaBufferMs - 100 ? (window.clRtcDrmDebugLog && console.info((/* @__PURE__ */ new Date())[e(474)]()[e(246)](11, -1) + e(310) + (r[e(438)][e(331)] + e(347) + r[e(289)] + " (") + (r.lastKeyFrameTime - r.videoElement[e(331)]) + ")"), r[e(438)][e(331)] = r.lastKeyFrameTime) : console[e(357)]((/* @__PURE__ */ new Date())[e(474)]()[e(246)](11, -1) + " too close to seek, " + u);
  } else !r[e(368)] && Date[e(475)]() > r[e(479)] && i > r[e(341)] + 100 && i > 3 * r[e(341)] >>> 1 && (window.clRtcDrmDebugLog && console[e(330)]((/* @__PURE__ */ new Date())[e(474)]()[e(246)](11, -1) + e(374) + i + e(396)), r.keyFrameNeeded = !0, r[e(322)] < 16e3 && (r[e(322)] <<= 1));
}
function za(r, e) {
  const t = H;
  var i;
  if (!r[t(244)] || r[t(356)]) return 0;
  r[t(380)] === 0 && (r[t(380)] = e[t(284)]);
  const u = (e[t(284)] - r[t(380)]) / 48e3;
  if (((i = r[t(274)]) === null || i === void 0 ? void 0 : i[t(315)]) === t(278)) return r.jmuxer[t(314)]({ audio: new Uint8Array(e[t(369)]), timestamp: u });
  const m = function(f) {
    const n = Ir, b = new DataView(f[n(231)]), h = f[n(231)].byteLength - 2, g = b[n(232)](h);
    if (g < h) {
      let o = h - g;
      if (b[n(217)](h - 1) !== 69) return console[n(230)]("SampleAuxInfo corrupted (postfix not found)"), null;
      if (b[n(217)](o++) >>> 4 !== 1) return console[n(230)](n(219)), null;
      const l = new Uint8Array(g - 2);
      let a = 0;
      for (; o < h - 1; ) {
        const s = b.getUint8(o++);
        if (l[a++] = s, a >= 16) break;
      }
      return { sai: l, offset: h - g };
    }
    return null;
  }(e);
  return m ? r[t(244)][t(314)]({ audio: new Uint8Array(e[t(369)], 0, m[t(295)]), audioSampleAuxInfo: m[t(303)], timestamp: u }) : (console.error("SampleAuxInfo extraction failed (audio)"), -1);
}
function Ya(r, e, t) {
  const i = Ii(t);
  return r.type ? en(i, r, e) : tn(i, r, e);
}
function en(r, e, t) {
  const i = H;
  if (r[i(375)] && r.video[i(315)] === i(287)) return t == null || t[i(269)](e), !1;
  const u = Date[i(475)]();
  if (e[i(338)] === "key") {
    const m = window[i(410)];
    ++r[i(423)] < (m ? Number.POSITIVE_INFINITY : 5) && (console[i(330)]((/* @__PURE__ */ new Date()).toISOString()[i(246)](11, -1) + " " + e[i(338)] + ", " + (e[i(369)][i(354)] + i(424) + r[i(438)].currentTime)), m && r[i(423)] === 1 && function(f, n = 64, b = 64) {
      const h = H, g = new Uint8Array(f[h(369)]);
      let o = "", c = 0;
      for (let l = 0; l < n && l < g.length; ++l) o += (g[l] < 16 ? "0" : "") + g[l][h(397)](16) + " ";
      if (c < g[h(267)]) for (c < g.length - b && (o += h(350), c = g[h(267)] - b); c < g[h(267)]; c++) o += (g[c] < 16 ? "0" : "") + g[c][h(397)](16) + " ";
      console[h(330)]("[" + ((f.type || h(274)) + h(342)) + h(343) + o[h(425)]());
    }(e, 128, 8)), r[i(368)] = !1, r[i(441)] = 0, r[i(479)] = u + r[i(322)];
  }
  return r[i(441)] += e[i(369)].byteLength, !r.keyFrameNeeded && r[i(441)] > Fa && (console[i(330)](i(299)), r[i(368)] = !0), r[i(244)] && (Ga(r, e) < 0 ? r.keyFrameNeeded = !0 : Xa(r)), t ? (!r[i(368)] || !Ua) && (e.data = Ca(r[i(368)]), t[i(269)](e)) : r[i(368)] != r.keyFrameNeededPosted && (r[i(240)] && r[i(240)][i(340)](r.keyFrameNeeded), r.keyFrameNeededPosted = r[i(368)]), r.keyFrameNeeded;
}
function Un() {
  const r = ["onFetch", "GOP is getting too long, requesting a new key frame", "userAgent", 'audio/mp4; codecs="opus"', "Edg", "sai", ") not found in [", "rtcDrmConfigure did not specify audioElement, audio will be dropped", "Fetched certificate from ", "environment", "keyFrameNeededPosted", 'video/mp4; codecs="avc1.640032"', " seeking from ", "ClearKey is not supported by Safari.", "let brokenFrame=null,idrFrames=[];function initializeDummyFrames(){brokenFrame=new Uint8Array([0,0,0,1,65,154,255", "sessionTypes", "feed", "encryption", "mediaBufferMs should be an integer.", "URL", "srcObject", "kind", "DRM config keyId must be an instance of 16-byte long Uint8Array.", "next", "keyFrameRequestInterval", "GET", "push", "hwSecurity", "prevSeqNum", "Invalid authToken type (", "Worker", "cryptPattern", "info", "currentTime", "pipeThrough", "message", "fpsCertificate", ".experiment", "ClearKey", 'rame:{type:$.type,timestamp:$.timestamp,data:$.data}}),"key"===$.type&&(keyFrameNeeded=!1),$.data=generateDummyFr', "type", "baseUrl", "postMessage", "mediaBufferMs", " frame", "]: ", " - ", "play", "430YHxZPA", " to ", "?audioTransformFunction:videoTransformFunction});e.pipeThrough(a).pipeTo(x)}self.RTCTransformEvent&&(self.onrtctr", "HW_SECURE_ALL", ".. ", "dispatchEvent", ", playback at ", "splice", "byteLength", "purchase", "ignoreAudio", "log", "Widevine", "DRM config env value must be one of: ", "encrypted", "frame", "SW_SECURE_CRYPTO", "Development", "DRM config iv must be an instance of 16-byte long Uint8Array.", "fpsLicenseUrl", "). Safari only supports FairPlay.", "). Edge only supports PlayReady, Widevine and ClearKey.", "keyFrameNeeded", "data", "No target media element!", "merchant", "No valid DRM config found, call rtcDrmConfigure first.", "requestMediaKeySystemAccess", " requesting a new key frame (latency ", "video", "ansform=$=>{let e=$.transformer;handleTransform(e.options.operation,e.readable,e.writable)}),onmessage=$=>{keyFra", "authToken", "key", "requestMediaKeySystemAccess(", "audioStartTimestamp", "audioElement", "join", 'ame(keyFrameNeeded),e.enqueue($)}function handleTransform($,e,x){let a=new TransformStream({transform:"audio"===$', "jitterBufferTarget", "FairPlay", "clRtcDrmCreateMediaDump", "/license-server-fairplay/cert/", "/license-proxy-headerauth/drmtoday/RightsManager.asmx", "Error recovery attempted", "setMediaKeys", "error", "),idrFrames.push(idrFrames[0].slice());let $=new Uint8Array(idrFrames[1]);$.set([16,0,50],27)}let idrPicIdToggle=", "5Xrtatp", 'data}}),e.enqueue($)}let keyFrameNeeded=!1;function videoTransformFunction($,e){postMessage({streamType:"video",f', "not-allowed", " ms)", "toString", "tencIvRecord", "createObjectURL", ") failed", "Blob", "createMediaKeys(", "Discarding corrupted video frame (no Annex B startcode)", "fpsCertificateUrl", "videoCapabilities", "com.microsoft.playready.recommendation", "Invalid DRM type (", "RTCRtpScriptTransform/TransformStream will not be created, ", "emeConfig", "clRtcDrmDebugLog", "get", "Invalid audioElement, it must be an instance of HTMLMediaElement.", ", curr: ", "transform", "createEncodedStreams", "keySystem", "2628Wkqzhb", "Invalid config argument type, DRM config must be an object.", "wvCertificate", " kf at ", "DRM config encryption value must be one of: ", "temporary", "keyFrameLogCntr", " bytes, playback at ", "trim", "licenseUrl", "debugCreateMediaDump", "x-dt-auth-token", "cenc", "/license-proxy-widevine/cenc/", "184,32,0,203,255,38,29,217,24,192,161,96,0,0,12,229,174,166,6,7,20,3,84,0,247,96,193,181,229,128,0,32,32]).buffer", " will be used", "Staging", "Target video element (", "robustness", "). It has to be a string containing a JWT.", "prLicenseUrl", "videoElement", "isInteger", "keys", "bytesSinceKey", "playoutDelayHint", "1404023gQClSZ", "encryptionScheme", "x-dt-custom-data", "Chrome", "8184JIDHCT", "SampleAuxInfo extraction failed (video)", "sinf", "Multiview (several DRM configs) detected, rtcDrmOnTrack have to be called with target DRM config.", "Safari doesn't support 'cenc'/AES-CTR, use 'cbcs' instead if possible.", "12680190VXiNrN", "6yLeBUQ", "track", "size", "wvCertificateUrl", "keyId", "buffered", "vendor", "bind", "seq", "Default transform mode enabled, ", "PlayReady", "stringify", "Production", "arrayBuffer", " bytes)", "forEach", "string", "object", "Frame gap: ", "streams", "cbcs-1-9", "toISOString", "now", "warn", "name", "Safari does not support Opus, audio won't be rendered.", "nextKeyFrameAllowedTime", "playbackRate", "11mczGIY", "worker", "495WPiRWX", "userId", "55700fhsyWd", "jmuxer", "jitterBufferDelayHint", "slice", "enabled", "rtcdrmerror", "0;function generateDummyFrame($){return(brokenFrame||initializeDummyFrames(),$)?brokenFrame:idrFrames[idrPicIdTog", "Unable to create Worker!", "src", "platform", "catch", "DRM config robustness can only be one of: ", "persistent-license", "const DUMMY_IDR_FRAME_SLICE_HDR0=new Uint8Array([32,0,203]),DUMMY_IDR_FRAME_SLICE_HDR1=new Uint8Array([16,0,50]);", " bytes", "serverCertificateUrl", "navigator", "addEventListener", "certificate", "set", "wvLicenseUrl", "videoStartTimestamp", "reportDiscontinuity", "sessionId", "length", "end", "enqueue", "Discarding corrupted video frame (too small)", ",255]).buffer,idrFrames.push(new Uint8Array([0,0,0,1,39,100,0,13,172,87,5,6,100,0,0,0,1,40,238,60,176,0,0,0,1,37,", "saiIvSize", "receiver", "audio", "com.widevine.alpha", "includes", "status", "cbcs", "Invalid videoElement, it must be an instance of HTMLVideoElement.", "2000", "a1d1f1", "Windows", "MSE (re)init", "timestamp", "systemID", "both", "clear", "Android", "lastKeyFrameTime", "5315652RyHiZD", "org.w3.clearkey", "com.apple.fps", "use rtcDrmFeedFrame to push frames manually", "debugLog", "offset", "serverCertificate", "12456507CHdSkc"];
  return (Un = function() {
    return r;
  })();
}
function tn(r, e, t) {
  const i = H;
  return r[i(274)] && r.audio[i(315)] !== i(287) ? e[i(369)][i(354)] > 0 && za(r, e) : t && t[i(269)](e), !1;
}
function Nr(r) {
  const e = H;
  if (!r || typeof r !== e(470)) throw new TypeError(e(418));
  if (!(r[e(438)] instanceof HTMLVideoElement)) throw new TypeError(e(279));
  if (r[e(381)] && !(r[e(381)] instanceof HTMLMediaElement)) throw new TypeError(e(412));
  if (r[e(341)] !== void 0 && !Number[e(439)](r.mediaBufferMs)) throw new TypeError("DRM config mediaBufferMs should be an integer.");
  let t = !1, i = !1, u = !1;
  const m = [e(278), "cenc", "clear"], f = ["SW", "HW"];
  for (const b of [r[e(375)], r[e(274)]]) if (b) {
    if (!m[e(276)](b[e(315)])) throw new RangeError(e(421) + m[e(382)](", "));
    if (Ze && b.encryption === e(429)) throw new RangeError(e(451));
    if (b[e(315)] !== e(287)) {
      if (i = !0, b[e(457)]) {
        if (!(b[e(457)] instanceof Uint8Array) || b[e(457)][e(267)] !== 16) throw new TypeError(e(320));
        u = !0;
      } else if (Ze) throw new ReferenceError(e(311));
      if (b.iv && (!(b.iv instanceof Uint8Array) || b.iv[e(267)] !== 16)) throw new TypeError(e(364));
      if (b[e(435)] && !f.includes(b[e(435)])) throw new RangeError(e(254) + f[e(382)](", "));
      Ze && b === r[e(274)] && b.codec === "opus" && (t = !0, console[e(391)](e(478)));
    }
  }
  if (i) {
    const b = [Me[e(363)], Me[e(433)], Me[e(465)]];
    if (!b[e(276)](r.environment)) throw new RangeError(e(359) + b[e(382)](", "));
    if (r[e(377)] && typeof r[e(377)] !== e(469)) throw new TypeError(e(327) + typeof r.authToken + e(436));
    if (r.type) {
      if (Ze) {
        if (r[e(338)] !== "FairPlay") throw new RangeError(e(407) + r[e(338)] + e(366));
      } else if (wi) {
        if (r.type !== e(358) && r[e(338)] !== e(336)) throw new RangeError(e(407) + r.type + "). Chrome only supports Widevine and ClearKey.");
      } else if (Pn && r.type !== e(463) && r[e(338)] !== "Widevine" && r[e(338)] !== e(336)) throw new RangeError("Invalid DRM type (" + r[e(338)] + e(367));
    }
  }
  r[e(294)] !== void 0 && (window[e(410)] = r[e(294)]), r[e(427)] !== void 0 && (window[e(386)] = r[e(427)]);
  let n = Je[e(411)](r[e(438)]);
  !n && (n = new Oa(r), Je[e(262)](r.videoElement, n)), n[e(247)] = i, n[e(356)] = t, n.audioEncrypted = !t && n[e(274)] && n[e(274)][e(315)] !== e(287), r.mediaBufferMs !== void 0 && (n[e(341)] = r[e(341)]), i && (!n[e(338)] && (n[e(338)] = Ze ? "FairPlay" : e(358)), !u && n[e(338)] !== e(336) && (n[e(338)] = e(336)), Ba(n), function(b) {
    wn(this, void 0, void 0, function* () {
      const h = kr;
      var g, o;
      let c = b[h(438)];
      if ((!b.video || b[h(375)][h(315)] === h(287)) && (c = b.audioElement), !c) throw new Error(h(370));
      c[h(251)] = "", c[h(318)] = null, yield c.setMediaKeys(null);
      let l = null;
      try {
        l = yield navigator[h(373)](b[h(416)], b[h(409)]);
      } catch (s) {
      }
      if (!l && b[h(409)][0]) {
        const s = (g = b[h(409)][0][h(313)]) === null || g === void 0 ? void 0 : g.indexOf(h(255));
        if (s !== void 0 && s >= 0) {
          (o = b[h(409)][0][h(313)]) === null || o === void 0 || o[h(353)](s, 1);
          try {
            l = yield navigator[h(373)](b.keySystem, b[h(409)]);
          } catch (p) {
          }
        }
      }
      if (!l) {
        const s = h(379) + b[h(416)] + h(400);
        return c[h(351)](new CustomEvent(h(248), { detail: { message: s } })), void console[h(391)](s);
      }
      let a = null;
      try {
        a = yield l.createMediaKeys();
      } catch (s) {
      }
      if (!a) {
        const s = h(402) + b.keySystem + h(400);
        return c[h(351)](new CustomEvent(h(248), { detail: { message: s } })), void console[h(391)](s);
      }
      if (b[h(296)]) window.clRtcDrmDebugLog && console[h(330)]("Applying pre-configured certificate (" + b.serverCertificate.byteLength + h(467)), yield a.setServerCertificate(b[h(296)]);
      else if (b[h(258)]) {
        const s = { method: h(323) }, p = b[h(258)];
        try {
          const d = yield b[h(298)] ? b[h(298)](p, s) : fetch(p, s);
          if (!d.ok) {
            const v = "Server certificate fetch failed with error " + d[h(277)];
            return void c[h(351)](new CustomEvent(h(248), { detail: { message: v } }));
          }
          const y = yield d[h(466)]();
          window[h(410)] && console[h(330)](h(306) + p + ", " + y[h(354)] + h(257)), yield a.setServerCertificate(y);
        } catch (d) {
          const y = d[h(477)] + ": " + d[h(333)];
          return console[h(391)](y), void c.dispatchEvent(new CustomEvent(h(248), { detail: { message: y } }));
        }
      }
      yield c[h(390)](a), c.addEventListener(h(360), Za), Ri(b);
    });
  }(n)), n[e(438)][e(260)](e(345), function() {
    const b = e;
    n[b(438)][b(331)] > 0.5 && (n[b(479)] = Date[b(475)]());
  });
}
const Ka = H(256) + H(312) + H(271) + H(431) + H(392) + H(249) + 'gle^=1]}function audioTransformFunction($,e){postMessage({streamType:"audio",frame:{timestamp:$.timestamp,data:$.' + H(394) + H(337) + H(383) + H(348) + H(376) + "meNeeded=$.data};";
function Ii(r) {
  const e = H;
  if (Je[e(455)] === 0) throw new TypeError(e(372));
  let t;
  if (r && r.videoElement) t = r[e(438)];
  else {
    if (Je[e(455)] !== 1) throw new TypeError(e(450));
    t = Je[e(440)]()[e(321)]().value;
  }
  const i = Je[e(411)](t);
  if (!i) {
    let u = "";
    throw Je[e(468)]((m, f) => {
      u += f.id + ", ";
    }), u = u[e(246)](0, -2), new TypeError(e(434) + t.id + e(304) + u + "]");
  }
  return i;
}
function ki(r, e) {
  const t = H;
  if (r && r[t(438)]) {
    if (r[t(438)][t(458)][t(267)] > 0) {
      const i = r[t(438)][t(458)][t(268)](r[t(438)][t(458)].length - 1) - r[t(438)][t(331)];
      e[t(442)] = e[t(245)] = e[t(384)] = i;
    }
    setTimeout(ki, 1e3, r, e);
  }
}
function Ha(r, e) {
  const t = H;
  var i, u;
  const m = r[t(454)][t(319)];
  m === "video" && (r[t(273)][t(442)] = r[t(273)].jitterBufferDelayHint = r[t(273)][t(384)] = 0);
  const f = Ii(e);
  if (f[t(247)]) {
    if (f.customTransform) window.clRtcDrmDebugLog && console[t(330)](t(408) + t(293));
    else if (window[t(410)] && console[t(330)](t(462) + ((ms ? "RTCRtpScriptTransform" : t(415)) + t(432))), ms) {
      if (f[t(240)] = function(n) {
        const b = H, h = window[b(317)] || window.webkitURL, g = window[b(401)], o = window[b(328)];
        if (!(h && g && o && n)) return null;
        const c = new g([n]);
        return new o(h[b(399)](c));
      }(Ka), f[t(240)] == null) throw new Error(t(250));
      f[t(240)].onmessage = (n) => {
        const b = t;
        n.data.streamType === b(375) ? en(f, n[b(369)][b(361)], null) : tn(f, n[b(369)][b(361)], null);
      }, r.receiver[t(414)] = new RTCRtpScriptTransform(f.worker, { operation: m });
    } else {
      const n = m === "video" ? en : tn, b = { drm: f, transform: (l, a) => {
        n(f, l, a);
      } }, h = r.receiver[t(415)](), g = new TransformStream({ transform: b[t(414)][t(460)](b) }), { readable: o, writable: c } = h;
      o[t(332)](g).pipeTo(c);
    }
    if (m === t(274) && ((i = f.audio) === null || i === void 0 ? void 0 : i[t(315)]) === t(287)) {
      if (!f[t(381)]) return void console.warn(t(305));
      f.audioElement.srcObject !== r.streams[0] && (f[t(381)][t(318)] = r.streams[0]), f[t(438)] && (r[t(273)][t(442)] = r.receiver[t(245)] = r[t(273)][t(384)] = f[t(341)], ki(f, r.receiver));
    } else m === t(375) && ((u = f[t(375)]) === null || u === void 0 ? void 0 : u[t(315)]) === "clear" && f[t(438)][t(318)] !== r[t(472)][0] && (f.videoElement[t(318)] = r[t(472)][0]);
  } else f[t(438)][t(318)] !== r[t(472)][0] && (f.videoElement.srcObject = r[t(472)][0]);
}
const ie = Fe.get("View");
ie.setLevel(Fe.DEBUG);
const Or = {
  metadata: !1,
  enableDRM: !1,
  disableVideo: !1,
  disableAudio: !1,
  peerConfig: {
    autoInitStats: !0,
    statsIntervalMs: 1e3
  }
};
class ec extends mi {
  constructor(e, t = !0) {
    super(e, ie, t), this.payloadTypeCodec = {}, this.tracksMidValues = {}, this.drmOptionsMap = null, this.streamName = "", this.DRMProfile = null, this.worker = null, this.subscriberToken = null, this.isMainStreamActive = !1, this.eventQueue = [], this.stopReemitingWebRTCPeerInstanceEvents = null, this.stopReemitingSignalingInstanceEvents = null, this.events = {}, this.options = null;
  }
  on(e, t) {
    return this.events[e] || (this.events[e] = []), this.events[e].push(t), this;
  }
  off(e, t) {
    const i = this.events[e];
    if (i) {
      const u = i.indexOf(t);
      u >= 0 && i.splice(u, 1);
    }
    return this;
  }
  emit(e, t) {
    return this.events[e] ? (this.events[e].forEach((i) => i(t)), !0) : !1;
  }
  /**
   * @typedef {Object} LayerInfo
   * @property {String} encodingId         - rid value of the simulcast encoding of the track  (default: automatic selection)
   * @property {Number} spatialLayerId     - The spatial layer id to send to the outgoing stream (default: max layer available)
   * @property {Number} temporalLayerId    - The temporaral layer id to send to the outgoing stream (default: max layer available)
   * @property {Number} maxSpatialLayerId  - Max spatial layer id (default: unlimited)
   * @property {Number} maxTemporalLayerId - Max temporal layer id (default: unlimited)
   */
  /**
   * Connects to an active stream as subscriber.
   *
   * In the example, `addStreamToYourVideoTag` and `getYourSubscriberConnectionPath` is your own implementation.
   * @param {Object} [options]                          - General subscriber options.
   * @param {Boolean} [options.dtx = false]             - True to modify SDP for supporting dtx in opus. Otherwise False.
   * @param {Boolean} [options.absCaptureTime = false]  - True to modify SDP for supporting absolute capture time header extension. Otherwise False.
   * @param {Boolean} [options.metadata = false]        - Enable metadata extraction if stream is compatible.
   * @param {Boolean} [options.drm = false]             - Enable the DRM protected stream playback.
   * @param {Boolean} [options.disableVideo = false]    - Disable the opportunity to receive video stream.
   * @param {Boolean} [options.disableAudio = false]    - Disable the opportunity to receive audio stream.
   * @param {Number} [options.multiplexedAudioTracks]   - Number of audio tracks to recieve VAD multiplexed audio for secondary sources.
   * @param {String} [options.pinnedSourceId]           - Id of the main source that will be received by the default MediaStream.
   * @param {Array<String>} [options.excludedSourceIds] - Do not receive media from the these source ids.
   * @param {Array<String>} [options.events]            - Override which events will be delivered by the server (any of "active" | "inactive" | "vad" | "layers" | "viewercount" | "updated").*
   * @param {RTCConfiguration} [options.peerConfig]     - Options to configure the new RTCPeerConnection.
   * @param {LayerInfo} [options.layer]                 - Select the simulcast encoding layer and svc layers for the main video track, leave empty for automatic layer selection based on bandwidth estimation.
   * @param {Object} [options.forcePlayoutDelay]        - Ask the server to use the playout delay header extension.
   * @param {Number} [options.forcePlayoutDelay.min]    - Set minimum playout delay value.
   * @param {Number} [options.forcePlayoutDelay.max]    - Set maximum playout delay value.
   * @param {Boolean} [options.enableDRM]               - Enable DRM, default is false.
   * @returns {Promise<void>} Promise object which resolves when the connection was successfully established.
   * @fires PeerConnection#track
   * @fires Signaling#broadcastEvent
   * @fires PeerConnection#connectionStateChange
   * @example await millicastView.connect(options)
   * @example
   * import View from '@millicast/sdk'
   *
   * //Define callback for generate new token
   * const tokenGenerator = () => getYourSubscriberInformation(accountId, streamName)
   *
   * //Create a new instance
   * const streamName = "Millicast Stream Name where i want to connect"
   * const millicastView = new View(tokenGenerator)
   *
   * //Set track event handler to receive streams from Publisher.
   * millicastView.on('track', (event) => {
   *   addStreamToYourVideoTag(event.streams[0])
   * })
   *
   * millicastView.on('error', (error) => {
   *   console.error('Error from Millicast SDK', error)
   * })
   *
   * //Start connection to broadcast
   * try {
   *  await millicastView.connect()
   * } catch (e) {
   *  console.log('Connection failed, handle error', e)
   * }
   */
  async connect(e = Or) {
    this.options = we(J(J({}, Or), e), {
      peerConfig: J(J({}, Or.peerConfig), e.peerConfig),
      setSDPToPeer: !1
    }), this.eventQueue.length = 0, await this.initConnection({ migrate: !1 });
  }
  /**
   * Select the simulcast encoding layer and svc layers for the main video track
   * @param {LayerInfo} layer - leave empty for automatic layer selection based on bandwidth estimation.
   */
  async select(e) {
    var t;
    ie.debug("Viewer select layer values: ", e), await ((t = this.signaling) == null ? void 0 : t.cmd("select", { layer: e })), ie.info("Connected to streamName: ", this.streamName);
  }
  /**
   * Add remote receiving track.
   * @param {String} media - Media kind ('audio' | 'video').
   * @param {Array<MediaStream>} streams - Streams the track will belong to.
   * @return {Promise<RTCRtpTransceiver>} Promise that will be resolved when the RTCRtpTransceiver is assigned an mid value.
   */
  async addRemoteTrack(e, t) {
    ie.info("Viewer adding remote track", e);
    const i = await this.webRTCPeer.addRemoteTrack(e, t);
    for (const u of t)
      u.addTrack(i.receiver.track);
    return i;
  }
  /**
   * Start projecting source in selected media ids.
   * @param {String} sourceId                          - Selected source id.
   * @param {Array<Object>} mapping                    - Mapping of the source track ids to the receiver mids
   * @param {String} [mapping.trackId]                 - Track id from the source (received on the "active" event), if not set the media kind will be used instead.
   * @param {String} [mapping.media]                   - Track kind of the source ('audio' | 'video'), if not set the trackId will be used instead.
   * @param {String} [mapping.mediaId]                 - mid value of the rtp receiver in which the media is going to be projected. If no mediaId is defined, the first track from the main media stream with the same media type as the input source track will be used.
   * @param {LayerInfo} [mapping.layer]                - Select the simulcast encoding layer and svc layers, only applicable to video tracks.
   * @param {Boolean} [mapping.promote]                - To remove all existing limitations from the source, such as restricted bitrate or resolution, set this to true.
   */
  async project(e, t) {
    var i;
    for (const u of t) {
      if (!u.trackId && !u.media)
        throw ie.error("Error in projection mapping, trackId or mediaId must be set"), new Error("Error in projection mapping, trackId or mediaId must be set");
      const m = this.webRTCPeer.getRTCPeer();
      if (u.mediaId && !(m != null && m.getTransceivers().find((f) => {
        var n;
        return f.mid === ((n = u.mediaId) == null ? void 0 : n.toString());
      })))
        throw ie.error("Error in projection mapping, ".concat(u.mediaId, " mid not found in local transceivers")), new Error("Error in projection mapping, ".concat(u.mediaId, " mid not found in local transceivers"));
    }
    ie.debug("Viewer project source: layer mappings: ", e, t), await ((i = this.signaling) == null ? void 0 : i.cmd("project", { sourceId: e, mapping: t })), ie.info("Projection done");
  }
  /**
   * Stop projecting attached source in selected media ids.
   * @param {Array<String>} mediaIds - mid value of the receivers that are going to be detached.
   */
  async unproject(e) {
    var t;
    ie.debug("Viewer unproject mediaIds: ", e), await ((t = this.signaling) == null ? void 0 : t.cmd("unproject", { mediaIds: e })), ie.info("Unprojection done");
  }
  async replaceConnection() {
    ie.info("Migrating current connection"), await this.initConnection({ migrate: !0 });
  }
  stop() {
    var e, t;
    super.stop(), (e = this.drmOptionsMap) == null || e.clear(), this.DRMProfile = null, (t = this.worker) == null || t.terminate(), this.worker = null, this.payloadTypeCodec = {}, this.tracksMidValues = {}, this.eventQueue.length = 0;
  }
  async initConnection(e) {
    var p, d, y, v, S, I;
    ie.debug("Viewer connect options values: ", this.options), this.stopReconnection = !1;
    let t;
    if (!e.migrate && this.isActive())
      throw ie.warn("Viewer currently subscribed"), new Error("Viewer currently subscribed");
    let i;
    try {
      i = await this.tokenGenerator(), (p = this.options) != null && p.peerConfig && (this.options.peerConfig.iceServers = i == null ? void 0 : i.iceServers, this.options.peerConfig.encodedInsertableStreams = Kr && (this.options.enableDRM || this.options.metadata));
    } catch (E) {
      throw ie.error("Error generating token."), E instanceof pr && (E.status === 401 || !this.autoReconnect ? this.stopReconnection = !0 : this.reconnect()), E;
    }
    if (!i)
      throw ie.error("Error while subscribing. Subscriber data required"), new Error("Subscriber data required");
    const u = fi(i.jwt);
    this.streamName = u.millicast.streamName;
    const m = new di({
      streamName: this.streamName,
      url: "".concat(i.urls[0], "?token=").concat(i.jwt)
    });
    i.drmObject && (this.DRMProfile = i.drmObject), i.subscriberToken && (this.subscriberToken = i.subscriberToken);
    const f = e.migrate ? new qe() : this.webRTCPeer;
    await f.createRTCPeer((d = this.options) == null ? void 0 : d.peerConfig), (y = this.stopReemitingWebRTCPeerInstanceEvents) == null || y.call(this), this.stopReemitingWebRTCPeerInstanceEvents = fr(
      f,
      this,
      Object.values(Ue).filter((E) => E !== Ue.track)
    ), (v = this.options) != null && v.metadata && (this.worker || (this.worker = new Hr()), this.worker.onmessage = (E) => {
      if (E.data.event === "metadata") {
        const T = new TextDecoder(), x = E.data.metadata;
        if (x.mid = E.data.mid, x.track = this.tracksMidValues[E.data.mid], E.data.metadata.uuid) {
          const k = E.data.metadata.uuid;
          x.uuid = k.reduce(
            (_, L) => _ + L.toString(16).padStart(2, "0"),
            ""
          ), x.uuid = x.uuid.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, "$1-$2-$3-$4-$5");
        }
        if (E.data.metadata.timecode && (x.timecode = new Date(T.decode(E.data.metadata.timecode))), E.data.metadata.unregistered) {
          const k = T.decode(E.data.metadata.unregistered);
          try {
            const _ = JSON.parse(k);
            x.unregistered = _;
          } catch (_) {
            ie.info("The content could not be converted to JSON, returning raw bytes instead");
          }
        }
        this.emit("metadata", x);
      }
    }), f.on("track", (E) => {
      if (!this.isMainStreamActive) {
        this.eventQueue.push(E);
        return;
      }
      this.onTrackEvent(E);
    }), m.on($e.broadcastEvent, (E) => {
      if (E.data.sourceId === null)
        switch (E.name) {
          case "active":
            for (this.emit("broadcastEvent", E), this.isMainStreamActive = !0; this.eventQueue.length > 0; )
              this.onTrackEvent(this.eventQueue.shift());
            return;
          case "inactive":
            this.isMainStreamActive = !1;
            break;
        }
      this.emit("broadcastEvent", E);
    });
    const n = we(J({}, this.options), { stereo: !0 }), b = f.getRTCLocalSDP(n), h = m.connect();
    t = await Promise.all([b, h]);
    const g = t[0];
    let o = this.signaling;
    this.signaling = m;
    const c = this.signaling.subscribe(g, we(J({}, this.options), {
      vad: !!((S = this.options) != null && S.multiplexedAudioTracks)
    })), l = (I = f.peer) == null ? void 0 : I.setLocalDescription(
      f.sessionDescription
    );
    t = await Promise.all([c, l]);
    const a = t[0];
    this.payloadTypeCodec = Se.getCodecPayloadType(a), await f.setRTCRemoteSDP(a), ie.info("Connected to streamName: ", this.streamName);
    let s = this.webRTCPeer;
    this.webRTCPeer = f, this.setReconnect(), e.migrate && this.webRTCPeer.on(Ue.connectionStateChange, (E) => {
      var T, x;
      E === "connected" ? setTimeout(() => {
        var k, _;
        (k = o == null ? void 0 : o.close) == null || k.call(o), (_ = s == null ? void 0 : s.closeRTCPeer) == null || _.call(s), o = s = null, ie.info("Current connection migrated");
      }, 1e3) : ["disconnected", "failed", "closed"].includes(E) && ((T = o == null ? void 0 : o.close) == null || T.call(o), (x = s == null ? void 0 : s.closeRTCPeer) == null || x.call(s), o = s = null);
    });
  }
  onTrackEvent(e) {
    var t, i, u, m, f;
    if (this.tracksMidValues[(t = e.transceiver) == null ? void 0 : t.mid] = e.track, this.isDRMOn) {
      const n = e.transceiver.mid;
      if (n) {
        const b = this.getDRMConfiguration(n);
        if (b) {
          try {
            Ha(e, b);
          } catch (h) {
            ie.error("Failed to apply DRM on media Id:", n, "error is: ", h), this.emit(
              "error",
              new Error("Failed to apply DRM on media Id: " + n + " error is: " + h)
            );
          }
          this.worker || (this.worker = new Hr()), this.worker.addEventListener("message", (h) => {
            h.data.event === "complete" && Ya(h.data.frame, null, b);
          });
        } else
          ie.warn("drmConfig not defined in track event");
      } else
        ie.warn("mediaId not defined in track event");
    }
    if ((i = this.options) != null && i.metadata) {
      if (pi && this.worker)
        e.receiver.transform = new RTCRtpScriptTransform(this.worker, {
          name: "receiverTransform",
          payloadTypeCodec: J({}, this.payloadTypeCodec),
          codec: this.options.metadata && "h264",
          mid: (u = e.transceiver) == null ? void 0 : u.mid
        });
      else if (Kr) {
        const { readable: n, writable: b } = e.receiver.createEncodedStreams();
        (f = this.worker) == null || f.postMessage(
          {
            action: "insertable-streams-receiver",
            payloadTypeCodec: J({}, this.payloadTypeCodec),
            codec: this.options.metadata && "h264",
            mid: (m = e.transceiver) == null ? void 0 : m.mid,
            readable: n,
            writable: b
          },
          [n, b]
        );
      }
    }
    this.emit("track", e);
  }
  getDRMConfiguration(e) {
    return this.drmOptionsMap ? this.drmOptionsMap.get(e) : null;
  }
  async onRtcDrmFetch(e, t) {
    return t.headers = t.headers || new Headers(), t.headers || (t.headers = new Headers()), t.headers.get("x-dt-custom-data") && t.headers.delete("x-dt-custom-data"), this.subscriberToken ? t.headers.append("Authorization", "Bearer ".concat(this.subscriberToken)) : ie.warn("onRtcDrmFetch: no subscriberToken"), fetch(e, t);
  }
  /**
     * @typedef {Object} EncryptionParameters
     * @property {String} keyId 16-byte KeyID, in lowercase hexadecimal without separators
     * @property {String} iv 16-byte initialization vector, in lowercase hexadecimal without separators
     * /
  
    /**
     * @typedef {Object} DRMOptions - the options for DRM playback
     * @property {HTMLVideoElement} videoElement - the video HTML element
     * @property {EncryptionParameters} videoEncryptionParams - the video encryption parameters
     * @property {String} videoMid - the video media ID of RTCRtpTransceiver
     * @property {HTMLAudioElement} audioElement - the audio HTML audioElement
     * @property {EncryptionParameters} [audioEncryptionParams] - the audio encryption parameters
     * @property {String} [audioMid] - the audio media ID of RTCRtpTransceiver
     * @property {Number} [mediaBufferMs] - average target latency in milliseconds
     */
  /**
   * Configure DRM protected stream.
   * When there are {@link EncryptionParameters} in the payload of 'active' broadcast event, this method should be called
   * @param {DRMOptions} options - the options for DRM playback
   */
  configureDRM(e) {
    var i;
    if (!e)
      throw new Error("Required DRM options is not provided");
    this.drmOptionsMap || (this.drmOptionsMap = /* @__PURE__ */ new Map());
    const t = {
      merchant: "dolby",
      environment: Me.Production,
      customTransform: (i = this.options) == null ? void 0 : i.metadata,
      videoElement: e.videoElement,
      audioElement: e.audioElement,
      video: {
        codec: "h264",
        encryption: "cbcs",
        keyId: as(e.videoEncryptionParams.keyId),
        iv: as(e.videoEncryptionParams.iv)
      },
      audio: { codec: "opus", encryption: "clear" },
      onFetch: this.onRtcDrmFetch.bind(this)
    };
    e.mediaBufferMs && (t.mediaBufferMs = e.mediaBufferMs), this.DRMProfile && (this.DRMProfile.playReadyUrl && (t.prLicenseUrl = this.DRMProfile.playReadyUrl), this.DRMProfile.widevineUrl && (t.wvLicenseUrl = this.DRMProfile.widevineUrl), this.DRMProfile.fairPlayUrl && (t.fpsLicenseUrl = this.DRMProfile.fairPlayUrl), this.DRMProfile.fairPlayCertUrl && (t.fpsCertificateUrl = this.DRMProfile.fairPlayCertUrl));
    try {
      Nr(t), this.drmOptionsMap.set(e.videoMid, t), e.audioMid && this.drmOptionsMap.set(e.audioMid, t), t.videoElement.addEventListener("rtcdrmerror", (u) => {
        const m = u;
        ie.error(
          "DRM error: ",
          m.detail.message,
          "in video element:",
          t.videoElement.id
        ), this.emit("error", new Error(m.detail.message));
      });
    } catch (u) {
      ie.error("Failed to configure DRM with options:", e, "error is:", u);
    }
  }
  /**
   * Remove DRM configuration for a mediaId
   * @param {String} mediaId
   */
  removeDRMConfiguration(e) {
    var t;
    (t = this.drmOptionsMap) == null || t.delete(e);
  }
  /**
   * Check if there are any DRM protected Track
   */
  get isDRMOn() {
    return !!this.drmOptionsMap && this.drmOptionsMap.size > 0;
  }
  /**
   * Exchange the DRM configuration between two transceivers
   * Both of the transceivers should be used for DRM protected streams
   * @param {String} targetMediaId
   * @param {String} sourceMediaId
   */
  exchangeDRMConfiguration(e, t) {
    const i = this.getDRMConfiguration(e), u = this.getDRMConfiguration(t);
    if (i === null || !(u != null && u.video))
      throw new Error("No DRM configuration found for " + e);
    if (u === null || !(i != null && i.video))
      throw new Error("No DRM configuration found for " + t);
    cs(i.video, u.video, "keyId"), cs(i.video, u.video, "iv");
    try {
      Nr(i);
    } catch (m) {
      ie.error("Failed to configure DRM with options:", i, "error is:", m);
    }
    try {
      Nr(u);
    } catch (m) {
      ie.error("Failed to configure DRM with options:", u, "error is:", m);
    }
  }
}
export {
  We as Director,
  Fe as Logger,
  qe as PeerConnection,
  qa as Publish,
  di as Signaling,
  ec as View
};
