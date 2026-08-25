import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { ContactPath } from "@/components/contact-path";
import { rawSiteContent } from "@/content/records";
import { siteContentSchema } from "@/content/schemas";

test("Contact exposes one verified public profile without inventing a direct contact channel", () => {
  const content = siteContentSchema.parse(rawSiteContent).metadata.footer;
  const markup = renderToStaticMarkup(createElement(ContactPath, { content }));

  assert.match(markup, /<main id="main-content" class="contact-path">/);
  assert.match(markup, /Let’s turn a difficult idea into a working system\./);
  assert.match(markup, /Open call, one public route/);
  assert.match(markup, /One verified profile\. No hidden inbox\./);
  assert.match(markup, /href="https:\/\/github\.com\/uset82"/);
  assert.equal((markup.match(/href="https:\/\/github\.com\/uset82"/g) ?? []).length, 1);
  assert.match(markup, /not as a response-time, availability, employment, or booking promise/);
  assert.equal((markup.match(/<dt>/g) ?? []).length, 4);
  assert.match(markup, /Public email/);
  assert.match(markup, /Not published/);
  assert.match(markup, /href="\/work"/);
  assert.match(markup, /href="\/story"/);
  assert.doesNotMatch(markup, /<(?:form|input|textarea|select|button|address)\b/);
  assert.doesNotMatch(markup, /(?:mailto:|tel:|street address|phone number)/i);
});

test("Contact makes the OpenEyes offer through public GitHub issues, not an inbox", () => {
  const content = siteContentSchema.parse(rawSiteContent).metadata.footer;
  const markup = renderToStaticMarkup(createElement(ContactPath, { content }));

  assert.match(markup, /Open call \/ 00/);
  assert.match(markup, /What valuable opportunity is already right in front of you/);
  assert.match(markup, /Bring an opportunity, not an idea\./);
  assert.match(markup, /One open role: a complementary co-founder\./);

  // Both asks land on the public intake repository rather than on a local route.
  assert.match(
    markup,
    /href="https:\/\/github\.com\/uset82\/openeyes\/issues\/new\?template=opportunity\.yml"/,
  );
  assert.match(
    markup,
    /href="https:\/\/github\.com\/uset82\/openeyes\/issues\/new\?template=co-founder\.yml"/,
  );

  // The offer must not turn OpenEyes into a claim the portfolio cannot support.
  assert.match(markup, /a proposal in progress, not a funded programme/);
  assert.doesNotMatch(markup, /(?:funded by|backed by|in partnership with|accepted into)/i);

  // The boundary rows stay honest now that one availability claim exists.
  assert.match(markup, /One open role, stated/);
  assert.doesNotMatch(markup, /<(?:form|input|textarea|select|button|address)\b/);
  assert.doesNotMatch(markup, /(?:mailto:|tel:)/i);
});

test("Contact keeps a cardless responsive hierarchy with touch and reduced-motion safeguards", () => {
  const page = readFileSync(path.join(process.cwd(), "src/app/(en)/contact/page.tsx"), "utf8");
  const styles = readFileSync(path.join(process.cwd(), "src/app/globals.css"), "utf8");

  assert.match(page, /<ContactPath/);
  assert.match(styles, /\.contact-path__hero:focus-within \.contact-path__signal/);
  assert.match(styles, /\.contact-path__hero:hover \.contact-path__signal/);
  assert.match(styles, /\.contact-path__privacy dl > div\s*\{[\s\S]*?min-height:\s*5\.25rem/);
  assert.match(styles, /@media \(max-width: 47\.99rem\)[\s\S]*?\.contact-path__hero/);
  assert.match(styles, /\.contact-path__continuation \.ui-action\s*\{[\s\S]*?width:\s*100%/);
  assert.match(styles, /\.contact-path__asks\s*\{[\s\S]*?grid-template-columns:\s*repeat\(2/);
  assert.match(
    styles,
    /@media \(max-width: 47\.99rem\)[\s\S]*?\.contact-path__asks\s*\{\s*grid-template-columns:\s*1fr/,
  );
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
  assert.doesNotMatch(page, /PageIntro|RecoveryState/);
});

test("Contact renders the 3D emblem over a monogram poster that survives without WebGL", () => {
  const content = siteContentSchema.parse(rawSiteContent).metadata.footer;
  const markup = renderToStaticMarkup(createElement(ContactPath, { content }));

  // Server output is the poster: rings, captions, and the flat monogram. The
  // canvas is client-only, so nothing WebGL may appear in this markup.
  assert.match(markup, /<strong aria-hidden="true">CC<\/strong>/);
  assert.match(markup, /SIGNAL \/ PRIVACY FIRST/i);
  assert.match(markup, /One verified public channel/);
  assert.doesNotMatch(markup, /<canvas/i);
  assert.doesNotMatch(markup, /contact-path__signal--emblem/);

  const disc = readFileSync(
    path.join(process.cwd(), "src/components/contact-signal.tsx"),
    "utf8",
  );
  // The monogram fades rather than unmounting, so the disc cannot reflow.
  assert.match(disc, /<strong aria-hidden="true">CC<\/strong>/);
  assert.match(disc, /surface="dark"/);

  const boundary = readFileSync(
    path.join(process.cwd(), "src/components/ca2m-emblem.tsx"),
    "utf8",
  );
  // The emblem must never be part of any route's first payload.
  assert.match(boundary, /ssr: false/);
  assert.match(boundary, /IntersectionObserver/);
  assert.match(boundary, /prefers-reduced-motion: reduce/);
});

/**
 * Reads a .glb container's JSON chunk without a glTF library.
 *
 * Layout: a 12-byte header, then chunk 0 — 4 bytes of length, 4 bytes of type,
 * then the JSON itself.
 */
function readGlbJson(file: string): {
  images?: unknown[];
  accessors?: { count: number }[];
  meshes?: { primitives: { indices?: number }[] }[];
} {
  const bytes = readFileSync(file);
  assert.equal(bytes.toString("utf8", 0, 4), "glTF", `${file} is not a glb container`);
  const jsonLength = bytes.readUInt32LE(12);
  return JSON.parse(bytes.toString("utf8", 20, 20 + jsonLength));
}

test("The contact emblem spends its budget on triangles, not on maps nobody samples", () => {
  const emblem = path.join(process.cwd(), "public/images/brand/ca2m-logo-signal.glb");
  const pipeline = readFileSync(
    path.join(process.cwd(), "scripts/optimize-contact-signal-logo.ts"),
    "utf8",
  );
  const scene = readFileSync(
    path.join(process.cwd(), "src/components/ca2m-emblem-scene.tsx"),
    "utf8",
  );

  assert.equal(existsSync(emblem), true);
  assert.ok(
    statSync(emblem).size < 2 * 1024 * 1024,
    "a 27rem mark on a text route stays below 2 MiB",
  );

  // These two assertions are the shipped artifact, not the script that made it.
  //
  // The first derivative decimated to 22.5K triangles at a 2% error tolerance
  // and kept 1.49 MB of maps. CA-squared-M is thin strokes and fine bevels, so
  // that rounded every edge into wax — and the normal map, baked against the
  // 1.5M-triangle original, described a surface the decimation no longer had.
  // Dropping all three maps paid for four times the geometry at half the bytes.
  const gltf = readGlbJson(emblem);
  assert.equal(
    gltf.images?.length ?? 0,
    0,
    "the mark is re-struck in one palette tone at render time, so it ships no maps",
  );

  const triangles = (gltf.meshes ?? [])
    .flatMap((mesh) => mesh.primitives)
    .reduce((total, primitive) => {
      const indices = primitive.indices;
      if (indices === undefined) return total;
      return total + (gltf.accessors?.[indices]?.count ?? 0) / 3;
    }, 0);
  assert.ok(
    triangles > 60_000,
    `the mark needs its edges: ${triangles} triangles is below the 60K floor`,
  );

  assert.match(pipeline, /ratio: 0\.06/);
  assert.match(pipeline, /setNormalTexture\(null\)/);
  assert.match(pipeline, /meshopt/);

  assert.match(scene, /ca2m-logo-signal\.glb/);
  // A demand-driven canvas has to request its own frames, and must stop when hidden.
  assert.match(scene, /if \(!document\.hidden\) state\.invalidate\(\)/);
  assert.match(scene, /if \(reducedMotion \|\| !swayRef\.current\) return/);
  assert.doesNotMatch(scene, /WebGLRenderer/);
});

test("The contact emblem stays legible and stays on the site palette", () => {
  const scene = readFileSync(
    path.join(process.cwd(), "src/components/ca2m-emblem-scene.tsx"),
    "utf8",
  );

  // CA²M is a reading monogram: off-axis its strokes collapse into each other.
  // It may sway, but it must never approach edge-on, and never make a revolution.
  const yaw = Number(/EMBLEM_SWAY_YAW_DEGREES = ([\d.]+)/.exec(scene)?.[1]);
  const pitch = Number(/EMBLEM_SWAY_PITCH_DEGREES = ([\d.]+)/.exec(scene)?.[1]);
  assert.ok(yaw > 0 && yaw <= 20, `sway yaw of ${yaw}° must stay within 20° of face-on`);
  assert.ok(pitch > 0 && pitch <= 10, `sway pitch of ${pitch}° must stay within 10°`);

  // The authored asset is baked copper, the most saturated colour anywhere near
  // this site. It is re-struck in one palette tone rather than shipped as-is.
  assert.match(scene, /new THREE\.MeshStandardMaterial\(/);
  // Which palette tone is a design call; that it comes from the palette at all
  // is the contract. An arbitrary literal here would bypass `palette:check`.
  assert.match(scene, /color: new THREE\.Color\(surface\.color\)/);
  assert.match(scene, /color: naturalPalette\.\w+,/);
  assert.doesNotMatch(scene, /new THREE\.Color\(["'#]/);
  // Scale is measured, never hand-tuned, so the asset cannot decide the layout.
  assert.match(scene, /new THREE\.Box3\(\)\.setFromObject/);
  assert.doesNotMatch(scene, /EMBLEM_LOGO_SCALE/);
});
