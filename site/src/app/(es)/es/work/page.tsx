import type { Metadata } from "next";

import { Ca2mAtomFilm } from "@/components/ca2m-atom-film";
import { ProjectRegister } from "@/components/project-register";
import { ProjectSystemsNav } from "@/components/project-systems-nav";

export const metadata: Metadata = {
  title: "Trabajo",
  description:
    "El trabajo que Carlos Alfredo Carpio Meza construye desde 2022. Registro público de GitHub agrupado por práctica, con búsqueda de proyectos, demos jugables y apps de astrología.",
  alternates: { canonical: "/es/work", languages: { en: "/work", es: "/es/work" } },
};

export default function WorkPageEs() {
  return (
    <>
      <Ca2mAtomFilm locale="es" />
      <ProjectSystemsNav locale="es" />
      <ProjectRegister locale="es" />
    </>
  );
}
