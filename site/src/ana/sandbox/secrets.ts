const SECRET_ENV = /(?:key|secret|token|password|credential|authorization)/i;

const SAFE_ENV = new Set(["NODE_ENV"]);

export const createSandboxEnv = (
  source: Record<string, string | undefined> = process.env,
): Record<string, string> => {
  const env: Record<string, string> = {};
  for (const [name, value] of Object.entries(source)) {
    if (!value || !SAFE_ENV.has(name) || SECRET_ENV.test(name)) continue;
    env[name] = value;
  }
  return env;
};

export const containsSecretLeak = (value: unknown): boolean => {
  const serialized = typeof value === "string" ? value : safeSerialize(value);
  return (
    /sk-or-(?:v1-)?[a-z0-9_-]{12,}/i.test(serialized) ||
    /OPENROUTER_API_KEY|ANA_MEMORY_KEY/i.test(serialized)
  );
};

const safeSerialize = (value: unknown): string => {
  try {
    return JSON.stringify(value) ?? "";
  } catch {
    return "";
  }
};
