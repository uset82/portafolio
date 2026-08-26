import { StoryPortrait } from "@/components/story-portrait";
import { OPPORTUNITY_PAPER, OPPORTUNITY_PROTOTYPE } from "@/content/opportunity";
import { ActionLink, StatusTag } from "@/components/ui";
import { PROFILE_ES } from "@/content/i18n/records-es";
import { ui } from "@/content/i18n/ui";
import type { SiteMetadata } from "@/content/schemas";
import { resolveHref, type Locale } from "@/lib/i18n";

type StoryProfileProps = {
  name: string;
  content: SiteMetadata["profileTeaser"];
  locale?: Locale;
};

export function StoryProfile({ name, content: source, locale = "en" }: StoryProfileProps) {
  const copy = ui(locale).story;
  const content = locale === "es" ? { ...source, ...PROFILE_ES } : source;
  return (
    <main id="main-content" className="story-profile">
      <section className="story-profile__hero" aria-labelledby="story-profile-title">
        <div className="story-profile__rail">
          <p className="section-label">{copy.label}</p>
          <StatusTag tone="ready">{copy.approved}</StatusTag>
        </div>

        <header className="story-profile__identity">
          <p>{content.role}</p>
          <h1 id="story-profile-title">{name}</h1>
          <strong>{content.heading}</strong>
        </header>

        <StoryPortrait
          bottomLabel={copy.portraitCaption}
          emblemLabel={copy.emblemLabel}
          topLabel={copy.portraitLabel}
        />
      </section>

      <section className="story-profile__narrative" aria-labelledby="story-narrative-title">
        <p className="section-label">{copy.perspectiveLabel}</p>
        <h2 id="story-narrative-title">{copy.perspectiveHeading}</h2>
        <p>{content.biography}</p>
      </section>

      {/* The route's own evidence: research he did not do, in a field he cannot
          read, and the prototype that came out of seeing it anyway. The paper is
          open access under CC BY, so it is cited in full rather than alluded to,
          and labelled plainly as somebody else's work. */}
      <section className="story-profile__opportunity" aria-labelledby="story-opportunity-title">
        <header>
          <p className="section-label">{copy.opportunityLabel}</p>
          <h2 id="story-opportunity-title">{copy.opportunityHeading}</h2>
        </header>

        <div className="story-profile__opportunity-copy">
          <p>{copy.opportunityBody}</p>

          <figure className="story-profile__paper">
            <figcaption>
              <span className="section-label">{copy.foundLabel}</span>
              <span className="story-profile__paper-flag">{copy.foundNotMine}</span>
            </figcaption>
            <blockquote cite={OPPORTUNITY_PAPER.href}>{OPPORTUNITY_PAPER.title}</blockquote>
            <p className="story-profile__paper-authors">{OPPORTUNITY_PAPER.authors}</p>
            <dl>
              <div>
                <dt>{OPPORTUNITY_PAPER.journal}</dt>
                <dd>{OPPORTUNITY_PAPER.citation}</dd>
              </div>
              <div>
                <dt>{copy.foundInstitution}</dt>
                <dd>{OPPORTUNITY_PAPER.institution}</dd>
              </div>
              <div>
                <dt>{copy.foundLicence}</dt>
                <dd>{OPPORTUNITY_PAPER.licence}</dd>
              </div>
            </dl>
            <ActionLink variant="text" href={OPPORTUNITY_PAPER.href} prefetch={false}>
              {copy.foundRead}
              <span aria-hidden="true"> ↗</span>
              <span className="visually-hidden">{ui(locale).common.externalSite}</span>
            </ActionLink>
          </figure>

          <p>{copy.opportunityTurn}</p>

          <div className="story-profile__built">
            <p className="section-label">{copy.builtLabel}</p>
            <h3>{copy.builtHeading}</h3>
            <p>{copy.builtBody}</p>
            <ActionLink variant="primary" href={OPPORTUNITY_PROTOTYPE.href} prefetch={false}>
              {copy.builtAction}
              <span aria-hidden="true"> ↗</span>
              <span className="visually-hidden">{ui(locale).common.externalSite}</span>
            </ActionLink>
            <p className="story-profile__built-meta">{copy.builtMeta}</p>
          </div>
        </div>
      </section>

      <section className="story-profile__practice" aria-labelledby="story-practice-title">
        <header>
          <p className="section-label">{copy.practiceLabel}</p>
          <h2 id="story-practice-title">{copy.practiceHeading}</h2>
        </header>

        <ol aria-label={copy.practiceAria}>
          {content.practiceThreads.map((thread, index) => (
            <li key={thread}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{thread}</strong>
            </li>
          ))}
        </ol>
      </section>

      <section className="story-profile__record" aria-labelledby="story-record-title">
        <div className="story-profile__record-heading">
          <p className="section-label">{copy.recordLabel}</p>
          <h2 id="story-record-title">{copy.recordHeading}</h2>
        </div>

        <div className="story-profile__record-copy">
          <p>{copy.recordBody}</p>

          <dl>
            <div>
              <dt>{copy.publishedNow}</dt>
              <dd>{copy.publishedNowValue}</dd>
            </div>
            <div>
              <dt>{copy.heldForReview}</dt>
              <dd>{copy.heldForReviewValue}</dd>
            </div>
          </dl>

          <p className="story-profile__privacy">{copy.privacy}</p>

          <nav className="story-profile__actions" aria-label={copy.actionsAria}>
            <ActionLink variant="primary" href={resolveHref(locale, "/work")}>
              {copy.exploreWork}
            </ActionLink>
            <ActionLink variant="secondary" href={resolveHref(locale, "/contact")}>
              {copy.visitContact}
            </ActionLink>
            <ActionLink variant="text" href={content.secondaryAction.href} prefetch={false}>
              {copy.viewGithub} <span aria-hidden="true">↗</span>
              <span className="visually-hidden">{ui(locale).common.externalSite}</span>
            </ActionLink>
          </nav>
        </div>
      </section>
    </main>
  );
}
