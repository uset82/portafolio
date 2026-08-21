import { ActionLink } from "@/components/ui";
import { SUPPORT_TEASER_ES } from "@/content/i18n/support-es";
import { ui } from "@/content/i18n/ui";
import { OPEN_SOURCE, SUPPORT_TEASER } from "@/content/support";
import { resolveHref, type Locale } from "@/lib/i18n";

/**
 * The homepage's one claim about the work on GitHub.
 *
 * The repositories tab is the place to look through everything. Contribution
 * stays on /support, and only for the MIT repositories. Unlicensed work is
 * readable there, not invited here. Tipping stays off this teaser until a
 * Buy Me a Coffee URL exists.
 */
export function SupportTeaser({ locale = "en" }: { locale?: Locale }) {
  const copy = ui(locale).supportTeaser;
  const teaser = locale === "es" ? SUPPORT_TEASER_ES : SUPPORT_TEASER;
  const headingId = "support-teaser-title";

  return (
    <section className="support-teaser" aria-labelledby={headingId}>
      <div className="support-teaser__copy">
        <p className="section-label">{teaser.eyebrow}</p>
        <p className="support-teaser__status">
          <span aria-hidden="true" />
          {teaser.status}
        </p>
        <h2 id={headingId}>{teaser.heading}</h2>
        <p className="support-teaser__description">{teaser.description}</p>
        <ul className="support-teaser__repos" aria-label={copy.reposAria}>
          {teaser.threads.map((thread, index) => (
            <li key={thread}>
              <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <strong>{thread}</strong>
            </li>
          ))}
        </ul>
        <div className="support-teaser__actions">
          <ActionLink
            className="support-teaser__action"
            href={OPEN_SOURCE.repositoriesUrl}
            target="_blank"
            rel="noreferrer"
          >
            {locale === "es" ? SUPPORT_TEASER_ES.repositoriesLabel : OPEN_SOURCE.repositoriesLabel}{" "}
            <span aria-hidden="true">&#8599;</span>
          </ActionLink>
          <ActionLink
            className="support-teaser__action"
            href={resolveHref(locale, SUPPORT_TEASER.actionHref)}
          >
            {teaser.actionLabel} <span aria-hidden="true">&#8594;</span>
          </ActionLink>
        </div>
      </div>

      <div className="support-teaser__mark" aria-hidden="true">
        <span className="support-teaser__mark-label">{copy.markLabel}</span>
        <svg className="support-teaser__glyph" viewBox="0 0 80 80" focusable="false">
          <rect className="support-teaser__page" x="24" y="12" width="38" height="48" rx="2.5" />
          <rect className="support-teaser__page" x="18" y="18" width="38" height="48" rx="2.5" />
          <rect
            className="support-teaser__page support-teaser__page--front"
            x="12"
            y="24"
            width="38"
            height="48"
            rx="2.5"
          />
          <line className="support-teaser__rule" x1="18" y1="36" x2="42" y2="36" />
          <line className="support-teaser__rule" x1="18" y1="42" x2="36" y2="42" />
          <line className="support-teaser__rule" x1="18" y1="48" x2="40" y2="48" />
          <circle className="support-teaser__node" cx="22" cy="58" r="3.2" />
        </svg>
        <small>{copy.comeAndLook}</small>
      </div>
    </section>
  );
}
