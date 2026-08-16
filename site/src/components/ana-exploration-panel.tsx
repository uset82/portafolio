"use client";

import type { AnaExplorationPrompt } from "@/lib/ai/ana-exploration";
import type { ObservatorySpecialistStatus } from "@/lib/ai/ana-exploration";

type AnaExplorationPanelProps = {
  prompts: readonly AnaExplorationPrompt[];
  statuses: readonly ObservatorySpecialistStatus[];
  disabled?: boolean;
  onPrompt?: (prompt: AnaExplorationPrompt) => void;
};

export function AnaExplorationPanel({
  prompts,
  statuses,
  disabled = false,
  onPrompt,
}: AnaExplorationPanelProps) {
  if (statuses.length === 0 && prompts.length === 0) {
    return null;
  }

  return (
    <div className="ana-exploration">
      {statuses.length > 0 ? (
        <>
          <p className="ana-exploration__kicker">Observatory specialists</p>
          <p className="ana-exploration__note">Status only — not separate chatbots.</p>
          <ul className="ana-status" aria-label="Observatory specialist status">
            {statuses.map((entry) => (
              <li
                key={entry.agentId}
                data-state={entry.state}
                data-artifact={entry.artifactId}
                data-agent={entry.agentId}
              >
                <span className="ana-status__dot" aria-hidden="true" />
                <span>{entry.label}</span>
                <span>{entry.state === "active" ? "active" : "standby"}</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}
      {prompts.length > 0 ? (
        <div className="suggested-prompts" aria-label="ANA exploration prompts">
          <p className="ana-exploration__kicker">What can I help you explore?</p>
          {prompts.map((prompt) => (
            <button
              key={prompt.id}
              type="button"
              disabled={disabled}
              data-channel={prompt.channel}
              onClick={() => onPrompt?.(prompt)}
            >
              {prompt.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
