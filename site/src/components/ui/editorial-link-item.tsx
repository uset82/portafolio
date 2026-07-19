import Link from "next/link";

import { cx } from "@/lib/class-names";

type EditorialLinkItemProps = {
  href: string;
  index?: string;
  title: string;
  description: string;
  className?: string;
};

export function EditorialLinkItem({
  href,
  index,
  title,
  description,
  className,
}: EditorialLinkItemProps) {
  return (
    <Link className={cx("ui-editorial-link", className)} href={href}>
      {index && <span className="system-index">{index}</span>}
      <span className="ui-editorial-link__copy">
        <strong>{title}</strong>
        <small>{description}</small>
      </span>
      <span className="system-arrow" aria-hidden="true">
        ↗
      </span>
    </Link>
  );
}
