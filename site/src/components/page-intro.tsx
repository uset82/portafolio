import { ActionLink, EditorialHeading } from "@/components/ui";

type PageIntroProps = {
  eyebrow: string;
  title: string;
  description: string;
  meta?: React.ReactNode;
  children?: React.ReactNode;
};

export function PageIntro({ eyebrow, title, description, meta, children }: PageIntroProps) {
  return (
    <main id="main-content" className="interior-main">
      <section className="page-intro layout-container layout-grid" aria-labelledby="page-title">
        <div className="page-intro__meta">
          <p className="section-label">{eyebrow}</p>
          {meta}
        </div>
        <EditorialHeading level={1} id="page-title">
          {title}
        </EditorialHeading>
        <div className="page-intro__summary">
          <p className="prose">{description}</p>
          {children}
        </div>
      </section>
      <section
        className="preparation-state layout-container layout-grid"
        aria-labelledby="preparation-title"
      >
        <span aria-hidden="true">CC / 01</span>
        <div>
          <h2 id="preparation-title">Source verification in progress</h2>
          <p>
            This route is part of the working site. Its publishable content will appear only after
            project facts, media rights, and links are verified—there is no invented filler here.
          </p>
        </div>
        <ActionLink className="text-link" href="/">
          Return to the Observatory <span aria-hidden="true">→</span>
        </ActionLink>
      </section>
    </main>
  );
}
