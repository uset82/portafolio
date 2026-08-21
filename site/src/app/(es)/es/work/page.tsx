import type { Metadata } from "next";

import { ProjectOrbit } from "@/components/project-orbit";
import { ProjectRegister } from "@/components/project-register";
import { ORBIT_PROJECTS } from "@/content/project-orbit";

export const metadata: Metadata = {
  title: "Trabajo",
  description:
    "El trabajo que Carlos Alfredo Carpio Meza construye desde 2022. Registro público de GitHub agrupado por práctica, con búsqueda de proyectos, demos jugables y apps de astrología.",
  alternates: { canonical: "/es/work", languages: { en: "/work", es: "/es/work" } },
};

export default function WorkPageEs() {
  return (
    <>
      <ProjectOrbit projects={ORBIT_PROJECTS} locale="es" />
      <ProjectRegister locale="es" />
    </>
  );
}
