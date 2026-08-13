import { z } from "zod";
import { agentPermissionSchema, type AgentPermission } from "../protocol/schemas";

export const visitorPermissionsSchema = z.tuple([z.literal("read"), z.literal("compute")]);

export const VISITOR_PERMISSIONS: readonly AgentPermission[] = ["read", "compute"];

export const ELEVATED_PERMISSIONS: readonly AgentPermission[] = [
  "network",
  "write",
  "external-action",
  "high-risk",
];

export const CONFIRMATION_PERMISSIONS: readonly AgentPermission[] = [
  "write",
  "external-action",
  "high-risk",
];

export const securityGateInputSchema = z
  .object({
    granted: z.array(agentPermissionSchema).optional(),
    confirmed: z.boolean().optional(),
    sharePersonalProfile: z.boolean().optional(),
  })
  .strict();

export type SecurityChecks = {
  canRun: boolean;
  canAccessInformation: boolean;
  canWrite: boolean;
  canCallExternalApis: boolean;
  canExposeSecrets: boolean;
  requiresConfirmation: boolean;
};

export type SecurityDecision = {
  allowed: boolean;
  agentId: string;
  reasons: string[];
  checks: SecurityChecks;
};

export const SECURITY_DENIED = "Security gate denied";
