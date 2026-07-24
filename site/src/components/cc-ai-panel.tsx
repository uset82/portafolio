"use client";

import Link from "next/link";
import {
  type FormEvent,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useReducer,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import type { CcAiRequest, CcAiResponse } from "@/lib/ai/cc-ai-contract";
import { requestCcAi } from "@/lib/ai/cc-ai-client";
import {
  buildCcAiHistory,
  CC_AI_MAX_MESSAGE_LENGTH,
  ccAiUiReducer,
  getCcAiPresentationChunkSize,
  initialCcAiUiState,
  type CcAiUiStatus,
} from "@/lib/ai/cc-ai-ui-state";

import { AnimatedButton } from "./animate-ui/button";
import { CcMark } from "./cc-mark";

const prompts = [
  "Which projects best show Carlos’s AI work?",
  "What is the Observatory?",
  "Where can I explore sound and music?",
];

const privacyNote =
  "Do not share sensitive information. Questions are sent to a selected model provider to generate an answer and may be subject to that provider's processing terms. Carlos's private files are not available to this assistant.";

type CcAiTransport = (request: CcAiRequest, signal: AbortSignal) => Promise<CcAiResponse>;

type CcAiPanelProps = {
  transport?: CcAiTransport;
};

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "summary",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

const getLocale = () => {
  const locale = document.documentElement.lang || "en";
  return /^[a-z]{2}(?:-[A-Z]{2})?$/.test(locale) ? locale : "en";
};

const getStatusAnnouncement = (status: CcAiUiStatus) => {
  switch (status) {
    case "connecting":
      return "Connecting to CC AI.";
    case "presenting":
      return "Answer received. Presenting it now.";
    case "complete":
      return "Answer ready.";
    case "stopped":
      return "Answer stopped. Retry is available.";
    case "rate-limited":
    case "error":
    case "welcome":
      return "";
  }
};

export function CcAiPanel({ transport = requestCcAi }: CcAiPanelProps) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [mobileSheet, setMobileSheet] = useState(false);
  const [state, dispatch] = useReducer(ccAiUiReducer, initialCcAiUiState);
  const titleId = useId();
  const descriptionId = useId();
  const inputId = useId();
  const inputHelpId = useId();
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const requestControllerRef = useRef<AbortController | null>(null);
  const messageSequenceRef = useRef(0);
  const reducedMotion = useReducedMotion();
  const active = state.status === "connecting" || state.status === "presenting";

  const closePanel = useCallback(() => {
    if (requestControllerRef.current || state.status === "presenting") {
      requestControllerRef.current?.abort();
      requestControllerRef.current = null;
      dispatch({ type: "request/stop" });
    }
    setOpen(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }, [state.status]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 47.99rem)");
    const update = () => setMobileSheet(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!open) return;

    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
    const previousOverflow = document.body.style.overflow;
    if (mobileSheet) document.body.style.overflow = "hidden";

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closePanel();
        return;
      }

      if (!mobileSheet || event.key !== "Tab" || !panelRef.current) return;
      const controls = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(focusableSelector),
      );
      const first = controls.at(0);
      const last = controls.at(-1);
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [closePanel, mobileSheet, open]);

  useEffect(
    () => () => {
      requestControllerRef.current?.abort();
    },
    [],
  );

  useEffect(() => {
    if (state.status !== "presenting") return;
    const presenting = state.messages.find((message) => message.state === "presenting");
    if (!presenting?.fullContent) return;

    if (reducedMotion) {
      dispatch({ type: "response/reveal", characters: presenting.fullContent.length });
      return;
    }

    const interval = window.setInterval(() => {
      dispatch({
        type: "response/reveal",
        characters: getCcAiPresentationChunkSize(presenting.fullContent?.length ?? 0),
      });
    }, 32);
    return () => window.clearInterval(interval);
  }, [reducedMotion, state.messages, state.status]);

  useEffect(() => {
    const transcript = transcriptRef.current;
    if (!transcript) return;
    transcript.scrollTop = transcript.scrollHeight;
  }, [state.messages, state.status]);

  async function sendQuestion(nextQuestion: string, appendUser = true) {
    const message = nextQuestion.trim();
    if (
      !message ||
      active ||
      requestControllerRef.current ||
      message.length > CC_AI_MAX_MESSAGE_LENGTH
    ) {
      return;
    }

    const controller = new AbortController();
    requestControllerRef.current = controller;
    const sequence = ++messageSequenceRef.current;
    const requestId = `cc-ai-user-${sequence}`;
    const history = buildCcAiHistory(state.messages, message);
    dispatch({ type: "request/start", requestId, question: message, appendUser });
    setQuestion("");

    try {
      const response = await transport(
        {
          message,
          history,
          locale: getLocale(),
        },
        controller.signal,
      );
      if (controller.signal.aborted) return;

      if (response.ok) {
        dispatch({
          type: "request/succeed",
          messageId: `cc-ai-assistant-${sequence}`,
          response,
        });
      } else {
        dispatch({ type: "request/fail", error: response.error });
      }
    } catch (error) {
      if (controller.signal.aborted) {
        return;
      }
      const invalidResponse =
        error instanceof Error && error.message === "CC AI returned an invalid response.";
      dispatch({
        type: "request/fail",
        error: {
          code: invalidResponse ? "invalid_response" : "provider_unavailable",
          message: invalidResponse
            ? "CC AI returned an unreadable answer. Your portfolio navigation still works."
            : "CC AI could not reach the server. Your portfolio navigation still works.",
          retryable: true,
        },
      });
    } finally {
      if (requestControllerRef.current === controller) {
        requestControllerRef.current = null;
      }
    }
  }

  function stopRequest() {
    requestControllerRef.current?.abort();
    requestControllerRef.current = null;
    dispatch({ type: "request/stop" });
  }

  function clearConversation() {
    requestControllerRef.current?.abort();
    requestControllerRef.current = null;
    dispatch({ type: "conversation/clear" });
    setQuestion("");
    window.requestAnimationFrame(() => inputRef.current?.focus());
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendQuestion(question);
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  const statusAnnouncement = getStatusAnnouncement(state.status);
  const characterGuidance =
    question.length > 1_600
      ? `${CC_AI_MAX_MESSAGE_LENGTH - question.length} characters remaining.`
      : "Enter sends. Shift plus Enter adds a new line.";

  return (
    <AnimatePresence initial={false}>
      {!open ? (
        <AnimatedButton
          ref={triggerRef}
          key="cc-ai-trigger"
          className="cc-ai-trigger"
          type="button"
          aria-controls={panelId}
          aria-expanded="false"
          initial={{ opacity: 0, y: reducedMotion ? 0 : 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reducedMotion ? 0 : 8 }}
          onClick={() => setOpen(true)}
        >
          <CcMark compact />
          <span>
            <strong>Ask CC AI</strong>
            <small>Public portfolio guide</small>
          </span>
          <span className="cc-ai-trigger__preview">
            Explore Carlos’s verified public work, experiments, sound, and story.
          </span>
          <span className="cc-ai-trigger__prompt">Open the portfolio guide →</span>
        </AnimatedButton>
      ) : (
        <>
          <motion.div
            key="cc-ai-backdrop"
            className="cc-ai-backdrop"
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePanel}
          />
          <motion.section
            ref={panelRef}
            key="cc-ai-panel"
            id={panelId}
            className="cc-ai-panel"
            role="dialog"
            aria-modal={mobileSheet || undefined}
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            initial={{ opacity: 0, y: reducedMotion ? 0 : 14, scale: reducedMotion ? 1 : 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reducedMotion ? 0 : 14, scale: reducedMotion ? 1 : 0.985 }}
          >
            <span className="cc-ai-sheet-handle" aria-hidden="true" />
            <header>
              <span className="cc-ai-panel__title">
                <CcMark compact />
                <span>
                  <h2 id={titleId}>CC AI</h2>
                  <small id={descriptionId}>AI answers from Carlos’s public portfolio.</small>
                </span>
              </span>
              <button type="button" className="icon-control" onClick={closePanel}>
                Close
              </button>
            </header>

            <div
              ref={transcriptRef}
              className="cc-ai-transcript"
              role="log"
              aria-live="off"
              aria-busy={active}
              aria-label="Conversation with CC AI"
            >
              {state.messages.length === 0 ? (
                <div className="cc-ai-welcome">
                  <p>
                    I can help you explore Carlos’s verified public work, experiments, sound, and
                    story. What would you like to find?
                  </p>
                  <div className="suggested-prompts" aria-label="Suggested questions">
                    {prompts.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        disabled={active}
                        onClick={() => void sendQuestion(prompt)}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {state.messages.map((message) => (
                <article
                  key={message.id}
                  className="cc-ai-message"
                  data-role={message.role}
                  data-state={message.state}
                >
                  <span className="cc-ai-message__label">
                    {message.role === "assistant" ? "CC AI" : "You"}
                  </span>
                  <p>
                    {message.content}
                    {message.state === "presenting" ? (
                      <span className="cc-ai-response-cursor" aria-hidden="true" />
                    ) : null}
                  </p>
                  {message.state === "stopped" ? (
                    <small className="cc-ai-message__state">Answer stopped</small>
                  ) : null}
                </article>
              ))}

              {state.status === "connecting" ? (
                <div className="cc-ai-connecting" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                  <p>Connecting…</p>
                </div>
              ) : null}

              {state.error ? (
                <div
                  className="cc-ai-error"
                  data-code={state.error.code}
                  role={state.status === "rate-limited" ? "status" : "alert"}
                >
                  <strong>
                    {state.status === "rate-limited" ? "Please try again later" : "CC AI paused"}
                  </strong>
                  <p>{state.error.message}</p>
                  {state.error.code === "disabled" ? (
                    <p className="cc-ai-error__routes">
                      Continue with <Link href="/work">selected work</Link> or{" "}
                      <Link href="/story">Carlos’s story</Link>.
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>

            <span className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">
              {statusAnnouncement}
            </span>

            <div className="cc-ai-response-controls">
              {active ? (
                <button type="button" onClick={stopRequest}>
                  Stop
                </button>
              ) : null}
              {!active && state.error?.retryable && state.lastQuestion ? (
                <button
                  type="button"
                  disabled={state.status === "rate-limited"}
                  onClick={() => void sendQuestion(state.lastQuestion, false)}
                >
                  Retry
                </button>
              ) : null}
              {state.messages.length > 0 && !active ? (
                <button type="button" onClick={clearConversation}>
                  Clear conversation
                </button>
              ) : null}
            </div>

            <form className="cc-ai-form" onSubmit={submit}>
              <label htmlFor={inputId}>Ask about Carlos’s public portfolio</label>
              <div className="cc-ai-form__row">
                <textarea
                  ref={inputRef}
                  id={inputId}
                  value={question}
                  maxLength={CC_AI_MAX_MESSAGE_LENGTH}
                  rows={2}
                  aria-describedby={inputHelpId}
                  placeholder="Ask about work, AI systems, sound, or Carlos’s story"
                  onChange={(event) => setQuestion(event.target.value)}
                  onKeyDown={handleInputKeyDown}
                />
                <button
                  type="submit"
                  disabled={active || state.status === "rate-limited" || !question.trim()}
                >
                  Send
                </button>
              </div>
              <small id={inputHelpId}>{characterGuidance}</small>
            </form>

            <details className="cc-ai-disclosure">
              <summary>About this AI and privacy</summary>
              <p>{privacyNote}</p>
              {state.response ? (
                <div className="cc-ai-model-disclosure">
                  <p>
                    {state.response.model.variable
                      ? "Model selected automatically for availability and cost."
                      : "A configured model answered this question."}{" "}
                    Response model: <code>{state.response.model.responded}</code>.
                  </p>
                  <p>
                    The answer used {state.response.knowledge.records} approved public portfolio{" "}
                    {state.response.knowledge.records === 1 ? "record" : "records"}.
                    {state.response.truncated || state.response.knowledge.truncated
                      ? " Some context or output was shortened to stay within safety limits."
                      : ""}
                  </p>
                </div>
              ) : null}
            </details>
          </motion.section>
        </>
      )}
    </AnimatePresence>
  );
}
