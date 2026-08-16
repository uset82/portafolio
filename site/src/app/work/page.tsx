import type { Metadata } from "next";

import { WorkRegister } from "@/components/work-register";
import { rawSiteContent } from "@/content/records";
import { siteContentSchema } from "@/content/schemas";

const siteContent = siteContentSchema.parse(rawSiteContent);

export const metadata: Metadata = {
  title: "Work",
  description:
    "Ten projects Carlos Alfredo Carpio Meza has built, across web, design systems, Rust, Flutter, VHDL, C++ and Python, each with its languages, licence and source. Observatory concepts are listed separately.",
};

export default function WorkPage() {
  return <WorkRegister concepts={siteContent.projects} />;
}
