"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { OrbitProject } from "@/content/project-orbit";

const LazyProjectOrbitScene = dynamic(
  () => import("./project-orbit-scene").then((module) => module.ProjectOrbitScene),
  { ssr: false, loading: () => null },
);

export type ProjectOrbitProps = {
  projects: readonly OrbitProject[];
};

/**
 * Semantic shell for the imported Claude Design orbit. The optional WebGL
 * scene mounts only as the section approaches the viewport; all systems remain
 * in the server-rendered navigation list when WebGL or JavaScript is absent.
 */
export function ProjectOrbit({ projects }: ProjectOrbitProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [shouldMountScene, setShouldMountScene] = useState(false);
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
      { rootMargin: "240px 0px", threshold: 0.01 },
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
        data-scene-mounted={shouldMountScene}
        data-reduced-motion={reducedMotion}
      >
        {/* A quiet CSS instrument holds the layout and visual metaphor until the
         * isolated Three chunk is ready, and remains useful if WebGL is absent. */}
        <div className="project-orbit__fallback-instrument" aria-hidden="true">
          <span className="project-orbit__fallback-rail" />
          <span className="project-orbit__fallback-rail project-orbit__fallback-rail--middle" />
          <span className="project-orbit__fallback-rail project-orbit__fallback-rail--inner" />
          <span className="project-orbit__fallback-core" />
        </div>

        <div className="project-orbit__canvas" aria-hidden="true">
          {shouldMountScene ? (
            <LazyProjectOrbitScene
              inView={inView}
              projects={projects}
              reducedMotion={reducedMotion}
              selectedId={selectedId}
              labelRefs={labelRefs}
              onOpen={openProject}
              onSelect={setSelectedId}
            />
          ) : null}
        </div>

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

        {selected ? (
          <aside className="project-orbit__panel" aria-live="polite">
            <button
              className="project-orbit__panel-close"
              type="button"
              aria-label="Close project details"
              onClick={() => setSelectedId(null)}
            >
              ×
            </button>
            <h3>{selected.name}</h3>
            <p>{selected.description}</p>
            <div className="project-orbit__panel-actions">
              {selected.destination === "assistant" ? (
                <button type="button" onClick={() => openProject(selected)}>
                  Ask CACM AI <span aria-hidden="true">↗</span>
                </button>
              ) : (
                <Link
                  href={selected.href}
                  {...(selected.external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
                >
                  {selected.external ? "Open repository" : "View project"}{" "}
                  <span aria-hidden="true">↗</span>
                </Link>
              )}
            </div>
          </aside>
        ) : null}
      </div>

      {/* The rail leaves the visual layout once the 3D orbit is active, but it
       * stays in the document: it is the keyboard, screen-reader, and
       * no-JavaScript path to every system, and it reappears on focus. */}
      <nav
        className="project-orbit__all"
        data-scene-mounted={shouldMountScene}
        aria-label="All systems"
      >
        <p>All systems</p>
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
