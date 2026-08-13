export type AssistantChannel = "cc-ai" | "ana";

export type AssistantChannelSource =
  | "typed"
  | "cc-ai-prompt"
  | { kind: "exploration"; channel: AssistantChannel }
  | { kind: "retry"; lastChannel: AssistantChannel };

export const resolveAssistantChannel = (source: AssistantChannelSource): AssistantChannel => {
  if (source === "typed" || source === "cc-ai-prompt") return "cc-ai";
  if (source.kind === "exploration") return source.channel;
  return source.lastChannel;
};

export const invokeAssistantChannel = async <TCcAi, TAna>(options: {
  channel: AssistantChannel;
  sendCcAi: () => Promise<TCcAi>;
  sendAna: () => Promise<TAna>;
}): Promise<{ channel: "cc-ai"; result: TCcAi } | { channel: "ana"; result: TAna }> => {
  if (options.channel === "ana") {
    return { channel: "ana", result: await options.sendAna() };
  }
  return { channel: "cc-ai", result: await options.sendCcAi() };
};
