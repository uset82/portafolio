import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { CosmosMark } from "@/components/cosmos-mark";

test("Cosmos mark ticks use fixed SVG coordinates so server and client HTML match", () => {
  const source = readFileSync(path.join(process.cwd(), "src/components/cosmos-mark.tsx"), "utf8");
  const markup = renderToStaticMarkup(createElement(CosmosMark));
  const ticks = markup.match(/class="cosmos-mark__tick"[^>]*>/g) ?? [];

  assert.match(source, /function svgCoord\(value: number\): string/);
  assert.match(source, /value\.toFixed\(4\)/);
  assert.equal(ticks.length, 24);
  for (const tick of ticks) {
    assert.match(tick, /x1="-?\d+\.\d{4}"/);
    assert.match(tick, /y1="-?\d+\.\d{4}"/);
    assert.match(tick, /x2="-?\d+\.\d{4}"/);
    assert.match(tick, /y2="-?\d+\.\d{4}"/);
    assert.doesNotMatch(tick, /[xy][12]="[^"]*\.\d{5}/);
  }
  assert.doesNotMatch(markup, /11\.37526699121404/);
});
