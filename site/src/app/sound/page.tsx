import type { Metadata } from "next";

import { MediaReadiness } from "@/components/media";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "Sound" };

export default function SoundPage() {
  return (
    <PageIntro
      eyebrow="Sound"
      title="Music, harmonic instruments, and responsive systems."
      description="This mute-first space will publish only approved tracks, artwork, credits, captions, and playback sources."
    >
      <MediaReadiness />
    </PageIntro>
  );
}
