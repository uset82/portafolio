import Link from "next/link";

import { StatusTag, type StatusTone } from "@/components/ui";

export type SelectedWorkStatus = "maintained" | "prototype" | "experiment";
export type SelectedWorkVisualTone = "sage" | "clay" | "water" | "walnut" | "taupe";

export type SelectedWorkItem = {
  id: string;
  title: string;
  tagline: string;
  category: string;
  status: SelectedWorkStatus;
  contribution: string;
  href: string;
  linkLabel: string;
  visualTone: SelectedWorkVisualTone;
};

type SelectedWorkProps = {
  eyebrow: string;
  heading: string;
  description: string;
  items: readonly SelectedWorkItem[];
  headingId?: string;
};

const statusTone: Record<SelectedWorkStatus, StatusTone> = {
  maintained: "ready",
  prototype: "concept",
  experiment: "neutral",
};

function formatStatus(status: SelectedWorkStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function SelectedWork({
  eyebrow,
  heading,
  description,
  items,
  headingId = "selected-work-title",
}: SelectedWorkProps) {
  return (
    <section className="selected-work" aria-labelledby={headingId}>
      <header className="selected-work__header">
        <p className="section-label">{eyebrow}</p>
        <div>
          <h2 id={headingId}>{heading}</h2>
          <p>{description}</p>
        </div>
      </header>

      <ol className="selected-work__list">
        {items.map((item, index) => {
          const displayIndex = String(index + 1).padStart(2, "0");
          const titleId = `selected-work-${item.id}-title`;

          return (
            <li key={item.id}>
              <article className="selected-work__project" aria-labelledby={titleId}>
                <div
                  className={`selected-work__plate selected-work__plate--${item.visualTone}`}
                  aria-hidden="true"
                >
                  <span>{displayIndex}</span>
                  <i />
                  <small>{item.category}</small>
                </div>

                <div className="selected-work__identity">
                  <div className="selected-work__meta">
                    <span>{item.category}</span>
                    <StatusTag tone={statusTone[item.status]}>
                      {formatStatus(item.status)}
                    </StatusTag>
                  </div>
                  <h3 id={titleId}>{item.title}</h3>
                  <p>{item.tagline}</p>
                </div>

                <div className="selected-work__contribution">
                  <span>Contribution</span>
                  <p>{item.contribution}</p>
                </div>

                <Link className="selected-work__project-link" href={item.href} prefetch={false}>
                  <span>{item.linkLabel}</span>
                  <span aria-hidden="true">↗</span>
                </Link>
              </article>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
