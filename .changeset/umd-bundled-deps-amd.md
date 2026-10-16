---
"@millicast/sdk": patch
---

Fix `useDefaults is not a function` when the UMD build is bundled by webpack or loaded by another AMD loader, by keeping bundled dependencies such as js-logger from registering themselves with the host's `define`.
