<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/opennemoclaw/blob/main/docs/local-install.md; checkedOn: 2026-07-31; redactions: 0 -->

# Local Install and Upgrade

Use these commands from the repository root to install or refresh a local NemoClaw runtime without calling the compiled CLI file directly.

## Install

```sh
npm run install:local
```

The installer:
- runs `npm install`
- runs `npm run build`
- stages a portable runtime in `~/.nemoclaw/runtime`
- copies built-in blueprints into `~/.nemoclaw/bundled/blueprints`
- writes install metadata to `~/.nemoclaw/install.json`
- creates launchers in `~/.nemoclaw/bin`
- creates activation helpers at `~/.nemoclaw/activate.sh`, `~/.nemoclaw/activate.cmd`, and `~/.nemoclaw/activate.ps1`

The staged runtime no longer depends on the repository path after install. Built-in packaged assets live under `~/.nemoclaw/bundled`, while user-managed blueprints and plugins remain under `~/.nemoclaw/blueprints` and `~/.nemoclaw/plugins`.

## Use the Launcher

If `~/.nemoclaw/bin` is on your `PATH`, use:

```sh
nemoclaw --help
```

If you do not want to change `PATH`, run the generated launcher directly:

```sh
~/.nemoclaw/bin/nemoclaw --help
```

On Windows Command Prompt:

```bat
%USERPROFILE%\.nemoclaw\bin\nemoclaw.cmd --help
```

On Windows PowerShell:

```powershell
& "$HOME\.nemoclaw\bin\nemoclaw.ps1" --help
```

## Activate the Current Shell

On Linux or other POSIX shells:

```sh
. "$HOME/.nemoclaw/activate.sh"
```

On Windows Command Prompt:

```bat
call %USERPROFILE%\.nemoclaw\activate.cmd
```

On Windows PowerShell:

```powershell
. "$HOME\.nemoclaw\activate.ps1"
```

## Upgrade

To refresh dependencies, rebuild the workspace, and restage the portable runtime:

```sh
npm run upgrade:local
```

This preserves the original `installedAt` timestamp in `~/.nemoclaw/install.json` and updates the recorded version, runtime paths, and launcher metadata.

## Uninstall

To remove the staged runtime, bundled assets, launchers, and install metadata while leaving agent state and config in place:

```sh
npm run uninstall:local -- --yes
```

To remove the full default local workspace under the install root as well:

```sh
npm run uninstall:local -- --yes --purge-data
```

`--purge-data` is destructive. It removes `config.yaml`, agents, logs, policies, blueprints, the SQLite runtime database, and the LanceDB memory store under the selected install root.

## Package the Current Host Platform

To create a portable package directory for the current host OS:

```sh
npm run package:portable
```

This writes the same staged runtime layout to `./dist/portable`, which you can archive with your preferred zip or tar tooling. Build the package on the same OS family you plan to run, because workspace dependencies can include platform-specific native modules.

## Notes

- All commands are safe to rerun from the repository root.
- The installer does not modify `PATH` for you; it generates launchers and activation helpers instead.
- Agent data, config, and install metadata all live under `~/.nemoclaw` by default.
- Release verification for install, upgrade, backup/restore, and uninstall is documented in [release-smoke.md](/Users/carlo/PROYECTOS/nemoclaw/docs/release-smoke.md).
- Additional packaging notes for Windows and Linux are in [platform-packaging.md](/Users/carlo/PROYECTOS/nemoclaw/docs/platform-packaging.md).
