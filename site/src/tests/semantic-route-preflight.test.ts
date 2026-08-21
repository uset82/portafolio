import assert from "node:assert/strict";
import test from "node:test";

import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import ArcadePage from "@/app/(en)/arcade/page";
import ContactPage from "@/app/(en)/contact/page";
import CosmosPage from "@/app/(en)/cosmos/page";
import LaboratoryPage from "@/app/(en)/laboratory/page";
import SoundPage from "@/app/(en)/sound/page";
import StoryPage from "@/app/(en)/story/page";
import SupportPage from "@/app/(en)/support/page";
import WorkPage from "@/app/(en)/work/page";

type CoreRoute = {
  name: string;
  Page: ComponentType;
  expectedHrefs: readonly string[];
};

const coreRoutes: readonly CoreRoute[] = [
  {
    name: "Work",
    Page: WorkPage,
    expectedHrefs: [
      "https://github.com/uset82/ASTROEA",
      "https://github.com/uset82/pinaculo",
      "https://github.com/uset82/StrudelAI",
      "https://jacobgolf.netlify.app/",
      "https://stillascalculator.netlify.app/",
      "https://pasharestaurant.netlify.app/",
      "https://chaclacayo.netlify.app/",
      "https://qubesolve.netlify.app/",
      "https://opennemoclaw.netlify.app/",
      "https://3doodle.netlify.app/draw",
      "https://effata.netlify.app/",
      "https://poetic-faun-843df2.netlify.app/",
      "https://monkeytugofwar.netlify.app/",
      "https://gimmemycake.netlify.app/",
      "https://superlative-pony-49581f.netlify.app/",
      "https://dommedag.netlify.app/",
      "https://mybankai.netlify.app/",
      "https://resplendent-sherbet-1d2236.netlify.app/",
      "https://fanciful-heliotrope-b6fb9c.netlify.app/",
      "https://smartapply.netlify.app/",
      "https://dealdash2025.netlify.app/",
      "/cosmos",
      "/support",
    ],
  },
  {
    name: "Laboratory",
    Page: LaboratoryPage,
    expectedHrefs: ["/work/future-energy", "/work", "/contact"],
  },
  { name: "Sound", Page: SoundPage, expectedHrefs: ["/arcade", "/support", "/work"] },
  {
    name: "Arcade",
    Page: ArcadePage,
    expectedHrefs: [
      "/arcade/mandelbro",
      "/arcade/jacobgolf",
      "/arcade/qubesolve",
      "/arcade/3doodle",
      "/arcade/football",
      "/arcade/monkey-tug-of-war",
      "/arcade/gimmemycake",
      "/arcade/drone-lips",
    ],
  },
  { name: "Support", Page: SupportPage, expectedHrefs: [] },
  { name: "Cosmos", Page: CosmosPage, expectedHrefs: ["/work", "/story"] },
  { name: "Story", Page: StoryPage, expectedHrefs: ["/work", "/contact"] },
  { name: "Contact", Page: ContactPage, expectedHrefs: ["/work", "/story"] },
];

function renderRoute(Page: ComponentType) {
  return renderToStaticMarkup(createElement(Page));
}

test("every static primary route keeps one semantic main landmark, one h1, and its recovery paths", () => {
  for (const route of coreRoutes) {
    const markup = renderRoute(route.Page);

    assert.equal(
      (markup.match(/<main\b[^>]*\bid="main-content"/g) ?? []).length,
      1,
      `${route.name} must expose exactly one skip-link target`,
    );
    assert.equal(
      (markup.match(/<h1\b/g) ?? []).length,
      1,
      `${route.name} must expose exactly one primary heading`,
    );
    assert.doesNotMatch(
      markup,
      /<main\b[^>]*aria-hidden=/,
      `${route.name} main content cannot be hidden from assistive technology`,
    );

    for (const href of route.expectedHrefs) {
      assert.match(markup, new RegExp(`href="${href}"`), `${route.name} must retain ${href}`);
    }
  }
});

test("held public rooms retain truthful no-media and no-collection boundaries", () => {
  const laboratory = renderRoute(LaboratoryPage);
  const sound = renderRoute(SoundPage);
  const cosmos = renderRoute(CosmosPage);
  const contact = renderRoute(ContactPage);

  assert.doesNotMatch(laboratory, /<(?:audio|video|iframe|canvas)\b/);
  assert.doesNotMatch(sound, /<(?:audio|video|iframe)\b/);
  assert.doesNotMatch(cosmos, /<(?:audio|video|iframe|canvas)\b/);
  assert.doesNotMatch(contact, /<(?:form|input|textarea|select|button)\b/);
});
