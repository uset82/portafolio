import { inspectSandboxUrl } from "../../sandbox/network";

export type NatalChartInput = {
  dateTime: string;
  latitude: number;
  longitude: number;
  houseSystem: string;
};

export type TransitChartInput = NatalChartInput & { transitDateTime: string };

export type SynastryChartInput = {
  person1: NatalChartInput;
  person2: NatalChartInput;
};

export type SolarReturnInput = NatalChartInput & { year: number };

export type ChartEngine = {
  health(): Promise<"healthy" | "unavailable">;
  natal(input: NatalChartInput): Promise<unknown>;
  transits(input: TransitChartInput): Promise<unknown>;
  synastry(input: SynastryChartInput): Promise<unknown>;
  solarReturn(input: SolarReturnInput): Promise<unknown>;
};

export type InterpretEngine = {
  interpret(input: { chart: unknown; focusArea?: string }): Promise<unknown>;
};

const postJson = async (url: string, body: unknown): Promise<unknown> => {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`ASTRAEA API ${response.status}`);
  }
  return response.json() as Promise<unknown>;
};

export const unavailableChartEngine = (): ChartEngine => ({
  health: async () => "unavailable",
  natal: async () => {
    throw new Error("ASTRAEA chart engine is not configured");
  },
  transits: async () => {
    throw new Error("ASTRAEA chart engine is not configured");
  },
  synastry: async () => {
    throw new Error("ASTRAEA chart engine is not configured");
  },
  solarReturn: async () => {
    throw new Error("ASTRAEA chart engine is not configured");
  },
});

export const httpChartEngine = (baseUrl: string): ChartEngine => {
  const root = baseUrl.replace(/\/$/, "");
  return {
    health: async () => {
      try {
        const response = await fetch(`${root}/health`);
        return response.ok ? "healthy" : "unavailable";
      } catch {
        return "unavailable";
      }
    },
    natal: async (input) =>
      postJson(`${root}/api/charts/natal`, {
        date_time: input.dateTime,
        latitude: input.latitude,
        longitude: input.longitude,
        house_system: input.houseSystem,
      }),
    transits: async (input) =>
      postJson(`${root}/api/charts/transit`, {
        natal_date_time: input.dateTime,
        natal_latitude: input.latitude,
        natal_longitude: input.longitude,
        transit_date_time: input.transitDateTime,
        house_system: input.houseSystem,
      }),
    synastry: async (input) =>
      postJson(`${root}/api/charts/synastry`, {
        person1_date_time: input.person1.dateTime,
        person1_latitude: input.person1.latitude,
        person1_longitude: input.person1.longitude,
        person2_date_time: input.person2.dateTime,
        person2_latitude: input.person2.latitude,
        person2_longitude: input.person2.longitude,
        house_system: input.person1.houseSystem,
      }),
    solarReturn: async (input) =>
      postJson(`${root}/api/charts/solar-return`, {
        natal_date_time: input.dateTime,
        latitude: input.latitude,
        longitude: input.longitude,
        year: input.year,
        house_system: input.houseSystem,
      }),
  };
};

export const createChartEngineFromEnv = (
  env: Record<string, string | undefined> = process.env,
): ChartEngine => {
  const baseUrl = env.ASTRAEA_API_URL?.trim();
  if (!baseUrl) return unavailableChartEngine();
  const allowed = inspectSandboxUrl(baseUrl, { allowPrivateHosts: true });
  return allowed.ok ? httpChartEngine(baseUrl) : unavailableChartEngine();
};
