import type { Metadata } from "next";

import { SoundRoom } from "@/components/sound-room";

export const metadata: Metadata = {
  title: "Sound",
  description:
    "StrudelAI is open for testing, with music Carlos makes on Suno and video on YouTube. Players stay click-to-load.",
};

export default function SoundPage() {
  return <SoundRoom />;
}
