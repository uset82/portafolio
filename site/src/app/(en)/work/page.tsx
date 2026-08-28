import type { Metadata } from "next";

import { ProjectOrbit } from "@/components/project-orbit";
import { ProjectRegister } from "@/components/project-register";
import { ORBIT_PROJECTS } from "@/content/project-orbit";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Work Carlos Alfredo Carpio Meza has been building since 2022. Public GitHub register grouped by practice, with search for projects, playable demos, and astrology apps.",
  alternates: { canonical: "/work", languages: { en: "/work", es: "/es/work" } },
};

export default function WorkPage() {
  return (
    <>
      <ProjectOrbit projects={ORBIT_PROJECTS} />
      <ProjectRegister />
    </>
  );
}
