import Link, { type LinkProps } from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";

import { cx } from "@/lib/class-names";

export type ActionVariant = "primary" | "secondary" | "text";

type ActionLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
    variant?: ActionVariant;
  };

export function ActionLink({ variant = "text", className, ...props }: ActionLinkProps) {
  return <Link className={cx("ui-action", `ui-action--${variant}`, className)} {...props} />;
}

type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ActionVariant;
  loading?: boolean;
};

export function ActionButton({
  variant = "secondary",
  loading = false,
  disabled,
  className,
  children,
  type = "button",
  ...props
}: ActionButtonProps) {
  return (
    <button
      type={type}
      className={cx("ui-action", `ui-action--${variant}`, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      <span className="ui-action__label">{loading ? "Working…" : children}</span>
    </button>
  );
}
