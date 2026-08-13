export class GitHubApiError extends Error {
  readonly endpoint: string;
  readonly status: number | undefined;

  constructor(endpoint: string, message: string, status?: number) {
    super(message);
    this.name = "GitHubApiError";
    this.endpoint = endpoint;
    this.status = status;
  }
}

export const redactCredentialLikeValues = (value: string) => {
  let text = value;
  let redactionCount = 0;
  const replace = (
    pattern: RegExp,
    replacement: string | ((match: string, ...groups: string[]) => string),
  ) => {
    text = text.replace(pattern, (...arguments_: string[]) => {
      redactionCount += 1;
      return typeof replacement === "string"
        ? replacement
        : replacement(arguments_[0] ?? "", ...arguments_.slice(1));
    });
  };

  replace(
    /((?:api[_-]?key|token|secret|password|passwd|private[_-]?key|anon[_-]?key)\s*[:=]\s*)(["']?)([^\s"'`]+)\2/gi,
    (_match, prefix) => `${prefix}[REDACTED credential-like value]`,
  );
  replace(
    /([?&](?:access_token|api_key|token|key)=)[^&\s)]+/gi,
    (_match, prefix) => `${prefix}[REDACTED credential-like value]`,
  );
  replace(
    /(authorization\s*:\s*bearer\s+)[A-Za-z0-9._~-]{12,}/gi,
    (_match, prefix) => `${prefix}[REDACTED credential-like value]`,
  );
  replace(
    /\b(?:github_pat_[A-Za-z0-9_]{20,}|gh[pousr]_[A-Za-z0-9]{20,}|sk-(?:or-v1-)?[A-Za-z0-9_-]{20,}|xox[baprs]-[A-Za-z0-9-]{20,})\b/g,
    "[REDACTED credential-like value]",
  );
  replace(
    /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g,
    "[REDACTED credential-like value]",
  );
  return { text, redactionCount };
};
