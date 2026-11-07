import Link from "next/link";

import { ORBIT_PROJECTS } from "@/content/project-orbit";
import { ui } from "@/content/i18n/ui";
import type { Locale } from "@/lib/i18n";

/**
 * The keyboard, screen-reader and no-JavaScript path to every selected system.
 *
 * The interactive ProjectOrbit instrument used to draw a second atom beneath
 * the Maya film on /work. It has been replaced by this link-only rail so the
 * page shows exactly one atom while keeping every project destination
 * reachable (validate-immersive-build.ts asserts four of those hrefs survive
 * in the prerendered /work HTML).
 *
 * This is a server component: no canvas, no WebGL, no continuous animation and
 * no client-side state. External destinations open in a new tab.
 */
export type ProjectSystemsNavProps = {
  locale?: Locale;
};

export function ProjectSystemsNav({ locale = "en" }: ProjectSystemsNavProps) {
  const label = ui(locale).orbit.allSystems;

  return (
    <nav className="project-systems" aria-label={label}>
      <p className="project-systems__eyebrow">Selected Systems</p>
      <ul className="project-systems__list">
        {ORBIT_PROJECTS.map((project) => (
          <li key={project.id}>
            <Link
              className="project-systems__link"
              href={project.href}
              {...(project.external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
            >
              {project.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
