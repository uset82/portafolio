import { createAnaStatusEvent, type AnaStatusEvent } from "@/lib/ai/ana-status";
import type { AnaTraceEvent } from "./schemas";

export type AnaStatusListener = (event: AnaStatusEvent) => void;

const TERMINAL_TRACE = new Set<AnaTraceEvent["event"]>([
  "success",
  "failed",
  "timeout",
  "cancelled",
  "skipped-cost",
]);

export const createAnaStatusEmitter = (options: {
  requestId: string;
  traceId: string;
  onStatus?: AnaStatusListener;
}) => {
  const active = new Set<string>();

  const emit = (input: {
    agentId: string;
    phase: AnaStatusEvent["phase"];
    capability?: string;
  }) => {
    if (!options.onStatus) return;
    options.onStatus(
      createAnaStatusEvent({
        requestId: options.requestId,
        traceId: options.traceId,
        agentId: input.agentId,
        phase: input.phase,
        active: [...active],
        ...(input.capability ? { capability: input.capability } : {}),
      }),
    );
  };

  return {
    understanding() {
      emit({ agentId: "ana", phase: "understanding" });
    },
    planning() {
      emit({ agentId: "ana", phase: "planning" });
    },
    combining() {
      active.clear();
      emit({ agentId: "ana", phase: "combining" });
    },
    fromTrace(event: AnaTraceEvent) {
      if (event.event === "start") {
        active.add(event.agentId);
        emit({ agentId: event.agentId, phase: "running", capability: event.capability });
        return;
      }
      if (TERMINAL_TRACE.has(event.event)) {
        active.delete(event.agentId);
      }
    },
  };
};
