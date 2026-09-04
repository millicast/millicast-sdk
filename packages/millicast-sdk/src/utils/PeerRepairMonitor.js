import Logger from '../Logger'

const logger = Logger.get('PeerRepairMonitor')

/**
 * @typedef {Object} PeerRepairOptions
 * @property {Boolean} [enabled = false] - Enable detection of bad peer connections and repair through a replacement connection.
 * @property {Number} [startupWindowMs = 10000] - Time after the peer connects during which the startup thresholds apply.
 * @property {Number} [startupBadRttMs = 500] - Startup: selected pair RTT above this value is bad.
 * @property {Number} [startupNoMediaTicks = 2] - Startup: consecutive stats reports without incoming media that mark the pair bad.
 * @property {Number} [badRttMs = 1000] - Steady state: selected pair RTT above this value is bad.
 * @property {Number} [badLossRatio = 0.2] - Steady state: incoming packet loss ratio above this value is bad.
 * @property {Number} [badTicks = 3] - Steady state: consecutive bad stats reports before a repair is considered.
 * @property {Number} [relativeRttRatio = 3] - Steady state: selected RTT above `relativeRttRatio` times the alternative RTT is bad.
 * @property {Number} [relativeRttTicks = 5] - Steady state: consecutive reports for the relative RTT rule.
 * @property {Number} [alternativeRttRatio = 0.5] - An alternative pair must have RTT below `selected RTT * alternativeRttRatio`.
 * @property {Number} [deadCandidateRequests = 5] - A remote candidate whose pairs sent this many checks without any response is demoted too.
 * @property {Number} [repairTimeoutMs = 10000] - Time the replacement connection has to connect before it is dropped and the current one is kept.
 * @property {Number} [cooldownMs = 30000] - Minimum time between two repairs.
 * @property {Number} [maxAttempts = 3] - Maximum repairs per View instance.
 */
export const defaultPeerRepairOptions = {
  enabled: false,
  startupWindowMs: 10000,
  startupBadRttMs: 500,
  startupNoMediaTicks: 2,
  badRttMs: 1000,
  badLossRatio: 0.2,
  badTicks: 3,
  relativeRttRatio: 3,
  relativeRttTicks: 5,
  alternativeRttRatio: 0.5,
  deadCandidateRequests: 5,
  repairTimeoutMs: 10000,
  cooldownMs: 30000,
  maxAttempts: 3
}

const candidateKey = (candidate) => `${candidate.address ?? candidate.ip}:${candidate.port}`

const describePair = (pair) => ({
  local: pair.local.candidateType,
  remote: candidateKey(pair.remote),
  remoteType: pair.remote.candidateType,
  protocol: pair.remote.protocol,
  rtt: pair.stats.currentRoundTripTime,
  requestsSent: pair.stats.requestsSent,
  responsesReceived: pair.stats.responsesReceived,
  state: pair.stats.state
})

/**
 * Reads the candidate pairs and their candidates out of a raw RTCStatsReport.
 * @param {RTCStatsReport} raw
 * @returns {{ pairs: Array<Object>, selectedPairId: String|undefined }}
 */
export const readCandidatePairs = (raw) => {
  const reports = Array.from(raw.values())
  const byId = new Map(reports.map((report) => [report.id, report]))
  const transport = reports.find((report) => report.type === 'transport' && report.selectedCandidatePairId)
  const pairs = []
  for (const stats of reports) {
    if (stats.type !== 'candidate-pair') continue
    const local = byId.get(stats.localCandidateId)
    const remote = byId.get(stats.remoteCandidateId)
    if (!local || !remote) continue
    pairs.push({ id: stats.id, stats, local, remote })
  }
  return { pairs, selectedPairId: transport?.selectedCandidatePairId }
}

/**
 * Decides, from the stats of one RTCPeerConnection, whether the selected ICE candidate pair is unusable and
 * whether another pair is a realistic alternative. The decision is returned to the caller, which performs the
 * repair; this class never touches the peer.
 */
export default class PeerRepairMonitor {
  constructor (options = {}) {
    this.options = { ...defaultPeerRepairOptions, ...options }
    this.attempts = 0
    this.lastRepairAt = null
    this.demotedCandidates = new Set()
    this.relayOnly = false
    this.reset()
  }

  /** Clears the per-peer counters. Call when a new peer starts being monitored. */
  reset () {
    this.connectedAt = null
    this.badTicks = 0
    this.noMediaTicks = 0
    this.relativeTicks = 0
    this.previousPacketsReceived = null
  }

  /** Forgets the candidates demoted so far. Call before a full reconnect so all candidates get a new chance. */
  clearDemotions () {
    this.demotedCandidates.clear()
    this.relayOnly = false
  }

  onConnected (nowMs = Date.now()) {
    this.reset()
    this.connectedAt = nowMs
  }

  onRepairStarted (decision, nowMs = Date.now()) {
    this.attempts++
    this.lastRepairAt = nowMs
    for (const candidate of decision.demote) {
      this.demotedCandidates.add(candidate)
    }
    this.relayOnly = decision.relayOnly === true
    this.reset()
  }

  /** The current connection is kept, so monitoring of it continues. */
  onRepairFailed (nowMs = Date.now()) {
    this.clearDemotions()
    this.onConnected(nowMs)
  }

  canRepair (nowMs) {
    if (this.attempts >= this.options.maxAttempts) return false
    if (this.lastRepairAt !== null && nowMs - this.lastRepairAt < this.options.cooldownMs) return false
    return true
  }

  /**
   * @param {Object} stats - Parsed stats from PeerConnectionStats (uses `raw`, `audio.inbounds`, `video.inbounds`).
   * @param {Boolean} streamActive - Whether the server reports the stream as active, so media is expected.
   * @param {Number} [nowMs]
   * @returns {Object|null} Repair decision, or null when no repair should happen.
   */
  evaluate (stats, streamActive, nowMs = Date.now()) {
    if (!this.options.enabled || !stats?.raw || this.connectedAt === null) return null

    const { pairs, selectedPairId } = readCandidatePairs(stats.raw)
    const selected = pairs.find((pair) => pair.id === selectedPairId) ??
      pairs.find((pair) => pair.stats.nominated && pair.stats.state === 'succeeded')
    if (!selected) return null

    const inbounds = [...(stats.audio?.inbounds ?? []), ...(stats.video?.inbounds ?? [])]
    const packetsReceived = inbounds.reduce((sum, inbound) => sum + (inbound.totalPacketsReceived ?? 0), 0)
    const receivingMedia = this.previousPacketsReceived !== null && packetsReceived > this.previousPacketsReceived
    this.previousPacketsReceived = packetsReceived
    const lossRatio = Math.max(0, ...inbounds.map((inbound) => inbound.packetsLostRatioPerSecond ?? 0))
    const rtt = selected.stats.currentRoundTripTime
    const startup = nowMs - this.connectedAt < this.options.startupWindowMs

    const alternatives = pairs.filter((pair) =>
      pair.id !== selected.id &&
      pair.stats.responsesReceived > 0 &&
      !this.demotedCandidates.has(candidateKey(pair.remote)) &&
      typeof pair.stats.currentRoundTripTime === 'number'
    ).sort((a, b) => a.stats.currentRoundTripTime - b.stats.currentRoundTripTime)
    const alternative = alternatives[0]

    this.noMediaTicks = streamActive && !receivingMedia ? this.noMediaTicks + 1 : 0
    const rttBad = typeof rtt === 'number' && rtt * 1000 > (startup ? this.options.startupBadRttMs : this.options.badRttMs)
    this.badTicks = rttBad || lossRatio > this.options.badLossRatio ? this.badTicks + 1 : 0
    const relativeBad = alternative && typeof rtt === 'number' && rtt > alternative.stats.currentRoundTripTime * this.options.relativeRttRatio
    this.relativeTicks = relativeBad ? this.relativeTicks + 1 : 0

    let reason = null
    if (startup) {
      if (rttBad) reason = 'startup-rtt'
      else if (this.noMediaTicks >= this.options.startupNoMediaTicks) reason = 'startup-no-media'
    } else {
      if (this.badTicks >= this.options.badTicks) reason = rttBad ? 'rtt' : 'loss'
      else if (this.noMediaTicks >= this.options.badTicks) reason = 'no-media'
      else if (this.relativeTicks >= this.options.relativeRttTicks) reason = 'relative-rtt'
    }
    if (!reason) return null

    const health = { reason, selected: describePair(selected), alternative: alternative ? describePair(alternative) : null }
    if (!alternative) {
      logger.warn('Selected candidate pair is bad but there is no alternative, keeping it', health)
      return null
    }
    const alternativeRtt = alternative.stats.currentRoundTripTime
    const alternativeIsBetter = typeof rtt !== 'number'
      ? alternativeRtt * 1000 < this.options.badRttMs
      : alternativeRtt <= rtt * this.options.alternativeRttRatio
    if (!alternativeIsBetter) {
      logger.warn('Selected candidate pair is bad but the alternative is not clearly better, keeping it', health)
      return null
    }
    if (!this.canRepair(nowMs)) {
      logger.warn('Selected candidate pair is bad but repair is on cooldown or attempts are exhausted', health)
      return null
    }

    const alternativeRemote = candidateKey(alternative.remote)
    const demote = new Set()
    if (candidateKey(selected.remote) !== alternativeRemote) {
      demote.add(candidateKey(selected.remote))
    }
    for (const pair of pairs) {
      const key = candidateKey(pair.remote)
      const dead = pair.stats.requestsSent >= this.options.deadCandidateRequests && !(pair.stats.responsesReceived > 0)
      if (dead && key !== alternativeRemote) {
        demote.add(key)
      }
    }
    const relayOnly = alternative.local.candidateType === 'relay' && selected.local.candidateType !== 'relay'
    if (demote.size === 0 && !relayOnly) {
      logger.warn('Selected candidate pair is bad but the alternative cannot be preferred through SDP priority or relay policy', health)
      return null
    }
    return { ...health, demote: [...demote], relayOnly }
  }
}
