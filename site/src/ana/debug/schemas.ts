import { z } from "zod";
import { anaIntentKindSchema, type AnaIntentKind, type AnaResultStatus } from "../core/schemas";

export const anaDebugLatencySchema = z
  .object({
    agentId: z.string().min(1),
    capability: z.string().min(1),
    runtimeMs: z.number().nonnegative(),
  })
  .strict();

export const anaDebugSnapshotSchema = z
  .object({
    requestId: z.string().min(1).max(80),
    traceId: z.string().min(1).max(80),
    recordedAt: z.string().min(1),
    request: z
      .object({
        kind: anaIntentKindSchema,
        preview: z.string().max(240),
      })
      .strict(),
    plan: z
      .object({
        agentCount: z.number().int().nonnegative(),
        goals: z.array(z.string()),
        selectedDomains: z.array(z.string()),
        steps: z.array(
          z
            .object({
              agentId: z.string().min(1),
              capability: z.string().min(1),
            })
            .strict(),
        ),
        unavailableAgents: z.array(z.string()),
        missingInputCount: z.number().int().nonnegative(),
      })
      .strict(),
    active: z.array(z.string()),
    latency: z.array(anaDebugLatencySchema),
    tokens: z
      .object({
        input: z.number().nonnegative(),
        output: z.number().nonnegative(),
        reported: z.boolean(),
      })
      .strict(),
    cost: z
      .object({
        units: z.number().nonnegative(),
        limit: z.number().nonnegative(),
      })
      .strict(),
    result: z
      .object({
        status: z.enum(["answered", "needs-input", "deferred", "failed"]),
        errors: z.array(z.string()),
      })
      .strict(),
  })
  .strict();

export type AnaDebugSnapshot = z.infer<typeof anaDebugSnapshotSchema>;
export type AnaDebugLatency = z.infer<typeof anaDebugLatencySchema>;
export type AnaDebugKind = AnaIntentKind;
export type AnaDebugResultStatus = AnaResultStatus;
