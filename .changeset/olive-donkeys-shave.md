---
"@millicast/sdk": minor
---

Added a `maintainResolution` publish option that works around decoders which glitch on a mid-stream resolution change, by keeping the encoder at a constant resolution and giving up frame rate instead when bandwidth or CPU is constrained. `contentHint` is now also carried over to the replacement track by `replaceTrack`.
