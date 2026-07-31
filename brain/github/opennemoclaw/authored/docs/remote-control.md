<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/opennemoclaw/blob/main/docs/remote-control.md; checkedOn: 2026-07-31; redactions: 1 -->

# Remote Control and Hosted Patterns

NemoClaw stays local-first by default, but you can now run the shared HTTP and websocket API as a controlled remote surface when you need browser access from another machine, a private dashboard, or a reverse-proxy deployment.

## Start the API Locally

```sh
nemoclaw serve
```

Default behavior:

- binds to `127.0.0.1:3000`
- keeps the local-only default posture
- allows browser CORS locally
- reuses the same lifecycle, persistence, policy, and websocket chat paths as the local dashboard

## Start the API for Remote Control

```sh
nemoclaw serve \
  --remote \
  --host 0.0.0.0 \
  --port 3000 \
  --cors-origin https://dashboard.example.com
```

Remote mode changes the defaults:

- non-loopback bind hosts require `--remote`
- unrestricted CORS is rejected
- if no API token is configured, NemoClaw generates an ephemeral bearer token for the current process
- CORS defaults to disabled unless you provide explicit origins

## Recommended Patterns

### Private-network control

Use `nemoclaw serve --remote` on a machine that is only reachable through a VPN, SSH tunnel, or private subnet. Keep a bearer token enabled and connect the web client to that API base URL.

### Reverse proxy / TLS front door

Run `nemoclaw serve --remote --host 127.0.0.1 --port 3000` behind a reverse proxy that terminates TLS and applies network controls. This works well when the proxy and NemoClaw run on the same host.

Typical proxy responsibilities:

- TLS termination
- IP allowlists or private ingress
- request logging and rate controls
- stable public URL routing to the local NemoClaw API

## Config Keys

You can persist API defaults with `nemoclaw config set`:

```sh
nemoclaw config set extensions.api.host 127.0.0.1
nemoclaw config set extensions.api.port 3000
nemoclaw config set extensions.api.authToken \"your-long-random-token\"
nemoclaw config set extensions.api.corsOrigins '[\"https://dashboard.example.com\"]'
```

The `serve` command uses these values unless you override them with flags.

## Web Client Notes

The browser dashboard already supports:

- bearer tokens for REST requests
- `?token=[REDACTED credential-like value] websocket auth for streamed chat

That means the same web client can connect to a remote or proxied API as long as:

- the API token matches
- CORS is disabled for non-browser access or restricted to explicit dashboard origins for browser access

## Safety Notes

- Do not expose the API publicly without TLS and network controls.
- Prefer long random bearer tokens for remote mode.
- Avoid wildcard CORS when the API is reachable outside the local machine.
- Keep Docker, policy enforcement, and the shared lifecycle path in place; remote control is transport exposure, not a second runtime model.
