<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/Thesis-Writer-Kit/blob/main/README.md; checkedOn: 2026-07-31; redactions: 0 -->

# Thesis Writer Kit

<div align="center">

![Thesis Writer Kit](https://img.shields.io/badge/Thesis-Writer_Kit-blue?style=for-the-badge)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Python 3.10+](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://www.python.org/downloads/)

**AI-powered thesis research and writing assistant with verified citations**

> Generate authentic, research-backed academic drafts using specialized AI agents that verify every source against 200M+ academic papers.

</div>

---

## Quick Start

```bash
# Navigate to the engine
cd .agent/opendraft/engine

# Install dependencies
pip install -r requirements.txt

# Setup API key (first time only)
python -m opendraft.cli setup

# Generate a draft
python -m opendraft.cli "Your research topic" --level master --lang en
```

---

## What's Included

| Component | Count | Description |
|-----------|-------|-------------|
| **Agents** | 5 | Specialist AI personas (research, writing, citations, editing, humanizing) |
| **Skills** | 6 | Domain-specific knowledge modules |
| **Workflows** | 6 | Slash command procedures |
| **Engine** | 1 | OpenDraft - Research draft generator with verified citations |

---

## Structure

```
.agent/
??? agents/           # 5 Specialist Agents
??? skills/           # 6 Skills
??? workflows/        # 6 Slash Commands
??? rules/            # Workspace Rules
??? opendraft/        # Research Engine (Python)
??? ARCHITECTURE.md   # Full documentation
```

---

## Agents

| Agent | Description |
|-------|-------------|
| `research-agent` | Deep literature search across 200M+ papers |
| `writing-agent` | Academic drafting with thesis structure |
| `citation-agent` | APA 7 citation verification and formatting |
| `editor-agent` | Grammar, coherence, and style refinement |
| `humanizer-agent` | AI detection bypass and authenticity enhancement |

---

## Skills

| Skill | Purpose |
|-------|---------|
| `academic-writing` | Thesis structure, PEEL paragraphs, academic tone |
| `citation-management` | APA 7 formatting, DOI verification, bibliography |
| `thesis-structure` | Chapter organization, argument mapping |
| `ai-bypass` | Stealth writing strategies, detection avoidance |
| `research-methods` | Literature review, source screening |
| `harper` | Grammar checking and language polish |

---

## Workflows

Invoke workflows with slash commands:

| Command | Description |
|---------|-------------|
| `/research` | Deep literature search on a topic |
| `/draft` | Generate section draft with citations |
| `/cite` | Verify and format citations |
| `/humanize` | Apply stealth writing strategies |
| `/export` | Export to PDF, Word, or LaTeX |
| `/status` | Check project and draft status |

### Example Usage

```
/research "AI governance in energy sector"
/draft introduction --words 600
/cite --style apa7 --verify
/humanize --section introduction
```

---

## Using with AI Assistants

### With Cursor/VS Code Copilot

The agents and skills are automatically available. Use workflows like:
- "Follow the research-agent to find papers on AI ethics"
- "Apply the humanizer skill to this paragraph"
- "Use /draft to write the methodology section"

### OpenDraft Engine (CLI)

```bash
# Quick research expos? (outline + sources)
python -m opendraft.cli "Impact of AI on Education" --expose

# Full thesis draft
python -m opendraft.cli "Sustainable Energy in Norway" --level master --lang en
```

---

## OpenDraft vs ChatGPT

| Feature | ChatGPT | Thesis Writer Kit |
|---------|---------|-------------------|
| Citation verification | ? Hallucinates | ? Verified against real DBs |
| Long-form writing | ? Hits limits | ? 20,000+ words |
| Academic structure | ? Generic | ? Thesis chapters |
| Source search | ? No | ? 200M+ papers |
| AI detection bypass | ? No | ? Stealth strategies |
| Export formats | ? Copy/paste | ? PDF, Word, LaTeX |

---

## Project Configuration

Current thesis configuration (editable in `.agent/config/thesis.yaml`):

| Field | Value |
|-------|-------|
| **Word Limit** | 4,000 words |
| **Citation Style** | APA 7 |
| **Degree Level** | Master |

---

## Documentation

- [Architecture Guide](.agent/ARCHITECTURE.md) - Full system documentation
- [OpenDraft README](.agent/opendraft/README.md) - Engine documentation
- [Quick Start Guide](RUN.md) - Getting started

---

## Requirements

- Python 3.10+
- Google Gemini API Key (free)

---

## License

MIT ? 2026

---

<div align="center">

**Built for researchers who need authentic, verifiable academic writing.**

</div>
