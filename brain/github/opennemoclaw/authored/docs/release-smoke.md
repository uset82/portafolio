<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/opennemoclaw/blob/main/docs/release-smoke.md; checkedOn: 2026-07-31; redactions: 0 -->

# Release Smoke Verification

NemoClaw now includes a full distribution smoke runner for the Phase 7 release path.

## Run It

From the repository root:

```sh
npm run smoke:release
```

The script stages everything in an isolated temporary directory and exercises:

- fresh local install through `scripts/local-install.mjs`
- running the generated launcher outside the repository checkout
- creating an agent from the bundled `basic-agent` blueprint
- exporting a backup bundle
- upgrading the install in place
- uninstalling with `--purge-data`
- reinstalling from scratch
- importing the saved backup
- creating an agent from a restored user-managed blueprint
- final clean-machine uninstall verification

## What It Leaves Behind

The runner writes a report JSON file under its temporary root and preserves the exported backup bundle so the results can be inspected after the smoke passes.

## Scope

This is intentionally heavier than the unit and integration suites. It is the end-to-end release validation for:

- install
- upgrade
- backup and restore
- uninstall
- clean-machine recovery
