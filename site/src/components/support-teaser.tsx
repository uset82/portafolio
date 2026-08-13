import { ActionLink } from "@/components/ui";
import { CONTRIBUTABLE_REPOS, SUPPORT_TEASER } from "@/content/support";

/**
 * The homepage's one claim about contribution.
 *
 * Only the MIT repositories already listed on /support appear here. Unlicensed
 * work is not invited. Tipping stays off this teaser until a Buy Me a Coffee
 * URL exists.
 */
export function SupportTeaser() {
  const headingId = "support-teaser-title";

  return (
    <section className="support-teaser" aria-labelledby={headingId}>
      <div className="support-teaser__copy">
        <p className="section-label">{SUPPORT_TEASER.eyebrow}</p>
        <p className="support-teaser__status">
          <span aria-hidden="true" />
          {SUPPORT_TEASER.status}
        </p>
        <h2 id={headingId}>{SUPPORT_TEASER.heading}</h2>
        <p className="support-teaser__description">{SUPPORT_TEASER.description}</p>
        <ul className="support-teaser__repos" aria-label="Repositories open to contribution">
          {CONTRIBUTABLE_REPOS.map((repo, index) => (
            <li key={repo.id}>
              <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <strong>{repo.name}</strong>
              <small>{repo.language}</small>
            </li>
          ))}
        </ul>
        <ActionLink className="support-teaser__action" href={SUPPORT_TEASER.actionHref}>
          {SUPPORT_TEASER.actionLabel} <span aria-hidden="true">→</span>
        </ActionLink>
      </div>

      <div className="support-teaser__mark" aria-hidden="true">
        <span className="support-teaser__mark-label">Open source / MIT</span>
        <div className="support-teaser__glyph">
          <i />
          <i />
          <b />
        </div>
        <small>Issues and pull requests are read</small>
      </div>
    </section>
  );
}
