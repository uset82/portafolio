import { ActionLink } from "@/components/ui";
import type { SelectedSystem } from "@/content/site";

type ProjectJourney = {
  previous: SelectedSystem | null;
  next: SelectedSystem | null;
};

type CaseStudyJourneyProps = {
  currentSlug: string;
  systems: readonly SelectedSystem[];
};

export function getProjectJourney(
  systems: readonly SelectedSystem[],
  currentSlug: string,
): ProjectJourney | null {
  const currentIndex = systems.findIndex((system) => system.slug === currentSlug);

  if (currentIndex < 0) return null;

  return {
    previous: systems[currentIndex - 1] ?? null,
    next: systems[currentIndex + 1] ?? null,
  };
}

function JourneyLink({
  direction,
  system,
}: {
  direction: "previous" | "next";
  system: SelectedSystem;
}) {
  const isPrevious = direction === "previous";
  const directionLabel = isPrevious ? "Previous system" : "Next system";

  return (
    <ActionLink
      href={`/work/${system.slug}`}
      className={`case-study-journey__link case-study-journey__link--${direction}`}
      aria-label={`${directionLabel}: ${system.title}`}
    >
      <span className="case-study-journey__direction">
        {isPrevious ? <span aria-hidden="true">←</span> : null}
        {directionLabel}
        {!isPrevious ? <span aria-hidden="true">→</span> : null}
      </span>
      <strong className="case-study-journey__title">
        <span aria-hidden="true">{system.index}</span>
        {system.title}
      </strong>
      <span className="case-study-journey__descriptor">
        {system.descriptor} · {system.group}
      </span>
    </ActionLink>
  );
}

export function CaseStudyJourney({ currentSlug, systems }: CaseStudyJourneyProps) {
  const journey = getProjectJourney(systems, currentSlug);

  if (!journey) return null;

  return (
    <nav className="case-study-journey" aria-label="Related project navigation">
      <div className="case-study-journey__routes">
        {journey.previous ? <JourneyLink direction="previous" system={journey.previous} /> : null}
        {journey.next ? <JourneyLink direction="next" system={journey.next} /> : null}
      </div>
      <ActionLink href="/work" variant="secondary" className="case-study-journey__exit">
        Return to Work
      </ActionLink>
    </nav>
  );
}
