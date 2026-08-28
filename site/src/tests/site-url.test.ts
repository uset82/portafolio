import assert from "node:assert/strict";
import test from "node:test";

import { absoluteUrl, resolveSiteUrl, siteUrl } from "@/lib/site-url";

const PRODUCTION_ORIGIN = "https://carloscarpio.dev";

test("production pins the canonical origin and ignores the configured variable", () => {
  for (const configured of [
    "https://carloscarpio.up.railway.app",
    "http://localhost:3000",
    undefined,
  ]) {
    const resolved = resolveSiteUrl({
      NODE_ENV: "production",
      ...(configured === undefined ? {} : { NEXT_PUBLIC_SITE_URL: configured }),
    });
    assert.equal(resolved.origin, PRODUCTION_ORIGIN);
  }
});

test("development honours the configured origin so local previews stay local", () => {
  const resolved = resolveSiteUrl({
    NODE_ENV: "development",
    NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
  });

  assert.equal(resolved.origin, "http://localhost:3000");
});

test("unusable origins fall back to production instead of throwing during the build", () => {
  for (const candidate of [
    undefined,
    "",
    "   ",
    "carloscarpio.dev",
    "ftp://carloscarpio.dev",
    "https://user:secret@carloscarpio.dev",
  ]) {
    const resolved = resolveSiteUrl({
      NODE_ENV: "development",
      ...(candidate === undefined ? {} : { NEXT_PUBLIC_SITE_URL: candidate }),
    });
    assert.equal(resolved.origin, PRODUCTION_ORIGIN);
  }
});

test("absolute URLs resolve against the site origin", () => {
  assert.equal(absoluteUrl("/sitemap.xml"), `${siteUrl.origin}/sitemap.xml`);
  assert.equal(absoluteUrl("/es/work"), `${siteUrl.origin}/es/work`);
});
