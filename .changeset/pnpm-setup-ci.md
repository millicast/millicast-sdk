---
"@millicast/sdk": patch
---

CI: set up Node (from `.nvmrc`) and pnpm with `millicast/pnpm-setup` and the pnpm store cache in every workflow, run the release, publish and docs workflows on `ubuntu-latest` instead of Node containers, and drop `corepack enable`.
