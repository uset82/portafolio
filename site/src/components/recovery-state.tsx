import { ActionLink, EditorialHeading } from "@/components/ui";
import { cx } from "@/lib/class-names";

type RecoveryAction = {
  href: string;
  label: string;
};

type RecoveryStateProps = {
  eyebrow: string;
  title: string;
  description: string;
  marker: string;
  headingLevel?: 1 | 2;
  primaryAction: RecoveryAction;
  secondaryAction?: RecoveryAction;
  className?: string;
};

export function RecoveryState({
  eyebrow,
  title,
  description,
  marker,
  headingLevel = 2,
  primaryAction,
  secondaryAction,
  className,
}: RecoveryStateProps) {
  const titleId = `recovery-${marker.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-title`;

  return (
    <section className={cx("recovery-state", className)} aria-labelledby={titleId}>
      <div className="recovery-state__instrument" aria-hidden="true">
        <span className="recovery-state__orbit recovery-state__orbit--outer" />
        <span className="recovery-state__orbit recovery-state__orbit--inner" />
        <span className="recovery-state__axis recovery-state__axis--horizontal" />
        <span className="recovery-state__axis recovery-state__axis--vertical" />
        <strong>{marker}</strong>
        <i />
      </div>

      <div className="recovery-state__copy">
        <p className="section-label">{eyebrow}</p>
        <EditorialHeading level={headingLevel} id={titleId}>
          {title}
        </EditorialHeading>
        <p className="prose">{description}</p>
        <nav className="recovery-state__actions" aria-label="Recovery options">
          <ActionLink variant="primary" href={primaryAction.href}>
            {primaryAction.label}
          </ActionLink>
          {secondaryAction ? (
            <ActionLink variant="secondary" href={secondaryAction.href}>
              {secondaryAction.label} <span aria-hidden="true">→</span>
            </ActionLink>
          ) : null}
        </nav>
      </div>
    </section>
  );
}
