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

        <div className="story-profile__portrait" aria-hidden="true">
          <span>{copy.portraitLabel}</span>
          <strong>CC</strong>
          <i />
          <i />
          <small>{copy.portraitCaption}</small>
        </div>
      </section>

      <section className="story-profile__narrative" aria-labelledby="story-narrative-title">
        <p className="section-label">{copy.perspectiveLabel}</p>
        <h2 id="story-narrative-title">{copy.perspectiveHeading}</h2>
        <p>{content.biography}</p>
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
