import { z } from "zod";

const chatTurnSchema = z
  .object({
    role: z.enum(["user", "assistant"]),
    content: z.string().trim().min(1).max(2_000),
  })
  .strict();

export const ccAiRequestSchema = z
  .object({
    message: z.string().trim().min(1).max(2_000),
    history: z.array(chatTurnSchema).max(8).default([]),
    locale: z
      .string()
      .regex(/^[a-z]{2}(?:-[A-Z]{2})?$/)
      .default("en"),
  })
  .strict();

export type CcAiRequest = z.infer<typeof ccAiRequestSchema>;

export type CcAiSuccessResponse = {
  ok: true;
  requestId: string;
  answer: string;
  truncated: boolean;
  model: {
    requested: string;
    fallbacks: string[];
    responded: string;
    selection: "free-router" | "specific-free-model" | "named-model";
    variable: boolean;
  };
  knowledge: {
    records: number;
    sourceIds: string[];
    truncated: boolean;
  };
};

export type CcAiErrorCode =
  | "disabled"
  | "forbidden"
  | "invalid_request"
  | "configuration"
  | "timeout"
  | "aborted"
  | "rate_limited"
  | "payment_required"
  | "provider_unavailable"
  | "busy"
  | "invalid_response";

export type CcAiErrorResponse = {
  ok: false;
  requestId: string;
  error: {
    code: CcAiErrorCode;
    message: string;
    retryable: boolean;
  };
};

export type CcAiResponse = CcAiSuccessResponse | CcAiErrorResponse;
