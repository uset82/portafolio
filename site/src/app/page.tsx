import { CcAiPanel } from "@/components/cc-ai-panel";
import { HeroReveal, HeroRevealItem, SceneReveal } from "@/components/hero-reveal";
import { ActionLink, EditorialLinkItem, ImageFrame } from "@/components/ui";
import { selectedSystems, siteContent } from "@/content/site";

export default function Home() {
  const { metadata } = siteContent;

  return (
    <main id="main-content">
      <section className="observatory-hero" aria-labelledby="hero-title">
        <SceneReveal>
          <ImageFrame
            className="observatory-media-frame"
            imageClassName="observatory-poster"
            src="/images/observatory-poster.png"
            alt="A warm sunlit observatory with a ceramic robot touching a sage-colored water basin among instruments for sound, celestial patterns, numerology, electronics, and energy."
            fill
            priority
            sizes="100vw"
            bleed
          />
          <div className="poster-bottom-cover" aria-hidden="true" />
        </SceneReveal>

        <div className="editorial-field">
          <HeroReveal>
            <HeroRevealItem>
              <p className="hero-eyebrow">{metadata.eyebrow}</p>
            </HeroRevealItem>
            <HeroRevealItem>
              <h1 id="hero-title">{metadata.headline}</h1>
            </HeroRevealItem>
            <HeroRevealItem>
              <p className="hero-support">{metadata.supportingStatement}</p>
            </HeroRevealItem>
            <HeroRevealItem>
              <div className="hero-actions">
                <ActionLink
                  variant="primary"
                  className="primary-action"
                  href={metadata.primaryAction.href}
                >
                  {metadata.primaryAction.label}
                </ActionLink>
                <ActionLink
                  variant="secondary"
                  className="secondary-action"
                  href={metadata.secondaryAction.href}
                >
                  {metadata.secondaryAction.label} <span aria-hidden="true">→</span>
                </ActionLink>
              </div>
            </HeroRevealItem>
            <HeroRevealItem>
              <p className="current-focus">
                <span aria-hidden="true" />
                {metadata.currentFocus}
              </p>
            </HeroRevealItem>
          </HeroReveal>
        </div>

        <div className="scene-status" aria-label="Observatory scene status">
          <span aria-hidden="true">●</span> Poster mode · immersive scene follows
        </div>

        <CcAiPanel />

        <div className="selected-systems" id="selected-systems">
          <div className="selected-systems__heading">
            <span aria-hidden="true" />
            <h2>Selected Systems</h2>
            <span aria-hidden="true" />
          </div>
          <div className="selected-systems__list">
            {selectedSystems.map((system) => (
              <EditorialLinkItem
                key={system.slug}
                href={`/work/${system.slug}`}
                index={system.index}
                title={system.title}
                description={system.descriptor}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="editorial-section laboratory-section" aria-labelledby="laboratory-title">
        <p className="section-label">Laboratory / 01</p>
        <div>
          <h2 id="laboratory-title">Systems that move between code and matter.</h2>
          <p>
            AI agents, resilient energy, electronics, and experimental interfaces—presented as
            evidence-led work, with concepts clearly separated from shipped systems.
          </p>
          <ActionLink className="text-link" href="/laboratory">
            Enter the Laboratory <span aria-hidden="true">→</span>
          </ActionLink>
        </div>
        <div className="instrument-figure" aria-hidden="true">
          <span>CC</span>
          <i />
          <i />
          <i />
        </div>
      </section>

      <section className="editorial-section sound-section" aria-labelledby="sound-title">
        <div className="sound-index" aria-hidden="true">
          <span>33</span>
          <span>11</span>
          <span>22</span>
        </div>
        <div>
          <p className="section-label">Sound / 02</p>
          <h2 id="sound-title">Sound as an instrument for pattern and memory.</h2>
          <p>
            A mute-first space for approved music, harmonic experiments, and visual systems that
            respond only when the listener chooses to play.
          </p>
          <ActionLink className="text-link" href="/sound">
            Visit Sound Lab <span aria-hidden="true">→</span>
          </ActionLink>
        </div>
      </section>

      <section className="editorial-section story-section" aria-labelledby="story-title">
        <p className="section-label">Story / 03</p>
        <div>
          <h2 id="story-title">One practice, many ways of seeing.</h2>
          <p>
            The work connects engineering precision with music, symbolic systems, travel, and the
            patient observation of how people make meaning.
          </p>
          <div className="inline-links">
            <ActionLink className="text-link" href="/story">
              Read Carlos’s story <span aria-hidden="true">→</span>
            </ActionLink>
            <ActionLink className="text-link" href="/cosmos">
              Explore Cosmos <span aria-hidden="true">→</span>
            </ActionLink>
          </div>
        </div>
      </section>
    </main>
  );
}
