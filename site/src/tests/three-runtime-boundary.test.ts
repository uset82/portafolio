import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const workspaceRoot = process.cwd();
const packageJson = JSON.parse(readFileSync(path.join(workspaceRoot, "package.json"), "utf8")) as {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
};

function readSource(relativePath: string) {
  return readFileSync(path.join(workspaceRoot, relativePath), "utf8");
}

function collectTsxFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return collectTsxFiles(entryPath);
    }

    return entry.isFile() && entry.name.endsWith(".tsx") ? [entryPath] : [];
  });
}

test("Three.js runtime versions are exact and compatible with React 19", () => {
  assert.equal(packageJson.dependencies.three, "0.185.1");
  assert.equal(packageJson.dependencies["@react-three/fiber"], "9.6.1");
  assert.equal(packageJson.dependencies["@react-three/drei"], "10.7.7");
  assert.equal(packageJson.devDependencies["@types/three"], "0.185.1");
  assert.equal(packageJson.dependencies.react, "19.2.4");
  assert.equal(packageJson.dependencies["react-dom"], "19.2.4");
});

test("Canvas ownership is client-only, lazy, bounded, and demand-rendered", () => {
  const canvasSource = readSource("src/components/three/three-canvas.tsx");
  const lazySource = readSource("src/components/three/lazy-three-canvas.tsx");
  const policySource = readSource("src/components/three/runtime-policy.ts");

  assert.match(canvasSource, /^"use client";/);
  assert.match(lazySource, /^"use client";/);
  assert.match(lazySource, /ssr:\s*false/);
  assert.match(lazySource, /loading:\s*\(\) => null/);
  assert.match(canvasSource, /dpr=\{\[\.\.\.THREE_DPR_RANGE\]\}/);
  assert.match(canvasSource, /frameloop=\{THREE_FRAMELOOP\}/);
  assert.match(canvasSource, /fallback=\{fallback\}/);
  assert.match(policySource, /\[1, 1\.5\]/);
  assert.match(policySource, /"demand"/);
  assert.match(policySource, /preserveDrawingBuffer:\s*false/);
});

test("Drei usage is a named allowlist and app routes do not import WebGL packages directly", () => {
  const dreiSource = readSource("src/components/three/drei-tools.ts");

  for (const approvedUtility of ["Html", "PerformanceMonitor", "Preload", "useGLTF", "useKTX2"]) {
    assert.match(dreiSource, new RegExp(`\\b${approvedUtility}\\b`));
  }

  assert.doesNotMatch(dreiSource, /export\s+\*/);

  for (const routeFile of collectTsxFiles(path.join(workspaceRoot, "src/app"))) {
    const routeSource = readFileSync(routeFile, "utf8");
    assert.doesNotMatch(
      routeSource,
      /from\s+["'](?:three|@react-three\/)/,
      `${path.relative(workspaceRoot, routeFile)} must use the lazy project boundary`,
    );
  }
});
