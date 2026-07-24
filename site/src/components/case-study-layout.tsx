import type { ReactNode } from "react";

import { ConsentEmbed, NativeMedia } from "@/components/media";
import {
  ActionLink,
  EditorialHeading,
  ImageFrame,
  StatusTag,
  type StatusTone,
} from "@/components/ui";
import type { MediaAsset, Project } from "@/content/schemas";

type CaseStudyLayoutProps = {
  project: Project;
  index?: string;
  group?: string;
  architectureVisual?: ReactNode;
  demo?: ReactNode;
  relatedWork?: ReactNode;
};

const reusableRights = new Set<MediaAsset["rights"]>([
  "owned",
  "permission-granted",
  "permissive-license",
  "attribution-required",
]);

function humanize(value: string) {
  return value.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusTone(status: Project["status"]): StatusTone {
  if (status === "shipped" || status === "maintained") return "ready";
  if (status === "preparation") return "hold";
  if (status === "archived") return "neutral";
  return "concept";
}

function canPublishMedia(media: MediaAsset) {
  return media.verification === "verified" && reusableRights.has(media.rights);
}

function CaseStudyMedia({ media }: { media: MediaAsset }) {
  const rightsLabel = humanize(media.rights);
  const credit = media.credit ?? media.owner;

  if (media.type === "image") {
    return (
      <ImageFrame
        src={media.src}
        alt={media.alt}
        width={media.width}
        height={media.height}
        sizes="(max-width: 48rem) 100vw, (max-width: 80rem) 84vw, 72rem"
        caption={media.caption ?? media.title}
        credit={credit}
      />
    );
  }

  if (media.type === "audio") {
    return (
      <NativeMedia
        kind="audio"
        title={media.title}
        src={media.src}
        fallbackUrl={media.src}
        credit={credit}
        rightsLabel={rightsLabel}
        {...(media.transcript ? { transcript: media.transcript } : {})}
        {...(media.durationSeconds
          ? { durationLabel: `${Math.ceil(media.durationSeconds / 60)} min` }
          : {})}
      />
    );
  }

  if (media.type === "video" && media.poster) {
    return (
      <NativeMedia
        kind="video"
        title={media.title}
        src={media.src}
        fallbackUrl={media.src}
        poster={media.poster}
        width={media.width}
        height={media.height}
        credit={credit}
        rightsLabel={rightsLabel}
        {...(media.transcript ? { transcript: media.transcript } : {})}
        {...(media.durationSeconds
          ? { durationLabel: `${Math.ceil(media.durationSeconds / 60)} min` }
          : {})}
        {...(media.captions
          ? {
              captions: [{ src: media.captions, srcLang: "en", label: "English", default: true }],
            }
          : {})}
      />
    );
  }

  if (media.type === "embed") {
    return (
      <ConsentEmbed
        provider={media.provider}
        accessibleName={media.accessibleName}
        embedUrl={media.src}
        fallbackUrl={media.fallbackUrl}
        privacyMode={media.privacyMode}
      />
    );
  }

  return null;
}

function ReadingSection({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="case-study__reading-section" id={id} aria-labelledby={`${id}-title`}>
      <p className="case-study__section-index" aria-hidden="true">
        {number}
      </p>
      <div>
        <EditorialHeading level={2} id={`${id}-title`}>
          {title}
        </EditorialHeading>
        <div className="case-study__prose">{children}</div>
      </div>
    </section>
  );
}

export function CaseStudyLayout({
  project,
  index,
  group,
  architectureVisual,
  demo,
  relatedWork,
}: CaseStudyLayoutProps) {
  const isConcept = "conceptStatement" in project;
  const approvedLinks =
    project.publication === "ready"
      ? project.links.filter(
          (link) => link.verification === "verified" || link.verification === "user-approved",
        )
      : [];
  const approvedMedia =
    project.publication === "ready" ? project.media.filter(canPublishMedia) : [];
  const eyebrow = `${group ?? humanize(project.category)} / ${index ?? "Case study"}`;

  return (
    <main id="main-content" className="case-study">
      <header className="case-study__hero layout-container">
        <div className="case-study__hero-rail">
          <ActionLink href="/work" className="case-study__back-link">
            <span aria-hidden="true">←</span> Back to Work
          </ActionLink>
          <p className="section-label">{eyebrow}</p>
          <StatusTag tone={statusTone(project.status)}>{humanize(project.status)}</StatusTag>
        </div>

        <div className="case-study__title-block">
          <p className="case-study__tagline">{project.tagline}</p>
          <EditorialHeading level={1} id="case-study-title">
            {project.title}
          </EditorialHeading>
          <p className="case-study__summary">{project.summary}</p>
        </div>

        <dl className="case-study__facts" aria-label="Project record status">
          <div>
            <dt>Category</dt>
            <dd>{humanize(project.category)}</dd>
          </div>
          <div>
            <dt>Evidence</dt>
            <dd>{humanize(project.verification)}</dd>
          </div>
          <div>
            <dt>Publication</dt>
            <dd>{humanize(project.publication)}</dd>
          </div>
          {!isConcept && project.year ? (
            <div>
              <dt>Year</dt>
              <dd>{project.year}</dd>
            </div>
          ) : null}
        </dl>
      </header>

      {isConcept ? (
        <>
          <ReadingSection id="overview" number="01" title="Approved concept">
            <p>{project.conceptStatement}</p>
          </ReadingSection>

          <section className="case-study__evidence-field" aria-labelledby="evidence-title">
            <div className="case-study__evidence-orbit" aria-hidden="true">
              <span />
              <span />
              <strong>{index ?? "CC"}</strong>
            </div>
            <div className="case-study__evidence-copy">
              <p className="section-label">Evidence field / intentionally empty</p>
              <EditorialHeading level={2} id="evidence-title">
                Public media is still held.
              </EditorialHeading>
              <p>
                No screenshot, model, demo, or source link is shown until its facts, ownership, and
                reuse rights pass review.
              </p>
            </div>
          </section>

          <ReadingSection id="publication-boundary" number="02" title="Publication boundary">
            <p>
              A full case study will add contribution, constraints, approach, evidence, outcomes,
              learning, stack, and source links only after those records are verified.
            </p>
            <ActionLink href="/" variant="secondary">
              Return to the Observatory
            </ActionLink>
          </ReadingSection>
        </>
      ) : (
        <>
          <ReadingSection id="contribution" number="01" title="Contribution">
            <p>{project.contribution}</p>
          </ReadingSection>

          <ReadingSection id="overview" number="02" title="Overview">
            <p>{project.summary}</p>
          </ReadingSection>

          <ReadingSection id="problem" number="03" title="Problem and constraints">
            <p>{project.problem}</p>
            <ul>
              {project.constraints.map((constraint) => (
                <li key={constraint}>{constraint}</li>
              ))}
            </ul>
          </ReadingSection>

          <ReadingSection id="approach" number="04" title="Approach">
            <p>{project.approach}</p>
          </ReadingSection>

          {approvedMedia.length > 0 || architectureVisual || demo ? (
            <section
              className="case-study__evidence"
              id="evidence"
              aria-labelledby="evidence-title"
            >
              <div className="case-study__evidence-heading">
                <p className="section-label">05 / Verified evidence</p>
                <EditorialHeading level={2} id="evidence-title">
                  Process, architecture, and demonstration
                </EditorialHeading>
              </div>
              <div className="case-study__media-stack">
                {approvedMedia.map((media) => (
                  <CaseStudyMedia key={media.id} media={media} />
                ))}
                {architectureVisual ? (
                  <div className="case-study__technical-field">{architectureVisual}</div>
                ) : null}
                {demo ? <div className="case-study__demo-field">{demo}</div> : null}
              </div>
            </section>
          ) : (
            <section className="case-study__unavailable" aria-labelledby="demo-unavailable-title">
              <p className="section-label">05 / Evidence</p>
              <EditorialHeading level={2} id="demo-unavailable-title">
                No public demonstration is available.
              </EditorialHeading>
              <p>
                A demo or visual will appear here only after its source and rights are verified.
              </p>
            </section>
          )}

          {project.outcome ? (
            <ReadingSection id="outcome" number="06" title="Outcome">
              <p>{project.outcome}</p>
            </ReadingSection>
          ) : null}

          {project.learnings.length > 0 ? (
            <ReadingSection id="learning" number="07" title="Learning">
              <ul>
                {project.learnings.map((learning) => (
                  <li key={learning}>{learning}</li>
                ))}
              </ul>
            </ReadingSection>
          ) : null}

          {project.stack.length > 0 ? (
            <ReadingSection id="stack" number="08" title="Stack">
              <ul className="case-study__stack-list" aria-label="Project technologies">
                {project.stack.map((technology) => (
                  <li key={technology}>{technology}</li>
                ))}
              </ul>
            </ReadingSection>
          ) : null}

          <ReadingSection id="sources" number="09" title="Sources and demonstrations">
            {approvedLinks.length > 0 ? (
              <div className="case-study__source-links">
                {approvedLinks.map((link) => (
                  <ActionLink
                    key={link.id}
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noreferrer" : undefined}
                    variant={link.kind === "demo" ? "primary" : "secondary"}
                  >
                    {link.label}
                    {link.external ? <span aria-hidden="true">↗</span> : null}
                  </ActionLink>
                ))}
              </div>
            ) : (
              <p>No verified public repository or demonstration is available for this record.</p>
            )}
          </ReadingSection>
        </>
      )}

      {relatedWork ? (
        <section className="case-study__related" aria-labelledby="related-work-title">
          <p className="section-label">Continue / Related work</p>
          <EditorialHeading level={2} id="related-work-title">
            Related work
          </EditorialHeading>
          {relatedWork}
        </section>
      ) : null}
    </main>
  );
}
