"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

/* The Selected Systems rail as an instrument rather than a row of boxes: the
 * projects sit at evenly spaced positions on a dial and a hand sweeps between
 * them, which is the same language as ASTRAEA's chart wheel and PINÁCULO's
 * marked ring.
 *
 * The full list is server-rendered as ordinary links, so the dial is an
 * enhancement rather than the only route to the work: without JavaScript, or
 * under reduced motion, every project is still present and reachable. Only the
 * sweep and the auto-advance are conditional.
 *
 * The centre readout is aria-hidden on purpose. It restates what the focused
 * link already says, and with the hand advancing on a timer a live region
 * would announce a new project every few seconds while the visitor is reading
 * something else. */

export type ObservatoryDialItem = {
  id: string;
  href: string;
  title: string;
  descriptor: string;
  status: string;
};

const ADVANCE_MS = 4_500;

export function ObservatoryDial({ items }: { items: ObservatoryDialItem[] }) {
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);
  const [animate, setAnimate] = useState(false);
  const inViewRef = useRef(true);
  const [inView, setInView] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);

  // Client-only: a server render has no motion preference to read, and the
  // static list is the correct output until we know one.
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const resolve = () => setAnimate(!query.matches);
    resolve();
    query.addEventListener("change", resolve);
    return () => query.removeEventListener("change", resolve);
  }, []);

  // A timer that keeps running against an offscreen dial is pure battery cost.
  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        inViewRef.current = entries.some((entry) => entry.isIntersecting);
        setInView(inViewRef.current);
      },
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!animate || held || !inView || items.length < 2) return;
    const id = window.setInterval(
      () => setActive((current) => (current + 1) % items.length),
      ADVANCE_MS,
    );
    return () => window.clearInterval(id);
  }, [animate, held, inView, items.length]);

  const step = useCallback(
    (delta: number) => setActive((current) => (current + delta + items.length) % items.length),
    [items.length],
  );

  const current = items[active] ?? items[0];
  if (!current) return null;

  const sweep = (360 / items.length) * active;

  return (
    <div
      ref={rootRef}
      className="observatory-dial"
      data-animate={animate}
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocusCapture={() => setHeld(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setHeld(false);
      }}
    >
      <div className="observatory-dial__face">
        <span className="observatory-dial__ring" aria-hidden="true" />
        <span
          className="observatory-dial__hand"
          aria-hidden="true"
          style={{ transform: `rotate(${sweep}deg)` }}
        />

        <ul className="observatory-dial__marks">
          {items.map((item, index) => (
            <li
              key={item.id}
              className="observatory-dial__mark"
              style={{ transform: `rotate(${(360 / items.length) * index}deg)` }}
            >
              <Link
                href={item.href}
                aria-current={index === active ? "true" : undefined}
                data-active={index === active}
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
                {/* Counter-rotated so the index reads upright at every
                 * position on the ring. */}
                <span style={{ transform: `rotate(-${(360 / items.length) * index}deg)` }}>
                  <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <span className="visually-hidden">
                    {item.title} — {item.descriptor}. {item.status}.
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <p className="observatory-dial__readout" aria-hidden="true">
          <strong>{current.title}</strong>
          <small>{current.descriptor}</small>
        </p>
      </div>
    </div>
  );
}
