"use client";

import Link from "next/link";
import { useId, useMemo, useSyncExternalStore, type FormEvent, type KeyboardEvent } from "react";

import { ActionButton, ActionLink } from "@/components/ui";
import {
  GITHUB_REGISTER_GROUPS,
  GITHUB_REGISTER_META,
  type GithubWorkEntry,
} from "@/content/github-register";
import {
  getWorkSearchLocationSnapshot,
  subscribeWorkSearchLocation,
  writeWorkSearchLocation,
} from "@/lib/work-search-location";
import { isWorkSearchActive, matchingWorkIds, type WorkSearchFacet } from "@/lib/work-search";

export type ProjectRegisterProps = {
  initialQuery?: string;
  initialFacet?: WorkSearchFacet;
};

function formatIndex(index: number) {
  return String(index + 1).padStart(2, "0");
}

function formatCount(count: number) {
  return String(count).padStart(2, "0");
}

function RepositoryRow({
  hidden,
  repository,
  index,
}: {
  hidden: boolean;
  repository: GithubWorkEntry;
  index: number;
}) {
  const titleId = `project-register-${repository.id}-title`;
  const meta = [
    repository.kind === "fork" ? "Fork" : "Own",
    repository.language || null,
    repository.licenseLabel,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="project-register__row" aria-labelledby={titleId} hidden={hidden}>
      <div className="project-register__index" aria-hidden="true">
        {formatIndex(index)}
      </div>

      <div className="project-register__identity">
        <p>{meta}</p>
        <h3 id={titleId}>{repository.title}</h3>
        <strong>{repository.description}</strong>
      </div>

      <div className="project-register__actions">
        {repository.tryUrl && repository.tryLabel ? (
          <a
            className="project-register__link"
            href={repository.tryUrl}
            rel="noreferrer"
            target="_blank"
          >
            <span>{repository.tryLabel}</span>
            <span aria-hidden="true">↗</span>
          </a>
        ) : null}
        {repository.roomHref && repository.roomLabel ? (
          <Link className="project-register__link" href={repository.roomHref} prefetch={false}>
            <span>{repository.roomLabel}</span>
            <span aria-hidden="true">→</span>
          </Link>
        ) : null}
        <a
          className="project-register__link"
          href={repository.url}
          rel="noreferrer"
          target="_blank"
        >
          <span>GitHub</span>
          <span aria-hidden="true">↗</span>
        </a>
      </div>
    </article>
  );
}

export function ProjectRegister({
  initialQuery = "",
  initialFacet = "all",
}: ProjectRegisterProps = {}) {
  const searchId = useId();
  const countId = useId();
  const serverSnapshot = useMemo(
    () => ({ query: initialQuery, facet: initialFacet }),
    [initialFacet, initialQuery],
  );
  const { query, facet } = useSyncExternalStore(
    subscribeWorkSearchLocation,
    getWorkSearchLocationSnapshot,
    () => serverSnapshot,
  );
  const projectCount = formatCount(GITHUB_REGISTER_META.count);
  const active = isWorkSearchActive(query, facet);
  const matchingIds = useMemo(
    () => matchingWorkIds(GITHUB_REGISTER_GROUPS, query, facet),
    [facet, query],
  );

  const handleReset = () => {
    writeWorkSearchLocation("", "all");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    document.getElementById("work-register-results")?.scrollIntoView({ block: "start" });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key !== "Escape" || !active) return;
    event.preventDefault();
    handleReset();
  };

  const handleFacetToggle = (next: WorkSearchFacet) => {
    writeWorkSearchLocation(query, facet === next ? "all" : next);
  };

  return (
    <main id="main-content" className="work-index">
      <section className="work-index__hero" aria-labelledby="work-index-title">
        <div className="work-index__rail">
          <p className="section-label">Work / Register</p>
          <p className="work-index__count">
            <span>{projectCount}</span>
            <small>public repositories</small>
          </p>
        </div>

        <h1 id="work-index-title">Work from 2022 to now.</h1>

        <div className="work-index__intro">
          <p>
            This is the work I have been building since 2022. You are welcome to try what is open,
            and to contribute. Private repositories stay off this page.
          </p>
          <nav className="work-index__welcome" aria-label="Try and contribute">
            <ActionLink variant="primary" href="/cosmos">
              Try
            </ActionLink>
            <ActionLink variant="secondary" href="/support">
              Contribute
            </ActionLink>
          </nav>
        </div>
      </section>

      <form
        className="work-index__search"
        role="search"
        action="/work"
        method="get"
        onSubmit={handleSubmit}
        onKeyDown={handleKeyDown}
        onReset={handleReset}
      >
        <div className="work-index__search-rail">
          <label className="section-label" htmlFor={searchId}>
            Find
          </label>
          <p id={countId} className="work-index__search-count" aria-live="polite">
            {active ? `${formatCount(matchingIds.size)} matching` : "Search the register"}
          </p>
        </div>

        <div className="work-index__search-field">
          <input
            id={searchId}
            type="search"
            name="q"
            value={query}
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="search"
            placeholder="Project, game, or astro"
            aria-describedby={countId}
            aria-controls="work-register-results"
            onChange={(event) => writeWorkSearchLocation(event.currentTarget.value, facet)}
          />
          <ActionButton type="reset" variant="text" hidden={!active}>
            Clear
          </ActionButton>
        </div>

        <div className="work-index__search-shortcuts">
          {facet !== "all" ? <input type="hidden" name="show" value={facet} /> : null}
          <button
            type="button"
            className="work-index__search-chip"
            aria-pressed={facet === "playable"}
            onClick={() => handleFacetToggle("playable")}
          >
            Playable
          </button>
          <button
            type="button"
            className="work-index__search-chip"
            aria-pressed={facet === "astrology"}
            onClick={() => handleFacetToggle("astrology")}
          >
            Astrology
          </button>
        </div>
      </form>

      <nav className="work-index__toc" aria-label="Work groups">
        {GITHUB_REGISTER_GROUPS.map((group) => {
          const visibleCount = group.repositories.filter((repository) =>
            matchingIds.has(repository.id),
          ).length;

          return (
            <a
              key={group.id}
              href={`#work-group-${group.id}`}
              hidden={active && visibleCount === 0}
            >
              <span>{formatCount(active ? visibleCount : group.repositories.length)}</span>
              <span>{group.title}</span>
            </a>
          );
        })}
      </nav>

      <div
        id="work-register-results"
        className="project-register project-register--github"
        tabIndex={-1}
      >
        {active && matchingIds.size === 0 ? (
          <p className="work-index__empty">
            No public repositories match. Clear the search to see the full register.
          </p>
        ) : null}

        {GITHUB_REGISTER_GROUPS.map((group) => {
          const titleId = `work-group-${group.id}-title`;
          const visibleCount = group.repositories.filter((repository) =>
            matchingIds.has(repository.id),
          ).length;

          return (
            <section
              key={group.id}
              id={`work-group-${group.id}`}
              className="project-register__group"
              aria-labelledby={titleId}
              hidden={active && visibleCount === 0}
            >
              <header className="project-register__group-head">
                <p className="section-label">{group.chartLabel}</p>
                <h2 id={titleId}>{group.title}</h2>
                <p className="project-register__group-count">
                  <span>{formatCount(active ? visibleCount : group.repositories.length)}</span>
                  <small>
                    {(active ? visibleCount : group.repositories.length) === 1
                      ? "repository"
                      : "repositories"}
                  </small>
                </p>
              </header>
              <ol className="project-register__list">
                {group.repositories.map((repository, index) => (
                  <li key={repository.id} hidden={active && !matchingIds.has(repository.id)}>
                    <RepositoryRow
                      repository={repository}
                      index={index}
                      hidden={active && !matchingIds.has(repository.id)}
                    />
                  </li>
                ))}
              </ol>
            </section>
          );
        })}
      </div>
    </main>
  );
}
