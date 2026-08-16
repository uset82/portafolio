import assert from "node:assert/strict";
import test from "node:test";

import {
  parseArtifactsFromMessage,
} from "../components/artifacts/artifact-parser";
import {
  buildSandboxHtml,
} from "../components/artifacts/artifact-sandbox";

test("artifact parser detects explicit <artifact> tags with attributes and code", () => {
  const message = `Here is a custom Pomodoro Timer for you:

<artifact identifier="pomodoro-timer" type="application/react" title="Pomodoro Timer App">
\`\`\`tsx
import React, { useState } from "react";
import { Play, Pause, RefreshCw } from "lucide-react";

export default function PomodoroApp() {
  const [seconds, setSeconds] = useState(1500);
  return (
    <div className="p-4 bg-stone-900 text-white rounded">
      <h1>Timer: {seconds}</h1>
    </div>
  );
}
\`\`\`
</artifact>

Let me know if you want to add alarm sounds!`;

  const { segments, artifacts } = parseArtifactsFromMessage(message);

  assert.equal(artifacts.length, 1);
  assert.equal(artifacts[0].id, "pomodoro-timer");
  assert.equal(artifacts[0].type, "application/react");
  assert.equal(artifacts[0].title, "Pomodoro Timer App");
  assert.match(artifacts[0].code, /export default function PomodoroApp/);

  assert.equal(segments.length, 3);
  assert.equal(segments[0].type, "text");
  assert.equal(segments[1].type, "artifact");
  assert.equal(segments[2].type, "text");
});

test("artifact parser detects standalone React code blocks as interactive artifacts", () => {
  const message = `Sure! Here is the component:

\`\`\`tsx
export default function RetroPad() {
  return <div className="grid grid-cols-4 gap-2"><button>Beat 1</button></div>;
}
\`\`\`
`;

  const { artifacts } = parseArtifactsFromMessage(message);
  assert.equal(artifacts.length, 1);
  assert.equal(artifacts[0].type, "application/react");
  assert.match(artifacts[0].code, /export default function RetroPad/);
});

test("sandbox html builder constructs complete React 19 + Tailwind + Lucide environment", () => {
  const artifact = {
    id: "test-app",
    type: "application/react" as const,
    title: "Test Application",
    code: `export default function App() { return <div className="text-amber-400">Hello World</div>; }`,
    language: "tsx",
    raw: "",
  };

  const html = buildSandboxHtml(artifact);

  assert.match(html, /<!DOCTYPE html>/i);
  assert.match(html, /cdn\.tailwindcss\.com/);
  assert.match(html, /react@19/);
  assert.match(html, /react-dom@19/);
  assert.match(html, /@babel\/standalone/);
  assert.match(html, /unpkg\.com\/lucide/);
  assert.match(html, /ReactDOM\.createRoot/);
  assert.match(html, /ErrorBoundary/);
  assert.match(html, /Hello World/);
});

test("sandbox html builder handles plain text/html artifacts", () => {
  const artifact = {
    id: "html-page",
    type: "text/html" as const,
    title: "Static Page",
    code: `<main class="p-6"><h1>Landing Page</h1></main>`,
    language: "html",
    raw: "",
  };

  const html = buildSandboxHtml(artifact);
  assert.match(html, /<main class="p-6"><h1>Landing Page<\/h1><\/main>/);
  assert.match(html, /cdn\.tailwindcss\.com/);
});
