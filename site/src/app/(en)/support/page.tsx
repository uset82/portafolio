import type { Metadata } from "next";

import { SupportRoom } from "@/components/support-room";
import { resolveTipUrl } from "@/content/support";

export const metadata: Metadata = {
  title: "Support",
  description:
    "Contribute to Carlos Alfredo Carpio Meza's MIT-licensed repositories, or buy him a coffee. Both are optional; the games, music, and code stay free either way.",
};

export default function SupportPage() {
  return <SupportRoom tipUrl={resolveTipUrl()} />;
}
