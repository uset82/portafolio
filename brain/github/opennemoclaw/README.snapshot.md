<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/opennemoclaw/blob/main/README.md; checkedOn: 2026-07-31; redactions: 0 -->

# OpenNemoClaw

<p align="center">
  <img src="https://github.com/user-attachments/assets/50320065-69d2-4e02-94fb-df8bb0b45036" alt="OpenNemoClaw" width="800" />
</p>

**Personal Agent Framework - Secure creation, deployment, and management of AI agents**

OpenNemoClaw is a powerful framework that allows you to easily create, test, configure, and manage intelligent AI agents in a local sandbox environment. It offers flexible model configurations (including deeply integrated support for **OpenRouter**), straightforward agent blueprinting, and complete sandboxing by leveraging Docker.

## Features

- **Local & Secure:** Agents run in a sandboxed Docker environment, ensuring that file system access and system execution are completely isolated.
- **Provider Agnostic:** Out-of-the-box support for multiple inference providers, with first-class support for building on top of OpenRouter.
- **Agent Blueprints:** Start quickly with pre-defined agent templates that jump-start your development.
- **Rich CLI Management:** Easily create, start, inspect, and interact with agents using an intuitive command-line interface.

## Prerequisites

- **Node.js** v18+ (Node 20 recommended)
- **Docker Desktop** (must be installed and actively running to provide sandbox environments)

## Getting Started

### Quick Install

Run the one-line installer to get up and running. It handles Node.js detection, cloning, building, and walks you through the onboard wizard.

**Linux / macOS:**
```sh
curl -fsSL https://raw.githubusercontent.com/uset82/opennemoc/main/scripts/install.sh | bash
```

**Windows (PowerShell):**
```powershell
iwr -useb https://raw.githubusercontent.com/uset82/opennemoc/main/scripts/install.ps1 | iex
```

### Manual Installation

If you prefer step-by-step control, clone and build manually:

```bash
git clone https://github.com/uset82/opennemoc.git
cd opennemoc
npm run install:local
```

### Quick Launch with OpenRouter

OpenNemoClaw makes it incredibly easy to use OpenRouter as your AI provider. For a full step-by-step walkthrough, see our [Launch Guide](launch.md).

Here is the quick path to setting up your first OpenRouter agent via PowerShell:

1. **Set the CLI Path:**
   ```powershell
   $NEMO = "$HOME\.nemoclaw\bin\nemoclaw.cmd"
   ```
2. **Configure OpenRouter:**
   ```powershell
   & $NEMO config set inference.defaultProvider openrouter
   & $NEMO config set inference.defaultModel openrouter/free
   ```
3. **Set your API Key strictly via Interactive Mode:**
   ```powershell
   & $NEMO onboard
   ```
4. **Create & Run an Agent:**
   ```powershell
   & $NEMO create my-first-agent --blueprint basic-agent
   & $NEMO start my-first-agent
   & $NEMO chat my-first-agent --new --stream --prompt "Hello, agent!"
   ```

## Documentation

- [Project Roadmap](ROADMAP.md) - Future plans and milestone tracking.
- [Project Research](RESEARCH.md) - Research findings and concepts.
- [Contributing](CONTRIBUTING.md) - Guidelines for contributing to the framework.
- [Launch Guide](launch.md) - Detailed step-by-step guide for setup and CLI testing.

## Workspaces Structure

This project uses npm workspaces to tightly manage its sub-packages. 
- Core CLI, internal packages, and library logic are structured inside the `packages/` directory.

## License

This project is licensed under the [MIT License](LICENSE).
