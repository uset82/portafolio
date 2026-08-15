import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";

import { MotionProvider } from "@/components/motion-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { footerNavigation, navigation, siteContent } from "@/content/site";

import "./globals.css";

const displayFont = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const bodyFont = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Carlos Alfredo Carpio Meza — Engineer, Inventor, Creative Technologist",
    template: "%s — Carlos Alfredo Carpio Meza",
  },
  description:
    "Carlos Alfredo Carpio Meza turns hidden patterns across AI, electronics, future energy, music, astrology, and numerology into working systems.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${bodyFont.variable}`}
      data-scroll-behavior="smooth"
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
            Skip to main content
          </a>
          <SiteHeader navigation={navigation} />
          {children}
          <SiteFooter content={siteContent.metadata.footer} navigation={footerNavigation} />
        </MotionProvider>
      </body>
    </html>
  );
}
