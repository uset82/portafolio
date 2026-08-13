import { AsyncLocalStorage } from "node:async_hooks";
import { z } from "zod";
import { agentCapabilitySchema, agentIdSchema, type AgentResponse } from "../protocol/schemas";

export const ANA_DELEGATION_DENIED =
  "Specialist-to-specialist calls are only allowed through ANA's runtime.";

export const ANA_DEFAULT_MAX_AGENT_DEPTH = 3;
export const ANA_DEFAULT_MAX_AGENTS_PER_REQUEST = 8;
export const ANA_DEFAULT_MAX_RUNTIME_MS = 30_000;

export const specialistDelegationRequestSchema = z
  .object({
    agentId: agentIdSchema,
    capability: agentCapabilitySchema,
    reason: z.string().trim().min(1).max(120),
  })
  .strict();

export type SpecialistDelegationRequest = z.infer<typeof specialistDelegationRequestSchema>;

export type AnaDelegationHandler = (request: SpecialistDelegationRequest) => Promise<AgentResponse>;

const storage = new AsyncLocalStorage<{ requestSpecialist: AnaDelegationHandler }>();

const denied = (agentId: string, summary: string): AgentResponse => ({
  agentId,
  status: "failed",
  result: { error: summary },
  summary,
  runtimeMs: 0,
});

export const parseSpecialistDelegationRequest = (
  value: unknown,
): SpecialistDelegationRequest | undefined => {
  const parsed = specialistDelegationRequestSchema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
};

export const runWithAnaDelegation = <T>(
  requestSpecialist: AnaDelegationHandler,
  fn: () => Promise<T>,
): Promise<T> => storage.run({ requestSpecialist }, fn);

export async function requestSpecialist(value: unknown): Promise<AgentResponse> {
  const parsed = parseSpecialistDelegationRequest(value);
  const agentId = parsed?.agentId ?? "unknown";
  if (!parsed) {
    return denied(agentId, "Invalid specialist delegation request.");
  }
  const frame = storage.getStore();
  if (!frame) {
    return denied(parsed.agentId, ANA_DELEGATION_DENIED);
  }
  return frame.requestSpecialist(parsed);
}
