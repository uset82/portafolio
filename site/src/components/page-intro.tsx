import { RecoveryState } from "@/components/recovery-state";
import { EditorialHeading } from "@/components/ui";

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
      <RecoveryState
        className="layout-container"
        eyebrow="Publication gate / held"
        title="Source verification in progress"
        description="This route is part of the working site. Its publishable content will appear only after project facts, media rights, and links are verified—there is no invented filler here."
        marker="CC / 01"
        primaryAction={{ href: "/", label: "Return to the Observatory" }}
      />
    </main>
  );
}
