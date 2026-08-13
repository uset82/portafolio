import { defineRepoAgent, type RepoAgent } from "../../protocol/agent";
import type { AgentHealth, AgentRequest, AgentResponse } from "../../protocol/schemas";
import { toAgentManifest } from "../../manifest/schemas";
import { utcTimestamp } from "../../registry/health";
import { SYMBOLIC_INTERPRETATION_WARNING } from "../labels";
import {
  calculateComplete,
  lifeCycles,
  listMasterNumbers,
  parseBirthDate,
  pinnacleCycles,
} from "./core";
import { pinaculoAgentJson } from "./manifest";

const manifest = toAgentManifest(pinaculoAgentJson);

const failed = (summary: string, runtimeMs: number): AgentResponse => ({
  agentId: manifest.id,
  status: "failed",
  result: null,
  summary,
  warnings: [SYMBOLIC_INTERPRETATION_WARNING],
  runtimeMs,
});

const executePinaculo = (request: AgentRequest): AgentResponse => {
  const started = Date.now();
  const fullName = request.input.fullName;
  const birthDate = request.input.birthDate;
  if (typeof fullName !== "string" || typeof birthDate !== "string") {
    return failed("fullName and birthDate are required strings.", Date.now() - started);
  }

  let day: number;
  let month: number;
  let year: number;
  try {
    ({ day, month, year } = parseBirthDate(birthDate));
  } catch (error) {
    return failed(
      error instanceof Error ? error.message : "Invalid birthDate",
      Date.now() - started,
    );
  }

  const positions = calculateComplete(day, month, year);
  const profile = {
    fullName,
    birthDate,
    positions,
    masterNumbers: listMasterNumbers(positions),
    lifeCycles: lifeCycles(positions),
    pinnacleCycles: pinnacleCycles(positions),
  };

  const result =
    request.capability === "master-numbers"
      ? { masterNumbers: profile.masterNumbers, positions }
      : request.capability === "life-cycles"
        ? { lifeCycles: profile.lifeCycles }
        : request.capability === "pinnacle-cycles"
          ? { pinnacleCycles: profile.pinnacleCycles }
          : profile;

  return {
    agentId: manifest.id,
    status: "success",
    result,
    summary: `Computed Pináculo ${request.capability} from birth date only. Name is recorded; letter-value mapping is not part of the extracted core.`,
    assumptions: [
      "Uses PinaculoCalculator.calculateComplete from uset82/pinaculo src/types/pinaculo.ts.",
      "fullName is not used in the numeric core; name-number mapping was removed upstream.",
    ],
    warnings: [SYMBOLIC_INTERPRETATION_WARNING],
    evidence: [
      {
        kind: "repository",
        label: manifest.repository,
        href: "https://github.com/uset82/pinaculo",
      },
      { kind: "capability", label: request.capability },
    ],
    confidence: 1,
    runtimeMs: Date.now() - started,
  };
};

export const createPinaculoAgent = (): RepoAgent =>
  defineRepoAgent({
    manifest: () => manifest,
    health: async (): Promise<AgentHealth> => ({
      agentId: manifest.id,
      status: "healthy",
      checkedAt: utcTimestamp(),
      message: "Local Pináculo calculator is available",
    }),
    execute: async (request) => executePinaculo(request),
  });
