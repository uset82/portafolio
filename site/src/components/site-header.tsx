"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import type { NavigationItem } from "@/content/site";

import { AnimatedButton } from "./animate-ui/button";
import { CcMark } from "./cc-mark";

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
        <Link className="identity" href="/" aria-label="Carlos Carpio — home">
          <CcMark />
          <span>Carlos Carpio</span>
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

        <div className="site-header__status" aria-label="Experience settings">
          <button className="quiet-control" type="button" aria-label="Sound is muted" disabled>
            <span aria-hidden="true">◖</span>
            <span>Muted</span>
          </button>
          <span className="motion-status">
            <span aria-hidden="true">•</span> Motion follows system
          </span>
        </div>

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
