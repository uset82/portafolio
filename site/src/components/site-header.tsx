"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { NavigationItem } from "@/content/site";
import { OBSERVATORY_LIVE_CANVAS_PRESENTATION } from "@/lib/three/progressive-loading";

import { BrandMark } from "./brand-mark";

export function SiteHeader({ navigation }: { navigation: NavigationItem[] }) {
  const pathname = usePathname();

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

        {/* With the menu button and its drawer removed, this is the only header
         * navigation at every width, so it must never be display:none. Narrow
         * viewports scroll it sideways rather than hiding it. */}
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
      </div>
    </header>
  );
}
