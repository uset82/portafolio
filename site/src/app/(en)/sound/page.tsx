import type { Metadata } from "next";

import { SoundRoom } from "@/components/sound-room";

export const metadata: Metadata = {
  title: "Sound",
  description:
    "Music from Suno, video on YouTube, and StrudelAI open for testing. The song plays in one press; the video loads on click.",
};

export default function SoundPage() {
  return <SoundRoom />;
}
