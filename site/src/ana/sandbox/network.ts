const METADATA_HOSTS = new Set([
  "metadata.google.internal",
  "metadata.internal",
  "169.254.169.254",
]);

const PRIVATE_IPV4 = /^(?:127\.|10\.|192\.168\.|169\.254\.|0\.|172\.(?:1[6-9]|2\d|3[01])\.)/;

export const SANDBOX_DENIED_URL = "Sandbox denied this network target.";

export type SandboxUrlDecision = { ok: true; host: string } | { ok: false; reason: string };

const hostnameOf = (url: URL): string => url.hostname.replace(/^\[|\]$/g, "").toLowerCase();

export const inspectSandboxUrl = (
  value: string,
  options: { allowPrivateHosts?: boolean } = {},
): SandboxUrlDecision => {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return { ok: false, reason: SANDBOX_DENIED_URL };
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { ok: false, reason: SANDBOX_DENIED_URL };
  }
  if (parsed.username || parsed.password) {
    return { ok: false, reason: SANDBOX_DENIED_URL };
  }
  const host = hostnameOf(parsed);
  if (!host || METADATA_HOSTS.has(host) || host.endsWith(".metadata.google.internal")) {
    return { ok: false, reason: SANDBOX_DENIED_URL };
  }
  const ipv6 = host.includes(":");
  const privateHost =
    host === "localhost" ||
    PRIVATE_IPV4.test(host) ||
    host === "::1" ||
    host === "0:0:0:0:0:0:0:1" ||
    (ipv6 && (host.startsWith("fc") || host.startsWith("fd") || host.startsWith("fe80")));
  if (privateHost && options.allowPrivateHosts !== true) {
    return { ok: false, reason: SANDBOX_DENIED_URL };
  }
  return { ok: true, host };
};

export const assertSandboxUrl = (
  value: string,
  options: { allowPrivateHosts?: boolean } = {},
): string => {
  const decision = inspectSandboxUrl(value, options);
  if (!decision.ok) throw new Error(decision.reason);
  return decision.host;
};
