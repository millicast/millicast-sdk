---
'@millicast/sdk': patch
---

Fix a `View`/`Publish` stuck in `isConnecting()` with no retries after a failed `connect()` when the instance is wrapped in a reactive proxy (e.g. stored in Vue/Vuex state).
