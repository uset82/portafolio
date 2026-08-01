<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/opennemoclaw/blob/main/docs/quickstart.md; checkedOn: 2026-07-31; redactions: 0 -->

# Quickstart

This quickstart is the fastest way to run NemoClaw from this repository without changing code.

It uses:
- the one-command installer script
- the default `basic-agent` blueprint
- Docker as the sandbox runtime
- OpenRouter as the inference provider

## Install OpenNemoClaw

Download and run the installer script. The script installs Node.js if it is not already present, clones the repository, builds the project, then runs the guided onboard wizard to configure inference and sandbox settings.

**Linux / macOS:**

```sh
curl -fsSL https://raw.githubusercontent.com/uset82/opennemoc/main/scripts/install.sh | bash
```

**Windows (PowerShell):**

```powershell
iwr -useb https://raw.githubusercontent.com/uset82/opennemoc/main/scripts/install.ps1 | iex
```

When the install completes, a summary confirms the running environment:

```
──────────────────────────────────────────────────
  Install        ~/.nemoclaw
  Repository     ~/opennemoc
  Node           v20.x.x
  Sandbox        Docker
──────────────────────────────────────────────────
  Run:           nemoclaw create my-agent --blueprint basic-agent
                 nemoclaw start my-agent
                 nemoclaw chat my-agent --prompt "Hello!"
  Status:        nemoclaw status my-agent
  Logs:          nemoclaw logs my-agent --follow
  Connect:       nemoclaw connect my-agent
──────────────────────────────────────────────────

[OK]    === Installation complete ===
```

On first start, NemoClaw will pull the configured sandbox image automatically if it is not already present locally.
The current default image is `node:20-alpine`.

### Manual Install (alternative)

If you prefer to install manually or already have the repository cloned:

```sh
git clone https://github.com/uset82/opennemoc.git
cd opennemoc
npm run install:local
```

The command examples below use `nemoclaw`. If you did not add the launcher directory to your `PATH`, use the generated launcher directly as described in [local-install.md](local-install.md).

## 2. Configure OpenRouter

Set your OpenRouter key in the default NemoClaw config:

```sh
nemoclaw config set security.openrouterApiKey YOUR_OPENROUTER_KEY
```

Optional checks:

```sh
nemoclaw config path
nemoclaw config get inference.defaultProvider
```

By default, NemoClaw stores data under `~/.nemoclaw`.

## 3. Create and Start an Agent

Create a default assistant:

```sh
nemoclaw create demo-agent --blueprint basic-agent
nemoclaw start demo-agent
```

This creates an agent directory and starts a Docker-backed sandbox for it.

## 4. Run Your First Chat Turn

Send a single prompt:

```sh
nemoclaw chat demo-agent --prompt "Say hello in one short sentence."
```

For an interactive session:

```sh
nemoclaw chat demo-agent
```

## 5. Check Status and Logs

Inspect the running agent:

```sh
nemoclaw status demo-agent
nemoclaw logs demo-agent
```

`status` includes:
- lifecycle state
- configured provider and model
- inference health diagnostics

## 6. Stop and Clean Up

When you are done:

```sh
nemoclaw stop demo-agent
nemoclaw destroy demo-agent --force
```

## What You Just Verified

If the commands above succeed, you have verified the current NemoClaw core loop:
- install
- create
- start
- chat
- status
- stop
- destroy

## Troubleshooting

Common issues:
- missing OpenRouter key:
  `OpenRouter API key not configured`
- Docker unavailable:
  `Docker is not available. Please ensure Docker is running.`
- `nemoclaw` not found:
  use the generated launcher directly or add the launcher directory to `PATH`
- agent not running:
  start the agent before using `chat`, `logs`, or `connect`

## Next Step

After the default assistant works, try the reference demos in [demo.md](/Users/carlo/PROYECTOS/nemoclaw/docs/demo.md), review launcher details in [local-install.md](/Users/carlo/PROYECTOS/nemoclaw/docs/local-install.md), or package the current host runtime as described in [platform-packaging.md](/Users/carlo/PROYECTOS/nemoclaw/docs/platform-packaging.md).
