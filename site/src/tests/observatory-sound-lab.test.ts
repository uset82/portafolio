import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { MediaReadiness } from "@/components/media";
import { ObservatoryArtifactAccess } from "@/components/three/observatory-artifact-access";
import {
  ObservatorySceneProvider,
  type ObservatorySceneProviderProps,
} from "@/components/three/observatory-scene-provider";
import { getObservatoryAsset } from "@/lib/three/asset-registry";
import {
  OBSERVATORY_SOUND_LAB_TECHNICAL_ART,
  SOUND_LAB_AUDIO_CATALOG,
  SOUND_LAB_AUDIO_CONTRACT,
  captureSoundLabDiagnostics,
  resolveSoundLabAudioAmplitude,
  resolveSoundLabMechanismPose,
  resolveSoundLabPresentation,
} from "@/lib/three/sound-lab-system";
import { createObservatorySceneStore } from "@/lib/three/scene-state";
import { naturalPalette } from "@/styles/palette";

const workspaceRoot = process.cwd();

function readSource(relativePath: string) {
  return readFileSync(path.join(workspaceRoot, relativePath), "utf8");
}

test("Sound Lab is a runtime-authored tactile instrument inside its declared budget", () => {
  const asset = getObservatoryAsset("sound-lab");
  const { tiers, colors, controls } = OBSERVATORY_SOUND_LAB_TECHNICAL_ART;
  const palette = new Set(Object.values(naturalPalette));

  assert.equal(asset.kind, "procedural");
  assert.equal(asset.status, "specified-audio-review-required");
  assert.deepEqual(OBSERVATORY_SOUND_LAB_TECHNICAL_ART.dimensionsMeters, asset.scaleMeters);
  assert.equal(controls.fullKnobs, 4);
  assert.equal(controls.fullSliders, 2);
  assert.equal(controls.reducedKnobs, 2);
  assert.equal(controls.reducedSliders, 1);
  assert.equal(tiers.full.maximumTriangles <= asset.lods[0]!.maxTriangles, true);
  assert.equal(tiers.reduced.maximumTriangles <= asset.lods[1]!.maxTriangles, true);
  assert.equal(tiers.full.maximumDrawCalls <= 18, true);
  assert.equal(tiers.full.materials, 5);
  assert.equal(tiers.full.textures, 0);
  assert.equal(tiers.full.renderTargets, 0);
  assert.equal(tiers.full.postPasses, 0);
  assert.equal(tiers.full.shadowCasters, 0);
  for (const color of Object.values(colors)) assert.equal(palette.has(color), true);
});

test("Sound Lab stays mute and source-empty while preserving a real metadata contract", () => {
  assert.equal(SOUND_LAB_AUDIO_CATALOG.length, 0);
  assert.equal(SOUND_LAB_AUDIO_CONTRACT.defaultMuted, true);
  assert.equal(SOUND_LAB_AUDIO_CONTRACT.autoplay, false);
  assert.equal(SOUND_LAB_AUDIO_CONTRACT.preload, "none");
  assert.equal(SOUND_LAB_AUDIO_CONTRACT.playerAvailable, false);
  assert.equal(SOUND_LAB_AUDIO_CONTRACT.trackCount, 0);
  assert.deepEqual(SOUND_LAB_AUDIO_CONTRACT.requiredMetadata, [
    "title",
    "artist-or-credit",
    "duration",
    "rights-and-availability",
    "transcript-or-notes",
    "approved-source",
    "waveform-source",
  ]);

  const readiness = renderToStaticMarkup(createElement(MediaReadiness));
  assert.match(readiness, /Awaiting sources/);
  assert.match(readiness, /Mute-first player/);
  assert.doesNotMatch(readiness, /<(?:audio|video|iframe)\b/);
});

test("selection creates one bounded mechanical pose and audio response rejects unapproved state", () => {
  const rest = resolveSoundLabMechanismPose(0);
  const focus = resolveSoundLabMechanismPose(1);
  const playing = { status: "playing" as const, muted: false };

  assert.equal(rest.dialRotation, 0);
  assert.equal(focus.dialRotation > rest.dialRotation, true);
  assert.equal(focus.dialLift > rest.dialLift, true);
  assert.equal(focus.sliderOffset > rest.sliderOffset, true);
  assert.equal(resolveSoundLabAudioAmplitude(playing, "full", 0.72), 0.72);
  assert.equal(resolveSoundLabAudioAmplitude({ ...playing, muted: true }, "full", 0.72), 0);
  assert.equal(resolveSoundLabAudioAmplitude({ status: "muted", muted: true }, "full", 0.72), 0);
  assert.equal(resolveSoundLabAudioAmplitude(playing, "reduced", 0.72), 0);
  assert.equal(resolveSoundLabAudioAmplitude(playing, "paused", 0.72), 0);
  assert.equal(resolveSoundLabAudioAmplitude(playing, "full", Number.NaN), 0);
  assert.deepEqual(resolveSoundLabPresentation("static", "static", false), {
    tier: "poster",
    animated: false,
    settleImmediately: true,
  });
  assert.deepEqual(resolveSoundLabPresentation("full", "full", true), {
    tier: "reduced",
    animated: false,
    settleImmediately: true,
  });
  assert.deepEqual(resolveSoundLabPresentation("full", "paused", false), {
    tier: "full",
    animated: false,
    settleImmediately: false,
  });
});

test("Sound Lab diagnostics report exact mechanical rest and focus with a mute-first audio hold", () => {
  const presentation = resolveSoundLabPresentation("full", "full", false);
  const sound = { status: "muted" as const, muted: true };
  const rest = captureSoundLabDiagnostics({
    presentation,
    selected: false,
    progress: 0,
    targetProgress: 0,
    pose: resolveSoundLabMechanismPose(0),
    sound,
    approvedAmplitude: 0,
  });
  const focus = captureSoundLabDiagnostics({
    presentation,
    selected: true,
    progress: 1,
    targetProgress: 1,
    pose: resolveSoundLabMechanismPose(1),
    sound,
    approvedAmplitude: 0,
  });

  for (const snapshot of [rest, focus]) {
    assert.equal(snapshot.version, 1);
    assert.equal(snapshot.phase, "settled");
    assert.equal(snapshot.alignment?.settled, true);
    assert.equal(snapshot.alignment?.progressError, 0);
    assert.equal(snapshot.alignment?.dialRotationErrorRadians, 0);
    assert.equal(snapshot.alignment?.dialLiftErrorMeters, 0);
    assert.equal(snapshot.alignment?.sliderErrorMeters, 0);
    assert.equal(snapshot.alignment?.signalErrorMeters, 0);
    assert.deepEqual(snapshot.audio, {
      sourceStatus: "awaiting-approved-sources",
      catalogTrackCount: 0,
      playerAvailable: false,
      defaultMuted: true,
      autoplay: false,
      preload: "none",
      soundStatus: "muted",
      muted: true,
      approvedAmplitude: 0,
      responseActive: false,
    });
  }
  assert.deepEqual(rest.currentPose, resolveSoundLabMechanismPose(0));
  assert.deepEqual(focus.currentPose, resolveSoundLabMechanismPose(1));
});

test("Sound Lab diagnostics distinguish transitions and tiers while malformed or fake audio fails closed", () => {
  const sound = { status: "muted" as const, muted: true };
  const transition = captureSoundLabDiagnostics({
    presentation: resolveSoundLabPresentation("full", "full", false),
    selected: true,
    progress: 0.4,
    targetProgress: 1,
    pose: resolveSoundLabMechanismPose(0.4),
    sound,
    approvedAmplitude: 0,
  });
  const paused = captureSoundLabDiagnostics({
    presentation: resolveSoundLabPresentation("full", "paused", false),
    selected: true,
    progress: 0.4,
    targetProgress: 1,
    pose: resolveSoundLabMechanismPose(0.4),
    sound,
    approvedAmplitude: 0,
  });
  const reduced = captureSoundLabDiagnostics({
    presentation: resolveSoundLabPresentation("reduced", "full", false),
    selected: true,
    progress: 1,
    targetProgress: 1,
    pose: resolveSoundLabMechanismPose(1),
    sound,
    approvedAmplitude: 0,
  });
  const poster = captureSoundLabDiagnostics({
    presentation: resolveSoundLabPresentation("static", "static", false),
    selected: false,
    progress: 0,
    targetProgress: 0,
    pose: resolveSoundLabMechanismPose(0),
    sound,
    approvedAmplitude: 0,
  });
  const malformed = captureSoundLabDiagnostics({
    presentation: resolveSoundLabPresentation("full", "full", false),
    selected: false,
    progress: Number.NaN,
    targetProgress: 2,
    pose: { ...resolveSoundLabMechanismPose(0), sliderOffset: Number.NaN },
    sound,
    approvedAmplitude: Number.NaN,
  });
  const fakeResponse = captureSoundLabDiagnostics({
    presentation: resolveSoundLabPresentation("full", "full", false),
    selected: false,
    progress: 0,
    targetProgress: 0,
    pose: resolveSoundLabMechanismPose(0, 0.7),
    sound: { status: "playing", muted: false },
    approvedAmplitude: 0.7,
  });

  assert.equal(transition.phase, "animating");
  assert.equal(transition.alignment?.settled, false);
  assert.equal(paused.phase, "paused");
  assert.equal(reduced.phase, "reduced");
  assert.equal(reduced.alignment?.settled, true);
  assert.equal(poster.phase, "poster");
  assert.equal(poster.currentPose, null);
  assert.equal(poster.alignment, null);
  assert.equal(malformed.progress, null);
  assert.equal(malformed.targetProgress, null);
  assert.equal(malformed.currentPose, null);
  assert.equal(malformed.targetPose, null);
  assert.equal(malformed.alignment, null);
  assert.equal(malformed.audio.approvedAmplitude, null);
  assert.equal(fakeResponse.audio.catalogTrackCount, 0);
  assert.equal(fakeResponse.audio.playerAvailable, false);
  assert.equal(fakeResponse.audio.responseActive, true);
});

test("the Sound Lab DOM equivalent exposes focus, media destination, and source readiness", () => {
  const store = createObservatorySceneStore();
  store.dispatch({ type: "artifact/select", artifactId: "sound-lab" });
  const artifact = {
    artifactId: "sound-lab" as const,
    href: "/sound",
    title: "Sound Lab",
    descriptor: "Harmonic instrument",
    status: "Awaiting approved sources",
    mechanismDescription:
      "A central harmonic dial and tactile controls respond to focus; playback remains unavailable until approved.",
  };
  const markup = renderToStaticMarkup(
    createElement(
      ObservatorySceneProvider,
      { store } as ObservatorySceneProviderProps,
      createElement(ObservatoryArtifactAccess, { artifact, interactive: true }),
    ),
  );

  assert.match(markup, /data-artifact-id="sound-lab"/);
  assert.match(markup, /data-selected="true"/);
  assert.match(markup, /Awaiting approved sources/);
  assert.match(markup, /href="\/sound"/);
  assert.match(markup, /Open Sound Lab — Harmonic instrument/);
  assert.match(markup, /central harmonic dial/);
  assert.match(markup, /aria-pressed="true"/);
  assert.match(markup, /Return to overview/);
  assert.doesNotMatch(markup, /<(?:audio|video|iframe)\b/);
});

test("the scene owns one sparse Sound Lab mechanism without fake media or perpetual motion", () => {
  const componentSource = readSource("src/components/three/observatory-sound-lab.tsx");
  const systemSource = readSource("src/lib/three/sound-lab-system.ts");
  const shellSource = readSource("src/components/three/observatory-scene-shell.tsx");
  const pageSource = readSource("src/app/page.tsx");
  const styles = readSource("src/app/globals.css");

  assert.match(componentSource, /InstancedMesh/);
  assert.match(componentSource, /SoundLabHarmonicDial/);
  assert.match(componentSource, /SoundLabTactileKnobs/);
  assert.match(componentSource, /SoundLabSlider/);
  assert.match(componentSource, /useFrame/);
  assert.match(componentSource, /window\.setInterval/);
  assert.match(componentSource, /window\.setTimeout/);
  assert.match(componentSource, /onClick=\{selectSoundLab\}/);
  assert.match(componentSource, /artifact\/select/);
  assert.doesNotMatch(
    componentSource,
    /useState|AudioContext|<audio|VideoTexture|CanvasTexture|TextGeometry|troika|shaderMaterial/,
  );
  assert.doesNotMatch(systemSource, /example\.mp3|placeholder track|unknown artist/i);
  assert.match(systemSource, /SOUND_LAB_AUDIO_CATALOG:[\s\S]*= \[\]/);
  assert.match(shellSource, /<ObservatorySoundLab/);
  assert.match(shellSource, /onSoundLabDiagnosticsReady/);
  assert.match(pageSource, /artifactId: "sound-lab"/);
  assert.match(pageSource, /metadata\.mediaTeaser\.action\.href/);
  assert.match(styles, /\.observatory-artifact-access\[data-artifact-id="sound-lab"\][\s\S]*top:/);
  assert.match(
    styles,
    /@media \(max-width: 64rem\)[\s\S]*data-artifact-id="sound-lab"[\s\S]*display:\s*none/,
  );
});
