import Link from "next/link";

import { navigation } from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <p className="section-label">Contact</p>
        <h2>Let’s turn a difficult idea into a working system.</h2>
        <Link className="text-link" href="/contact">
          Start a conversation <span aria-hidden="true">↗</span>
        </Link>
      </div>
      <nav aria-label="Footer navigation">
        {navigation.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
      <p className="site-footer__note">
        © {new Date().getFullYear()} Carlos Carpio. Built as a semantic portfolio with an optional
        immersive layer.
      </p>
    </footer>
  );
}
