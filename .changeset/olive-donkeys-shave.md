---
"@millicast/sdk": minor
---

Added a `maintainResolution` publish option that keeps the encoder at a constant resolution, giving up frame rate instead when bandwidth or CPU is constrained. `contentHint` is now also carried over to the replacement track by `replaceTrack`.
