import { defineRepoAgent, type RepoAgent } from "../../protocol/agent";
import type { AgentHealth, AgentRequest, AgentResponse } from "../../protocol/schemas";
import { toAgentManifest } from "../../manifest/schemas";
import { utcTimestamp } from "../../registry/health";
import { SYMBOLIC_INTERPRETATION_WARNING } from "../labels";
import {
  createChartEngineFromEnv,
  type ChartEngine,
  type InterpretEngine,
  type NatalChartInput,
} from "./engine";
import { astraeaAgentJson } from "./manifest";

const manifest = toAgentManifest(astraeaAgentJson);

const asString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim().length > 0 ? value : undefined;

const asNumber = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;

const natalFrom = (input: AgentRequest["input"]): NatalChartInput | undefined => {
  const birthDate = asString(input.birthDate);
  const birthTime = asString(input.birthTime);
  const latitude = asNumber(input.latitude);
  const longitude = asNumber(input.longitude);
  const houseSystem = asString(input.houseSystem) ?? "placidus";
  if (!birthDate || !birthTime || latitude === undefined || longitude === undefined)
    return undefined;
  return {
    dateTime: `${birthDate} ${birthTime}`,
    latitude,
    longitude,
    houseSystem,
  };
};

const person2From = (input: AgentRequest["input"]): NatalChartInput | undefined => {
  const birthDate = asString(input.person2BirthDate);
  const birthTime = asString(input.person2BirthTime);
  const latitude = asNumber(input.person2Latitude);
  const longitude = asNumber(input.person2Longitude);
  const houseSystem = asString(input.houseSystem) ?? "placidus";
  if (!birthDate || !birthTime || latitude === undefined || longitude === undefined)
    return undefined;
  return { dateTime: `${birthDate} ${birthTime}`, latitude, longitude, houseSystem };
};

const failed = (summary: string, runtimeMs: number): AgentResponse => ({
  agentId: manifest.id,
  status: "failed",
  result: null,
  summary,
  warnings: [SYMBOLIC_INTERPRETATION_WARNING],
  runtimeMs,
});

export const createAstraeaAgent = (
  options: {
    chartEngine?: ChartEngine;
    interpretEngine?: InterpretEngine;
  } = {},
): RepoAgent => {
  const chartEngine = options.chartEngine ?? createChartEngineFromEnv();
  const interpretEngine = options.interpretEngine;

  return defineRepoAgent({
    manifest: () => manifest,
    health: async (): Promise<AgentHealth> => {
      const status = await chartEngine.health();
      return {
        agentId: manifest.id,
        status,
        checkedAt: utcTimestamp(),
        message:
          status === "healthy"
            ? "ASTRAEA chart engine is reachable"
            : "ASTRAEA chart engine is not configured or unreachable",
      };
    },
    execute: async (request) => {
      const started = Date.now();
      try {
        if (request.capability === "interpretation") {
          if (!interpretEngine) {
            return failed(
              "Interpretation requires the ASTRAEA AI engine and is not invented in this host.",
              Date.now() - started,
            );
          }
          const natal = natalFrom(request.input);
          if (!natal) {
            return failed(
              "interpretation needs birthDate, birthTime, latitude, and longitude.",
              Date.now() - started,
            );
          }
          const chart = await chartEngine.natal(natal);
          const focusArea = asString(request.input.focusArea);
          const interpretation = await interpretEngine.interpret({
            chart,
            ...(focusArea ? { focusArea } : {}),
          });
          return {
            agentId: manifest.id,
            status: "success",
            result: { chart, interpretation },
            summary: "Returned an ASTRAEA interpretation grounded in calculated chart data.",
            warnings: [SYMBOLIC_INTERPRETATION_WARNING],
            evidence: [{ kind: "capability", label: request.capability }],
            runtimeMs: Date.now() - started,
          };
        }

        const natal = natalFrom(request.input);
        if (!natal) {
          return failed(
            `${request.capability} needs birthDate, birthTime, latitude, and longitude.`,
            Date.now() - started,
          );
        }

        let chart: unknown;
        if (request.capability === "natal-chart") {
          chart = await chartEngine.natal(natal);
        } else if (request.capability === "transits") {
          const transitDateTime = asString(request.input.transitDateTime);
          if (!transitDateTime) {
            return failed("transits needs transitDateTime.", Date.now() - started);
          }
          chart = await chartEngine.transits({ ...natal, transitDateTime });
        } else if (request.capability === "synastry") {
          const person2 = person2From(request.input);
          if (!person2) {
            return failed(
              "synastry needs person2BirthDate, person2BirthTime, person2Latitude, and person2Longitude.",
              Date.now() - started,
            );
          }
          chart = await chartEngine.synastry({ person1: natal, person2 });
        } else if (request.capability === "solar-return") {
          const year = asNumber(request.input.year);
          if (year === undefined) {
            return failed("solar-return needs year.", Date.now() - started);
          }
          chart = await chartEngine.solarReturn({ ...natal, year });
        } else {
          return failed(`Unsupported capability ${request.capability}.`, Date.now() - started);
        }

        return {
          agentId: manifest.id,
          status: "success",
          result: { chart },
          summary: `Computed ${request.capability} via the ASTRAEA chart engine (Immanuel / Swiss Ephemeris).`,
          assumptions: ["Tropical zodiac and Placidus houses unless houseSystem is provided."],
          warnings: [SYMBOLIC_INTERPRETATION_WARNING],
          evidence: [
            {
              kind: "repository",
              label: manifest.repository,
              href: "https://github.com/uset82/ASTROEA",
            },
            { kind: "capability", label: request.capability },
          ],
          runtimeMs: Date.now() - started,
        };
      } catch (error) {
        return failed(
          error instanceof Error ? error.message : "ASTRAEA chart engine failed",
          Date.now() - started,
        );
      }
    },
  });
};
