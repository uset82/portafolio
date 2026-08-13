const normalize = (value: string) => value.replace(/\\/g, "/").toLowerCase();

const PUBLIC_BRAIN = /(?:^|\/)brain\/(?!private)/;
const SITE_SRC = /(?:^|\/)site\/src(?:\/|$)/;
const CLIENT_BUNDLE = /(?:^|\/)site\/(?:\.next|out)(?:\/|$)/;
const CC_AI_LEDGER = /cc-ai-public-knowledge/;
const BRAIN_PRIVATE = /(?:^|\/)brain-private(?:\/|$)/;

export const MEMORY_ISOLATION_ERROR =
  "ANA memory persistence, if used, must stay in an isolated brain-private root and must not enter public brain, CC AI, or client bundles.";

export const assertMemoryPathIsolated = (targetPath: string): void => {
  const path = normalize(targetPath);
  if (!path) {
    throw new Error(MEMORY_ISOLATION_ERROR);
  }
  if (CC_AI_LEDGER.test(path) || SITE_SRC.test(path) || CLIENT_BUNDLE.test(path)) {
    throw new Error(MEMORY_ISOLATION_ERROR);
  }
  if (PUBLIC_BRAIN.test(path) && !BRAIN_PRIVATE.test(path)) {
    throw new Error(MEMORY_ISOLATION_ERROR);
  }
  if (!BRAIN_PRIVATE.test(path)) {
    throw new Error(MEMORY_ISOLATION_ERROR);
  }
};
