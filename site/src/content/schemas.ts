import { z } from "zod";

const idSchema = z
  .string()
  .min(2, "IDs must contain at least two characters")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase kebab-case IDs");

const slugSchema = idSchema;

const partialDateSchema = z
  .string()
  .regex(/^\d{4}(?:-(?:0[1-9]|1[0-2])(?:-(?:0[1-9]|[12]\d|3[01]))?)?$/, {
    message: "Use YYYY, YYYY-MM, or YYYY-MM-DD",
  });

const hrefSchema = z
  .string()
  .min(1)
  .refine(
    (value) =>
      value.startsWith("/") ||
      value.startsWith("#") ||
      value.startsWith("mailto:") ||
      URL.canParse(value),
    "Use an internal path, fragment, mailto link, or absolute URL",
  );

export const verificationStateSchema = z.enum([
  "verified",
  "user-approved",
  "reference-approved",
  "needs-user-confirmation",
  "needs-source-review",
  "blocked",
  "rejected",
]);

export const rightsStateSchema = z.enum([
  "owned",
  "permission-granted",
  "permissive-license",
  "attribution-required",
  "pending",
  "not-applicable",
  "rejected",
]);

export const publicationStateSchema = z.enum(["draft", "ready", "hold", "private"]);

export const sourceReferenceSchema = z
  .object({
    id: idSchema,
    label: z.string().min(2),
    kind: z.enum([
      "user-approval",
      "repository",
      "live-demo",
      "document",
      "reference-image",
      "media-file",
      "license",
      "external-page",
    ]),
    owner: z.string().min(2),
    public: z.boolean(),
    url: z.string().url().optional(),
    path: z.string().min(1).optional(),
    checkedOn: partialDateSchema.optional(),
    notes: z.string().min(2).optional(),
  })
  .strict()
  .superRefine((source, context) => {
    if (!source.url && !source.path) {
      context.addIssue({
        code: "custom",
        path: ["url"],
        message: "A source needs either a public URL or a repository-relative path",
      });
    }
  });

export const linkSchema = z
  .object({
    id: idSchema,
    label: z.string().min(1),
    href: hrefSchema,
    kind: z.enum([
      "navigation",
      "repository",
      "demo",
      "documentation",
      "social",
      "contact",
      "download",
      "external",
    ]),
    verification: verificationStateSchema,
    sourceIds: z.array(idSchema).default([]),
    external: z.boolean().default(false),
  })
  .strict();

const mediaBaseShape = {
  id: idSchema,
  title: z.string().min(1),
  src: z.string().min(1),
  owner: z.string().min(2),
  rights: rightsStateSchema,
  verification: verificationStateSchema,
  sourceIds: z.array(idSchema).min(1),
  credit: z.string().min(2).optional(),
  caption: z.string().min(2).optional(),
  poster: z.string().min(1).optional(),
};

const imageMediaSchema = z
  .object({
    ...mediaBaseShape,
    type: z.literal("image"),
    alt: z.string(),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    decorative: z.boolean().default(false),
  })
  .strict()
  .superRefine((image, context) => {
    if (!image.decorative && image.alt.trim().length < 8) {
      context.addIssue({
        code: "custom",
        path: ["alt"],
        message: "Informative images need useful alt text; mark truly decorative images explicitly",
      });
    }
    if (image.decorative && image.alt !== "") {
      context.addIssue({
        code: "custom",
        path: ["alt"],
        message: "Decorative images must use empty alt text",
      });
    }
  });

const audioMediaSchema = z
  .object({
    ...mediaBaseShape,
    type: z.literal("audio"),
    durationSeconds: z.number().positive().optional(),
    transcript: z.string().min(2).optional(),
    mutedByDefault: z.literal(true),
  })
  .strict();

const videoMediaSchema = z
  .object({
    ...mediaBaseShape,
    type: z.literal("video"),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    durationSeconds: z.number().positive().optional(),
    captions: z.string().min(1).optional(),
    transcript: z.string().min(2).optional(),
  })
  .strict()
  .superRefine((video, context) => {
    if (!video.poster) {
      context.addIssue({
        code: "custom",
        path: ["poster"],
        message: "Published video needs a poster for poster-first loading",
      });
    }
    if (!video.captions && !video.transcript) {
      context.addIssue({
        code: "custom",
        path: ["captions"],
        message: "Video needs captions or a transcript before publication",
      });
    }
  });

const embedMediaSchema = z
  .object({
    ...mediaBaseShape,
    type: z.literal("embed"),
    provider: z.string().min(2),
    privacyMode: z.boolean(),
    accessibleName: z.string().min(4),
    fallbackUrl: z.string().url(),
  })
  .strict()
  .superRefine((embed, context) => {
    if (!URL.canParse(embed.src)) {
      context.addIssue({
        code: "custom",
        path: ["src"],
        message: "External embed sources must use an absolute URL",
      });
      return;
    }

    const sourceUrl = new URL(embed.src);
    const autoplayValues = new Set(["1", "true", "yes"]);
    const startsAutomatically = [...sourceUrl.searchParams.entries()].some(
      ([key, value]) =>
        ["autoplay", "auto_play"].includes(key.toLowerCase()) &&
        autoplayValues.has(value.toLowerCase()),
    );

    if (startsAutomatically) {
      context.addIssue({
        code: "custom",
        path: ["src"],
        message: "Embed URLs must not request autoplay",
      });
    }
  });

export const mediaAssetSchema = z.union([
  imageMediaSchema,
  audioMediaSchema,
  videoMediaSchema,
  embedMediaSchema,
]);

const projectCommonShape = {
  id: idSchema,
  slug: slugSchema,
  title: z.string().min(1),
  tagline: z.string().min(4),
  category: z.enum([
    "ai",
    "software",
    "electronics",
    "energy",
    "sound",
    "cosmos",
    "creative-tools",
    "mixed",
  ]),
  featured: z.boolean(),
  publication: publicationStateSchema,
  summary: z.string().min(20),
  owner: z.string().min(2),
  verification: verificationStateSchema,
  rights: rightsStateSchema,
  sourceIds: z.array(idSchema).min(1),
  stack: z.array(z.string().min(1)).default([]),
  links: z.array(linkSchema).default([]),
  media: z.array(mediaAssetSchema).default([]),
  presentation: z
    .object({
      index: z.string().regex(/^\d{2}$/),
      descriptor: z.string().min(3),
      group: z.enum(["Work", "Laboratory", "Sound", "Cosmos"]),
    })
    .strict()
    .optional(),
};

const conceptProjectSchema = z
  .object({
    ...projectCommonShape,
    status: z.enum(["concept", "preparation"]),
    conceptStatement: z.string().min(20),
  })
  .strict();

const evidenceProjectSchema = z
  .object({
    ...projectCommonShape,
    status: z.enum(["shipped", "maintained", "prototype", "experiment", "archived"]),
    contribution: z.string().min(20),
    problem: z.string().min(20),
    constraints: z.array(z.string().min(8)).min(1),
    approach: z.string().min(20),
    outcome: z.string().min(20).optional(),
    learnings: z.array(z.string().min(8)).default([]),
    year: z.number().int().min(1990).max(2100).optional(),
  })
  .strict();

export const projectSchema = z.union([conceptProjectSchema, evidenceProjectSchema]);

export const mediaWorkSchema = z
  .object({
    id: idSchema,
    slug: slugSchema,
    title: z.string().min(1),
    kind: z.enum(["track", "album", "video", "performance", "sound-experiment"]),
    status: z.enum(["published", "prototype", "private", "preparation", "archived"]),
    publication: publicationStateSchema,
    summary: z.string().min(20),
    credits: z.array(z.string().min(2)),
    media: z.array(mediaAssetSchema),
    links: z.array(linkSchema).default([]),
    owner: z.string().min(2),
    verification: verificationStateSchema,
    rights: rightsStateSchema,
    sourceIds: z.array(idSchema).min(1),
  })
  .strict();

export const experienceSchema = z
  .object({
    id: idSchema,
    organization: z.string().min(2),
    role: z.string().min(2),
    start: partialDateSchema,
    end: z.union([partialDateSchema, z.literal("present")]),
    summary: z.string().min(20),
    locationGranularity: z.enum(["country", "region", "city", "remote", "not-public"]),
    links: z.array(linkSchema).default([]),
    verification: verificationStateSchema,
    sourceIds: z.array(idSchema).min(1),
  })
  .strict();

export const educationSchema = z
  .object({
    id: idSchema,
    institution: z.string().min(2),
    program: z.string().min(2),
    credential: z.string().min(2).optional(),
    start: partialDateSchema.optional(),
    end: partialDateSchema.optional(),
    summary: z.string().min(12).optional(),
    verification: verificationStateSchema,
    sourceIds: z.array(idSchema).min(1),
  })
  .strict();

export const tripSchema = z
  .object({
    id: idSchema,
    slug: slugSchema,
    title: z.string().min(2),
    placeLabel: z.string().min(2),
    placeGranularity: z.enum(["country", "region", "city", "withheld"]),
    timeGranularity: z.enum(["year", "season", "withheld"]),
    timeLabel: z.string().min(2).optional(),
    reflection: z.string().min(20),
    media: z.array(imageMediaSchema).min(1),
    privacyReviewed: z.literal(true),
    verification: verificationStateSchema,
    sourceIds: z.array(idSchema).min(1),
  })
  .strict();

export const hobbySchema = z
  .object({
    id: idSchema,
    slug: slugSchema,
    title: z.string().min(2),
    framing: z.enum(["creative-practice", "personal-interest", "ongoing-study"]),
    summary: z.string().min(20),
    claimsBoundary: z.string().min(12),
    media: z.array(mediaAssetSchema).default([]),
    verification: verificationStateSchema,
    sourceIds: z.array(idSchema).min(1),
  })
  .strict();

export const siteMetadataSchema = z
  .object({
    name: z.string().min(2),
    locale: z.string().regex(/^[a-z]{2}(?:-[A-Z]{2})?$/),
    eyebrow: z.string().min(4),
    headline: z.string().min(12),
    supportingStatement: z.string().min(20),
    currentFocus: z.string().min(20),
    assistantName: z.string().min(2),
    primaryAction: linkSchema,
    secondaryAction: linkSchema,
    verification: verificationStateSchema,
    sourceIds: z.array(idSchema).min(1),
  })
  .strict();

export const siteContentSchema = z
  .object({
    sources: z.array(sourceReferenceSchema).min(1),
    metadata: siteMetadataSchema,
    navigation: z.array(linkSchema).min(1),
    projects: z.array(projectSchema),
    mediaWorks: z.array(mediaWorkSchema).default([]),
    experiences: z.array(experienceSchema).default([]),
    education: z.array(educationSchema).default([]),
    trips: z.array(tripSchema).default([]),
    hobbies: z.array(hobbySchema).default([]),
  })
  .strict()
  .superRefine((content, context) => {
    const sourceIds = new Set(content.sources.map((source) => source.id));
    const usedIds = new Set<string>();

    const checkId = (id: string, path: Array<string | number>) => {
      if (usedIds.has(id)) {
        context.addIssue({ code: "custom", path, message: `Duplicate content ID: ${id}` });
      }
      usedIds.add(id);
    };

    const checkSources = (ids: string[], path: Array<string | number>) => {
      ids.forEach((sourceId, index) => {
        if (!sourceIds.has(sourceId)) {
          context.addIssue({
            code: "custom",
            path: [...path, index],
            message: `Unknown source ID: ${sourceId}`,
          });
        }
      });
    };

    checkSources(content.metadata.sourceIds, ["metadata", "sourceIds"]);
    content.navigation.forEach((link, index) => {
      checkId(link.id, ["navigation", index, "id"]);
      checkSources(link.sourceIds, ["navigation", index, "sourceIds"]);
    });

    const collections = [
      content.projects,
      content.mediaWorks,
      content.experiences,
      content.education,
      content.trips,
      content.hobbies,
    ] as const;

    collections.forEach((collection, collectionIndex) => {
      collection.forEach((record, recordIndex) => {
        checkId(record.id, ["collections", collectionIndex, recordIndex, "id"]);
        checkSources(record.sourceIds, ["collections", collectionIndex, recordIndex, "sourceIds"]);
      });
    });
  });

export const inventoryItemSchema = z
  .object({
    id: idSchema,
    type: z.enum([
      "site-metadata",
      "profile",
      "cv",
      "project",
      "image",
      "video",
      "audio",
      "trip",
      "hobby",
      "contact",
      "social",
      "knowledge",
      "3d-asset",
      "design-reference",
    ]),
    title: z.string().min(2),
    owner: z.string().min(2),
    source: z.string().min(2),
    verification: verificationStateSchema,
    rights: rightsStateSchema,
    missingFields: z.array(z.string().min(2)),
    priority: z.enum(["launch-critical", "launch-important", "later"]),
    launchDecision: z.enum(["include", "hold", "fallback", "exclude"]),
    requestedAction: z.string().min(5),
    fallback: z.string().min(5),
    launchImpact: z.string().min(5),
    notes: z.string().min(2).optional(),
  })
  .strict();

export const inventoryLedgerSchema = z
  .object({
    version: z.literal(1),
    reviewedOn: partialDateSchema,
    items: z.array(inventoryItemSchema).min(1),
  })
  .strict()
  .superRefine((ledger, context) => {
    const ids = new Set<string>();
    ledger.items.forEach((item, index) => {
      if (ids.has(item.id)) {
        context.addIssue({
          code: "custom",
          path: ["items", index, "id"],
          message: `Duplicate inventory ID: ${item.id}`,
        });
      }
      ids.add(item.id);

      if (item.verification !== "verified" && item.missingFields.length === 0) {
        context.addIssue({
          code: "custom",
          path: ["items", index, "missingFields"],
          message: "Unverified inventory items must state what is missing",
        });
      }
    });
  });

export type SourceReference = z.infer<typeof sourceReferenceSchema>;
export type LinkRecord = z.infer<typeof linkSchema>;
export type MediaAsset = z.infer<typeof mediaAssetSchema>;
export type Project = z.infer<typeof projectSchema>;
export type MediaWork = z.infer<typeof mediaWorkSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Education = z.infer<typeof educationSchema>;
export type Trip = z.infer<typeof tripSchema>;
export type Hobby = z.infer<typeof hobbySchema>;
export type SiteMetadata = z.infer<typeof siteMetadataSchema>;
export type SiteContent = z.infer<typeof siteContentSchema>;
export type InventoryItem = z.infer<typeof inventoryItemSchema>;
