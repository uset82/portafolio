"use client";

import { motion } from "motion/react";

const group = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.055,
      delayChildren: 0.08,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.52 },
  },
};

export function HeroReveal({ children }: { children: React.ReactNode }) {
  return (
    <motion.div className="hero-copy" variants={group} initial="hidden" animate="visible">
      {children}
    </motion.div>
  );
}

export function HeroRevealItem({ children }: { children: React.ReactNode }) {
  return <motion.div variants={item}>{children}</motion.div>;
}

export function SceneReveal({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="scene-reveal"
      initial={{ opacity: 0, scale: 0.985 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.65, delay: 0.05 }}
    >
      {children}
    </motion.div>
  );
}
