import { ActionLink, StatusTag } from "@/components/ui";
import { CONTRIBUTABLE_REPOS, OPEN_SOURCE, SUPPORT_SUMMARY, TIP } from "@/content/support";

type SupportRoomProps = {
  /** Resolved on the server. `null` hides the tip card rather than guessing. */
  tipUrl: string | null;
};

export function SupportRoom({ tipUrl }: SupportRoomProps) {
  // The hero counts the ways this page actually offers, not the ways it could.
  const summary = tipUrl ? SUPPORT_SUMMARY.withTip : SUPPORT_SUMMARY.withoutTip;

  return (
    <main id="main-content" className="support-room">
      <section className="support-room__hero" aria-labelledby="support-title">
        <div className="support-room__rail">
          <p className="section-label">{SUPPORT_SUMMARY.eyebrow}</p>
          <StatusTag tone="ready">{CONTRIBUTABLE_REPOS.length} repositories open</StatusTag>
        </div>

        <div className="support-room__identity">
          <p>{summary.kicker}</p>
          <h1 id="support-title">{SUPPORT_SUMMARY.heading}</h1>
          <strong>{summary.description}</strong>
        </div>
      </section>

      <section className="support-room__contribute" aria-labelledby="support-contribute-title">
        <header>
          <p className="section-label">{OPEN_SOURCE.eyebrow} / 01</p>
          <h2 id="support-contribute-title">{OPEN_SOURCE.heading}</h2>
          <p>{OPEN_SOURCE.description}</p>
        </header>

        <ul className="support-room__repos" aria-label="Repositories open to contribution">
          {CONTRIBUTABLE_REPOS.map((repo) => (
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
                  Open issues <span aria-hidden="true">&#8599;</span>
                </ActionLink>
                <ActionLink href={repo.repository} target="_blank" rel="noreferrer">
                  Source <span aria-hidden="true">&#8599;</span>
                </ActionLink>
              </div>
            </li>
          ))}
        </ul>

        <aside className="support-room__licensing" aria-labelledby="support-licensing-title">
          <h3 id="support-licensing-title">{OPEN_SOURCE.licensingNote.heading}</h3>
          <p>{OPEN_SOURCE.licensingNote.body}</p>
          <small>Licence audit run {OPEN_SOURCE.licensingNote.auditedOn}.</small>
          <ActionLink href={OPEN_SOURCE.profileUrl} target="_blank" rel="noreferrer">
            {OPEN_SOURCE.profileLabel} <span aria-hidden="true">&#8599;</span>
          </ActionLink>
        </aside>
      </section>

      {tipUrl ? (
        <section className="support-room__tip" aria-labelledby="support-tip-title">
          <div className="support-room__tip-copy">
            <p className="section-label">Buy me a coffee / 02</p>
            <h2 id="support-tip-title">Or just buy me a coffee.</h2>
            <p>{TIP.note}</p>
            <ActionLink variant="primary" href={tipUrl} target="_blank" rel="noreferrer">
              Buy me a coffee on {TIP.platform} <span aria-hidden="true">&#8599;</span>
            </ActionLink>
          </div>

          <div className="support-room__tip-mark" aria-hidden="true">
            <span>Optional / 00</span>
            <strong>&#9749;</strong>
            <i />
          </div>
        </section>
      ) : null}
    </main>
  );
}
