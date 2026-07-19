import Image, { type ImageProps } from "next/image";
import type { ReactNode } from "react";

import { cx } from "@/lib/class-names";

type ImageFrameProps = Omit<ImageProps, "alt" | "className"> & {
  alt: string;
  caption?: ReactNode;
  credit?: ReactNode;
  className?: string;
  imageClassName?: string;
  bleed?: boolean;
};

export function ImageFrame({
  alt,
  caption,
  credit,
  className,
  imageClassName,
  bleed = false,
  ...imageProps
}: ImageFrameProps) {
  return (
    <figure
      className={cx("media-frame", "ui-image-frame", bleed && "ui-image-frame--bleed", className)}
    >
      <Image className={imageClassName} alt={alt} {...imageProps} />
      {(caption || credit) && (
        <figcaption className="ui-image-frame__caption">
          {caption && <span>{caption}</span>}
          {credit && <small>Credit: {credit}</small>}
        </figcaption>
      )}
    </figure>
  );
}
