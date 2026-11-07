import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import test from "node:test";

function readSource(relativePath: string) {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

test("The Maya atom film is the lead visual on both Work routes", () => {
  const component = readSource("src/components/ca2m-atom-film.tsx");
  const englishWork = readSource("src/app/(en)/work/page.tsx");
  const spanishWork = readSource("src/app/(es)/es/work/page.tsx");
  const styles = readSource("src/app/globals.css");

  assert.match(component, /^"use client";/);
  assert.match(englishWork, /<Ca2mAtomFilm \/>/);
  assert.match(spanishWork, /<Ca2mAtomFilm locale="es" \/>/);

  // /work must show exactly ONE atom. The Maya film owns it; the interactive
  // instrument is gone, and only a link rail remains to reach the projects.
  assert.doesNotMatch(englishWork, /<ProjectOrbit/);
  assert.doesNotMatch(spanishWork, /<ProjectOrbit/);
  assert.match(englishWork, /<ProjectSystemsNav \/>/);
  assert.match(spanishWork, /<ProjectSystemsNav locale="es" \/>/);
  assert.ok(
    englishWork.indexOf("<Ca2mAtomFilm") < englishWork.indexOf("<ProjectSystemsNav"),
    "the film must lead the page, with the link rail below it",
  );

  // The section is visual only on /work. The heading survives for the document
  // outline and the landmark name, but it is never painted, and the eyebrow,
  // supporting line and caption are gone.
  assert.match(component, /className="visually-hidden"/);
  assert.doesNotMatch(component, /copy\.eyebrow/);
  assert.doesNotMatch(component, /copy\.line/);
  assert.doesNotMatch(component, /copy\.caption/);
  assert.doesNotMatch(component, /<figcaption/);

  // The still is the server-rendered first paint and the no-JS view.
  assert.match(component, /<Image/);
  assert.match(component, /alt=\{copy\.alt\}/);
  assert.match(component, /priority/);
  assert.match(component, /\/images\/ca2m-atom-maya-poster\.jpg/);
  assert.match(component, /\/videos\/ca2m-atom-maya\.mp4/);
  assert.match(component, /poster=\{FILM_POSTER\}/);

  // Motion is opt-in for reduced-motion and save-data visitors, and the clip
  // must never keep playing offscreen or in a hidden tab.
  assert.match(component, /prefers-reduced-motion: reduce/);
  assert.match(component, /saveData/);
  assert.match(component, /preload=\{canPlay \? "auto" : "none"\}/);
  assert.match(component, /IntersectionObserver/);
  assert.match(component, /visibilitychange/);
  assert.match(component, /loop/);
  assert.match(component, /playsInline/);
  assert.match(component, /aria-hidden="true"/);
  assert.match(component, /onClick=\{play\}/);

  assert.match(styles, /\.ca2m-atom-film__video\[data-visible="true"\]/);
  assert.match(styles, /\.project-systems__link/);
});

test("The Maya atom film ships local, size-bounded media and translated copy", () => {
  const video = path.join(process.cwd(), "public/videos/ca2m-atom-maya.mp4");
  const poster = path.join(process.cwd(), "public/images/ca2m-atom-maya-poster.jpg");

  assert.equal(existsSync(video), true, "the exported loop must be committed locally");
  assert.equal(existsSync(poster), true, "the poster must be committed locally");
  assert.ok(statSync(video).size < 5 * 1024 * 1024, "the loop stays below 5 MiB");
  assert.ok(statSync(poster).size < 400 * 1024, "the poster stays small enough for first paint");

  const copy = readSource("src/content/i18n/ui.ts");
  assert.equal((copy.match(/atomFilm: \{/g) ?? []).length, 2, "EN and ES both carry the copy");
  assert.match(copy, /title: "El átomo, reconstruido en Maya\."/);
});
