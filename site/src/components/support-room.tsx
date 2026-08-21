import { ActionLink, StatusTag } from "@/components/ui";
import { localizeSupport } from "@/content/i18n/support-es";
import { ui } from "@/content/i18n/ui";
import { CONTRIBUTABLE_REPOS, OPEN_SOURCE, SUPPORT_SUMMARY, TIP } from "@/content/support";
import type { Locale } from "@/lib/i18n";

type SupportRoomProps = {
  /** Resolved on the server. `null` hides the tip card rather than guessing. */
  tipUrl: string | null;
  locale?: Locale;
};

export function SupportRoom({ tipUrl, locale = "en" }: SupportRoomProps) {
  const copy = ui(locale).support;
  const { summary, openSource, repos, tip } = localizeSupport(
    { summary: SUPPORT_SUMMARY, openSource: OPEN_SOURCE, repos: CONTRIBUTABLE_REPOS, tip: TIP },
    locale,
  );
  return (
    <main id="main-content" className="support-room">
      <section className="support-room__hero" aria-labelledby="support-title">
        <div className="support-room__rail">
          <p className="section-label">{summary.eyebrow}</p>
          <StatusTag tone="ready">{copy.repositoriesOpen(repos.length)}</StatusTag>
        </div>

        <div className="support-room__identity">
          <p>{copy.twoWays}</p>
          <h1 id="support-title">{summary.heading}</h1>
          <strong>{summary.description}</strong>
        </div>
      </section>

      <section className="support-room__contribute" aria-labelledby="support-contribute-title">
        <header>
          <p className="section-label">{openSource.eyebrow} / 01</p>
          <h2 id="support-contribute-title">{openSource.heading}</h2>
          <p>{openSource.description}</p>
        </header>

        <ul className="support-room__repos" aria-label={copy.reposAria}>
          {repos.map((repo) => (
            <li key={repo.id}>
              <div className="support-room__repo-head">
                <StatusTag tone="ready">{repo.license}</StatusTag>
                <p>{repo.language}</p>
                <h3>{repo.name}</h3>
              </div>
              <p className="support-room__repo-body">{repo.description}</p>
              <div className="support-room__repo-actions">
                <ActionLink
                  variant="secondary"
                  href={repo.issuesUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {copy.openIssues} <span aria-hidden="true">&#8599;</span>
                </ActionLink>
                <ActionLink href={repo.repository} target="_blank" rel="noreferrer">
                  {copy.source} <span aria-hidden="true">&#8599;</span>
                </ActionLink>
              </div>
            </li>
          ))}
        </ul>

        <aside className="support-room__licensing" aria-labelledby="support-licensing-title">
          <h3 id="support-licensing-title">{openSource.licensingNote.heading}</h3>
          <p>{openSource.licensingNote.body}</p>
          <small>{copy.auditRun(openSource.licensingNote.auditedOn)}</small>
          <ActionLink href={OPEN_SOURCE.repositoriesUrl} target="_blank" rel="noreferrer">
            {openSource.repositoriesLabel} <span aria-hidden="true">&#8599;</span>
          </ActionLink>
        </aside>
      </section>

      {tipUrl ? (
        <section className="support-room__tip" aria-labelledby="support-tip-title">
          <div className="support-room__tip-copy">
            <p className="section-label">{copy.tipLabel}</p>
            <h2 id="support-tip-title">{copy.tipHeading}</h2>
            <p>{tip.note}</p>
            <ActionLink variant="primary" href={tipUrl} target="_blank" rel="noreferrer">
              {copy.tipAction(TIP.platform)} <span aria-hidden="true">&#8599;</span>
            </ActionLink>
          </div>

          <div className="support-room__tip-mark" aria-hidden="true">
            <span>{copy.optional}</span>
            <strong>&#9749;</strong>
            <i />
          </div>
        </section>
      ) : null}
    </main>
  );
}
