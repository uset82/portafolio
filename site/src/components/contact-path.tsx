import { ActionLink, StatusTag } from "@/components/ui";
import type { SiteMetadata } from "@/content/schemas";

type ContactPathProps = {
  content: SiteMetadata["footer"];
};

const privacyBoundaries = [
  ["Public email", "Not published"],
  ["Contact form", "Not enabled"],
  ["Additional social accounts", "None approved"],
  ["Availability", "No claim published"],
] as const;

export function ContactPath({ content }: ContactPathProps) {
  return (
    <main id="main-content" className="contact-path">
      <section className="contact-path__hero" aria-labelledby="contact-path-title">
        <div className="contact-path__rail">
          <p className="section-label">Contact / Public boundary</p>
          <StatusTag tone="hold">{content.status}</StatusTag>
        </div>

        <div className="contact-path__identity">
          <h1 id="contact-path-title">{content.heading}</h1>
          <p>
            No public email, form, booking route, or availability statement has been approved. Until
            that decision is made, this page offers only Carlos&apos;s verified public GitHub
            profile and clear paths back into the work.
          </p>
        </div>

        <div className="contact-path__signal" aria-hidden="true">
          <span>Signal / privacy first</span>
          <i />
          <i />
          <i />
          <strong>CC</strong>
          <small>One verified public channel</small>
        </div>
      </section>

      <section className="contact-path__channel" aria-labelledby="contact-channel-title">
        <div>
          <p className="section-label">Public channel / 01</p>
          <h2 id="contact-channel-title">One verified profile. No hidden inbox.</h2>
        </div>

        <div className="contact-path__channel-copy">
          <p>
            GitHub is the only public account Carlos has approved for this portfolio. It is offered
            as a verified profile path—not as a response-time, availability, employment, or booking
            promise.
          </p>
          <ActionLink
            className="contact-path__github"
            variant="primary"
            href={content.secondaryAction.href}
            prefetch={false}
          >
            <span>
              <small>Verified external profile</small>
              {content.secondaryAction.label}
            </span>
            <span aria-hidden="true">↗</span>
            <span className="visually-hidden"> — external site</span>
          </ActionLink>
        </div>
      </section>

      <section className="contact-path__privacy" aria-labelledby="contact-privacy-title">
        <header>
          <p className="section-label">Privacy / 02</p>
          <h2 id="contact-privacy-title">No contact data is collected here.</h2>
          <p>
            This route contains no message field, file upload, tracking form, private address, or
            direct-contact value. The omitted options remain visible as decisions, not disguised as
            working features.
          </p>
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
        <p className="section-label">Continue / 03</p>
        <h2 id="contact-next-title">Start with the work and the public story.</h2>
        <p>
          These routes contain the approved context currently available without asking for personal
          information or implying an open engagement.
        </p>
        <nav aria-label="Contact route alternatives">
          <ActionLink variant="primary" href="/work">
            Explore Work
          </ActionLink>
          <ActionLink variant="secondary" href="/story">
            Read Story
          </ActionLink>
        </nav>
      </section>
    </main>
  );
}
