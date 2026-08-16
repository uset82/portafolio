import type { Metadata } from "next";

import { ProjectRegister } from "@/components/project-register";
import { GITHUB_REGISTER_META } from "@/content/github-register";

export const metadata: Metadata = {
  title: "Work",
  description: `Public GitHub register for Carlos Alfredo Carpio Meza: ${GITHUB_REGISTER_META.count} public repositories. Cosmos holds ASTROEA and Pináculo to try.`,
};

export default function WorkPage() {
  return <ProjectRegister />;
}
