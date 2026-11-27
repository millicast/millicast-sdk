---
'@millicast/sdk': minor
---

Add opt-in viewer client stats capture: `View.connect({ debugCapture: true })` records Director requests, signaling WebSocket messages, peer connection events, SDP/ICE, raw `getStats()` and page lifecycle events to IndexedDB, with tokens and TURN credentials redacted. `DebugCapture.download()` saves one zip file with a WebRTC dump (`*-webrtc-dump.json`) and a HAR (`*-network.har`) covering the whole viewing session, including retries and reconnects. Also adds `DebugCapture.listSessions()`, `getCapture()`, `deleteSession()` and `clear()`.
