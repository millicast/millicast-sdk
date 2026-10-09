---
"@millicast/sdk": patch
---

A `View.connect()` or `Publish.connect()` with `metadata: true` that fails now terminates its metadata transform worker instead of leaving it running until `stop()`.
