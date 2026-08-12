"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

/* Selected Systems as a Bohr atom: three tilted orbits crossing at 60°, two
 * projects riding each, a nucleus reading out the highlighted one.
 *
 * Positions are driven from one requestAnimationFrame loop rather than CSS
 * motion paths. `offset-path` would be tidier, but basic-shape paths do not
 * scale with a clamp()-sized element and an unsupported value drops every
 * marker onto the origin — a silent pile-up. Six transform writes a frame is
 * cheap and the geometry stays exact at any size.
 *
 * A moving target is hard to click, so pointer or keyboard attention freezes
 * every orbit. The loop also stops when the atom scrolls out of view and never
 * starts under prefers-reduced-motion, where the markers hold their opening
 * positions and stay ordinary links. */

export type ObservatoryAtomItem = {
  id: string;
  href: string;
  title: string;
  descriptor: string;
  status: string;
};

const ORBITS = [
  { tilt: 0, period: 26_000 },
  { tilt: 60, period: 21_000 },
  { tilt: 120, period: 31_000 },
] as const;

const RADIUS_X = 0.44;
const RADIUS_Y = 0.17;
const HIGHLIGHT_MS = 4_500;

export function ObservatoryAtom({ items }: { items: ObservatoryAtomItem[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const markerRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const resolve = () => setAnimate(!query.matches);
    resolve();
    query.addEventListener("change", resolve);
    return () => query.removeEventListener("change", resolve);
  }, []);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => setInView(entries.some((entry) => entry.isIntersecting)),
      { threshold: 0.15 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  /* Placement is shared by the animated and the still case, so a reduced-motion
   * visitor gets the same spread rather than a heap in the middle. */
  const place = useCallback(
    (elapsed: number) => {
      const node = rootRef.current;
      if (!node) return;
      const size = node.clientWidth;
      const rx = size * RADIUS_X;
      const ry = size * RADIUS_Y;

      items.forEach((_, index) => {
        const marker = markerRefs.current[index];
        if (!marker) return;
        const orbit = ORBITS[index % ORBITS.length]!;
        const seat = Math.floor(index / ORBITS.length);
        const tilt = (orbit.tilt * Math.PI) / 180;
        const angle = (elapsed / orbit.period) * Math.PI * 2 + seat * Math.PI;

        const x = rx * Math.cos(angle);
        const y = ry * Math.sin(angle);
        const rotatedX = x * Math.cos(tilt) - y * Math.sin(tilt);
        const rotatedY = x * Math.sin(tilt) + y * Math.cos(tilt);

        // Translation only: the marker never rotates, so its label stays
        // upright everywhere on the orbit.
        marker.style.transform = `translate(-50%, -50%) translate(${rotatedX.toFixed(2)}px, ${rotatedY.toFixed(2)}px)`;
        // Behind the nucleus on the far half, in front on the near half.
        marker.style.zIndex = Math.sin(angle) > 0 ? "2" : "0";
      });
    },
    [items],
  );

  /* Elapsed time survives a pause. Restarting the clock at zero would snap
   * every marker back to its opening position the moment a pointer left the
   * atom, which reads as the whole thing twitching. */
  const elapsedRef = useRef(0);

  useEffect(() => {
    place(elapsedRef.current);
    if (!animate || held || !inView) return;

    let frame = 0;
    const origin = performance.now() - elapsedRef.current;
    const tick = (now: number) => {
      elapsedRef.current = now - origin;
      place(elapsedRef.current);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [animate, held, inView, place]);

  useEffect(() => {
    if (!animate || held || !inView || items.length < 2) return;
    const id = window.setInterval(
      () => setActive((current) => (current + 1) % items.length),
      HIGHLIGHT_MS,
    );
    return () => window.clearInterval(id);
  }, [animate, held, inView, items.length]);

  const step = useCallback(
    (delta: number) => setActive((current) => (current + delta + items.length) % items.length),
    [items.length],
  );

  const current = items[active] ?? items[0];
  if (!current) return null;

  return (
    <div
      ref={rootRef}
      className="observatory-atom"
      data-animate={animate}
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocusCapture={() => setHeld(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setHeld(false);
      }}
    >
      {ORBITS.map((orbit) => (
        <span
          key={orbit.tilt}
          className="observatory-atom__orbit"
          aria-hidden="true"
          style={{ transform: `translate(-50%, -50%) rotate(${orbit.tilt}deg)` }}
        />
      ))}

      <p className="observatory-atom__nucleus" aria-hidden="true">
        <strong>{current.title}</strong>
        <small>{current.descriptor}</small>
      </p>

      <ul className="observatory-atom__markers">
        {items.map((item, index) => (
          <li
            key={item.id}
            ref={(node) => {
              markerRefs.current[index] = node;
            }}
            className="observatory-atom__marker"
          >
            <Link
              href={item.href}
              data-active={index === active}
              aria-current={index === active ? "true" : undefined}
              onFocus={() => setActive(index)}
              onPointerEnter={() => setActive(index)}
              onKeyDown={(event) => {
                if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                  event.preventDefault();
                  step(1);
                }
                if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                  event.preventDefault();
                  step(-1);
                }
              }}
            >
              <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <span className="visually-hidden">
                {item.title} — {item.descriptor}. {item.status}.
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
