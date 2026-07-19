import type { HTMLAttributes, ReactNode } from "react";

import { cx } from "@/lib/class-names";

type EditorialHeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  level?: 1 | 2 | 3;
  children: ReactNode;
};

export function EditorialHeading({
  level = 2,
  className,
  children,
  ...props
}: EditorialHeadingProps) {
  const Heading = `h${level}` as "h1" | "h2" | "h3";

  return (
    <Heading className={cx("ui-editorial-heading", className)} {...props}>
      {children}
    </Heading>
  );
}
