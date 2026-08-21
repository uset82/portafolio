"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { localizeOrbitProject } from "@/content/i18n/project-orbit-es";
import { ui } from "@/content/i18n/ui";
import type { OrbitProject } from "@/content/project-orbit";
import type { Locale } from "@/lib/i18n";

import { ProjectOrbitAtomic } from "./project-orbit-atomic";

const LazyProjectOrbitScene = dynamic(
  () => import("./project-orbit-scene").then((module) => module.ProjectOrbitScene),
  { ssr: false, loading: () => null },
);

export type ProjectOrbitProps = {
  projects: readonly OrbitProject[];
  locale?: Locale;
};

/**
 * Project Orbit: the CA²M nucleus with each system on its own shell.
 *
 * Two layers, in this order:
 *
 *   1. `ProjectOrbitAtomic` — a server-rendered 2.5D SVG of the same
 *      instrument. It is what a visitor sees immediately, and what they keep if
 *      WebGL is unavailable or JavaScript never runs.
 *   2. `ProjectOrbitScene` — the real thing: the optimised CA²M logo as a glTF
 *      nucleus, brass tube rings, instanced bearings, and a slow revolution.
 *      It replaces the SVG once its chunk has loaded.
 *
 * The 3D layer was switched off in 76501d0 (`void LazyProjectOrbitScene`) and
 * later shadowed by a second scene that never mounted, which left only the flat
 * SVG on the page. Both are corrected here: the scene mounts again, and the SVG
 * goes back to being the fallback it was written as.
 *
 * The scene positions the label buttons through `labelRefs`, so those buttons
 * exist only while the scene owns the layout. Without it the SVG draws its own
 * pills instead — two label systems must never be visible at once, which is
 * what stacked eleven of them in one corner.
 */
export function ProjectOrbit({ projects: source, locale = "en" }: ProjectOrbitProps) {
  const copy = ui(locale).orbit;
  const projects = useMemo(
    () => source.map((project) => localizeOrbitProject(project, locale)),
    [locale, source],
  );
  const stageRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [shouldMountScene, setShouldMountScene] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [inView, setInView] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const target = stageRef.current;
    if (!target || typeof IntersectionObserver === "undefined") {
      setShouldMountScene(true);
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((entry) => entry.isIntersecting);
        setInView(visible);
        if (visible) setShouldMountScene(true);
      },
      { rootMargin: "240px 0px", threshold: 0 },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const selected = useMemo(
    () => projects.find((project) => project.id === selectedId) ?? null,
    [projects, selectedId],
  );

  const openProject = useCallback((project: OrbitProject) => {
    if (project.destination === "assistant") {
      const assistantTrigger = document.querySelector<HTMLButtonElement>(".cc-ai-trigger");
      if (assistantTrigger) {
        assistantTrigger.click();
        return;
      }
    }

    if (project.external) {
      window.open(project.href, "_blank", "noopener,noreferrer");
      return;
    }

    window.location.assign(project.href);
  }, []);

  return (
    <section
      className="project-orbit-section"
      id="selected-systems"
      aria-labelledby="project-orbit-title"
    >
      <header className="project-orbit-section__head">
        <p className="project-orbit-section__eyebrow">Selected Systems</p>
        <h2 id="project-orbit-title" className="visually-hidden">
          Project Orbit
        </h2>
        <p className="project-orbit-section__line">
          Energy. Creative tools and tech human experience.
        </p>
        <span className="project-orbit-section__rule" aria-hidden="true" />
      </header>

      <div
        ref={stageRef}
        className="project-orbit__stage"
        data-scene-ready={sceneReady}
        data-reduced-motion={reducedMotion}
      >
        <div className="project-orbit__instrument" aria-hidden={sceneReady}>
          <ProjectOrbitAtomic
            projects={projects}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onOpen={openProject}
          />
        </div>

        {shouldMountScene ? (
          <div className="project-orbit__canvas" aria-hidden="true">
            <LazyProjectOrbitScene
              inView={inView}
              projects={projects}
              reducedMotion={reducedMotion}
              selectedId={selectedId}
              labelRefs={labelRefs}
              onOpen={openProject}
              onSelect={setSelectedId}
              onReady={setSceneReady}
            />
          </div>
        ) : null}

        {sceneReady ? (
          <div className="project-orbit__labels" aria-hidden="true">
            {projects.map((project, index) => (
              <button
                key={project.id}
                ref={(label) => {
                  labelRefs.current[index] = label;
                }}
                className="project-orbit__label"
                tabIndex={-1}
                type="button"
                onClick={() => setSelectedId(project.id)}
              >
                {project.name}
              </button>
            ))}
          </div>
        ) : null}

        {selected ? (
          <aside className="project-orbit__panel" aria-live="polite">
            <button
              className="project-orbit__panel-close"
              type="button"
              aria-label={copy.close}
              onClick={() => setSelectedId(null)}
            >
              ×
            </button>
            <h3>{selected.name}</h3>
            <p>{selected.description}</p>
            <div className="project-orbit__panel-actions">
              {selected.destination === "assistant" ? (
                <button type="button" onClick={() => openProject(selected)}>
                  {copy.askAi} <span aria-hidden="true">↗</span>
                </button>
              ) : (
                <Link
                  href={selected.href}
                  {...(selected.external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
                >
                  {selected.external ? copy.openRepository : copy.viewProject}{" "}
                  <span aria-hidden="true">↗</span>
                </Link>
              )}
            </div>
          </aside>
        ) : null}
      </div>

      {/* The instrument's affordances are pointer-only and hidden from assistive
       * technology. This rail is the keyboard, screen-reader and no-JavaScript
       * path to every system. */}
      <nav
        className="project-orbit__all"
        data-scene-ready={sceneReady}
        aria-label={copy.allSystems}
      >
        <p>{copy.allSystems}</p>
        <ul>
          {projects.map((project) => (
            <li key={project.id}>
              <Link
                href={project.href}
                aria-current={project.id === selectedId ? "true" : undefined}
                {...(project.external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
                onClick={(event) => {
                  event.preventDefault();
                  setSelectedId(project.id);
                }}
                onFocus={() => setSelectedId(project.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedId(project.id);
                  }
                }}
              >
                {project.name}
                {project.external ? <span aria-hidden="true"> ↗</span> : null}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
