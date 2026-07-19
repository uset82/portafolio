"use client";

import { motion, type HTMLMotionProps } from "motion/react";

/**
 * Adapted from Animate UI's MIT-licensed copy-first Button primitive.
 * Styling remains local so the motion behavior follows this project's tokens.
 * Source: https://animate-ui.com/docs/primitives/buttons/button
 */
export type AnimatedButtonProps = HTMLMotionProps<"button"> & {
  hoverScale?: number;
  tapScale?: number;
};

export function AnimatedButton({
  hoverScale = 1.015,
  tapScale = 0.98,
  ...props
}: AnimatedButtonProps) {
  return (
    <motion.button whileHover={{ scale: hoverScale }} whileTap={{ scale: tapScale }} {...props} />
  );
}
