import assert from "node:assert/strict";
import test from "node:test";

import { rawSiteContent } from "@/content/records";
import { mediaAssetSchema, siteContentSchema } from "@/content/schemas";

test("approved display records satisfy the site content contract", () => {
  const content = siteContentSchema.parse(rawSiteContent);

  assert.equal(content.projects.length, 3);
  assert.equal(content.mediaWorks.length, 0);
  assert.ok(content.projects.every((project) => project.publication === "hold"));
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
