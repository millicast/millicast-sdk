---
"@millicast/sdk": patch
---

Fix simulcast publishing on Chrome 154+ sending all three layers at full resolution. The SDK now sets `scaleResolutionDownBy` to 4, 2 and 1 on the simulcast layers after the local description is set.
