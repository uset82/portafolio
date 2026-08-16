import assert from "node:assert/strict";
import test from "node:test";

import { ARCADE_GAMES } from "@/content/arcade";
import { FLAGSHIP_PROJECTS } from "@/content/flagship";
import { rawSiteContent } from "@/content/records";
import { siteContentSchema } from "@/content/schemas";
import {
  THREADS,
  THREAD_ASSIGNMENTS,
  assignmentFor,
  findThread,
  livesOn,
  projectsOnThread,
  threadsFor,
} from "@/content/threads";

const content = siteContentSchema.parse(rawSiteContent);

test("the menu stays at four doors and every one is a verb", () => {
  assert.equal(content.navigation.length, 4);
  assert.deepEqual(
    content.navigation.map((item) => [item.label, item.href]),
    [
      ["Play", "/arcade"],
      ["See", "/work"],
      ["Listen", "/sound"],
      ["About", "/story"],
    ],
  );
});

test("a fifth door is rejected by the schema, not left to discipline", () => {
  const overloaded = {
    ...rawSiteContent,
    navigation: [
      ...content.navigation,
      { ...content.navigation[0]!, id: "nav-extra", label: "Extra", href: "/extra" },
    ],
  };

  assert.equal(siteContentSchema.safeParse(overloaded).success, false);
});

test("routes dropped from the menu stay reachable in the footer", () => {
  const secondary = content.secondaryNavigation.map((item) => item.href);
  for (const href of ["/laboratory", "/cosmos", "/support", "/contact"]) {
    assert.ok(secondary.includes(href), `${href} lost its last route into the site`);
  }

  // No route may sit in both lists, or it is presented as two things.
  const primary = content.navigation.map((item) => item.href);
  for (const href of secondary) {
    assert.ok(!primary.includes(href), `${href} appears in both menus`);
  }
});

test("every project has exactly one home", () => {
  for (const assignment of THREAD_ASSIGNMENTS) {
    assert.ok(
      ["/arcade", "/work", "/sound"].includes(assignment.home),
      `${assignment.id} has an unroutable home`,
    );
  }

  const ids = THREAD_ASSIGNMENTS.map((entry) => entry.id);
  assert.equal(new Set(ids).size, ids.length, "a project may not be assigned twice");
});

test("no game's full card lives outside the arcade", () => {
  for (const game of ARCADE_GAMES) {
    const assignment = assignmentFor(game.id);
    assert.ok(assignment, `${game.id} is in the arcade with no thread assignment`);
    assert.equal(assignment.home, "/arcade", `${game.id} must live in the arcade`);
  }
});

test("the two games and StrudelAI are the flagship entries that live elsewhere", () => {
  const away = FLAGSHIP_PROJECTS.filter((project) => !livesOn(project.id, "/work"));
  assert.deepEqual(away.map((project) => project.id).sort(), [
    "monkey-tug-of-war",
    "my-football-game",
    "strudelai",
  ]);
});

test("every flagship project carries at least one thread", () => {
  for (const project of FLAGSHIP_PROJECTS) {
    assert.ok(
      threadsFor(project.id).length > 0,
      `${project.id} has no thread, so nothing cross-links to it`,
    );
  }
});

test("a project carries at most two threads, or the threads mean nothing", () => {
  for (const assignment of THREAD_ASSIGNMENTS) {
    assert.ok(
      assignment.threads.length >= 1 && assignment.threads.length <= 2,
      `${assignment.id} carries ${assignment.threads.length} threads`,
    );
  }
});

test("every thread has projects, and the crossings are real", () => {
  for (const thread of THREADS) {
    assert.ok(projectsOnThread(thread.id).length > 0, `${thread.id} is an empty thread`);
    assert.equal(findThread(thread.slug)?.id, thread.id);
  }

  // These are the crossings that justify threads existing at all: work that
  // belongs to two worlds at once.
  assert.deepEqual(assignmentFor("reactiongame")?.threads, ["games", "matter"]);
  assert.deepEqual(assignmentFor("strudelai")?.threads, ["sound", "intelligence"]);
});

test("threads reach across more than one room", () => {
  const crossing = THREADS.filter((thread) => {
    const homes = new Set(projectsOnThread(thread.id).map((project) => project.home));
    return homes.size > 1;
  });

  assert.ok(
    crossing.length > 0,
    "if no thread spans two rooms, threads are just categories with extra steps",
  );
});
