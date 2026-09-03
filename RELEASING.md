# Release Guide

This document describes how to release the Millicast SDK, including both Release Candidate (RC) and Production releases to NPM.

## Prerequisites

- Write access to the repository
- Ability to create GitHub releases/tags
- NPM publish access is handled via CI/CD (requires a [Trusted Publisher](https://docs.npmjs.com/trusted-publishers) in NPM)

## Changesets Workflow

Before any release, ensure all changes have been documented using changesets:

1. **Create a changeset for each feature/fix:**
   ```bash
   pnpm exec changeset
   ```
   - Select the version type: `patch`, `minor`, or `major`
   - Enter a summary of the change

2. **Generate CHANGELOG and bump version:**
   ```bash
   pnpm exec changeset version
   ```
   This consolidates all changesets into `packages/millicast-sdk/CHANGELOG.md` and updates the version in `package.json`.

3. **Commit the changes** and push to `main`.

---

## Release Candidate (RC) Release

RC releases are published to NPM under the `next` tag, allowing users to test pre-release versions.

### TODO
Need to re-add a workflow/logic to follow this. Perform this manually if needed.

### Steps

1. **Ensure your changes are merged to `main`**

2. **Create and push a tag** with the `next-` prefix:
   ```bash
   git tag next-<version>
   git push origin next-<version>
   ```
   Example: `next-0.2.0-rc.1`

3. **CI Pipeline automatically:**
   - Builds the SDK (`pnpm --filter @millicast/sdk run build`)
   - Publishes to NPM with the `next` tag

### Installing RC Versions

Users can install RC versions with:
```bash
npm install @millicast/sdk@next
```

---

## Production Release (NPM)

Production releases are triggered by creating a GitHub Release with a version tag (without `rc` in the name).

### Steps

1. **Ensure all changesets are versioned:**
   ```bash
   pnpm exec changeset version
   ```
   Commit and push the updated `CHANGELOG.md` and `package.json`.

2. **Create a GitHub Release:**
   - Go to **Releases** → **Draft a new release**
   - Create a new tag matching the version (e.g., `v0.2.0` or `0.2.0`)
   - **Important:** Do NOT include `rc` in the tag name
   - Add release notes (can reference the CHANGELOG)
   - Publish the release

3. **CI Pipeline automatically:**
   - Runs `pnpm ci` and `pnpm run build`
   - Builds documentation (`pnpm run build-docs`)
   - Runs all tests
   - Deploys documentation to GitHub Pages
   - Publishes the SDK to NPM with public access

### What Gets Published

- **NPM Package:** `@millicast/sdk` (public)
- **Documentation:** Deployed to GitHub Pages

---

## Summary

| Release Type | Trigger | NPM Tag | Docs Deployed |
|--------------|---------|---------|---------------|
| **RC** | Push tag `next-*` | `next` | No |
| **Production** | GitHub Release (tag without `rc`) | `latest` | Yes |

---

## Troubleshooting

- **Tests failing on release:** The production release pipeline runs tests before publishing. Ensure all tests pass on `main` before creating a release.
- **NPM publish fails:** Verify the `NPM_TOKEN` secret is valid and has publish permissions.
- **Docs not deploying:** Documentation only deploys on production releases (non-RC tags).
