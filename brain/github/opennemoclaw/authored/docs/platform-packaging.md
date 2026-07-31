<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/opennemoclaw/blob/main/docs/platform-packaging.md; checkedOn: 2026-07-31; redactions: 0 -->

# Windows and Linux Packaging

NemoClaw packaging is host-specific. Build the package on the same OS family you plan to run, because some dependencies can include native modules.

## Create a Portable Package

From the repository root:

```sh
npm run package:portable
```

This creates `./dist/portable` with:
- `bin/` launchers
- `runtime/` with the staged CLI runtime
- `bundled/blueprints/` for install-owned built-in blueprints
- `install.json` metadata
- activation helpers for POSIX shells, `cmd.exe`, and PowerShell

The resulting directory is ready to archive with your preferred zip or tar tooling for the current host platform.

## Windows Notes

- Use `dist/portable/bin/nemoclaw.cmd` from Command Prompt.
- Use `dist/portable/bin/nemoclaw.ps1` from PowerShell.
- For a temporary session PATH update, run `. "$PWD\\dist\\portable\\activate.ps1"` in PowerShell or `call dist\\portable\\activate.cmd` in Command Prompt.

## Linux Notes

- Use `dist/portable/bin/nemoclaw` directly.
- For a temporary session PATH update, run `. "$PWD/dist/portable/activate.sh"`.
- If you archive the package, preserve executable bits on shell scripts when extracting.

## Runtime Asset Layout

The packaged runtime keeps install-owned assets separate from user-managed content:
- built-in blueprints live under `bundled/blueprints`
- user blueprints still belong under `~/.nemoclaw/blueprints`
- user plugins still belong under `~/.nemoclaw/plugins`

That separation lets upgrades refresh packaged defaults without overwriting user-authored content.
