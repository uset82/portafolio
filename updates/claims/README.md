# Claim files

One file per agent. **Separate files by design** — a single shared claim board would become the
most contended file in the repo and cause the exact conflicts this system exists to prevent.

Append one line per claim, newest last:

```
- A.1 · started 2026-08-01 · branch feat/brain-pipeline · status: in-progress
- A.1 · 2026-08-02 · status: merged in #14
```

| File | Agent |
| --- | --- |
| `codex.md` | Codex |
| `grok.md` | Grok in Cursor |
| `gemini.md` | Gemini |
| `claude.md` | Claude |

Before starting a task, check the other three files to confirm nobody else claimed it. Only
ever write to your own.
