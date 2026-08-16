"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { OrbitIcon, OrbitProject } from "@/content/project-orbit";
import { naturalPalette } from "@/styles/palette";

export type ProjectOrbitAtomicProps = {
  projects: readonly OrbitProject[];
  selectedId: string | null;
  onSelect: (projectId: string | null) => void;
  onOpen: (project: OrbitProject) => void;
};

type NodeConfig = {
  id: string;
  cx: number;
  cy: number;
  labelX: number;
  labelY: number;
  labelAlign: "left" | "right" | "center";
  stem?: { x1: number; y1: number; x2: number; y2: number };
};

const ATOMIC_NODES: Record<string, NodeConfig> = {
  "3doodle": {
    id: "3doodle",
    cx: 500,
    cy: 78,
    labelX: 566,
    labelY: 78,
    labelAlign: "left",
    stem: { x1: 500, y1: 106, x2: 500, y2: 122 },
  },
  "future-energy": {
    id: "future-energy",
    cx: 500,
    cy: 502,
    labelX: 500,
    labelY: 556,
    labelAlign: "center",
    stem: { x1: 500, y1: 458, x2: 500, y2: 474 },
  },
  repo2agent: {
    id: "repo2agent",
    cx: 128,
    cy: 290,
    labelX: 68,
    labelY: 290,
    labelAlign: "right",
    stem: { x1: 156, y1: 290, x2: 182, y2: 290 },
  },
  smartchatbot: {
    id: "smartchatbot",
    cx: 872,
    cy: 290,
    labelX: 932,
    labelY: 290,
    labelAlign: "left",
    stem: { x1: 818, y1: 290, x2: 844, y2: 290 },
  },
  strudelai: {
    id: "strudelai",
    cx: 308,
    cy: 136,
    labelX: 374,
    labelY: 136,
    labelAlign: "left",
    stem: { x1: 326, y1: 152, x2: 348, y2: 168 },
  },
  astraea: {
    id: "astraea",
    cx: 746,
    cy: 494,
    labelX: 676,
    labelY: 534,
    labelAlign: "right",
    stem: { x1: 728, y1: 476, x2: 708, y2: 460 },
  },
  pinaculo: {
    id: "pinaculo",
    cx: 848,
    cy: 428,
    labelX: 914,
    labelY: 428,
    labelAlign: "left",
    stem: { x1: 824, y1: 412, x2: 802, y2: 398 },
  },
  ifoundyou: {
    id: "ifoundyou",
    cx: 692,
    cy: 136,
    labelX: 758,
    labelY: 136,
    labelAlign: "left",
    stem: { x1: 674, y1: 152, x2: 652, y2: 168 },
  },
  "avatar-studio": {
    id: "avatar-studio",
    cx: 668,
    cy: 364,
    labelX: 736,
    labelY: 364,
    labelAlign: "left",
    stem: { x1: 648, y1: 348, x2: 628, y2: 334 },
  },
  "sound-lab": {
    id: "sound-lab",
    cx: 288,
    cy: 494,
    labelX: 358,
    labelY: 520,
    labelAlign: "left",
    stem: { x1: 308, y1: 476, x2: 328, y2: 460 },
  },
  arcade: {
    id: "arcade",
    cx: 332,
    cy: 364,
    labelX: 264,
    labelY: 364,
    labelAlign: "right",
    stem: { x1: 352, y1: 348, x2: 372, y2: 334 },
  },
};

const ICON_COLOR = naturalPalette.warmIvory;

function renderIconSvg(icon: OrbitIcon) {
  switch (icon) {
    case "cube":
      return (
        <g
          stroke={ICON_COLOR}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        >
          <path d="M0 -12 L10.4 -6 L10.4 6 L0 12 L-10.4 6 L-10.4 -6 Z" />
          <path d="M0 -12 L0 0 L10.4 6" />
          <path d="M0 0 L-10.4 6" />
        </g>
      );
    case "bolt":
      return (
        <path
          d="M2 -13 L-6 -1 L-1 -1 L-3 13 L6 1 L1 1 Z"
          fill={ICON_COLOR}
          stroke={ICON_COLOR}
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      );
    case "robot":
      return (
        <g
          stroke={ICON_COLOR}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        >
          <line x1="0" y1="-13" x2="0" y2="-9" />
          <circle cx="0" cy="-14" r="1.5" fill={ICON_COLOR} />
          <rect x="-10" y="-9" width="20" height="18" rx="4" />
          <circle cx="-4" cy="-1" r="1.8" fill={ICON_COLOR} />
          <circle cx="4" cy="-1" r="1.8" fill={ICON_COLOR} />
          <line x1="-5" y1="4.5" x2="5" y2="4.5" />
        </g>
      );
    case "chat":
      return (
        <g
          stroke={ICON_COLOR}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        >
          <path d="M-10 -7 C-10 -11 -6 -11 0 -11 C6 -11 10 -11 10 -7 C10 -1 6 3 0 3 C-2 3 -4.5 2.5 -6 4 L-6 1.5 C-8.5 0.5 -10 -2 -10 -7 Z" />
          <circle cx="-4" cy="-4" r="1.2" fill={ICON_COLOR} />
          <circle cx="0" cy="-4" r="1.2" fill={ICON_COLOR} />
          <circle cx="4" cy="-4" r="1.2" fill={ICON_COLOR} />
        </g>
      );
    case "code":
      return (
        <g
          stroke={ICON_COLOR}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        >
          <path d="M-5 -7 L-10 0 L-5 7" />
          <path d="M5 -7 L10 0 L5 7" />
          <line x1="2" y1="-8" x2="-2" y2="8" strokeWidth="1.8" />
        </g>
      );
    case "constellation":
      return (
        <g
          stroke={ICON_COLOR}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        >
          <circle cx="-6" cy="6" r="2" fill={ICON_COLOR} />
          <circle cx="0" cy="-6" r="2.2" fill={ICON_COLOR} />
          <circle cx="7" cy="-2" r="1.8" fill={ICON_COLOR} />
          <circle cx="6" cy="7" r="1.8" fill={ICON_COLOR} />
          <line x1="-6" y1="6" x2="0" y2="-6" />
          <line x1="0" y1="-6" x2="7" y2="-2" />
          <line x1="7" y1="-2" x2="6" y2="7" />
          <line x1="0" y1="-6" x2="6" y2="7" strokeDasharray="2 2" />
        </g>
      );
    case "pyramid":
      return (
        <g
          stroke={ICON_COLOR}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        >
          <circle cx="0" cy="0" r="12" strokeWidth="1.5" />
          <path d="M0 -9 L8 7 L-8 7 Z" />
          <line x1="-4.5" y1="1" x2="4.5" y2="1" />
        </g>
      );
    case "pin":
      return (
        <g
          stroke={ICON_COLOR}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        >
          <circle cx="0" cy="-3" r="4.5" />
          <path d="M-8 9 C-8 4.5 -4 2 0 2 C4 2 8 4.5 8 9" />
        </g>
      );
    case "mic":
      return (
        <g
          stroke={ICON_COLOR}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        >
          <rect x="-3.5" y="-10" width="7" height="12" rx="3.5" />
          <path d="M-7 -3 C-7 3 -3 6 0 6 C3 6 7 3 7 -3" />
          <line x1="0" y1="6" x2="0" y2="11" />
          <line x1="-4" y1="11" x2="4" y2="11" />
        </g>
      );
    case "waveform":
      return (
        <g stroke={ICON_COLOR} strokeWidth="2.2" strokeLinecap="round">
          <line x1="-8" y1="-4" x2="-8" y2="4" />
          <line x1="-4" y1="-9" x2="-4" y2="9" />
          <line x1="0" y1="-12" x2="0" y2="12" />
          <line x1="4" y1="-7" x2="4" y2="7" />
          <line x1="8" y1="-3" x2="8" y2="3" />
        </g>
      );
    default:
      return <circle cx="0" cy="0" r="4" fill={ICON_COLOR} />;
  }
}

export function ProjectOrbitAtomic({
  projects,
  selectedId,
  onSelect,
  onOpen,
}: ProjectOrbitAtomicProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    setMousePos({ x, y });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMousePos({ x: 0, y: 0 });
    setHoveredId(null);
  }, []);

  // Bead animation along paths
  const [beadAngle, setBeadAngle] = useState(0);
  useEffect(() => {
    let animId: number;
    let last = performance.now();
    const loop = (now: number) => {
      const delta = (now - last) / 1000;
      last = now;
      setBeadAngle((prev) => (prev + delta * 0.45) % (Math.PI * 2));
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  const projectMap = useMemo(() => {
    const map = new Map<string, OrbitProject>();
    projects.forEach((p) => map.set(p.id, p));
    return map;
  }, [projects]);

  return (
    <div
      ref={containerRef}
      className="project-orbit-atomic"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={
        {
          "--tilt-x": `${mousePos.y * -4}deg`,
          "--tilt-y": `${mousePos.x * 4}deg`,
        } as React.CSSProperties
      }
    >
      <svg
        viewBox="0 0 1000 580"
        className="project-orbit-atomic__svg"
        aria-hidden="true"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Metallic Brass Rail Gradients */}
          <linearGradient id="po-brass-linear" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={naturalPalette.orbitIvory} />
            <stop offset="25%" stopColor={naturalPalette.orbitBrass} />
            <stop offset="50%" stopColor={naturalPalette.orbitBronze} />
            <stop offset="75%" stopColor={naturalPalette.orbitBearing} />
            <stop offset="100%" stopColor={naturalPalette.orbitBrassDim} />
          </linearGradient>

          <linearGradient id="po-brass-inner" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={naturalPalette.orbitBrassDim} />
            <stop offset="50%" stopColor={naturalPalette.deepWood} />
            <stop offset="100%" stopColor={naturalPalette.orbitBronze} />
          </linearGradient>

          {/* Golden Sphere Gradient for Beads */}
          <radialGradient id="po-gold-sphere" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor={naturalPalette.warmIvory} />
            <stop offset="35%" stopColor={naturalPalette.orbitBearing} />
            <stop offset="75%" stopColor={naturalPalette.orbitBrassDim} />
            <stop offset="100%" stopColor={naturalPalette.espresso} />
          </radialGradient>

          {/* Medallion Gradients */}
          <radialGradient id="po-medallion-face" cx="40%" cy="38%" r="62%">
            <stop offset="0%" stopColor={naturalPalette.orbitAmbient} />
            <stop offset="60%" stopColor={naturalPalette.deepEspresso} />
            <stop offset="100%" stopColor={naturalPalette.orbitInkRaised} />
          </radialGradient>

          <radialGradient id="po-gold-rim" cx="50%" cy="50%" r="50%">
            <stop offset="78%" stopColor={naturalPalette.walnut} />
            <stop offset="84%" stopColor={naturalPalette.orbitBearing} />
            <stop offset="90%" stopColor={naturalPalette.oak} />
            <stop offset="96%" stopColor={naturalPalette.orbitBrightBrass} />
            <stop offset="100%" stopColor={naturalPalette.espresso} />
          </radialGradient>

          {/* Node Medal Gradients */}
          <radialGradient id="po-node-core" cx="38%" cy="35%" r="65%">
            <stop offset="0%" stopColor={naturalPalette.orbitAmbient} />
            <stop offset="70%" stopColor={naturalPalette.orbitInkPanel} />
            <stop offset="100%" stopColor={naturalPalette.orbitInkRaised} />
          </radialGradient>

          <linearGradient id="po-node-bezel" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={naturalPalette.warmIvory} />
            <stop offset="30%" stopColor={naturalPalette.orbitBearing} />
            <stop offset="70%" stopColor={naturalPalette.orbitBronze} />
            <stop offset="100%" stopColor={naturalPalette.orbitBrass} />
          </linearGradient>

          {/* Drop Shadows */}
          <filter id="po-shadow" x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow
              dx="0"
              dy="6"
              stdDeviation="8"
              floodColor={naturalPalette.orbitInk}
              floodOpacity="0.32"
            />
          </filter>

          <filter id="po-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation="9"
              floodColor={naturalPalette.orbitKeyLight}
              floodOpacity="0.85"
            />
          </filter>
        </defs>

        {/* --- 1. AMBIENT SHADOW LAYER --- */}
        <g opacity="0.4" filter="url(#po-shadow)">
          <ellipse
            cx="500"
            cy="290"
            rx="92"
            ry="226"
            fill="none"
            stroke={naturalPalette.orbitInk}
            strokeWidth="7"
          />
          <ellipse
            cx="500"
            cy="290"
            rx="392"
            ry="74"
            fill="none"
            stroke={naturalPalette.orbitInk}
            strokeWidth="7"
          />
          <ellipse
            cx="500"
            cy="290"
            rx="362"
            ry="100"
            fill="none"
            stroke={naturalPalette.orbitInk}
            strokeWidth="7"
            transform="rotate(-34 500 290)"
          />
          <ellipse
            cx="500"
            cy="290"
            rx="362"
            ry="100"
            fill="none"
            stroke={naturalPalette.orbitInk}
            strokeWidth="7"
            transform="rotate(34 500 290)"
          />
        </g>

        {/* --- 2. DUAL BRASS ORBITAL RAILS --- */}
        {/* Ring 1: Vertical Orbit */}
        <g id="ring-vertical">
          <ellipse
            cx="500"
            cy="290"
            rx="96"
            ry="232"
            fill="none"
            stroke="url(#po-brass-linear)"
            strokeWidth="4"
          />
          <ellipse
            cx="500"
            cy="290"
            rx="86"
            ry="220"
            fill="none"
            stroke="url(#po-brass-inner)"
            strokeWidth="2.5"
          />
          {[Math.PI * 0.25, Math.PI * 0.75, Math.PI * 1.25, Math.PI * 1.75].map((ang, i) => {
            const x = 500 + Math.cos(ang) * 91;
            const y = 290 + Math.sin(ang) * 226;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="4.5"
                fill="url(#po-gold-sphere)"
                stroke={naturalPalette.orbitBronze}
                strokeWidth="0.8"
              />
            );
          })}
        </g>

        {/* Ring 2: Horizontal Orbit */}
        <g id="ring-horizontal">
          <ellipse
            cx="500"
            cy="290"
            rx="396"
            ry="76"
            fill="none"
            stroke="url(#po-brass-linear)"
            strokeWidth="4.2"
          />
          <ellipse
            cx="500"
            cy="290"
            rx="382"
            ry="65"
            fill="none"
            stroke="url(#po-brass-inner)"
            strokeWidth="2.5"
          />
          {[
            Math.PI * 0.2,
            Math.PI * 0.45,
            Math.PI * 0.8,
            Math.PI * 1.2,
            Math.PI * 1.55,
            Math.PI * 1.8,
          ].map((ang, i) => {
            const x = 500 + Math.cos(ang) * 389;
            const y = 290 + Math.sin(ang) * 70;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="4.5"
                fill="url(#po-gold-sphere)"
                stroke={naturalPalette.orbitBronze}
                strokeWidth="0.8"
              />
            );
          })}
        </g>

        {/* Ring 3: Diagonal A (-34deg) */}
        <g id="ring-diagonal-a" transform="rotate(-34 500 290)">
          <ellipse
            cx="500"
            cy="290"
            rx="366"
            ry="102"
            fill="none"
            stroke="url(#po-brass-linear)"
            strokeWidth="4"
          />
          <ellipse
            cx="500"
            cy="290"
            rx="352"
            ry="90"
            fill="none"
            stroke="url(#po-brass-inner)"
            strokeWidth="2.5"
          />
          {[Math.PI * 0.15, Math.PI * 0.6, Math.PI * 1.15, Math.PI * 1.6].map((ang, i) => {
            const x = 500 + Math.cos(ang) * 359;
            const y = 290 + Math.sin(ang) * 96;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="4.5"
                fill="url(#po-gold-sphere)"
                stroke={naturalPalette.orbitBronze}
                strokeWidth="0.8"
              />
            );
          })}
        </g>

        {/* Ring 4: Diagonal B (+34deg) */}
        <g id="ring-diagonal-b" transform="rotate(34 500 290)">
          <ellipse
            cx="500"
            cy="290"
            rx="366"
            ry="102"
            fill="none"
            stroke="url(#po-brass-linear)"
            strokeWidth="4"
          />
          <ellipse
            cx="500"
            cy="290"
            rx="352"
            ry="90"
            fill="none"
            stroke="url(#po-brass-inner)"
            strokeWidth="2.5"
          />
          {[Math.PI * 0.35, Math.PI * 0.85, Math.PI * 1.35, Math.PI * 1.85].map((ang, i) => {
            const x = 500 + Math.cos(ang) * 359;
            const y = 290 + Math.sin(ang) * 96;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="4.5"
                fill="url(#po-gold-sphere)"
                stroke={naturalPalette.orbitBronze}
                strokeWidth="0.8"
              />
            );
          })}
        </g>

        {/* --- 3. GLIDING ORBITAL BEADS --- */}
        <circle
          cx={500 + Math.cos(beadAngle * 1.2) * 91}
          cy={290 + Math.sin(beadAngle * 1.2) * 226}
          r="5.5"
          fill="url(#po-gold-sphere)"
          stroke={naturalPalette.orbitBrightBrass}
          strokeWidth="0.9"
        />
        <circle
          cx={500 + Math.cos(beadAngle * 0.9 + 1.2) * 389}
          cy={290 + Math.sin(beadAngle * 0.9 + 1.2) * 70}
          r="5.5"
          fill="url(#po-gold-sphere)"
          stroke={naturalPalette.orbitBrightBrass}
          strokeWidth="0.9"
        />
        {(() => {
          const ang = beadAngle * 1.1 + 2.5;
          const lx = Math.cos(ang) * 359;
          const ly = Math.sin(ang) * 96;
          const rad = (-34 * Math.PI) / 180;
          const gx = 500 + lx * Math.cos(rad) - ly * Math.sin(rad);
          const gy = 290 + lx * Math.sin(rad) + ly * Math.cos(rad);
          return (
            <circle
              cx={gx}
              cy={gy}
              r="5.5"
              fill="url(#po-gold-sphere)"
              stroke={naturalPalette.orbitBrightBrass}
              strokeWidth="0.9"
            />
          );
        })()}
        {(() => {
          const ang = beadAngle * 1.05 + 4.2;
          const lx = Math.cos(ang) * 359;
          const ly = Math.sin(ang) * 96;
          const rad = (34 * Math.PI) / 180;
          const gx = 500 + lx * Math.cos(rad) - ly * Math.sin(rad);
          const gy = 290 + lx * Math.sin(rad) + ly * Math.cos(rad);
          return (
            <circle
              cx={gx}
              cy={gy}
              r="5.5"
              fill="url(#po-gold-sphere)"
              stroke={naturalPalette.orbitBrightBrass}
              strokeWidth="0.9"
            />
          );
        })()}

        {/* --- 4. CONNECTING STEMS TO NODES --- */}
        {Object.values(ATOMIC_NODES).map((node) => {
          if (!node.stem) return null;
          return (
            <g key={`stem-${node.id}`}>
              <line
                x1={node.stem.x1}
                y1={node.stem.y1}
                x2={node.stem.x2}
                y2={node.stem.y2}
                stroke="url(#po-brass-linear)"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <circle cx={node.stem.x1} cy={node.stem.y1} r="3.5" fill="url(#po-gold-sphere)" />
              <circle cx={node.stem.x2} cy={node.stem.y2} r="3" fill="url(#po-gold-sphere)" />
            </g>
          );
        })}

        {/* --- 5. CENTRAL CA²M MEDALLION NUCLEUS --- */}
        <g
          id="central-medallion"
          filter="url(#po-shadow)"
          className="project-orbit-atomic__medallion"
        >
          <circle
            cx="500"
            cy="290"
            r="82"
            fill="url(#po-gold-rim)"
            stroke={naturalPalette.orbitBrass}
            strokeWidth="3.5"
          />
          <circle
            cx="500"
            cy="290"
            r="75"
            fill="none"
            stroke={naturalPalette.deepWood}
            strokeWidth="2.5"
          />
          <circle
            cx="500"
            cy="290"
            r="70"
            fill="url(#po-medallion-face)"
            stroke={naturalPalette.orbitBearing}
            strokeWidth="1.8"
          />

          {/* Embossed Taurus / CAM² Emblem */}
          <g transform="translate(500, 290)">
            <path
              d="M-28 -18 C-36 -38 -6 -48 10 -40 C-10 -42 -22 -28 -16 -12 Z"
              fill={naturalPalette.orbitBearing}
              filter="drop-shadow(0 1px 2px rgba(0,0,0,0.6))"
            />
            <path
              d="M0 -32 L22 28 L14 28 L8 12 L-8 12 L-14 28 L-22 28 Z M0 -14 L-5 6 L5 6 Z"
              fill={naturalPalette.orbitBearing}
              stroke={naturalPalette.orbitBronze}
              strokeWidth="0.8"
              filter="drop-shadow(0 2px 3px rgba(0,0,0,0.7))"
            />
            <circle
              cx="0"
              cy="-6"
              r="6"
              fill="none"
              stroke={naturalPalette.orbitBrightBrass}
              strokeWidth="2.5"
            />
            <path
              d="M-6 -10 C-6 -16 6 -16 6 -10"
              fill="none"
              stroke={naturalPalette.orbitBrightBrass}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <text
              x="22"
              y="-24"
              fontFamily="var(--font-heading, Georgia, serif)"
              fontSize="20"
              fontWeight="600"
              fill={naturalPalette.orbitBrightBrass}
              filter="drop-shadow(0 1px 2px rgba(0,0,0,0.6))"
            >
              ²
            </text>
          </g>
        </g>

        {/* --- 6. INTERACTIVE NODE MEDALLIONS --- */}
        {Object.values(ATOMIC_NODES).map((node) => {
          const project = projectMap.get(node.id);
          if (!project) return null;
          const isSelected = selectedId === node.id;
          const isHovered = hoveredId === node.id;
          const isActive = isSelected || isHovered;

          return (
            <g
              key={node.id}
              className="project-orbit-atomic__node"
              data-active={isActive}
              tabIndex={0}
              role="button"
              aria-label={project.name}
              onClick={() => {
                if (selectedId === node.id) {
                  onOpen(project);
                } else {
                  onSelect(node.id);
                }
              }}
              onMouseEnter={() => setHoveredId(node.id)}
              onMouseLeave={() => setHoveredId(null)}
              onFocus={() => {
                setHoveredId(node.id);
                onSelect(node.id);
              }}
              onBlur={() => setHoveredId(null)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(node.id);
                  onOpen(project);
                }
              }}
              transform={`translate(${node.cx}, ${node.cy})`}
            >
              {isActive ? (
                <circle
                  cx="0"
                  cy="0"
                  r="38"
                  fill="none"
                  stroke={naturalPalette.orbitBrightBrass}
                  strokeWidth="2"
                  filter="url(#po-glow)"
                  opacity="0.9"
                />
              ) : null}

              <circle
                cx="0"
                cy="0"
                r="28"
                fill="url(#po-node-bezel)"
                stroke={naturalPalette.orbitBronze}
                strokeWidth="1.5"
                filter="url(#po-shadow)"
              />
              <circle
                cx="0"
                cy="0"
                r="25"
                fill="none"
                stroke={naturalPalette.orbitIvory}
                strokeWidth="1"
              />
              <circle cx="0" cy="0" r="23" fill="url(#po-node-core)" />

              <g transform="scale(1.05)">{renderIconSvg(project.icon)}</g>
            </g>
          );
        })}
      </svg>

      {/* --- 7. EDITORIAL PILL BADGES --- */}
      <div className="project-orbit-atomic__labels" aria-hidden="true">
        {Object.values(ATOMIC_NODES).map((node) => {
          const project = projectMap.get(node.id);
          if (!project) return null;
          const isSelected = selectedId === node.id;
          const isHovered = hoveredId === node.id;
          const isActive = isSelected || isHovered;

          const leftPercent = (node.labelX / 1000) * 100;
          const topPercent = (node.labelY / 580) * 100;

          let transform = "translate(-50%, -50%)";
          if (node.labelAlign === "left") transform = "translate(0%, -50%)";
          if (node.labelAlign === "right") transform = "translate(-100%, -50%)";

          return (
            <button
              key={`label-${node.id}`}
              type="button"
              className="project-orbit-atomic__pill"
              data-active={isActive}
              style={{
                left: `${leftPercent}%`,
                top: `${topPercent}%`,
                transform,
              }}
              onClick={() => {
                if (selectedId === node.id) {
                  onOpen(project);
                } else {
                  onSelect(node.id);
                }
              }}
              onMouseEnter={() => setHoveredId(node.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {project.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
