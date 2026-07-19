"use client";

import { useId, useRef, useState } from "react";

import { AnimatedButton } from "./animate-ui/button";
import { CcMark } from "./cc-mark";

const prompts = [
  "Which projects best show Carlos’s AI work?",
  "What is the Observatory?",
  "Where can I explore sound and music?",
];

export function CcAiPanel() {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  function openPanel() {
    setOpen(true);
    window.setTimeout(() => closeButtonRef.current?.focus(), 0);
  }

  if (!open) {
    return (
      <AnimatedButton className="cc-ai-trigger" type="button" onClick={openPanel}>
        <CcMark compact />
        <span>
          <strong>Ask CC AI</strong>
          <small>Public portfolio guide</small>
        </span>
        <p className="cc-ai-trigger__preview">
          Explore Carlos’s verified public work, experiments, sound, and story.
        </p>
        <span className="cc-ai-trigger__prompt">Open the portfolio guide →</span>
      </AnimatedButton>
    );
  }

  return (
    <section className="cc-ai-panel" aria-labelledby={titleId}>
      <header>
        <span className="cc-ai-panel__title">
          <CcMark compact />
          <span>
            <strong id={titleId}>CC AI</strong>
            <small>Public portfolio guide</small>
          </span>
        </span>
        <button
          ref={closeButtonRef}
          type="button"
          className="icon-control"
          onClick={() => setOpen(false)}
        >
          Close
        </button>
      </header>

      <div className="cc-ai-transcript" role="log" aria-live="polite">
        <p className="assistant-message">
          I can help you explore Carlos’s verified public work, experiments, sound, and story. What
          would you like to find?
        </p>
        <div className="suggested-prompts" aria-label="Suggested questions">
          {prompts.map((prompt) => (
            <button key={prompt} type="button" disabled title="Chat service is not connected yet">
              {prompt}
            </button>
          ))}
        </div>
      </div>

      <form className="cc-ai-form" onSubmit={(event) => event.preventDefault()}>
        <label className="visually-hidden" htmlFor="cc-ai-question">
          Ask about Carlos’s public portfolio
        </label>
        <input
          id="cc-ai-question"
          type="text"
          placeholder="Chat connection follows the verified knowledge review"
          disabled
        />
        <button type="submit" disabled>
          Send
        </button>
      </form>
      <p className="cc-ai-note">
        Prototype shell — the model service stays off until its public knowledge and privacy
        settings are approved.
      </p>
    </section>
  );
}
