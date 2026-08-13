import { isPersonalProfileField, isSecretField } from "./allowlists";

export const REDACTED = "[redacted]";

const ANALYTICS_KEYS = new Set([
  "requestId",
  "agentId",
  "event",
  "at",
  "capability",
  "status",
  "runtimeMs",
]);

export const isSensitiveLogKey = (field: string): boolean =>
  isPersonalProfileField(field) ||
  isSecretField(field) ||
  /birth|fullName|token|password|secret|credential|authorization|api[_-]?key/i.test(field);

export const maskSensitiveFields = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(maskSensitiveFields);
  if (value && typeof value === "object") {
    const masked: Record<string, unknown> = {};
    for (const [field, nested] of Object.entries(value)) {
      masked[field] = isSensitiveLogKey(field) ? REDACTED : maskSensitiveFields(nested);
    }
    return masked;
  }
  return value;
};

export const toAnalyticsEvent = (payload: Record<string, unknown>): Record<string, unknown> => {
  const event: Record<string, unknown> = {};
  for (const [field, value] of Object.entries(payload)) {
    if (!ANALYTICS_KEYS.has(field) || isSensitiveLogKey(field) || !hasSafeAnalyticsValue(value)) {
      continue;
    }
    event[field] = value;
  }
  return event;
};

const hasSafeAnalyticsValue = (value: unknown): boolean => {
  if (value === undefined || value === null) return false;
  if (typeof value === "number" || typeof value === "boolean") return true;
  if (typeof value !== "string") return false;
  return !/1815-12-10|Ada Lovelace|\b\d{4}-\d{2}-\d{2}\b/i.test(value);
};
