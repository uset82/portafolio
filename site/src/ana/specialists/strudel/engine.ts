import { inspectSandboxUrl } from "../../sandbox/network";

export type MusicGenerateInput = {
  prompt: string;
  bpm?: number;
};

export type MusicEngine = {
  health(): Promise<"healthy" | "unavailable">;
  generate(input: MusicGenerateInput): Promise<unknown>;
};

const postJson = async (url: string, body: unknown): Promise<unknown> => {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`StrudelAI API ${response.status}`);
  }
  return response.json() as Promise<unknown>;
};

export const unavailableMusicEngine = (): MusicEngine => ({
  health: async () => "unavailable",
  generate: async () => {
    throw new Error("StrudelAI music engine is not configured");
  },
});

export const httpMusicEngine = (baseUrl: string): MusicEngine => {
  const root = baseUrl.replace(/\/$/, "");
  return {
    health: async () => {
      try {
        const response = await fetch(root);
        return response.ok ? "healthy" : "unavailable";
      } catch {
        return "unavailable";
      }
    },
    generate: async (input) =>
      postJson(`${root}/api/agent`, {
        prompt: input.prompt,
        ...(input.bpm === undefined ? {} : { currentState: { bpm: input.bpm } }),
      }),
  };
};

export const createMusicEngineFromEnv = (
  env: Record<string, string | undefined> = process.env,
): MusicEngine => {
  const baseUrl = env.STRUDEL_API_URL?.trim();
  if (!baseUrl) return unavailableMusicEngine();
  const allowed = inspectSandboxUrl(baseUrl, { allowPrivateHosts: true });
  return allowed.ok ? httpMusicEngine(baseUrl) : unavailableMusicEngine();
};
