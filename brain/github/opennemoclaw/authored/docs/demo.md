<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/opennemoclaw/blob/main/docs/demo.md; checkedOn: 2026-07-31; redactions: 0 -->

# Demo Flow

This document gives you two concrete repo-backed demos:
- `basic-agent` for the default assistant flow
- `web-scraper` for the first tool-heavy extraction flow

Run the local installer first:

```sh
npm run install:local
```

The commands below assume you can invoke `nemoclaw` from your `PATH`. If you prefer not to change `PATH`, use the generated launcher directly as described in [local-install.md](/Users/carlo/PROYECTOS/nemoclaw/docs/local-install.md).

Before running these demos:
- make sure Docker is running
- set `security.openrouterApiKey`

## Demo 1: Basic Agent

Create the default assistant:

```sh
nemoclaw create demo-basic --blueprint basic-agent
nemoclaw start demo-basic
```

Run a simple turn:

```sh
nemoclaw chat demo-basic --prompt "Write a two-sentence summary of what NemoClaw is."
```

What to expect:
- the agent responds directly in chat
- conversation history is persisted
- later turns can reuse the same conversation and recall relevant memory

Inspect and clean up:

```sh
nemoclaw status demo-basic
nemoclaw stop demo-basic
nemoclaw destroy demo-basic --force
```

## Demo 2: Web Scraper

Create the scraping agent:

```sh
nemoclaw create demo-scraper --blueprint web-scraper
nemoclaw start demo-scraper
```

Run a scrape:

```sh
nemoclaw chat demo-scraper --prompt "Fetch https://example.com and summarize the page title, the main heading, and the links."
```

What to expect:
- the runtime fetches the page with `http_fetch`
- it parses HTML with `parse_html`
- it returns a compact extraction summary instead of raw markup

Optional follow-up prompts:

```sh
nemoclaw chat demo-scraper --prompt "Now give me the plain text only."
nemoclaw chat demo-scraper --prompt "Save the extracted notes to /sandbox/scrapes/example-summary.txt and tell me what you wrote."
```

Inspect and clean up:

```sh
nemoclaw status demo-scraper
nemoclaw logs demo-scraper
nemoclaw stop demo-scraper
nemoclaw destroy demo-scraper --force
```

## Notes

These demos are grounded in the current repo:
- `basic-agent` is the reference assistant blueprint
- `web-scraper` is the reference tool-heavy blueprint
- both flows use the same host-side runtime, policy stack, Docker sandbox, SQLite conversation store, and LanceDB-backed memory path
