# Architecture and current boundaries

## Workspace map

OpenNemoClaw separates command-line lifecycle and workspace operations, an HTTP/control API,
core agent runtime behavior, connector implementations, policy evaluation, Docker execution,
and a Web management interface. Two blueprints provide bounded agent and scraper examples.

## Sandbox and policy evidence

The Docker provider exposes resource limits, read-only-root configuration, privilege and
capability settings, network/DNS/port configuration, and bind mounts. Blueprint defaults request
restricted settings, and tests cover provider and integration paths. The configuration also
permits options such as privileged mode, added capabilities, alternate networking, exposed
ports, and writable binds; the policy engine permits requests when no policy is loaded.

These facts support saying that sandbox and policy controls exist in source. They do not support
claims of complete isolation, secure-by-default operation, production hardening, or audited
end-to-end enforcement.

## Provider boundary

The verified connector surface includes OpenRouter and a generic HTTP connector. Describe this
as an extensible connector experiment rather than proven first-class provider-agnostic support.
Credentials remain environment or interactive inputs and never belong in portfolio examples.

Source: `docs/content/opennemoclaw-source-pack.md`.
