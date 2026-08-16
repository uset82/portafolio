"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { OrbitProject } from "@/content/project-orbit";

import { ProjectOrbitAtomic } from "./project-orbit-atomic";

export type ProjectOrbitProps = {
  projects: readonly OrbitProject[];
};

/**
 * Project Orbit: the CA²M nucleus with each system on its own shell.
 *
 * The instrument is `ProjectOrbitAtomic`, a 2.5D SVG that draws the orbits, the
 * nodes and the nucleus, and positions its own pill labels from the node
 * geometry. It renders on the server and needs no WebGL, so the section is the
 * same for everyone.
 *
 * Two layers used to sit on top of it and both were dead weight. A WebGL scene
 * mounted on intersection, except the observer never flipped it on, so it never
 * rendered. A second set of labels lived here waiting for that scene to place
 * them; with nothing placing them, all eleven stacked in the corner of the
 * stage. Removing both is what fixed the section — the atom underneath was
 * already correct.
 */
export function ProjectOrbit({ projects }: ProjectOrbitProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
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

      <div ref={stageRef} className="project-orbit__stage" data-reduced-motion={reducedMotion}>
        <div className="project-orbit__instrument">
          <ProjectOrbitAtomic
            projects={projects}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onOpen={openProject}
          />
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

      {/* The instrument's pills are pointer affordances and are hidden from
       * assistive technology. This rail is the keyboard, screen-reader and
       * no-JavaScript path to every system. */}
      <nav className="project-orbit__all" aria-label="All systems">
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
