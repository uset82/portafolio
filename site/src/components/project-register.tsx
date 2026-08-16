import Link from "next/link";

import { ActionLink } from "@/components/ui";
import { GITHUB_REGISTER, GITHUB_REGISTER_META } from "@/content/github-register";

function formatIndex(index: number) {
  return String(index + 1).padStart(2, "0");
}

export function ProjectRegister() {
  const projectCount = String(GITHUB_REGISTER_META.count).padStart(2, "0");

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

      <nav className="project-register project-register--github" aria-label="Project register">
        <ol className="project-register__list">
          {GITHUB_REGISTER.map((repository, index) => {
            const titleId = `project-register-${repository.id}-title`;
            const meta = [
              repository.kind === "fork" ? "Fork" : "Own",
              repository.language || null,
              repository.licenseLabel,
            ]
              .filter(Boolean)
              .join(" · ");

            return (
              <li key={repository.id}>
                <article className="project-register__row" aria-labelledby={titleId}>
                  <div className="project-register__index" aria-hidden="true">
                    {formatIndex(index)}
                  </div>

                  <div className="project-register__identity">
                    <p>{meta}</p>
                    <h2 id={titleId}>{repository.title}</h2>
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
                      <Link
                        className="project-register__link"
                        href={repository.roomHref}
                        prefetch={false}
                      >
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
              </li>
            );
          })}
        </ol>
      </nav>
    </main>
  );
}
