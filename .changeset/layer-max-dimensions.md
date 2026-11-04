---
'@millicast/sdk': minor
---

Add `maxWidth` and `maxHeight` resolution constraints to `LayerInfo`, so `View.select()`, `View.project()` and `View.connect({ layer })` can limit the resolution of a video track (0 resets the restriction). Supplying only the dimension limits keeps server side ABR active within those limits; supplying `encodingId`, `spatialLayerId` or `temporalLayerId` still fixes the track to that layer. Matches the `maxWidth`/`maxHeight` constraints already available in the native SDKs.
