---
"@millicast/sdk": minor
---

`View.connect()` and `Publish.connect()` now reject with `Viewer connection already in progress` / `Broadcast connection already in progress` when called while a previous `connect()` on the same instance is still connecting, instead of opening a second websocket and peer connection. `stop()` now cancels a `connect()` in progress: the pending call rejects with an `AbortError`, its websocket and peer connection are closed, and a new `connect()` can be started straight away. Adds `isConnecting()`.
