import type { CcAiErrorCode, CcAiRequest, CcAiSuccessResponse } from "./cc-ai-contract";

export const CC_AI_MAX_MESSAGE_LENGTH = 2_000;
export const CC_AI_MAX_HISTORY_TURNS = 8;

export type CcAiUiStatus =
  "welcome" | "connecting" | "presenting" | "complete" | "stopped" | "error" | "rate-limited";

export type CcAiUiMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  fullContent?: string;
  state: "complete" | "presenting" | "stopped";
};

export type CcAiUiError = {
  code: CcAiErrorCode;
  message: string;
  retryable: boolean;
};

export type CcAiResponseMetadata = Pick<
  CcAiSuccessResponse,
  "requestId" | "truncated" | "model" | "knowledge"
>;

export type CcAiUiState = {
  status: CcAiUiStatus;
  messages: CcAiUiMessage[];
  lastQuestion: string;
  error?: CcAiUiError;
  response?: CcAiResponseMetadata;
};

export type CcAiUiAction =
  | {
      type: "request/start";
      requestId: string;
      question: string;
      appendUser: boolean;
    }
  | {
      type: "request/succeed";
      messageId: string;
      response: CcAiSuccessResponse;
    }
  | { type: "response/reveal"; characters: number }
  | { type: "request/stop" }
  | { type: "request/fail"; error: CcAiUiError }
  | { type: "conversation/clear" };

export const initialCcAiUiState: CcAiUiState = {
  status: "welcome",
  messages: [],
  lastQuestion: "",
};

const updatePresentingMessage = (
  messages: readonly CcAiUiMessage[],
  characters: number,
): { messages: CcAiUiMessage[]; complete: boolean } => {
  let completed = false;
  const next = messages.map((message) => {
    if (message.role !== "assistant" || message.state !== "presenting" || !message.fullContent) {
      return message;
    }

    const end = Math.min(message.fullContent.length, message.content.length + characters);
    completed = end === message.fullContent.length;
    if (completed) {
      return {
        id: message.id,
        role: message.role,
        content: message.fullContent.slice(0, end),
        state: "complete" as const,
      };
    }
    return {
      ...message,
      content: message.fullContent.slice(0, end),
    };
  });

  return { messages: next, complete: completed };
};

export function ccAiUiReducer(state: CcAiUiState, action: CcAiUiAction): CcAiUiState {
  switch (action.type) {
    case "request/start": {
      const userMessage: CcAiUiMessage = {
        id: action.requestId,
        role: "user",
        content: action.question,
        state: "complete",
      };
      return {
        status: "connecting",
        messages: action.appendUser ? [...state.messages, userMessage] : state.messages,
        lastQuestion: action.question,
      };
    }
    case "request/succeed":
      return {
        status: "presenting",
        lastQuestion: state.lastQuestion,
        response: {
          requestId: action.response.requestId,
          truncated: action.response.truncated,
          model: action.response.model,
          knowledge: action.response.knowledge,
        },
        messages: [
          ...state.messages,
          {
            id: action.messageId,
            role: "assistant",
            content: "",
            fullContent: action.response.answer,
            state: "presenting",
          },
        ],
      };
    case "response/reveal": {
      const revealed = updatePresentingMessage(state.messages, Math.max(1, action.characters));
      return {
        ...state,
        messages: revealed.messages,
        status: revealed.complete ? "complete" : state.status,
      };
    }
    case "request/stop":
      return {
        ...state,
        status: "stopped",
        error: {
          code: "aborted",
          message: "Answer stopped. You can retry the same question.",
          retryable: true,
        },
        messages: state.messages.map((message) => {
          if (message.state !== "presenting") return message;
          return {
            id: message.id,
            role: message.role,
            content: message.content,
            state: "stopped" as const,
          };
        }),
      };
    case "request/fail":
      return {
        ...state,
        status: action.error.code === "rate_limited" ? "rate-limited" : "error",
        error: action.error,
      };
    case "conversation/clear":
      return initialCcAiUiState;
  }
}

export function buildCcAiHistory(
  messages: readonly CcAiUiMessage[],
  currentQuestion: string,
): CcAiRequest["history"] {
  const history = messages
    .filter((message) => message.state === "complete" && message.content.trim())
    .map(({ role, content }) => ({
      role,
      content: content.trim().slice(0, CC_AI_MAX_MESSAGE_LENGTH),
    }));

  const last = history.at(-1);
  if (last?.role === "user" && last.content === currentQuestion.trim()) {
    history.pop();
  }

  return history.slice(-CC_AI_MAX_HISTORY_TURNS);
}

export function getCcAiPresentationChunkSize(answerLength: number) {
  return Math.max(6, Math.min(80, Math.ceil(answerLength / 90)));
}
