import { CcAiPanel } from "@/components/cc-ai-panel";
import { HeroReveal, HeroRevealItem, SceneReveal } from "@/components/hero-reveal";
import { MediaTeaser } from "@/components/media-teaser";
import { PersonalTeaser } from "@/components/personal-teaser";
import { ProfileTeaser } from "@/components/profile-teaser";
import { ObservatoryExperienceControls } from "@/components/three/observatory-experience-controls";
import { ObservatoryProgressiveExperienceContent } from "@/components/three/observatory-progressive-experience";
import { ObservatorySceneRuntimeProvider } from "@/components/three/observatory-scene-runtime-provider";
import { ActionLink, EditorialLinkItem, ImageFrame } from "@/components/ui";
import { selectedSystems, siteContent } from "@/content/site";

const OBSERVATORY_ARTIFACT_DESCRIPTIONS = {
  astraea: "Three marked rings align when the instrument is focused.",
  pinaculo:
    "A 24-position ring uses paired one-, two-, and three-groove markers as restrained references to 11, 22, and 33.",
  "future-energy":
    "Two independent closed liquid circuits meet separate sides of one central stack; the focus response is a conceptual diagram, not a performance claim.",
} as const;

export default function Home() {
  const { metadata } = siteContent;
  const projectArtifacts = (["astraea", "pinaculo", "future-energy"] as const).map((artifactId) => {
    const system = selectedSystems.find((candidate) => candidate.slug === artifactId);
    if (!system) throw new Error(`The approved ${artifactId} project entry is required.`);
    return {
      artifactId,
      href: `/work/${system.slug}`,
      title: system.title,
      descriptor: system.descriptor,
      status: system.status,
      mechanismDescription: OBSERVATORY_ARTIFACT_DESCRIPTIONS[artifactId],
    };
  });
  const observatoryArtifacts = [
    ...projectArtifacts.slice(0, 2),
    {
      artifactId: "sound-lab" as const,
      href: metadata.mediaTeaser.action.href,
      title: "Sound Lab",
      descriptor: "Harmonic instrument",
      status: metadata.mediaTeaser.status,
      mechanismDescription:
        "A central harmonic dial and tactile controls respond to focus; playback remains unavailable until its sources, credits, duration, rights, and notes are approved.",
    },
    projectArtifacts[2]!,
    {
      artifactId: "electronics-ai" as const,
      href: "/laboratory",
      title: "Electronics / AI",
      descriptor: "Protected modular concept",
      status: projectArtifacts[2]!.status,
      mechanismDescription:
        "Protected modular boards, tactile controls, cable sockets, and a blank mechanical status window identify a concept only; no functioning AI hardware or live inference is claimed.",
    },
    {
      artifactId: "drone" as const,
      href: "/laboratory",
      title: "Aerial systems",
      descriptor: "Guarded camera-drone concept",
      status: projectArtifacts[2]!.status,
      mechanismDescription:
        "A compact protected-rotor camera drone uses one sparse bounded stabilization cycle; it is a visual concept, not a flight-performance or autonomous-operation claim.",
    },
  ];

  return (
    <main id="main-content">
      <section className="observatory-hero" aria-labelledby="hero-title">
        <ObservatorySceneRuntimeProvider>
          <SceneReveal>
            <ObservatoryProgressiveExperienceContent
              artifacts={observatoryArtifacts}
              poster={
                <>
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
                </>
              }
            />
          </SceneReveal>
          <ObservatoryExperienceControls />
        </ObservatorySceneRuntimeProvider>

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
              <p className="current-focus current-focus--desktop">
                <span aria-hidden="true" />
                {metadata.currentFocus}
              </p>
            </HeroRevealItem>
          </HeroReveal>
        </div>

        <CcAiPanel />

        <p className="current-focus current-focus--mobile">
          <span aria-hidden="true" />
          {metadata.currentFocus}
        </p>

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

      <MediaTeaser content={metadata.mediaTeaser} />

      <PersonalTeaser content={metadata.personalTeaser} />

      <ProfileTeaser content={metadata.profileTeaser} />
    </main>
  );
}
