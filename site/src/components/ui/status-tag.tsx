import type { HTMLAttributes, ReactNode } from "react";

import { cx } from "@/lib/class-names";

export type StatusTone = "neutral" | "concept" | "ready" | "hold" | "private";

type StatusTagProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: StatusTone;
  children: ReactNode;
};

export function StatusTag({ tone = "neutral", className, children, ...props }: StatusTagProps) {
  return (
    <span className={cx("ui-status", `ui-status--${tone}`, className)} {...props}>
      <span className="ui-status__marker" aria-hidden="true" />
      {children}
    </span>
  );
}
