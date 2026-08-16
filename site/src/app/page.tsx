import { AnaExplorationPanel } from "@/components/ana-exploration-panel";
import { ArcadeTeaser } from "@/components/arcade/arcade-teaser";
import { CcAiPanel } from "@/components/cc-ai-panel";
import { HeroReveal, HeroRevealItem, SceneReveal } from "@/components/hero-reveal";
import { MediaTeaser } from "@/components/media-teaser";
import { ProjectOrbit } from "@/components/project-orbit";
import { PersonalTeaser } from "@/components/personal-teaser";
import { ObservatoryHeroVideo } from "@/components/observatory-hero-video";
import { SupportTeaser } from "@/components/support-teaser";
import { ObservatoryExperienceControls } from "@/components/three/observatory-experience-controls";
import { ObservatoryProgressiveExperienceContent } from "@/components/three/observatory-progressive-experience";
import { OBSERVATORY_LIVE_CANVAS_PRESENTATION } from "@/lib/three/progressive-loading";
import { ObservatorySceneRuntimeProvider } from "@/components/three/observatory-scene-runtime-provider";
import { ActionLink, ImageFrame } from "@/components/ui";
import { ARCADE_GAMES, isArcadeGamePlayable } from "@/content/arcade";
import { ORBIT_PROJECTS } from "@/content/project-orbit";
import { selectedSystems, siteContent } from "@/content/site";
import { observatorySpecialistStatuses, selectExplorationPrompts } from "@/lib/ai/ana-exploration";

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
  const playableGames = ARCADE_GAMES.filter(isArcadeGamePlayable);
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
          <noscript>
            <div className="ana-exploration ana-exploration--noscript">
              <p>CACM AI remains the public portfolio guide.</p>
              <AnaExplorationPanel prompts={[]} statuses={observatorySpecialistStatuses()} />
            </div>
          </noscript>
        </div>

        <CcAiPanel
          explorationPrompts={selectExplorationPrompts({
            orchestratorEnabled: process.env.ANA_SPECIALISTS_ENABLED === "true",
            availableAgentIds: [],
          })}
        />

        <p className="current-focus current-focus--mobile">
          <span aria-hidden="true" />
          {metadata.currentFocus}
        </p>
      </section>

      <ProjectOrbit projects={ORBIT_PROJECTS} />

      <ArcadeTeaser playable={playableGames} total={ARCADE_GAMES.length} />

      <MediaTeaser content={metadata.mediaTeaser} />

      <SupportTeaser />

      <PersonalTeaser content={metadata.personalTeaser} />
    </main>
  );
}
