export const ANA_COMBINED_CONSENT_FIELD = "sharePersonalProfile";

export const ANA_COMBINED_CONSENT_PROMPT =
  "ANA needs explicit consent before a combined personal analysis. Confirm that you consent to share your personal profile.";

const CONSENT_PHRASES = [
  "i consent to share",
  "i consent to use",
  "you may use my personal",
  "you may use my birth",
  "you may use my profile",
  "share my personal profile",
  "share my profile",
  "with my consent",
] as const;

export const isCombinedAnalysisRequest = (message: string): boolean => {
  const normalized = message.toLowerCase();
  return [
    "combined analysis",
    "combined personal analysis",
    "full personal analysis",
    "personality, education, career",
    "personality, career, and business",
    "education, career, and business",
    "across personality, career",
  ].some((needle) => normalized.includes(needle));
};

export const hasExplicitPersonalConsent = (
  request: { message: string; input?: Record<string, unknown> | undefined },
  runtime?: { sharePersonalProfile?: boolean | undefined },
): boolean => {
  if (runtime?.sharePersonalProfile === true) return true;
  if (request.input?.sharePersonalProfile === true) return true;
  const normalized = request.message.toLowerCase();
  return CONSENT_PHRASES.some((phrase) => normalized.includes(phrase));
};
