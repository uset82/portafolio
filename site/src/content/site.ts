import "server-only";

import { rawSiteContent } from "./records";
import { siteContentSchema, type LinkRecord, type Project } from "./schemas";

export const siteContent = siteContentSchema.parse(rawSiteContent);

export const navigation = siteContent.navigation.map(({ href, label }) => ({ href, label }));

export type NavigationItem = Pick<LinkRecord, "href" | "label">;

export type SelectedSystem = {
  index: string;
  slug: string;
  title: string;
  descriptor: string;
  group: "Work" | "Laboratory" | "Sound" | "Cosmos";
  status: Project["status"];
};

export const selectedSystems: SelectedSystem[] = siteContent.projects.flatMap((project) =>
  project.featured && project.presentation
    ? [
        {
          index: project.presentation.index,
          slug: project.slug,
          title: project.title,
          descriptor: project.presentation.descriptor,
          group: project.presentation.group,
          status: project.status,
        },
      ]
    : [],
);
