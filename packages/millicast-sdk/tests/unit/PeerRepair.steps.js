// OPTI-4246
import { loadFeature, defineFeature } from 'jest-cucumber'
import SdpParser from '../../src/utils/SdpParser'
import PeerRepairMonitor from '../../src/utils/PeerRepairMonitor'
const feature = loadFeature('../features/PeerRepair.feature', { loadRelativePath: true, errors: true })

const ipv4Candidate = 'a=candidate:1 1 udp 2130706431 157.245.199.81 43153 typ host generation 0\r\n'
const ipv6Candidate = 'a=candidate:2 1 udp 2130706175 2400:6180::d2:0:3:149b:e000 43153 typ host generation 0\r\n'
const remoteSdp = 'v=0\r\no=- 1 1 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=ice-lite\r\nm=video 43153 UDP/TLS/RTP/SAVPF 102\r\nc=IN IP4 157.245.199.81\r\n' +
  ipv4Candidate + ipv6Candidate + 'a=ice-ufrag:abcd\r\na=ice-pwd:efgh\r\na=mid:0\r\na=rtpmap:102 H264/90000\r\n'

const SELECTED_REMOTE = '2400:6180::d2:0:3:149b:e000:43153'
const RELAY_REMOTE = '157.245.199.81:43153'

const buildRaw = ({ selectedRtt, alternativeRtt, alternativeResponses = 1, deadPair = false, packets }) => {
  const reports = [
    { id: 'T', type: 'transport', selectedCandidatePairId: 'P1' },
    { id: 'L1', type: 'local-candidate', candidateType: 'host', address: '2001:db8::1', port: 5000, protocol: 'udp' },
    { id: 'R1', type: 'remote-candidate', candidateType: 'host', address: '2400:6180::d2:0:3:149b:e000', port: 43153, protocol: 'udp' },
    { id: 'P1', type: 'candidate-pair', localCandidateId: 'L1', remoteCandidateId: 'R1', state: 'succeeded', nominated: true, requestsSent: 20, responsesReceived: 3, currentRoundTripTime: selectedRtt },
    { id: 'L2', type: 'local-candidate', candidateType: 'relay', address: '139.59.220.163', port: 6000, protocol: 'udp' },
    { id: 'R2', type: 'remote-candidate', candidateType: 'host', address: '157.245.199.81', port: 43153, protocol: 'udp' },
    { id: 'P2', type: 'candidate-pair', localCandidateId: 'L2', remoteCandidateId: 'R2', state: 'succeeded', nominated: false, requestsSent: 20, responsesReceived: alternativeResponses, currentRoundTripTime: alternativeRtt },
    { id: 'V', type: 'inbound-rtp', kind: 'video' }
  ]
  if (deadPair) {
    reports.push(
      { id: 'L3', type: 'local-candidate', candidateType: 'host', address: '192.168.0.2', port: 5001, protocol: 'udp' },
      { id: 'R3', type: 'remote-candidate', candidateType: 'host', address: '10.0.0.9', port: 43153, protocol: 'udp' },
      { id: 'P3', type: 'candidate-pair', localCandidateId: 'L3', remoteCandidateId: 'R3', state: 'in-progress', nominated: false, requestsSent: 12, responsesReceived: 0 }
    )
  }
  return new Map(reports.map((report) => [report.id, report]))
}

const buildStats = (raw, packets) => ({
  raw,
  audio: { inbounds: [] },
  video: { inbounds: [{ totalPacketsReceived: packets, packetsLostRatioPerSecond: 0 }] }
})

defineFeature(feature, test => {
  let sdp
  let result

  test('Demote remote candidates in the SDP answer', ({ given, when, then }) => {
    given('a remote sdp with an IPv4 and an IPv6 host candidate', () => { sdp = remoteSdp })
    when('I demote the IPv6 candidate', () => { result = SdpParser.demoteCandidates(sdp, [SELECTED_REMOTE]) })
    then('the IPv6 candidate has priority 1 and the IPv4 candidate keeps its priority', () => {
      expect(result).toContain(ipv4Candidate)
      expect(result).toContain('a=candidate:2 1 udp 1 2400:6180::d2:0:3:149b:e000 43153 typ host generation 0\r\n')
      expect(result).not.toContain(ipv6Candidate)
    })
  })

  test('Demote no candidates', ({ given, when, then }) => {
    given('a remote sdp with an IPv4 and an IPv6 host candidate', () => { sdp = remoteSdp })
    when('I demote no candidates', () => { result = SdpParser.demoteCandidates(sdp, new Set()) })
    then('the sdp is unchanged', () => { expect(result).toBe(remoteSdp) })
  })

  let monitor
  let now
  let decision
  let packets

  const connectedAgo = (seconds, options = {}) => {
    now = 1_000_000
    packets = 100
    monitor = new PeerRepairMonitor({ enabled: true, ...options })
    monitor.onConnected(now - seconds * 1000)
  }

  const report = (raw) => {
    packets += 50
    now += 1000
    decision = monitor.evaluate(buildStats(raw, packets), true, now)
  }

  const expectRepair = () => {
    expect(decision).not.toBeNull()
    expect(decision.demote).toContain(SELECTED_REMOTE)
    expect(decision.relayOnly).toBe(true)
    expect(decision.alternative.remote).toBe(RELAY_REMOTE)
  }

  test('Bad selected pair with a better alternative during startup', ({ given, when, then }) => {
    given('a repair monitor connected 3 seconds ago', () => connectedAgo(3))
    when('stats report the selected host pair with 9 seconds RTT and a relay pair with 300 ms RTT', () => {
      report(buildRaw({ selectedRtt: 9, alternativeRtt: 0.3 }))
    })
    then('a repair is decided with the selected remote candidate demoted and relay only', () => {
      expectRepair()
      expect(decision.reason).toBe('startup-rtt')
      expect(decision.demote).toEqual([SELECTED_REMOTE])
    })
  })

  test('Bad selected pair without alternative', ({ given, when, then }) => {
    given('a repair monitor connected 3 seconds ago', () => connectedAgo(3))
    when('stats report the selected host pair with 9 seconds RTT and no other pair with responses', () => {
      report(buildRaw({ selectedRtt: 9, alternativeRtt: 0.3, alternativeResponses: 0 }))
    })
    then('no repair is decided', () => { expect(decision).toBeNull() })
  })

  test('Alternative is not better', ({ given, when, then }) => {
    given('a repair monitor connected 3 seconds ago', () => connectedAgo(3))
    when('stats report the selected host pair with 9 seconds RTT and a relay pair with 6 seconds RTT', () => {
      report(buildRaw({ selectedRtt: 9, alternativeRtt: 6 }))
    })
    then('no repair is decided', () => { expect(decision).toBeNull() })
  })

  test('Dead candidates are demoted together with the selected one', ({ given, when, then }) => {
    given('a repair monitor connected 3 seconds ago', () => connectedAgo(3))
    when('stats report the selected host pair with 9 seconds RTT, a relay pair with 300 ms RTT and a dead IPv4 pair', () => {
      report(buildRaw({ selectedRtt: 9, alternativeRtt: 0.3, deadPair: true }))
    })
    then('a repair is decided demoting the selected and the dead remote candidates', () => {
      expectRepair()
      expect(decision.demote.sort()).toEqual(['10.0.0.9:43153', SELECTED_REMOTE].sort())
    })
  })

  test('Steady state needs consecutive bad reports', ({ given, when, then }) => {
    given('a repair monitor connected 60 seconds ago', () => connectedAgo(60))
    when('stats report the selected host pair with 2 seconds RTT and a relay pair with 300 ms RTT twice', () => {
      report(buildRaw({ selectedRtt: 2, alternativeRtt: 0.3 }))
      expect(decision).toBeNull()
      report(buildRaw({ selectedRtt: 2, alternativeRtt: 0.3 }))
    })
    then('no repair is decided', () => { expect(decision).toBeNull() })
    when('stats report the selected host pair with 2 seconds RTT and a relay pair with 300 ms RTT once more', () => {
      report(buildRaw({ selectedRtt: 2, alternativeRtt: 0.3 }))
    })
    then('a repair is decided with the selected remote candidate demoted and relay only', () => {
      expectRepair()
      expect(decision.reason).toBe('rtt')
    })
  })

  test('Cooldown and attempts limit repairs', ({ given, when, and, then }) => {
    given('a repair monitor connected 3 seconds ago', () => connectedAgo(3))
    when('a repair was started 5 seconds ago', () => {
      monitor.onRepairStarted({ demote: [SELECTED_REMOTE], relayOnly: true }, now - 5000)
      monitor.onConnected(now - 3000)
    })
    and('stats report the selected host pair with 9 seconds RTT and a relay pair with 300 ms RTT', () => {
      report(buildRaw({ selectedRtt: 9, alternativeRtt: 0.3 }))
    })
    then('no repair is decided', () => {
      expect(decision).toBeNull()
      expect(monitor.demotedCandidates.has(SELECTED_REMOTE)).toBe(true)
      expect(monitor.relayOnly).toBe(true)
    })
  })

  test('Failed repair clears demotions', ({ given, when, and, then }) => {
    given('a repair monitor connected 3 seconds ago', () => connectedAgo(3))
    when('a repair was started 5 seconds ago', () => {
      monitor.onRepairStarted({ demote: [SELECTED_REMOTE], relayOnly: true }, now - 5000)
    })
    and('the repair fails', () => { monitor.onRepairFailed() })
    then('no candidates are demoted and relay only is off', () => {
      expect(monitor.demotedCandidates.size).toBe(0)
      expect(monitor.relayOnly).toBe(false)
      expect(monitor.attempts).toBe(1)
    })
  })

  test('Monitoring continues after a failed repair', ({ given, when, and, then }) => {
    given('a repair monitor connected 3 seconds ago', () => connectedAgo(3))
    when('a repair was started 40 seconds ago', () => {
      monitor.onRepairStarted({ demote: [SELECTED_REMOTE], relayOnly: true }, now - 40000)
    })
    and('the repair fails', () => { monitor.onRepairFailed(now) })
    and('stats report the selected host pair with 9 seconds RTT and a relay pair with 300 ms RTT', () => {
      report(buildRaw({ selectedRtt: 9, alternativeRtt: 0.3 }))
    })
    then('a repair is decided with the selected remote candidate demoted and relay only', () => {
      expectRepair()
      expect(monitor.attempts).toBe(1)
    })
  })

  test('Relay only follows the latest repair decision', ({ given, when, and, then }) => {
    given('a repair monitor connected 3 seconds ago', () => connectedAgo(3))
    when('a repair was started 5 seconds ago', () => {
      monitor.onRepairStarted({ demote: [SELECTED_REMOTE], relayOnly: true }, now - 5000)
      expect(monitor.relayOnly).toBe(true)
    })
    and('a repair towards a direct alternative is started', () => {
      monitor.onRepairStarted({ demote: [RELAY_REMOTE], relayOnly: false }, now)
    })
    then('relay only is off', () => {
      expect(monitor.relayOnly).toBe(false)
      expect(monitor.demotedCandidates.has(SELECTED_REMOTE)).toBe(true)
    })
  })

  test('Disabled monitor never repairs', ({ given, when, then }) => {
    given('a disabled repair monitor connected 3 seconds ago', () => connectedAgo(3, { enabled: false }))
    when('stats report the selected host pair with 9 seconds RTT and a relay pair with 300 ms RTT', () => {
      report(buildRaw({ selectedRtt: 9, alternativeRtt: 0.3 }))
    })
    then('no repair is decided', () => { expect(decision).toBeNull() })
  })
})
