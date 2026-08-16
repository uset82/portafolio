import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

import { rawSiteContent } from "@/content/records";
import {
  localMediaClearanceRegisterSchema,
  mediaAssetSchema,
  siteContentSchema,
} from "@/content/schemas";

test("approved display records satisfy the site content contract", () => {
  const content = siteContentSchema.parse(rawSiteContent);

  assert.equal(content.projects.length, 3);
  assert.equal(content.mediaWorks.length, 0);
  assert.ok(content.projects.every((project) => project.publication === "hold"));
});

test("homepage identity content stays focused and approval-backed", () => {
  const { metadata } = siteContentSchema.parse(rawSiteContent);

  assert.equal(metadata.name, "Carlos Alfredo Carpio Meza");
  assert.equal(metadata.eyebrow, "Engineer · Inventor · Creative Technologist");
  assert.match(metadata.headline, /\.$/);
  assert.equal(metadata.headline.split(/[.!?]+/).filter(Boolean).length, 1);
  assert.ok(metadata.supportingStatement.length <= 180);
  // Direction 1A promoted Work to the primary action; the Observatory keeps
  // the same approved record as the secondary discovery route.
  assert.deepEqual(
    [metadata.primaryAction.href, metadata.secondaryAction.href],
    ["/work", "#selected-systems"],
  );
  assert.notEqual(metadata.primaryAction.label, metadata.secondaryAction.label);
  assert.ok(metadata.sourceIds.includes("approved-public-profile"));
});

test("homepage profile teaser stays approval-backed and excludes private CV material", () => {
  const { profileTeaser } = siteContentSchema.parse(rawSiteContent).metadata;

  assert.equal(profileTeaser.verification, "user-approved");
  assert.equal(profileTeaser.role, "Engineer · Inventor · Creative Technologist");
  assert.equal(
    profileTeaser.biography,
    "Carlos works across artificial intelligence, electronics, resilient energy, music, astrology, and numerology. His portfolio connects engineering practice with creative experimentation, presenting verified work separately from prototypes, personal studies, and future concepts.",
  );
  assert.deepEqual(profileTeaser.practiceThreads, [
    "AI and electronics",
    "Resilient energy",
    "Music and symbolic systems",
  ]);
  assert.equal(profileTeaser.primaryAction.href, "/story");
  assert.equal(profileTeaser.secondaryAction.href, "https://github.com/uset82");
  assert.equal(profileTeaser.primaryAction.external, false);
  assert.equal(profileTeaser.secondaryAction.external, true);
  assert.ok(profileTeaser.sourceIds.includes("approved-public-profile"));
  assert.doesNotMatch(
    JSON.stringify(profileTeaser),
    /(?:birth date|citizenship|street address|phone number|private email|\.pdf)/i,
  );
});

test("homepage media teaser promises click-to-load playback and embeds nothing itself", () => {
  const { mediaTeaser } = siteContentSchema.parse(rawSiteContent).metadata;

  assert.equal(mediaTeaser.status, "Listen when you are ready");
  assert.deepEqual(mediaTeaser.formats, ["Music", "Video"]);
  assert.equal(mediaTeaser.action.href, "/sound");
  assert.equal(mediaTeaser.action.external, false);
  assert.ok(mediaTeaser.sourceIds.includes("approved-public-profile"));
  assert.doesNotMatch(mediaTeaser.description, /StrudelAI/);
  assert.match(mediaTeaser.description, /nothing starts until you press play/);
  assert.match(mediaTeaser.heading, /Music you can hear/);
  assert.match(mediaTeaser.heading, /video you can watch/);
  // The teaser may name the platforms; it may not carry a playable source.
  assert.doesNotMatch(
    JSON.stringify(mediaTeaser),
    /(?:autoplay|iframe|\.mp[34]|youtube\.com|youtu\.be|suno\.com)/i,
  );
});

test("homepage personal teaser adds approved depth without publishing private stories", () => {
  const { personalTeaser } = siteContentSchema.parse(rawSiteContent).metadata;

  assert.equal(personalTeaser.verification, "reference-approved");
  assert.equal(personalTeaser.status, "Personal stories held for review");
  assert.deepEqual(personalTeaser.themes, [
    "Travel notes",
    "Astrology studies",
    "Numerology studies",
  ]);
  assert.equal(personalTeaser.action.href, "/cosmos");
  assert.equal(personalTeaser.action.external, false);
  assert.match(personalTeaser.claimsBoundary, /not scientific, medical, or predictive advice/);
  assert.ok(personalTeaser.sourceIds.includes("approved-public-profile"));
  assert.doesNotMatch(
    JSON.stringify(personalTeaser),
    /(?:latitude|longitude|street address|postal code|flight|hotel|\.jpe?g|\.png)/i,
  );
});

test("footer contact content exposes only the approved privacy-safe paths", () => {
  const { footer } = siteContentSchema.parse(rawSiteContent).metadata;

  assert.equal(footer.status, "Public contact method pending");
  assert.equal(footer.primaryAction.href, "/contact");
  assert.equal(footer.primaryAction.external, false);
  assert.equal(footer.secondaryAction.href, "https://github.com/uset82");
  assert.equal(footer.secondaryAction.external, true);
  assert.ok(footer.sourceIds.includes("approved-public-profile"));
  assert.doesNotMatch(
    JSON.stringify(footer),
    /(?:mailto:|@(?:gmail|outlook|protonmail)|phone|street address|available for hire|book a call)/i,
  );
});

test("video records fail without a poster and accessibility text", () => {
  const result = mediaAssetSchema.safeParse({
    id: "test-video",
    type: "video",
    title: "Test video",
    src: "/media/test-video.mp4",
    owner: "Portfolio test",
    rights: "owned",
    verification: "verified",
    sourceIds: ["test-source"],
    width: 1920,
    height: 1080,
  });

  assert.equal(result.success, false);
  if (result.success) return;

  const messages = result.error.issues.map((issue) => issue.message);
  assert.ok(messages.includes("Published video needs a poster for poster-first loading"));
  assert.ok(messages.includes("Video needs captions or a transcript before publication"));
});

test("external embed records reject autoplay provider URLs", () => {
  const result = mediaAssetSchema.safeParse({
    id: "test-embed",
    type: "embed",
    title: "Test embed",
    src: "https://media.example/embed/test?autoplay=1",
    owner: "Portfolio test",
    rights: "permission-granted",
    verification: "verified",
    sourceIds: ["test-source"],
    provider: "Example media",
    privacyMode: true,
    accessibleName: "Test media player",
    fallbackUrl: "https://media.example/watch/test",
  });

  assert.equal(result.success, false);
  if (result.success) return;

  assert.ok(
    result.error.issues.some((issue) => issue.message === "Embed URLs must not request autoplay"),
  );
});

test("local media stays hash-pinned with only the two approved derivation sources included", () => {
  const registerPath = resolve(
    process.cwd(),
    "../docs/content/local-media-clearance-register.json",
  );
  const register = localMediaClearanceRegisterSchema.parse(
    JSON.parse(readFileSync(registerPath, "utf8")),
  );

  // Carlos approved the monogram mark (2026-07-27) and, on 2026-08-11, the
  // replacement Observatory sequence as the homepage's silent looping visual.
  // The 2026-07-19 robot water source it superseded went back to exclude, so
  // every local file except the monogram and the new sequence stays excluded.
  assert.equal(register.status, "runtime-approved");
  assert.deepEqual(
    register.assets.map((asset) => asset.path).sort(),
    [
      "imagesandvideo/Firefly.jpg",
      "imagesandvideo/Rotating Golden Monogram Emblem Animation.mp4",
      "imagesandvideo/Robot_kneeling_in_reflective_water_202607192339.mp4",
      "imagesandvideo/Robot_observatory_sequence_202608111745.mp4",
      "imagesandvideo/frontUI.png",
      "imagesandvideo/logo.glb",
      "imagesandvideo/logo.png",
      "imagesandvideo/mainUI.png",
      "imagesandvideo/robot.glb",
    ].sort(),
  );
  assert.ok(register.assets.every((asset) => asset.rights === "owned"));
  assert.deepEqual(
    register.assets
      .filter((asset) => asset.decision === "include")
      .map((asset) => asset.path)
      .sort(),
    [
      "imagesandvideo/Robot_observatory_sequence_202608111745.mp4",
      "imagesandvideo/logo.png",
    ].sort(),
  );
  assert.ok(register.assets.every((asset) => /^[A-F0-9]{64}$/.test(asset.sha256)));
  assert.ok(register.assets.every((asset) => asset.owner.toLowerCase().includes("carlos carpio")));

  const unsafePublication = localMediaClearanceRegisterSchema.safeParse({
    ...register,
    status: "ownership-recorded-runtime-hold",
    assets: register.assets.map((asset, index) =>
      index === 0 ? { ...asset, decision: "include" } : asset,
    ),
  });
  assert.equal(unsafePublication.success, false);
});
