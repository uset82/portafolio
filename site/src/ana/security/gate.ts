import { isPersonalProfileField } from "../privacy/allowlists";
import type { AgentPermission } from "../protocol/schemas";
import type { RepoAgent } from "../protocol/agent";
import { containsSecretLeak } from "../sandbox/secrets";
import {
  CONFIRMATION_PERMISSIONS,
  ELEVATED_PERMISSIONS,
  SECURITY_DENIED,
  VISITOR_PERMISSIONS,
  type SecurityDecision,
} from "./schemas";

export type EvaluateSecurityGateInput = {
  agent: RepoAgent;
  input: Record<string, unknown>;
  granted?: readonly AgentPermission[];
  confirmed?: boolean;
  sharePersonalProfile?: boolean;
};

const hasValue = (value: unknown) => value !== undefined && value !== "";

const requestedPersonalFields = (input: Record<string, unknown>): string[] =>
  Object.entries(input)
    .filter(([field, value]) => isPersonalProfileField(field) && hasValue(value))
    .map(([field]) => field);

export const evaluateSecurityGate = (options: EvaluateSecurityGateInput): SecurityDecision => {
  const manifest = options.agent.manifest();
  const granted = new Set(options.granted ?? VISITOR_PERMISSIONS);
  const confirmed = options.confirmed === true;
  const reasons: string[] = [];

  const undeclared = manifest.permissions.filter((permission) => !granted.has(permission));
  const confirmationNeeded = new Set<AgentPermission>(CONFIRMATION_PERMISSIONS);
  const needsConfirmation = manifest.permissions.some((permission) =>
    confirmationNeeded.has(permission),
  );
  const wantsWrite = manifest.permissions.includes("write");
  const wantsNetwork = manifest.permissions.includes("network");
  const personalFields = requestedPersonalFields(options.input);
  const exposeSecrets = containsSecretLeak(options.input);

  const canRun = undeclared.length === 0 && (!needsConfirmation || confirmed);
  const canAccessInformation = personalFields.length === 0 || options.sharePersonalProfile === true;
  const canWrite = wantsWrite && granted.has("write") && confirmed;
  const canCallExternalApis = wantsNetwork && granted.has("network");
  const canExposeSecrets = exposeSecrets;

  if (undeclared.length > 0) {
    reasons.push(`${SECURITY_DENIED}: ${undeclared.join(", ")} is not granted.`);
  }
  if (needsConfirmation && !confirmed) {
    reasons.push(
      `${SECURITY_DENIED}: confirmation is required for write, external-action, or high-risk.`,
    );
  }
  if (!canAccessInformation) {
    reasons.push(`${SECURITY_DENIED}: personal profile fields need share consent.`);
  }
  if (canExposeSecrets) {
    reasons.push(`${SECURITY_DENIED}: input could expose secrets.`);
  }

  const allowed = canRun && canAccessInformation && !canExposeSecrets;
  return {
    allowed,
    agentId: manifest.id,
    reasons,
    checks: {
      canRun,
      canAccessInformation,
      canWrite,
      canCallExternalApis,
      canExposeSecrets,
      requiresConfirmation: needsConfirmation,
    },
  };
};

export const isVisitorDefaultPermission = (permission: AgentPermission): boolean =>
  VISITOR_PERMISSIONS.includes(permission);

const elevated = new Set<AgentPermission>(ELEVATED_PERMISSIONS);

export const isElevatedPermission = (permission: AgentPermission): boolean =>
  elevated.has(permission);
