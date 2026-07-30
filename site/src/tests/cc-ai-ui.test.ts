import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { CcAiPanel } from "@/components/cc-ai-panel";
import { isCcAiResponse, requestCcAi } from "@/lib/ai/cc-ai-client";
import type { CcAiSuccessResponse } from "@/lib/ai/cc-ai-contract";
import {
  buildCcAiHistory,
  ccAiUiReducer,
  getCcAiPresentationChunkSize,
  initialCcAiUiState,
  type CcAiUiMessage,
} from "@/lib/ai/cc-ai-ui-state";

const successResponse: CcAiSuccessResponse = {
  ok: true,
  requestId: "00000000-0000-4000-8000-000000000033",
  answer: "A verified public answer.",
  truncated: false,
  model: {
    requested: "openrouter/free",
    fallbacks: [],
    responded: "example/free-model",
    selection: "free-router",
    variable: true,
  },
  knowledge: {
    records: 2,
    sourceIds: ["project-one", "project-two"],
    truncated: false,
  },
};

test("CC AI history remains bounded and never duplicates the retried question", () => {
  const messages: CcAiUiMessage[] = Array.from({ length: 10 }, (_, index) => ({
    id: `message-${index}`,
    role: index % 2 === 0 ? "user" : "assistant",
    content: `Turn ${index}`,
    state: "complete",
  }));
  messages.push({
    id: "current-question",
    role: "user",
    content: "Retry this question",
    state: "complete",
  });

  const history = buildCcAiHistory(messages, "Retry this question");

  assert.equal(history.length, 8);
  assert.deepEqual(history.at(-1), { role: "assistant", content: "Turn 9" });
  assert.equal(
    history.some(({ content }) => content === "Retry this question"),
    false,
  );

  const boundedContent = buildCcAiHistory(
    [
      {
        id: "long-answer",
        role: "assistant",
        content: "a".repeat(4_000),
        state: "complete",
      },
    ],
    "Next question",
  );
  assert.equal(boundedContent[0]?.content.length, 2_000);
});

test("CC AI state presents a complete response progressively and discloses its metadata", () => {
  const connecting = ccAiUiReducer(initialCcAiUiState, {
    type: "request/start",
    requestId: "question-1",
    question: "What is the Observatory?",
    appendUser: true,
  });
  const presenting = ccAiUiReducer(connecting, {
    type: "request/succeed",
    messageId: "answer-1",
    response: successResponse,
  });

  assert.equal(connecting.status, "connecting");
  assert.equal(presenting.status, "presenting");
  assert.equal(presenting.messages.at(-1)?.content, "");
  assert.equal(presenting.response?.model.responded, "example/free-model");

  const partial = ccAiUiReducer(presenting, { type: "response/reveal", characters: 4 });
  const complete = ccAiUiReducer(partial, {
    type: "response/reveal",
    characters: successResponse.answer.length,
  });

  assert.equal(partial.messages.at(-1)?.content, "A ve");
  assert.equal(complete.status, "complete");
  assert.equal(complete.messages.at(-1)?.content, successResponse.answer);
  assert.equal(complete.messages.at(-1)?.fullContent, undefined);
  assert.ok(getCcAiPresentationChunkSize(12_000) <= 80);
});

test("CC AI stop and rate-limit states remain explicit and retry-safe", () => {
  const connecting = ccAiUiReducer(initialCcAiUiState, {
    type: "request/start",
    requestId: "question-1",
    question: "Question",
    appendUser: true,
  });
  const stopped = ccAiUiReducer(connecting, { type: "request/stop" });
  const rateLimited = ccAiUiReducer(connecting, {
    type: "request/fail",
    error: {
      code: "rate_limited",
      message: "Please try again later.",
      retryable: true,
    },
  });
  const retried = ccAiUiReducer(stopped, {
    type: "request/start",
    requestId: "question-2",
    question: "Question",
    appendUser: false,
  });

  assert.equal(stopped.status, "stopped");
  assert.equal(stopped.error?.code, "aborted");
  assert.equal(rateLimited.status, "rate-limited");
  assert.equal(retried.messages.filter(({ role }) => role === "user").length, 1);
});

test("CC AI browser transport sends only the public request contract and validates responses", async () => {
  const controller = new AbortController();
  let sentBody = "";
  const response = await requestCcAi(
    { message: "Question", history: [], locale: "en" },
    controller.signal,
    async (_input, init) => {
      sentBody = String(init?.body);
      assert.equal(init?.method, "POST");
      assert.equal(init?.cache, "no-store");
      assert.equal(init?.signal, controller.signal);
      return { json: async () => successResponse };
    },
  );

  assert.equal(response.ok, true);
  assert.deepEqual(JSON.parse(sentBody), {
    message: "Question",
    history: [],
    locale: "en",
  });
  assert.equal(isCcAiResponse({ ok: true, requestId: "x", answer: "" }), false);
  assert.equal(isCcAiResponse(successResponse), true);

  await assert.rejects(
    () =>
      requestCcAi(
        { message: "Question", history: [], locale: "en" },
        controller.signal,
        async () => ({ json: async () => ({ ok: true, requestId: "incomplete" }) }),
      ),
    /invalid response/,
  );
});

test("CC AI shell and source contracts preserve disclosure, focus, motion, and mobile fallback", () => {
  const markup = renderToStaticMarkup(createElement(CcAiPanel));
  const component = readFileSync(
    path.join(process.cwd(), "src/components/cc-ai-panel.tsx"),
    "utf8",
  );
  const styles = readFileSync(path.join(process.cwd(), "src/app/globals.css"), "utf8");

  assert.match(markup, /<button[^>]+class="cc-ai-trigger"[^>]+aria-expanded="false"/);
  assert.match(markup, /Ask CC AI/);
  assert.match(component, /role="dialog"/);
  assert.match(component, /role="log"/);
  assert.match(component, /aria-live="off"/);
  assert.match(component, /aria-live="polite"/);
  assert.match(component, /new AbortController\(\)/);
  assert.match(component, />\s*Stop\s*</);
  assert.match(component, />\s*Retry\s*</);
  assert.match(component, /Shift plus Enter adds a new line/);
  assert.match(component, /Model selected automatically for availability and cost/);
  assert.match(component, /Do not share sensitive information/);
  assert.match(component, /Carlos's private files are not available/);
  assert.match(component, /matchMedia\("\(max-width: 47\.99rem\)"\)/);
  assert.match(component, /document\.body\.style\.overflow = "hidden"/);
  assert.match(component, /"summary",[\s\S]*"\[tabindex\]:not/);
  assert.doesNotMatch(component, /dangerouslySetInnerHTML/);
  // Roomy on desktop but still bounded by the viewport so the panel can never
  // outgrow the screen it floats over.
  assert.match(styles, /\.cc-ai-panel[^}]*width:\s*min\(40rem,/);
  assert.match(styles, /\.cc-ai-panel[^}]*max-height:\s*min\(calc\(100svh - 9\.5rem\), 42rem\)/);
  assert.match(
    styles,
    /@media \(max-width: 47\.99rem\)[\s\S]*?\.cc-ai-panel[^}]*height:\s*min\(86svh, 48rem\)/,
  );
  // The assistant carries Carlos's approved monogram, not a typographic stand-in.
  assert.match(component, /<BrandMark compact \/>/);
  assert.doesNotMatch(component, /CcMark/);
  assert.match(styles, /\.brand-mark--compact\s*\{[^}]*width:\s*2\.4rem/);
  assert.match(
    styles,
    /@media \(max-width: 47\.99rem\)[\s\S]*?\.observatory-hero \.cc-ai-trigger\s*\{[^}]*bottom:\s*calc\(var\(--page-gutter\) \+ var\(--control-height\) \+ 1rem\)/,
  );
  assert.match(
    styles,
    /\.cc-ai-response-controls button[^}]*min-height:\s*var\(--control-height\)/,
  );
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
});
