import Link from "next/link";

import { StatusTag, type StatusTone } from "@/components/ui";
import type { Project } from "@/content/schemas";

type ProjectRegisterProps = {
  projects: readonly Project[];
};

const statusTone: Record<Project["status"], StatusTone> = {
  maintained: "ready",
  shipped: "ready",
  prototype: "neutral",
  experiment: "neutral",
  concept: "concept",
  preparation: "hold",
  archived: "hold",
};

function formatLabel(value: string) {
  return value
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function ProjectRegister({ projects }: ProjectRegisterProps) {
  const orderedProjects = [...projects].sort((left, right) =>
    (left.presentation?.index ?? left.title).localeCompare(
      right.presentation?.index ?? right.title,
    ),
  );
  const projectCount = String(orderedProjects.length).padStart(2, "0");

  return (
    <main id="main-content" className="work-index">
      <section className="work-index__hero" aria-labelledby="work-index-title">
        <div className="work-index__rail">
          <p className="section-label">Work / Register</p>
          <p className="work-index__count">
            <span>{projectCount}</span>
            <small>validated routes</small>
          </p>
        </div>

        <h1 id="work-index-title">A working register of systems and ideas.</h1>

        <div className="work-index__intro">
          <p>
            Each entry is labeled by its present evidence state. These Observatory concepts are
            navigable, but no shipped result, ownership claim, or outcome is implied.
          </p>
          <p className="work-index__boundary">
            <span aria-hidden="true" /> Evidence-led publication remains under review
          </p>
        </div>
      </section>

      <nav className="project-register" aria-label="Project register">
        <ol className="project-register__list">
          {orderedProjects.map((project, index) => {
            const displayIndex = project.presentation?.index ?? String(index + 1).padStart(2, "0");
            const group = project.presentation?.group ?? "Work";
            const category = formatLabel(project.category);
            const taxonomy =
              group.toLocaleLowerCase() === category.toLocaleLowerCase()
                ? group
                : `${group} / ${category}`;
            const titleId = `project-register-${project.id}-title`;

            return (
              <li key={project.id}>
                <article className="project-register__row" aria-labelledby={titleId}>
                  <div className="project-register__instrument" aria-hidden="true">
                    <span>{displayIndex}</span>
                    <i />
                    <small>{group}</small>
                  </div>

                  <div className="project-register__identity">
                    <p>{taxonomy}</p>
                    <h2 id={titleId}>{project.title}</h2>
                    <strong>{project.tagline}</strong>
                  </div>

                  <div className="project-register__evidence">
                    <span>Evidence state</span>
                    <StatusTag tone={statusTone[project.status]}>
                      {formatLabel(project.status)}
                    </StatusTag>
                    <p>{project.summary}</p>
                  </div>

                  <Link
                    className="project-register__link"
                    href={`/work/${project.slug}`}
                    prefetch={false}
                  >
                    <span>Open concept</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                </article>
              </li>
            );
          })}
        </ol>
      </nav>
    </main>
  );
}
