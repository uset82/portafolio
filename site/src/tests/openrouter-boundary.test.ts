import assert from "node:assert/strict";
import test from "node:test";

import {
  buildOpenRouterOptions,
  instantiateOpenRouterClient,
  OPENROUTER_APP_TITLE,
  OpenRouterConfigurationError,
} from "@/lib/ai/openrouter-boundary";

test("OpenRouter configuration requires a server key without exposing its value", () => {
  assert.throws(
    () => buildOpenRouterOptions({}),
    (error: unknown) =>
      error instanceof OpenRouterConfigurationError &&
      error.message ===
        "CC AI is unavailable because OPENROUTER_API_KEY is not configured on the server.",
  );
});

test("OpenRouter configuration includes approved attribution metadata", () => {
  const options = buildOpenRouterOptions({
    OPENROUTER_API_KEY: "test-key",
    NEXT_PUBLIC_SITE_URL: "https://portfolio.example/story?preview=true",
  });

  assert.equal(options.apiKey, "test-key");
  assert.equal(options.appTitle, OPENROUTER_APP_TITLE);
  assert.equal(options.httpReferer, "https://portfolio.example");
  assert.equal(options.debugLogger, undefined);
});

test("OpenRouter configuration rejects unsafe attribution URLs", () => {
  assert.throws(
    () =>
      buildOpenRouterOptions({
        OPENROUTER_API_KEY: "test-key",
        NEXT_PUBLIC_SITE_URL: "javascript:alert(1)",
      }),
    OpenRouterConfigurationError,
  );
});

test("OpenRouter client construction accepts a deterministic test factory", () => {
  const options = buildOpenRouterOptions({ OPENROUTER_API_KEY: "test-key" });
  const fakeClient = { kind: "fake-openrouter-client" } as const;
  let receivedOptions: typeof options | undefined;

  const client = instantiateOpenRouterClient(options, (received) => {
    receivedOptions = received;
    return fakeClient;
  });

  assert.equal(client, fakeClient);
  assert.equal(receivedOptions, options);
});

test("the OpenRouter app title stays HTTP-header safe", () => {
  // X-Title is sent as an HTTP header; any character above U+00FF throws
  // "Cannot convert argument to a ByteString" before the request leaves the
  // process, which surfaced to visitors as a provider outage.
  assert.match(OPENROUTER_APP_TITLE, /^[ -~]*$/);

  const options = buildOpenRouterOptions({ OPENROUTER_API_KEY: "test-key" });
  assert.equal(options.appTitle, OPENROUTER_APP_TITLE);
  assert.doesNotThrow(() => new Headers({ "X-Title": String(options.appTitle) }));
});
