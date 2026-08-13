import type { Metadata } from "next";

import { SoundRoom } from "@/components/sound-room";

export const metadata: Metadata = {
  title: "Sound",
  description:
    "Music Carlos Alfredo Carpio Meza makes with Suno and video published on YouTube. Every player is click-to-load: no autoplay, and no provider contacted until you ask for one.",
};

export default function SoundPage() {
  return <SoundRoom />;
}
