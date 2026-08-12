import { CcAiPanel } from "@/components/cc-ai-panel";
import { HeroReveal, HeroRevealItem, SceneReveal } from "@/components/hero-reveal";
import { MediaTeaser } from "@/components/media-teaser";
import { ObservatoryDial } from "@/components/observatory-dial";
import { PersonalTeaser } from "@/components/personal-teaser";
import { ObservatoryHeroVideo } from "@/components/observatory-hero-video";
import { ProfileTeaser } from "@/components/profile-teaser";
import { ObservatoryExperienceControls } from "@/components/three/observatory-experience-controls";
import { ObservatoryProgressiveExperienceContent } from "@/components/three/observatory-progressive-experience";
import { OBSERVATORY_LIVE_CANVAS_PRESENTATION } from "@/lib/three/progressive-loading";
import { ObservatorySceneRuntimeProvider } from "@/components/three/observatory-scene-runtime-provider";
import { ActionLink, ImageFrame } from "@/components/ui";
import { selectedSystems, siteContent } from "@/content/site";

const OBSERVATORY_ARTIFACT_DESCRIPTIONS = {
  astraea: "Three marked rings align when the instrument is focused.",
  pinaculo:
    "A 24-position ring uses paired one-, two-, and three-groove markers as restrained references to 11, 22, and 33.",
  "future-energy":
    "Two independent closed liquid circuits meet separate sides of one central stack; the focus response is a conceptual diagram, not a performance claim.",
  "electronics-ai":
    "Protected modular boards, tactile controls, cable sockets, and a blank mechanical status window identify a concept only; no functioning AI hardware or live inference is claimed.",
  drone:
    "A compact protected-rotor camera drone uses one sparse bounded stabilization cycle; it is a visual concept, not a flight-performance or autonomous-operation claim.",
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
    ...siteContent.laboratoryConcepts.map((concept) => ({
      artifactId: concept.artifactId,
      href: concept.href,
      title: concept.title,
      descriptor: concept.descriptor,
      status: concept.status,
      mechanismDescription: OBSERVATORY_ARTIFACT_DESCRIPTIONS[concept.artifactId],
    })),
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
                  {/* The hero still is the clip's own first frame, not the
                   * design mock-up: that mock-up has a chat panel painted into
                   * the artwork, which read as a second, stale CACM AI box behind
                   * the real one whenever the clip had not taken over yet. */}
                  <ImageFrame
                    className="observatory-media-frame"
                    imageClassName="observatory-poster"
                    src="/images/robot-water-poster.jpg"
                    alt="A warm sunlit observatory with a long-haired android kneeling to touch a sage-colored water basin among instruments for sound, celestial patterns, numerology, electronics, and energy."
                    fill
                    priority
                    sizes="100vw"
                    bleed
                  />
                  <ObservatoryHeroVideo />
                  {/* Direction 1A overlays the hero type on the scene instead
                   * of parking it on a cream panel. Two scrims carry that: a
                   * diagonal one that darkens the reading column, and a
                   * bottom-up one that seats the Selected Systems cards. They
                   * sit above the clip and below every text layer, so the copy
                   * keeps its contrast while the clip keeps playing. */}
                  <div
                    className="observatory-scrim observatory-scrim--reading"
                    aria-hidden="true"
                  />
                  <div className="observatory-scrim observatory-scrim--base" aria-hidden="true" />
                  {/* Last of the three, so it paints over the other two. The
                   * header is an absolute cream slab sitting on top of a dark
                   * scene, which cut a hard rule across the page. This carries
                   * that cream down through a blush into the brown instead,
                   * and is fully transparent before the headline starts. */}
                  <div className="observatory-scrim observatory-scrim--crown" aria-hidden="true" />
                </>
              }
            />
          </SceneReveal>
          {/* U.20 holds the live Canvas, so the scene controls stay unmounted
           * until a composed-hero framing direction is approved. */}
          {OBSERVATORY_LIVE_CANVAS_PRESENTATION === "approved" ? (
            <ObservatoryExperienceControls />
          ) : null}
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
            <h2>Selected Systems</h2>
            <p className="selected-systems__count">
              {String(observatoryArtifacts.length).padStart(2, "0")} systems
            </p>
          </div>
          {/* Every Observatory system sits on the dial, not just the flagship
           * three, because a six-position ring divides evenly and the whole
           * register is what the visitor is choosing between. */}
          <ObservatoryDial
            items={observatoryArtifacts.map((artifact) => ({
              id: artifact.artifactId,
              href: artifact.href,
              title: artifact.title,
              descriptor: artifact.descriptor,
              status: artifact.status,
            }))}
          />
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
