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
  // The route carries the thesis itself now. The footer's shorter invitation has
  // to close any page on the site; this one only ever opens the contact route.
  assert.match(markup, /The idea is not to have an idea\. It is to see the opportunities\./);
  assert.doesNotMatch(markup, /turn a difficult idea into a working system/);
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

  // Server output is the poster: rings, captions, and the flat mark. The canvas
  // is client-only, so nothing WebGL may appear in this markup.
  //
  // The poster has to be the SAME mark the model draws. It used to be a CC
  // monogram, which meant the disc visibly showed one mark and then exchanged it
  // for another during the second or so the model took to arrive.
  assert.match(markup, /class="ca2m-poster contact-path__signal-poster"/);
  assert.doesNotMatch(markup, />CC</);
  assert.match(markup, /SIGNAL \/ PRIVACY FIRST/i);
  assert.match(markup, /One verified public channel/);
  assert.doesNotMatch(markup, /<canvas/i);
  assert.doesNotMatch(markup, /contact-path__signal--emblem/);

  const disc = readFileSync(path.join(process.cwd(), "src/components/contact-signal.tsx"), "utf8");
  // The poster fades rather than unmounting, so the disc cannot reflow.
  assert.match(disc, /ca2m-poster contact-path__signal-poster/);
  assert.match(disc, /surface="dark"/);

  const styles = readFileSync(path.join(process.cwd(), "src/app/globals.css"), "utf8");
  // One artwork, masked, so each surface can tint it to the tone its model is
  // struck in — and so the flat mark and the model are the same shape.
  const poster = styles.match(/\n\.ca2m-poster \{([\s\S]*?)\n\}/);
  assert.ok(poster, "the shared poster must be declared");
  assert.match(poster[1], /--ca2m-mark:\s*url\("\/images\/brand\/ca2m-mark\.png"\)/);
  // The artwork's transparency carries its own render's shading, so a single
  // mask layer paints a washed ghost of the mark rather than the mark. Layers
  // composite as a union: repeating it is what returns solid ink.
  const layers = poster[1].match(/\n {2}mask: ([^;]*);/);
  assert.ok(layers, "the poster must declare the unprefixed mask");
  assert.equal((layers[1].match(/var\(--ca2m-mark\)/g) ?? []).length, 4);
  assert.match(poster[1], /-webkit-mask: (?:var\(--ca2m-mark\), ){3}var\(--ca2m-mark\);/);
  // Poster out and emblem in have to run at one duration, or the exchange dips
  // through a moment with neither mark at full strength.
  assert.match(poster[1], /transition: opacity var\(--duration-reveal\)/);
  // Poster and emblem must be declared as one box. Separate boxes are how the
  // mark ends up jumping when the model replaces it.
  assert.match(
    styles,
    /\.contact-path__signal > \.contact-path__signal-poster,\s*\n\.contact-path__signal > \.contact-path__signal-emblem\s*\{/,
  );

  const boundary = readFileSync(path.join(process.cwd(), "src/components/ca2m-emblem.tsx"), "utf8");
  // The emblem must never be part of any route's first payload.
  assert.match(boundary, /ssr: false/);
  assert.match(boundary, /IntersectionObserver/);
  assert.match(boundary, /prefers-reduced-motion: reduce/);

  // The model is asked for at the same moment as the chunk that will use it,
  // instead of waiting for that chunk to arrive and ask. `crossOrigin` is what
  // makes the browser reuse the response for three's own request rather than
  // fetching the model a second time.
  assert.match(
    boundary,
    /const warm = \(\) => \{[\s\S]*?preload\(EMBLEM_LOGO_URL, \{ as: "fetch", crossOrigin: "anonymous", fetchPriority: "low" \}\);\s*void import\("\.\/ca2m-emblem-scene"\)/,
  );

  // Fetching and mounting must stay separate decisions. Joined, both waited on
  // the viewport, and the story plate is below the fold on a phone — so the
  // whole payload was spent while the visitor was already looking at the empty
  // plate. The warm-up runs on idle instead, using the time they spend reading.
  assert.match(boundary, /requestIdleCallback\(warm, \{ timeout: 2000 \}\)/);
  assert.match(boundary, /const mount = \(\) => \{\s*warm\(\);\s*setShouldMount\(true\);/);
  // Anyone who asked to be spared the bytes keeps the fetch-on-approach behaviour.
  assert.match(boundary, /saveData/);
  assert.match(boundary, /if \(!thrifty\)/);
  // Naming the asset must not drag three into the page's first-load bundle.
  assert.match(boundary, /from "@\/components\/ca2m-emblem-asset"/);
  assert.doesNotMatch(boundary, /^import [^\n]*from "(?:three|@react-three)/m);

  // A model that never arrives has to cost the mark and nothing else. The scene
  // throws out of render when its chunk or its model fails, and unhandled that
  // throw reaches the route: blocking the model in a real browser replaced the
  // whole page — biography, privacy statement, contact channel — with Next's
  // client error screen. Caught, the flat poster simply stays.
  assert.match(boundary, /static getDerivedStateFromError/);
  assert.match(boundary, /<EmblemFailureBoundary>[\s\S]*?<LazyCa2mEmblemScene/);
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
  // The old ceiling here was 2 MiB, which the 808 KB derivative passed while
  // being four times heavier than it needed to be. This one is set just above
  // what the mark actually costs, so the next regression has to be declared.
  const bytes = statSync(emblem).size;
  assert.ok(bytes < 260_000, `the mark is fetched before a visitor scrolls to it: ${bytes} bytes`);

  // These two assertions are the shipped artifact, not the script that made it.
  //
  // The first derivative decimated to 22.5K triangles at a 2% error tolerance
  // and kept 1.49 MB of maps. CA-squared-M is thin strokes and fine bevels, so
  // that rounded every edge into wax — and the normal map, baked against the
  // 1.5M-triangle original, described a surface the decimation no longer had.
  // Dropping all three maps is what left room to keep the edges at all.
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
  // A band rather than a floor. Too few and the bevels round off, which is the
  // 2% pass this pipeline already rejected once; too many and the mark is paying
  // for detail past the 243 device pixels it is ever drawn into. Both edges of
  // the band were measured by rendering candidates through the shipped scene.
  assert.ok(
    triangles >= 12_000 && triangles <= 30_000,
    `the mark needs its edges and nothing past them: ${triangles} triangles`,
  );

  assert.match(pipeline, /ratio: 0\.012/);
  assert.match(pipeline, /setNormalTexture\(null\)/);
  assert.match(pipeline, /meshopt/);

  const asset = readFileSync(
    path.join(process.cwd(), "src/components/ca2m-emblem-asset.ts"),
    "utf8",
  );
  assert.match(asset, /EMBLEM_LOGO_URL = "\/images\/brand\/ca2m-logo-signal\.glb"/);
  // One declaration of the path, so the preload and the loader cannot drift onto
  // two different URLs and fetch the model twice.
  assert.match(scene, /import \{ EMBLEM_LOGO_URL \} from "@\/components\/ca2m-emblem-asset"/);
  assert.doesNotMatch(scene, /"\/images\/brand\/ca2m-logo-signal\.glb"/);
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
