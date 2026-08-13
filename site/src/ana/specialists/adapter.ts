import { z } from "zod";
import { invokeRepoAgent, AgentProtocolError } from "../protocol/agent";
import { agentCapabilitySchema, agentIdSchema } from "../protocol/schemas";
import { specialistById, type SpecialistCatalog } from "./catalog";

const agentHttpRequestSchema = z
  .object({
    requestId: z.string().trim().min(1).max(80).optional(),
    agentId: agentIdSchema.optional(),
    capability: agentCapabilitySchema,
    input: z.record(z.string(), z.unknown()),
  })
  .strict();

export type AgentHttpHandlerOptions = {
  enabled: boolean;
  specialists: SpecialistCatalog;
  createRequestId?: () => string;
};

const jsonResponse = (body: unknown, status: number) =>
  Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });

export function createAgentPostHandler({
  enabled,
  specialists,
  createRequestId = () => crypto.randomUUID(),
}: AgentHttpHandlerOptions) {
  return async function handleAgentPost(request: Request) {
    const fallbackId = createRequestId();
    if (!enabled) {
      return jsonResponse(
        {
          ok: false,
          requestId: fallbackId,
          error: { code: "disabled", message: "Specialist adapter is disabled." },
        },
        503,
      );
    }

    if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
      return jsonResponse(
        { ok: false, requestId: fallbackId, error: { code: "invalid_request" } },
        415,
      );
    }

    let payload: unknown;
    try {
      payload = JSON.parse(await request.text()) as unknown;
    } catch {
      return jsonResponse(
        { ok: false, requestId: fallbackId, error: { code: "invalid_request" } },
        400,
      );
    }

    const parsed = agentHttpRequestSchema.safeParse(payload);
    if (!parsed.success) {
      return jsonResponse(
        { ok: false, requestId: fallbackId, error: { code: "invalid_request" } },
        400,
      );
    }

    const requestId = parsed.data.requestId ?? fallbackId;
    let agent = parsed.data.agentId ? specialistById(specialists, parsed.data.agentId) : undefined;
    if (!agent && !parsed.data.agentId) {
      const matches = Object.values(specialists).filter((candidate) =>
        candidate.manifest().capabilities.includes(parsed.data.capability),
      );
      const [onlyMatch] = matches;
      if (matches.length === 1 && onlyMatch) {
        agent = onlyMatch;
      } else if (matches.length > 1) {
        return jsonResponse(
          {
            ok: false,
            requestId,
            error: {
              code: "ambiguous_agent",
              message: "Pass agentId when multiple specialists match.",
            },
          },
          400,
        );
      }
    }
    if (!agent) {
      return jsonResponse(
        {
          ok: false,
          requestId,
          error: { code: "not_found", message: "No specialist matches this request." },
        },
        404,
      );
    }

    try {
      const response = await invokeRepoAgent(agent, {
        requestId,
        capability: parsed.data.capability,
        input: parsed.data.input,
      });
      return jsonResponse({ ok: true, requestId, response }, 200);
    } catch (error) {
      if (error instanceof AgentProtocolError) {
        return jsonResponse(
          { ok: false, requestId, error: { code: error.code, message: error.message } },
          400,
        );
      }
      return jsonResponse(
        {
          ok: false,
          requestId,
          error: { code: "failed", message: "Specialist execution failed." },
        },
        500,
      );
    }
  };
}
