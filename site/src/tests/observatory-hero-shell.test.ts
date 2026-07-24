import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

function readSource(relativePath: string) {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

test("the homepage owns one complete semantic Observatory layer stack", () => {
  const home = readSource("src/app/page.tsx");
  const layout = readSource("src/app/layout.tsx");
  const progressive = readSource("src/components/three/observatory-progressive-experience.tsx");
  const canvas = readSource("src/components/three/three-canvas.tsx");

  const layerOrder = [
    home.indexOf("<SceneReveal>"),
    home.indexOf('className="editorial-field"'),
    home.indexOf("<CcAiPanel />"),
    home.indexOf('className="selected-systems"'),
    home.indexOf('className="editorial-section laboratory-section"'),
  ];

  assert.equal(
    layerOrder.every((position) => position >= 0),
    true,
  );
  assert.deepEqual(
    layerOrder,
    [...layerOrder].sort((left, right) => left - right),
  );
  assert.equal((home.match(/\/images\/observatory-poster\.png/g) ?? []).length, 1);
  assert.match(home, /<h1 id="hero-title">\{metadata\.headline\}<\/h1>/);
  assert.equal((home.match(/<ActionLink/g) ?? []).length >= 2, true);
  assert.match(home, /selectedSystems\.map/);

  assert.equal(layout.indexOf("<SiteHeader") < layout.indexOf("{children}"), true);
  assert.match(progressive, /<figure/);
  assert.match(progressive, /data-scene-layer="poster"/);
  assert.match(progressive, /data-scene-layer="canvas"/);
  assert.match(progressive, /data-scene-layer="status"/);
  assert.match(progressive, /aria-hidden=\{canvasIsReady\}/);
  assert.match(progressive, /aria-hidden=\{!canvasIsReady\}/);
  assert.match(canvas, /aria-describedby=\{accessibleDescriptionId\}/);
  assert.match(canvas, /frameloop=\{THREE_FRAMELOOP\}/);
  assert.match(canvas, /dpr=\{\[\.\.\.THREE_DPR_RANGE\]\}/);
});

test("the Observatory layer contract preserves palette, focus, reduced motion, and narrow reflow", () => {
  const styles = readSource("src/app/globals.css");

  assert.match(styles, /\.observatory-hero\s*\{[\s\S]*?isolation:\s*isolate/);
  assert.match(styles, /\.observatory-poster-layer\s*\{[\s\S]*?z-index:\s*0/);
  assert.match(styles, /\.observatory-canvas-layer\s*\{[\s\S]*?z-index:\s*1/);
  assert.match(styles, /\.editorial-field\s*\{[\s\S]*?z-index:\s*var\(--z-content\)/);
  assert.match(styles, /\.selected-systems\s*\{[\s\S]*?z-index:\s*var\(--z-content\)/);
  assert.match(styles, /\.cc-ai-trigger,[\s\S]*?z-index:\s*var\(--z-chat\)/);
  assert.match(styles, /\.primary-action,[\s\S]*?min-height:\s*var\(--control-height\)/);
  assert.match(styles, /\.selected-systems__list a\s*\{[\s\S]*?min-height:\s*4\.35rem/);
  assert.match(styles, /@media \(max-width: 39\.99rem\)[\s\S]*?\.observatory-hero/);
  assert.match(
    styles,
    /@media \(max-width: 47\.99rem\)[\s\S]*?\.observatory-artifact-access\[data-artifact-id="astraea"\]\s*\{[\s\S]*?right:\s*auto[\s\S]*?left:\s*var\(--page-gutter\)/,
  );
  assert.match(
    styles,
    /@media \(max-width: 47\.99rem\)[\s\S]*?\.scene-status\s*\{[\s\S]*?top:\s*var\(--page-gutter\)[\s\S]*?bottom:\s*auto/,
  );
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
});
