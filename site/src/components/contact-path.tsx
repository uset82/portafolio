import { ContactSignal } from "@/components/contact-signal";
import { ActionLink, StatusTag } from "@/components/ui";
import { FOOTER_ES } from "@/content/i18n/records-es";
import { OPEN_CALL_ROUTES } from "@/content/open-call";
import { ui } from "@/content/i18n/ui";
import type { SiteMetadata } from "@/content/schemas";
import { resolveHref, type Locale } from "@/lib/i18n";

type ContactPathProps = {
  content: SiteMetadata["footer"];
  locale?: Locale;
};

export function ContactPath({ content, locale = "en" }: ContactPathProps) {
  const copy = ui(locale).contact;
  const privacyBoundaries = copy.boundaries;
  const status = locale === "es" ? FOOTER_ES.status : content.status;
  const heading = locale === "es" ? FOOTER_ES.heading : content.heading;
  return (
    <main id="main-content" className="contact-path">
      <section className="contact-path__hero" aria-labelledby="contact-path-title">
        <div className="contact-path__rail">
          <p className="section-label">{copy.label}</p>
          <StatusTag tone="hold">{status}</StatusTag>
        </div>

        <div className="contact-path__identity">
          <h1 id="contact-path-title">{heading}</h1>
          <p>{copy.intro}</p>
        </div>

        <ContactSignal
          bottomLabel={copy.oneChannel}
          emblemLabel={copy.emblemLabel}
          topLabel={copy.signalLabel}
        />
      </section>

      <section className="contact-path__call" aria-labelledby="contact-call-title">
        <header>
          <p className="section-label">{copy.callLabel}</p>
          <h2 id="contact-call-title">{copy.callHeading}</h2>
          <p className="contact-path__project">{copy.callProject}</p>
        </header>

        <div className="contact-path__call-copy">
          <p className="contact-path__question">{copy.callQuestion}</p>
          <p>{copy.callBody}</p>

          <ul className="contact-path__asks" aria-label={copy.asksAria}>
            <li>
              <p className="section-label">{copy.askOneLabel}</p>
              <h3>{copy.askOneHeading}</h3>
              <p>{copy.askOneBody}</p>
              <ActionLink
                variant="primary"
                href={OPEN_CALL_ROUTES.opportunity}
                prefetch={false}
              >
                {copy.askOneAction}
                <span aria-hidden="true">↗</span>
                <span className="visually-hidden">{ui(locale).common.externalSite}</span>
              </ActionLink>
              <p className="contact-path__ask-meta">{copy.askOneMeta}</p>
            </li>

            <li>
              <p className="section-label">{copy.askTwoLabel}</p>
              <h3>{copy.askTwoHeading}</h3>
              <p>{copy.askTwoBody}</p>
              <ActionLink
                variant="secondary"
                href={OPEN_CALL_ROUTES.coFounder}
                prefetch={false}
              >
                {copy.askTwoAction}
                <span aria-hidden="true">↗</span>
                <span className="visually-hidden">{ui(locale).common.externalSite}</span>
              </ActionLink>
              <p className="contact-path__ask-meta">{copy.askTwoMeta}</p>
            </li>
          </ul>

          <p className="contact-path__call-note">{copy.callProjectNote}</p>
        </div>
      </section>

      <section className="contact-path__channel" aria-labelledby="contact-channel-title">
        <div>
          <p className="section-label">{copy.channelLabel}</p>
          <h2 id="contact-channel-title">{copy.channelHeading}</h2>
        </div>

        <div className="contact-path__channel-copy">
          <p>{copy.channelBody}</p>
          <ActionLink
            className="contact-path__github"
            variant="primary"
            href={content.secondaryAction.href}
            prefetch={false}
          >
            <span>
              <small>{copy.verifiedProfile}</small>
              {content.secondaryAction.label}
            </span>
            <span aria-hidden="true">↗</span>
            <span className="visually-hidden">{ui(locale).common.externalSite}</span>
          </ActionLink>
        </div>
      </section>

      <section className="contact-path__privacy" aria-labelledby="contact-privacy-title">
        <header>
          <p className="section-label">{copy.privacyLabel}</p>
          <h2 id="contact-privacy-title">{copy.privacyHeading}</h2>
          <p>{copy.privacyBody}</p>
        </header>

        <dl>
          {privacyBoundaries.map(([label, value], index) => (
            <div key={label}>
              <dt>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {label}
              </dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="contact-path__continuation" aria-labelledby="contact-next-title">
        <p className="section-label">{copy.continueLabel}</p>
        <h2 id="contact-next-title">{copy.continueHeading}</h2>
        <p>{copy.continueBody}</p>
        <nav aria-label={copy.alternativesAria}>
          <ActionLink variant="primary" href={resolveHref(locale, "/work")}>
            {copy.exploreWork}
          </ActionLink>
          <ActionLink variant="secondary" href={resolveHref(locale, "/story")}>
            {copy.readStory}
          </ActionLink>
        </nav>
      </section>
    </main>
  );
}
