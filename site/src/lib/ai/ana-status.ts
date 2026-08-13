export const ANA_STATUS_PHASES = ["understanding", "planning", "running", "combining"] as const;

export type AnaStatusPhase = (typeof ANA_STATUS_PHASES)[number];

export type AnaStatusEvent = {
  type: "status";
  requestId: string;
  traceId: string;
  agentId: string;
  label: string;
  phase: AnaStatusPhase;
  announcement: string;
  active: string[];
};

export type AnaStreamCompleteEvent = {
  type: "complete";
  ok: true;
  requestId: string;
  traceId: string;
  answer: string;
  status: string;
  active: string[];
};

export type AnaStreamErrorEvent = {
  type: "error";
  ok: false;
  requestId: string;
  error: {
    code: string;
    message: string;
    retryable: boolean;
  };
};

export type AnaStreamEvent = AnaStatusEvent | AnaStreamCompleteEvent | AnaStreamErrorEvent;

const AGENT_LABELS: Record<string, string> = {
  ana: "ANA",
  astraea: "ASTRAEA",
  pinaculo: "PINÁCULO",
  strudel: "STRUDEL",
  mentora: "MENTORA",
  smartapply: "Career",
  "career-agent": "Career",
  "education-agent": "MENTORA",
  "electronics-agent": "ELECTRONICS",
  stillas: "STILLAS",
  "thesis-writer": "Thesis Writer",
  creative: "Creative",
  engineering: "Engineering",
  "personal-insight": "Personal Insight",
  business: "Business",
  "ana-knowledge": "ANA",
  "ana-verifier": "ANA Verifier",
};

const RUNNING_PHRASES: Record<string, string> = {
  "natal-chart": "calculating a natal chart",
  "numerology-profile": "analyzing a numerology profile",
  "pattern-generate": "generating a music pattern",
  "career-analysis": "comparing options",
  education: "reviewing education",
  "capability-search": "inspecting the engineering question",
  "ask-portfolio": "searching public repository knowledge",
  "combined-analysis": "comparing personal, education, career, and business specialists",
  "business-ideas": "reviewing a business idea",
  "application-track": "comparing career options",
  "market-research": "checking market research",
};

export const anaAgentLabel = (agentId: string): string => AGENT_LABELS[agentId] ?? agentId;

export const anaStatusAnnouncement = (input: {
  agentId: string;
  phase: AnaStatusPhase;
  capability?: string;
}): string => {
  if (input.phase === "understanding") return "ANA is understanding your question.";
  if (input.phase === "planning") return "ANA is planning.";
  if (input.phase === "combining") return "ANA is combining the results.";
  const label = anaAgentLabel(input.agentId);
  const phrase = input.capability ? RUNNING_PHRASES[input.capability] : undefined;
  return phrase ? `${label} is ${phrase}.` : `${label} is working.`;
};

export const createAnaStatusEvent = (input: {
  requestId: string;
  traceId: string;
  agentId: string;
  phase: AnaStatusPhase;
  active?: readonly string[];
  capability?: string;
}): AnaStatusEvent => ({
  type: "status",
  requestId: input.requestId,
  traceId: input.traceId,
  agentId: input.agentId,
  label: anaAgentLabel(input.agentId),
  phase: input.phase,
  announcement: anaStatusAnnouncement({
    agentId: input.agentId,
    phase: input.phase,
    ...(input.capability ? { capability: input.capability } : {}),
  }),
  active: [...(input.active ?? [])],
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

export const isAnaStatusEvent = (value: unknown): value is AnaStatusEvent => {
  if (!isRecord(value) || value.type !== "status") return false;
  return (
    typeof value.requestId === "string" &&
    typeof value.traceId === "string" &&
    typeof value.agentId === "string" &&
    typeof value.label === "string" &&
    ANA_STATUS_PHASES.includes(value.phase as AnaStatusPhase) &&
    typeof value.announcement === "string" &&
    value.announcement.trim().length > 0 &&
    isStringArray(value.active)
  );
};

export const isAnaStreamCompleteEvent = (value: unknown): value is AnaStreamCompleteEvent => {
  if (!isRecord(value) || value.type !== "complete" || value.ok !== true) return false;
  return (
    typeof value.requestId === "string" &&
    typeof value.traceId === "string" &&
    typeof value.answer === "string" &&
    value.answer.trim().length > 0 &&
    typeof value.status === "string" &&
    isStringArray(value.active)
  );
};

export const isAnaStreamErrorEvent = (value: unknown): value is AnaStreamErrorEvent => {
  if (!isRecord(value) || value.type !== "error" || value.ok !== false) return false;
  return (
    typeof value.requestId === "string" &&
    isRecord(value.error) &&
    typeof value.error.code === "string" &&
    typeof value.error.message === "string" &&
    typeof value.error.retryable === "boolean"
  );
};

export const isAnaStreamEvent = (value: unknown): value is AnaStreamEvent =>
  isAnaStatusEvent(value) || isAnaStreamCompleteEvent(value) || isAnaStreamErrorEvent(value);

export const encodeSseEvent = (data: unknown): string => `data: ${JSON.stringify(data)}\n\n`;

export const parseSseDataFrames = (chunk: string): unknown[] => {
  const frames: unknown[] = [];
  for (const block of chunk.split("\n\n")) {
    const dataLines = block
      .split("\n")
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trimStart());
    if (dataLines.length === 0) continue;
    try {
      frames.push(JSON.parse(dataLines.join("\n")));
    } catch {
      /* ignore incomplete or non-JSON frames */
    }
  }
  return frames;
};

export const splitSseBuffer = (
  buffer: string,
  flushTail: boolean,
): { frames: unknown[]; rest: string } => {
  const normalized = buffer.replace(/\r\n/g, "\n");
  const lastBreak = normalized.lastIndexOf("\n\n");
  if (lastBreak === -1) {
    return flushTail
      ? { frames: parseSseDataFrames(normalized), rest: "" }
      : { frames: [], rest: normalized };
  }
  const ready = normalized.slice(0, lastBreak + 2);
  const rest = normalized.slice(lastBreak + 2);
  const frames = parseSseDataFrames(ready);
  if (!flushTail) return { frames, rest };
  return { frames: [...frames, ...parseSseDataFrames(rest)], rest: "" };
};
