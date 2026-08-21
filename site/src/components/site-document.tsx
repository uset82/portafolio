import { Cormorant_Garamond, Manrope } from "next/font/google";

import { MotionProvider } from "@/components/motion-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ui } from "@/content/i18n/ui";
import { navigation, siteContent } from "@/content/site";
import type { Locale } from "@/lib/i18n";

const displayFont = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const bodyFont = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

/**
 * The document both language trees render.
 *
 * Each locale has its own root layout so it can declare its own `lang`, and
 * both delegate here: the chrome, the fonts and the no-script fallback are the
 * same page furniture in either language, and duplicating them would let the
 * two versions drift apart one fix at a time.
 */
export function SiteDocument({
  locale,
  children,
}: Readonly<{ locale: Locale; children: React.ReactNode }>) {
  const copy = ui(locale);

  return (
    <html
      lang={locale}
      className={`${displayFont.variable} ${bodyFont.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body>
        <noscript>
          <style>{`.scene-reveal,
.hero-copy > div {
  opacity: 1 !important;
  transform: none !important;
}`}</style>
        </noscript>
        <MotionProvider>
          <a className="skip-link" href="#main-content">
            {copy.common.skipToContent}
          </a>
          <SiteHeader navigation={navigation} locale={locale} />
          {children}
          <SiteFooter content={siteContent.metadata.footer} locale={locale} />
        </MotionProvider>
      </body>
    </html>
  );
}
