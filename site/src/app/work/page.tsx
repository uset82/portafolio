import type { Metadata } from "next";

import { ProjectRegister } from "@/components/project-register";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Work Carlos Alfredo Carpio Meza has been building since 2022. Public GitHub register grouped by practice, with an invitation to try and to contribute.",
};

export default function WorkPage() {
  return <ProjectRegister />;
}
