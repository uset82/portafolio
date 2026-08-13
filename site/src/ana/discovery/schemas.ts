export type DiscoveryDocument = {
  id: string;
  repository: string;
  text: string;
  executable: boolean;
  agentId?: string;
  capability?: string;
  domainAgentId?: string;
  fields: {
    description?: string;
    capabilities?: string;
    readme?: string;
    apiSchema?: string;
    toolDescription?: string;
  };
};

export type DiscoveryHit = {
  id: string;
  repository: string;
  score: number;
  source: "embedding" | "keyword";
  executable: boolean;
  agentId?: string;
  capability?: string;
  domainAgentId?: string;
};

export type DiscoveryIndex = {
  documents: readonly DiscoveryDocument[];
};

export type EmbeddingEngine = {
  available: () => boolean | Promise<boolean>;
  embed: (texts: readonly string[]) => Promise<readonly (readonly number[])[]>;
};
