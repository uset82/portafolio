import type { Metadata } from "next";

import { SoundRoom } from "@/components/sound-room";

export const metadata: Metadata = {
  title: "Sound",
  description:
    "Music from Suno, video on YouTube, and StrudelAI open for testing. Players stay click-to-load.",
};

export default function SoundPage() {
  return <SoundRoom />;
}
