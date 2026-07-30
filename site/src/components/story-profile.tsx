import { ActionLink, StatusTag } from "@/components/ui";
import type { SiteMetadata } from "@/content/schemas";

type StoryProfileProps = {
  name: string;
  content: SiteMetadata["profileTeaser"];
};

export function StoryProfile({ name, content }: StoryProfileProps) {
  return (
    <main id="main-content" className="story-profile">
      <section className="story-profile__hero" aria-labelledby="story-profile-title">
        <div className="story-profile__rail">
          <p className="section-label">Story / Public profile</p>
          <StatusTag tone="ready">Biography approved</StatusTag>
        </div>

        <header className="story-profile__identity">
          <p>{content.role}</p>
          <h1 id="story-profile-title">{name}</h1>
          <strong>{content.heading}</strong>
        </header>

        <div className="story-profile__portrait" aria-hidden="true">
          <span>Profile study / 01</span>
          <strong>CC</strong>
          <i />
          <i />
          <small>Typographic portrait</small>
        </div>
      </section>

      <section className="story-profile__narrative" aria-labelledby="story-narrative-title">
        <p className="section-label">Perspective / 01</p>
        <h2 id="story-narrative-title">The person behind the systems.</h2>
        <p>{content.biography}</p>
      </section>

      <section className="story-profile__practice" aria-labelledby="story-practice-title">
        <header>
          <p className="section-label">Practice / 02</p>
          <h2 id="story-practice-title">Three threads, one evolving practice.</h2>
        </header>

        <ol aria-label="Approved practice threads">
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
          <p className="section-label">Public record / 03</p>
          <h2 id="story-record-title">A web-first CV, released carefully.</h2>
        </div>

        <div className="story-profile__record-copy">
          <p>
            This page currently publishes only Carlos&apos;s approved role, biography, practice
            areas, and public GitHub path. Experience, education, and skills remain withheld until a
            privacy-safe web record is separately approved.
          </p>

          <dl>
            <div>
              <dt>Published now</dt>
              <dd>Approved public biography and GitHub profile</dd>
            </div>
            <div>
              <dt>Held for review</dt>
              <dd>Career timeline, education, skills, portrait, and résumé file</dd>
            </div>
          </dl>

          <p className="story-profile__privacy">
            No private résumé, portrait, location, direct contact detail, or unsupported career
            claim is exposed by this route.
          </p>

          <nav className="story-profile__actions" aria-label="Public profile paths">
            <ActionLink variant="primary" href="/work">
              Explore the work
            </ActionLink>
            <ActionLink variant="secondary" href="/contact">
              Visit Contact
            </ActionLink>
            <ActionLink variant="text" href={content.secondaryAction.href} prefetch={false}>
              View GitHub <span aria-hidden="true">↗</span>
              <span className="visually-hidden"> — external site</span>
            </ActionLink>
          </nav>
        </div>
      </section>
    </main>
  );
}
