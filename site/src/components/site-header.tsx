"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import type { NavigationItem } from "@/content/site";
import { OBSERVATORY_LIVE_CANVAS_PRESENTATION } from "@/lib/three/progressive-loading";

import { AnimatedButton } from "./animate-ui/button";
import { BrandMark } from "./brand-mark";

export function SiteHeader({ navigation }: { navigation: NavigationItem[] }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    firstLinkRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <header className="site-header">
      <div className="site-header__inner">
        {/* The name is stacked on two lines so the full legal name fits the
         * header column without shrinking the type. The link's aria-label
         * still carries the whole name, so the visual split never reaches the
         * accessibility tree as two fragments. */}
        <Link className="identity" href="/" aria-label="Carlos Alfredo Carpio Meza — home">
          <BrandMark />
          <span className="identity__name">
            <span>Carlos Alfredo</span>
            <span>Carpio Meza</span>
          </span>
        </Link>

        <nav className="desktop-navigation" aria-label="Primary navigation">
          {navigation.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* The Experience settings anchor only exists while the live Canvas is
         * approved (U.20 currently holds it poster-authoritative). */}
        {OBSERVATORY_LIVE_CANVAS_PRESENTATION === "approved" ? (
          <div className="site-header__status" aria-label="Experience settings">
            <Link className="quiet-control" href="/#observatory-experience-settings">
              <span aria-hidden="true">◌</span>
              <span>Experience</span>
            </Link>
          </div>
        ) : (
          <div className="site-header__status" aria-hidden="true" />
        )}

        <AnimatedButton
          className="menu-button"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? "Close" : "Menu"}
        </AnimatedButton>
      </div>

      {menuOpen ? (
        <div className="mobile-navigation-shell" id="mobile-navigation">
          <nav aria-label="Mobile navigation">
            {navigation.map((item, index) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  ref={index === 0 ? firstLinkRef : undefined}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setMenuOpen(false)}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <p>Engineer · Inventor · Creative Technologist</p>
        </div>
      ) : null}
    </header>
  );
}
