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
};

type RailConfig = {
  id: string;
  rx: number;
  ry: number;
  /** Degrees, SVG-clockwise about the shared centre (500, 290). */
  rotate: number;
  /** Fixed decorative bearing beads, parked between the node seats. */
  beadAngles: readonly number[];
};

/**
 * The four orbital rails of the atom. Everything — rails, beads and node
 * seats — is computed from these same four ellipses so nothing can drift
 * out of alignment.
 */
const ORBIT_RAILS: readonly RailConfig[] = [
  { id: "vertical", rx: 96, ry: 220, rotate: 0, beadAngles: [45, 135, 225, 315] },
  { id: "horizontal", rx: 396, ry: 76, rotate: 0, beadAngles: [30, 150, 210, 330] },
  { id: "diagonal-a", rx: 366, ry: 102, rotate: -34, beadAngles: [90, 200, 270, 335] },
  { id: "diagonal-b", rx: 366, ry: 102, rotate: 34, beadAngles: [90, 195, 270, 315] },
];

/** A point on a rail's ellipse, matching the SVG `rotate(deg 500 290)`. */
function railPoint(rail: RailConfig, thetaDegrees: number) {
  const theta = (thetaDegrees * Math.PI) / 180;
  const dx = Math.cos(theta) * rail.rx;
  const dy = Math.sin(theta) * rail.ry;
  const rad = (rail.rotate * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return {
    x: 500 + dx * cos - dy * sin,
    y: 290 + dx * sin + dy * cos,
  };
}

/**
 * Every node sits EXACTLY on its rail — each position below is the rail
 * ellipse evaluated at a designed angle, not placed by eye — and every pair
 * mirrors across the vertical centreline: 3Doodle↔FUTURE ENERGY (meridian),
 * Repo2Agent↔SmartChatbot and ARCADE↔Avatar Studio (equator),
 * StrudelAI↔iFoundYou (upper diagonals), SOUND LAB↔ASTRAEA (lower
 * diagonals). PINÁCULO, the eleventh system, takes the remaining seat on the
 * lower-right diagonal arc, exactly as in the reference composition. Labels
 * hang outward from the centre so none of them cross the instrument.
 */
const ATOMIC_NODES: Record<string, NodeConfig> = {
  "3doodle": {
    id: "3doodle",
    cx: 500,
    cy: 70,
    labelX: 566,
    labelY: 70,
    labelAlign: "left",
  },
  strudelai: {
    id: "strudelai",
    cx: 209,
    cy: 155,
    labelX: 143,
    labelY: 155,
    labelAlign: "right",
  },
  ifoundyou: {
    id: "ifoundyou",
    cx: 791,
    cy: 155,
    labelX: 857,
    labelY: 155,
    labelAlign: "left",
  },
  repo2agent: {
    id: "repo2agent",
    cx: 104,
    cy: 290,
    labelX: 64,
    labelY: 290,
    labelAlign: "right",
  },
  smartchatbot: {
    id: "smartchatbot",
    cx: 896,
    cy: 290,
    labelX: 936,
    labelY: 290,
    labelAlign: "left",
  },
  arcade: {
    id: "arcade",
    cx: 333,
    cy: 359,
    labelX: 293,
    labelY: 359,
    labelAlign: "right",
  },
  "avatar-studio": {
    id: "avatar-studio",
    cx: 667,
    cy: 359,
    labelX: 707,
    labelY: 359,
    labelAlign: "left",
  },
  pinaculo: {
    id: "pinaculo",
    cx: 795,
    cy: 431,
    labelX: 861,
    labelY: 431,
    labelAlign: "left",
  },
  "sound-lab": {
    id: "sound-lab",
    cx: 284,
    cy: 506,
    labelX: 324,
    labelY: 506,
    labelAlign: "left",
  },
  astraea: {
    id: "astraea",
    cx: 716,
    cy: 506,
    labelX: 676,
    labelY: 506,
    labelAlign: "right",
  },
  "future-energy": {
    id: "future-energy",
    cx: 500,
    cy: 510,
    labelX: 500,
    labelY: 560,
    labelAlign: "center",
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

          {/* Dark channel between the two brass tubes of every rail */}
          <linearGradient id="po-rail-channel" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={naturalPalette.deepWood} />
            <stop offset="50%" stopColor={naturalPalette.orbitInk} />
            <stop offset="100%" stopColor={naturalPalette.espresso} />
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

          <filter id="po-rail-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow
              dx="0"
              dy="5"
              stdDeviation="7"
              floodColor={naturalPalette.orbitInk}
              floodOpacity="0.26"
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

          <clipPath id="po-medallion-clip">
            <circle cx="500" cy="290" r="64" />
          </clipPath>
        </defs>

        {/* --- 1. FOUR ORBITAL RAILS ---
         * One geometry per rail, drawn twice: a wide brass stroke with a
         * narrow dark channel down its middle, which reads as two perfectly
         * parallel machined tubes at every point of the ellipse. The previous
         * version drew separately-offset ellipses (plus offset shadow copies),
         * which can never stay parallel and is what made the instrument look
         * doubled and misaligned. */}
        <g filter="url(#po-rail-shadow)">
          {ORBIT_RAILS.map((rail) => (
            <g
              key={rail.id}
              id={`ring-${rail.id}`}
              transform={rail.rotate ? `rotate(${rail.rotate} 500 290)` : undefined}
            >
              <ellipse
                cx="500"
                cy="290"
                rx={rail.rx}
                ry={rail.ry}
                fill="none"
                stroke="url(#po-brass-linear)"
                strokeWidth="9.5"
              />
              <ellipse
                cx="500"
                cy="290"
                rx={rail.rx}
                ry={rail.ry}
                fill="none"
                stroke="url(#po-rail-channel)"
                strokeWidth="5"
              />
            </g>
          ))}
        </g>

        {/* --- 2. FIXED BEARING BEADS, seated in the rail channel --- */}
        {ORBIT_RAILS.map((rail) => (
          <g key={`beads-${rail.id}`}>
            {rail.beadAngles.map((deg) => {
              const point = railPoint(rail, deg);
              return (
                <circle
                  key={deg}
                  cx={point.x}
                  cy={point.y}
                  r="4.5"
                  fill="url(#po-gold-sphere)"
                  stroke={naturalPalette.orbitBronze}
                  strokeWidth="0.8"
                />
              );
            })}
          </g>
        ))}

        {/* --- 3. GLIDING ORBITAL BEADS, one per rail --- */}
        <circle
          cx={500 + Math.cos(beadAngle * 1.2) * 96}
          cy={290 + Math.sin(beadAngle * 1.2) * 220}
          r="5.5"
          fill="url(#po-gold-sphere)"
          stroke={naturalPalette.orbitBrightBrass}
          strokeWidth="0.9"
        />
        <circle
          cx={500 + Math.cos(beadAngle * 0.9 + 1.2) * 396}
          cy={290 + Math.sin(beadAngle * 0.9 + 1.2) * 76}
          r="5.5"
          fill="url(#po-gold-sphere)"
          stroke={naturalPalette.orbitBrightBrass}
          strokeWidth="0.9"
        />
        {(() => {
          const ang = beadAngle * 1.1 + 2.5;
          const lx = Math.cos(ang) * 366;
          const ly = Math.sin(ang) * 102;
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
          const lx = Math.cos(ang) * 366;
          const ly = Math.sin(ang) * 102;
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

        {/* --- 4. CENTRAL CA²M MEDALLION NUCLEUS --- */}
        <g
          id="central-medallion"
          filter="url(#po-shadow)"
          className="project-orbit-atomic__medallion"
          role="button"
          tabIndex={0}
          aria-label="Work register: Website creation and all projects"
          style={{ cursor: "pointer" }}
          onClick={() => {
            window.location.assign("/work#work-group-websites");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              window.location.assign("/work#work-group-websites");
            }
          }}
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

          {/* The real CA²M mark — the same asset the 3D scene textures with —
           * instead of a hand-drawn approximation of it. */}
          <image
            href="/images/brand/ca2m-mark.png"
            x="442"
            y="232"
            width="116"
            height="116"
            clipPath="url(#po-medallion-clip)"
            preserveAspectRatio="xMidYMid meet"
          />
        </g>

        {/* --- 5. INTERACTIVE NODE MEDALLIONS --- */}
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
              {/* The hover scale lives on this INNER group: a CSS transform on
               * the outer one would override its `translate` attribute and
               * teleport the node to the viewBox origin mid-hover. */}
              <g className="project-orbit-atomic__node-scale">
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
            </g>
          );
        })}
      </svg>

      {/* --- 6. EDITORIAL PILL BADGES --- */}
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
