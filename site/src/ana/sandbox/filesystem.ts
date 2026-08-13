const FORBIDDEN_FS = [
  /(?:^|[\\/])\.env(?:\.|$)/i,
  /(?:^|[\\/])site[\\/].*\.env/i,
  /(?:^|[\\/])brain-private(?:[\\/]|$)/i,
  /(?:^|[\\/])proc[\\/]/i,
  /(?:^|[\\/])etc[\\/]passwd/i,
];

export const containsForbiddenFsReference = (value: unknown): boolean => {
  if (typeof value === "string") {
    return FORBIDDEN_FS.some((pattern) => pattern.test(value));
  }
  if (Array.isArray(value)) return value.some(containsForbiddenFsReference);
  if (value && typeof value === "object") {
    return Object.values(value).some(containsForbiddenFsReference);
  }
  return false;
};
