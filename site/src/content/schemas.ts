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

const laboratoryConceptCommonShape = {
  id: idSchema,
  descriptor: z.string().min(8),
  status: z.literal("concept"),
  statusLabel: z.string().min(4),
  href: z.literal("/laboratory"),
  summary: z.string().min(40),
  boundary: z.string().min(40),
  verification: z.literal("reference-approved"),
  rights: z.literal("not-applicable"),
  sourceIds: z.array(idSchema).min(1),
};

export const laboratoryConceptSchema = z.discriminatedUnion("artifactId", [
  z
    .object({
      ...laboratoryConceptCommonShape,
      artifactId: z.literal("electronics-ai"),
      title: z.literal("Electronics / AI"),
    })
    .strict(),
  z
    .object({
      ...laboratoryConceptCommonShape,
      artifactId: z.literal("drone"),
      title: z.literal("Aerial systems"),
    })
    .strict(),
]);

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

export const draftProjectSummaryLinkSchema = z
  .object({
    label: z.string().min(2),
    kind: z.enum(["repository", "demo", "release"]),
    href: z.string().url(),
    verification: z.literal("verified"),
    checkedOn: partialDateSchema,
    result: z.string().min(8),
  })
  .strict();

export const draftProjectLearningSchema = z
  .object({
    text: z.string().min(20),
    provenance: z.string().min(20),
  })
  .strict();

export const flagshipProjectSummarySchema = z
  .object({
    id: idSchema,
    slug: slugSchema,
    order: z.number().int().positive(),
    title: z.string().min(1),
    tagline: z.string().min(12),
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
    status: z.enum(["shipped", "maintained", "prototype", "experiment", "archived"]),
    summary: z.string().min(40),
    contribution: z.string().min(40),
    stack: z.array(z.string().min(2)).min(1),
    problem: z.string().min(40),
    constraints: z.array(z.string().min(20)).min(1),
    approach: z.string().min(40),
    outcome: z.string().min(40),
    learnings: z.array(draftProjectLearningSchema).min(1),
    links: z.array(draftProjectSummaryLinkSchema).min(1),
    sourcePack: z
      .string()
      .regex(
        /^docs\/content\/[a-z0-9-]+-source-pack\.md$/,
        "Use a repository-relative case-study source-pack path",
      ),
    provenanceNotes: z.array(z.string().min(20)).min(1),
    verification: z.literal("verified"),
    rights: z.literal("pending"),
    publication: z.literal("hold"),
    mediaDecision: z.literal("exclude"),
  })
  .strict()
  .superRefine((project, context) => {
    const repositoryLinks = project.links.filter((link) => link.kind === "repository");
    if (repositoryLinks.length !== 1) {
      context.addIssue({
        code: "custom",
        path: ["links"],
        message: "Each flagship summary needs exactly one verified repository link",
      });
    }

    const hrefs = new Set<string>();
    project.links.forEach((link, index) => {
      if (hrefs.has(link.href)) {
        context.addIssue({
          code: "custom",
          path: ["links", index, "href"],
          message: `Duplicate project link: ${link.href}`,
        });
      }
      hrefs.add(link.href);
    });
  });

export const flagshipProjectSummaryLedgerSchema = z
  .object({
    version: z.literal(1),
    reviewedOn: partialDateSchema,
    publication: z.literal("hold"),
    selection: z.array(idSchema).min(1),
    projects: z.array(flagshipProjectSummarySchema).min(1),
  })
  .strict()
  .superRefine((ledger, context) => {
    const selectionIds = new Set<string>();
    const slugs = new Set<string>();

    if (ledger.selection.length !== ledger.projects.length) {
      context.addIssue({
        code: "custom",
        path: ["projects"],
        message: "Every selected flagship project needs exactly one summary",
      });
    }

    ledger.selection.forEach((id, index) => {
      if (selectionIds.has(id)) {
        context.addIssue({
          code: "custom",
          path: ["selection", index],
          message: `Duplicate selected project ID: ${id}`,
        });
      }
      selectionIds.add(id);

      const project = ledger.projects[index];
      if (!project) return;

      if (project.id !== id) {
        context.addIssue({
          code: "custom",
          path: ["projects", index, "id"],
          message: `Expected selected project ${id} at order ${index + 1}`,
        });
      }

      if (project.order !== index + 1) {
        context.addIssue({
          code: "custom",
          path: ["projects", index, "order"],
          message: `Expected project order ${index + 1}`,
        });
      }

      if (slugs.has(project.slug)) {
        context.addIssue({
          code: "custom",
          path: ["projects", index, "slug"],
          message: `Duplicate project slug: ${project.slug}`,
        });
      }
      slugs.add(project.slug);
    });
  });

export const auditedProjectLinkSchema = z
  .object({
    id: idSchema,
    projectId: idSchema,
    label: z.string().min(2),
    kind: z.enum(["repository", "demo", "release", "installer"]),
    requestedUrl: z.string().url(),
    status: z.enum(["verified", "broken", "private", "unavailable"]),
    httpStatus: z.number().int().min(100).max(599).optional(),
    finalUrl: z.string().url().optional(),
    redirects: z.number().int().nonnegative(),
    contentType: z.string().min(2).optional(),
    publication: z.enum(["include", "exclude"]),
    notes: z.string().min(20),
  })
  .strict()
  .superRefine((link, context) => {
    if (link.status === "verified") {
      if (!link.httpStatus || link.httpStatus < 200 || link.httpStatus >= 400) {
        context.addIssue({
          code: "custom",
          path: ["httpStatus"],
          message: "A verified link needs a successful HTTP status",
        });
      }
      if (!link.finalUrl) {
        context.addIssue({
          code: "custom",
          path: ["finalUrl"],
          message: "A verified link needs a known final URL",
        });
      }
      if (link.publication !== "include") {
        context.addIssue({
          code: "custom",
          path: ["publication"],
          message: "A verified project action should be marked for inclusion",
        });
      }
    } else if (link.publication !== "exclude") {
      context.addIssue({
        code: "custom",
        path: ["publication"],
        message: "Broken, private, or unavailable links must be excluded",
      });
    }

    if (link.status === "broken" && (!link.httpStatus || link.httpStatus < 400 || !link.finalUrl)) {
      context.addIssue({
        code: "custom",
        path: ["httpStatus"],
        message: "A broken HTTP link needs its failure status and final URL",
      });
    }
  });

export const projectLinkRegisterSchema = z
  .object({
    version: z.literal(1),
    checkedOn: partialDateSchema,
    method: z.string().min(40),
    links: z.array(auditedProjectLinkSchema).min(1),
  })
  .strict()
  .superRefine((register, context) => {
    const ids = new Set<string>();
    const urls = new Set<string>();

    register.links.forEach((link, index) => {
      if (ids.has(link.id)) {
        context.addIssue({
          code: "custom",
          path: ["links", index, "id"],
          message: `Duplicate audited link ID: ${link.id}`,
        });
      }
      ids.add(link.id);

      if (urls.has(link.requestedUrl)) {
        context.addIssue({
          code: "custom",
          path: ["links", index, "requestedUrl"],
          message: `Duplicate audited URL: ${link.requestedUrl}`,
        });
      }
      urls.add(link.requestedUrl);
    });
  });

const knownMediaDimensionsSchema = z
  .object({
    status: z.literal("known"),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    bytes: z.number().int().positive(),
    durationSeconds: z.number().positive().optional(),
    frameRate: z.number().positive().optional(),
    videoCodec: z.string().min(2).optional(),
    audioCodec: z.string().min(2).optional(),
  })
  .strict();

const unmeasuredMediaDimensionsSchema = z
  .object({
    status: z.literal("not-measured"),
    reason: z.string().min(20),
  })
  .strict();

const mediaDimensionsSchema = z.union([
  knownMediaDimensionsSchema,
  unmeasuredMediaDimensionsSchema,
]);

export const projectMediaCandidateSchema = z
  .object({
    id: idSchema,
    projectId: idSchema,
    type: z.enum(["image", "video", "image-group"]),
    source: z.string().min(12),
    owner: z.string().min(12),
    permission: rightsStateSchema,
    license: z.string().min(8),
    dimensions: mediaDimensionsSchema,
    captionIntent: z.string().min(20),
    altTextIntent: z.string().min(20),
    optimizationNeeds: z.array(z.string().min(12)).min(1),
    decision: z.enum(["include", "hold", "exclude", "never-republish"]),
    reason: z.string().min(20),
  })
  .strict()
  .superRefine((candidate, context) => {
    if (candidate.decision !== "include") return;

    if (
      !["owned", "permission-granted", "permissive-license", "attribution-required"].includes(
        candidate.permission,
      )
    ) {
      context.addIssue({
        code: "custom",
        path: ["permission"],
        message: "Included project media needs affirmative reuse rights",
      });
    }

    if (candidate.dimensions.status !== "known") {
      context.addIssue({
        code: "custom",
        path: ["dimensions"],
        message: "Included project media needs measured dimensions",
      });
    }
  });

export const projectMediaDecisionSchema = z
  .object({
    projectId: idSchema,
    sourcePack: z
      .string()
      .regex(
        /^docs\/content\/[a-z0-9-]+-source-pack\.md$/,
        "Use a repository-relative case-study source-pack path",
      ),
    reusableMedia: z.array(idSchema),
    fallback: z.string().min(20),
    notes: z.string().min(20),
  })
  .strict();

export const deferredNonProjectAssetSchema = z
  .object({
    id: idSchema,
    path: z.string().regex(/^imagesandvideo\/.+/, "Use the local reference-asset path"),
    type: z.enum(["image", "video"]),
    dimensions: knownMediaDimensionsSchema,
    owner: z.string().min(12),
    permission: rightsStateSchema,
    license: z.string().min(8),
    captionIntent: z.string().min(20),
    altTextIntent: z.string().min(20),
    optimizationNeeds: z.array(z.string().min(12)).min(1),
    routing: z.string().min(20),
  })
  .strict();

export const projectMediaInventorySchema = z
  .object({
    version: z.literal(1),
    reviewedOn: partialDateSchema,
    publication: z.literal("hold"),
    reusableProjectMediaCount: z.number().int().nonnegative(),
    projects: z.array(projectMediaDecisionSchema).min(1),
    candidates: z.array(projectMediaCandidateSchema),
    deferredNonProjectAssets: z.array(deferredNonProjectAssetSchema),
  })
  .strict()
  .superRefine((inventory, context) => {
    const projectIds = new Set<string>();
    const candidatesById = new Map(
      inventory.candidates.map((candidate) => [candidate.id, candidate]),
    );
    const usedIds = new Set<string>();
    let reusableCount = 0;

    inventory.projects.forEach((project, projectIndex) => {
      if (projectIds.has(project.projectId)) {
        context.addIssue({
          code: "custom",
          path: ["projects", projectIndex, "projectId"],
          message: `Duplicate project media decision: ${project.projectId}`,
        });
      }
      projectIds.add(project.projectId);

      project.reusableMedia.forEach((candidateId, reusableIndex) => {
        reusableCount += 1;
        const candidate = candidatesById.get(candidateId);
        if (!candidate) {
          context.addIssue({
            code: "custom",
            path: ["projects", projectIndex, "reusableMedia", reusableIndex],
            message: `Unknown reusable media candidate: ${candidateId}`,
          });
          return;
        }
        if (candidate.projectId !== project.projectId || candidate.decision !== "include") {
          context.addIssue({
            code: "custom",
            path: ["projects", projectIndex, "reusableMedia", reusableIndex],
            message: "Reusable media must be an included candidate for the same project",
          });
        }
      });
    });

    if (reusableCount !== inventory.reusableProjectMediaCount) {
      context.addIssue({
        code: "custom",
        path: ["reusableProjectMediaCount"],
        message: `Expected reusable-project-media count ${reusableCount}`,
      });
    }

    inventory.candidates.forEach((candidate, candidateIndex) => {
      if (!projectIds.has(candidate.projectId)) {
        context.addIssue({
          code: "custom",
          path: ["candidates", candidateIndex, "projectId"],
          message: `Unknown project media owner: ${candidate.projectId}`,
        });
      }
      if (usedIds.has(candidate.id)) {
        context.addIssue({
          code: "custom",
          path: ["candidates", candidateIndex, "id"],
          message: `Duplicate media inventory ID: ${candidate.id}`,
        });
      }
      usedIds.add(candidate.id);
    });

    inventory.deferredNonProjectAssets.forEach((asset, assetIndex) => {
      if (usedIds.has(asset.id)) {
        context.addIssue({
          code: "custom",
          path: ["deferredNonProjectAssets", assetIndex, "id"],
          message: `Duplicate media inventory ID: ${asset.id}`,
        });
      }
      usedIds.add(asset.id);
    });
  });

const voiceTechnologyNameSchema = z
  .object({
    canonical: z.string().min(2),
    avoid: z.array(z.string().min(2)).min(1),
    note: z.string().min(12),
  })
  .strict();

const voiceStatusLabelSchema = z
  .object({
    internal: z.enum([
      "shipped",
      "maintained",
      "prototype",
      "experiment",
      "concept",
      "preparation",
      "archived",
      "hold",
      "private",
    ]),
    display: z.string().min(3),
    useWhen: z.string().min(30),
  })
  .strict();

const prohibitedCopyClaimSchema = z
  .object({
    id: idSchema,
    rule: z.string().min(30),
    evidenceNeeded: z.string().min(20),
  })
  .strict();

export const voiceAndCopyContractSchema = z
  .object({
    version: z.literal(1),
    reviewedOn: partialDateSchema,
    locale: z.literal("en"),
    voice: z
      .object({
        qualities: z.array(z.string().min(3)).min(5),
        avoid: z.array(z.string().min(3)).min(5),
        sentenceGuideline: z.string().min(40),
      })
      .strict(),
    perspective: z
      .object({
        identity: z.literal("first-person"),
        evidence: z.literal("third-person"),
        interface: z.literal("direct"),
        rules: z.array(z.string().min(20)).min(4),
      })
      .strict(),
    casing: z
      .object({
        headings: z.literal("sentence-case"),
        navigation: z.literal("title-case"),
        controls: z.literal("sentence-case"),
        preserveOfficialNames: z.literal(true),
        rules: z.array(z.string().min(20)).min(2),
      })
      .strict(),
    punctuation: z
      .object({
        serialComma: z.literal(true),
        exclamationDefault: z.literal(false),
        rules: z.array(z.string().min(20)).min(4),
      })
      .strict(),
    technologyNames: z.array(voiceTechnologyNameSchema).min(12),
    statusLabels: z.array(voiceStatusLabelSchema).length(9),
    prohibitedClaims: z.array(prohibitedCopyClaimSchema).min(10),
    requiredReviewChecks: z.array(z.string().min(20)).min(8),
  })
  .strict()
  .superRefine((contract, context) => {
    const expectedStatuses = [
      "shipped",
      "maintained",
      "prototype",
      "experiment",
      "concept",
      "preparation",
      "archived",
      "hold",
      "private",
    ];

    if (
      contract.statusLabels.map((status) => status.internal).join("|") !==
      expectedStatuses.join("|")
    ) {
      context.addIssue({
        code: "custom",
        path: ["statusLabels"],
        message: "Voice contract must define every status in canonical order",
      });
    }

    const technologyNames = new Set<string>();
    contract.technologyNames.forEach((technology, index) => {
      if (technologyNames.has(technology.canonical)) {
        context.addIssue({
          code: "custom",
          path: ["technologyNames", index, "canonical"],
          message: `Duplicate canonical technology name: ${technology.canonical}`,
        });
      }
      technologyNames.add(technology.canonical);
    });

    const prohibitedClaimIds = new Set<string>();
    contract.prohibitedClaims.forEach((claim, index) => {
      if (prohibitedClaimIds.has(claim.id)) {
        context.addIssue({
          code: "custom",
          path: ["prohibitedClaims", index, "id"],
          message: `Duplicate prohibited-claim ID: ${claim.id}`,
        });
      }
      prohibitedClaimIds.add(claim.id);
    });
  });

export const assetLicensingEntrySchema = z
  .object({
    id: idSchema,
    label: z.string().min(3),
    scope: z.enum(["launch", "conditional", "excluded"]),
    kind: z.enum([
      "image",
      "icon",
      "font",
      "decoder",
      "procedural-visual",
      "reference-group",
      "3d",
      "audio-video",
    ]),
    paths: z.array(z.string().min(3)).min(1),
    source: z.string().min(20),
    owner: z.string().min(8),
    rights: rightsStateSchema,
    license: z.string().min(12),
    attribution: z.string().min(12),
    decision: z.enum(["include", "hold", "exclude", "replace"]),
    launchCritical: z.boolean(),
    evidence: z.string().min(30),
  })
  .strict()
  .superRefine((asset, context) => {
    if (asset.scope === "launch" && !["include", "replace"].includes(asset.decision)) {
      context.addIssue({
        code: "custom",
        path: ["decision"],
        message: "Every launch asset must be included with resolved rights or explicitly replaced",
      });
    }

    if (asset.decision === "include" && ["pending", "rejected"].includes(asset.rights)) {
      context.addIssue({
        code: "custom",
        path: ["rights"],
        message: "Included launch assets need resolved rights",
      });
    }

    if (asset.scope === "excluded" && asset.decision !== "exclude") {
      context.addIssue({
        code: "custom",
        path: ["decision"],
        message: "Excluded asset groups must remain excluded",
      });
    }

    if (asset.launchCritical && asset.decision === "exclude") {
      context.addIssue({
        code: "custom",
        path: ["launchCritical"],
        message: "A launch-critical asset needs an include, hold, or replacement decision",
      });
    }
  });

export const assetLicensingRegisterSchema = z
  .object({
    version: z.literal(1),
    reviewedOn: partialDateSchema,
    releaseDecision: z.enum(["ready", "hold"]),
    assets: z.array(assetLicensingEntrySchema).min(1),
    reviewNotes: z.array(z.string().min(20)).min(1),
  })
  .strict()
  .superRefine((register, context) => {
    const ids = new Set<string>();
    let hasCriticalHold = false;

    register.assets.forEach((asset, index) => {
      if (ids.has(asset.id)) {
        context.addIssue({
          code: "custom",
          path: ["assets", index, "id"],
          message: `Duplicate asset-licensing ID: ${asset.id}`,
        });
      }
      ids.add(asset.id);
      if (asset.launchCritical && asset.decision === "hold") hasCriticalHold = true;
    });

    if (hasCriticalHold && register.releaseDecision !== "hold") {
      context.addIssue({
        code: "custom",
        path: ["releaseDecision"],
        message: "A launch-critical held asset must hold the release",
      });
    }

    if (!hasCriticalHold && register.releaseDecision !== "ready") {
      context.addIssue({
        code: "custom",
        path: ["releaseDecision"],
        message: "Release may be ready only when no launch-critical asset is held",
      });
    }
  });

const localMediaClearanceAssetSchema = z
  .object({
    id: idSchema,
    path: z
      .string()
      .regex(/^imagesandvideo\/[^/]+$/, "Use one repository-relative local-media file path"),
    kind: z.enum(["image", "video", "model"]),
    bytes: z.number().int().positive(),
    sha256: z.string().regex(/^[A-F0-9]{64}$/, "Use an uppercase SHA-256 hash"),
    source: z.string().min(20),
    owner: z.string().min(20),
    rights: rightsStateSchema,
    license: z.string().min(12),
    attribution: z.string().min(20),
    decision: z.enum(["include", "exclude"]),
    requiredClearance: z.array(z.string().min(12)).min(2),
    accessibilityPlan: z.string().min(20),
    technicalReview: z.string().min(20),
    evidence: z.string().min(30),
  })
  .strict()
  .superRefine((asset, context) => {
    const isImage = /\.(?:png|jpe?g)$/i.test(asset.path);
    const isVideo = /\.mp4$/i.test(asset.path);
    const isModel = /\.glb$/i.test(asset.path);

    if (
      (asset.kind === "image" && !isImage) ||
      (asset.kind === "video" && !isVideo) ||
      (asset.kind === "model" && !isModel)
    ) {
      context.addIssue({
        code: "custom",
        path: ["kind"],
        message: "Local-media kind must match the file extension",
      });
    }

    if (
      asset.decision === "include" &&
      !["owned", "permission-granted", "permissive-license", "attribution-required"].includes(
        asset.rights,
      )
    ) {
      context.addIssue({
        code: "custom",
        path: ["rights"],
        message: "Included local media needs affirmative publication rights",
      });
    }
  });

export const localMediaClearanceRegisterSchema = z
  .object({
    version: z.literal(1),
    reviewedOn: partialDateSchema,
    status: z.enum([
      "pending-file-level-clearance",
      "ownership-recorded-runtime-hold",
      "runtime-approved",
    ]),
    assets: z.array(localMediaClearanceAssetSchema).min(1),
    reviewNotes: z.array(z.string().min(20)).min(1),
  })
  .strict()
  .superRefine((register, context) => {
    const ids = new Set<string>();
    const paths = new Set<string>();
    const hashes = new Set<string>();
    const runtimeHoldStatuses = new Set([
      "pending-file-level-clearance",
      "ownership-recorded-runtime-hold",
    ]);

    register.assets.forEach((asset, index) => {
      if (ids.has(asset.id)) {
        context.addIssue({
          code: "custom",
          path: ["assets", index, "id"],
          message: `Duplicate local-media clearance ID: ${asset.id}`,
        });
      }
      if (paths.has(asset.path)) {
        context.addIssue({
          code: "custom",
          path: ["assets", index, "path"],
          message: `Duplicate local-media clearance path: ${asset.path}`,
        });
      }
      if (hashes.has(asset.sha256)) {
        context.addIssue({
          code: "custom",
          path: ["assets", index, "sha256"],
          message: `Duplicate local-media clearance hash: ${asset.sha256}`,
        });
      }
      ids.add(asset.id);
      paths.add(asset.path);
      hashes.add(asset.sha256);

      if (asset.rights === "pending" && asset.decision !== "exclude") {
        context.addIssue({
          code: "custom",
          path: ["assets", index, "decision"],
          message: "Pending local media must remain excluded",
        });
      }

      if (runtimeHoldStatuses.has(register.status) && asset.decision !== "exclude") {
        context.addIssue({
          code: "custom",
          path: ["assets", index, "decision"],
          message: "Local media must remain excluded while runtime clearance is held",
        });
      }
    });
  });

export const unresolvedContentBlockerSchema = z
  .object({
    id: idSchema,
    category: z.enum([
      "identity-contact",
      "project-publication",
      "rights-provenance",
      "media-asset",
      "personal-content",
      "experimental-feature",
      "content-freeze",
    ]),
    status: z.enum([
      "awaiting-user",
      "awaiting-user-and-project-change",
      "awaiting-user-and-implementation",
      "deferred-with-fallback",
    ]),
    priority: z.enum(["production-blocker", "section-blocker", "enhancement-deferred"]),
    owner: z.string().min(8),
    sourceInventoryIds: z.array(idSchema).min(1),
    requestedAction: z.string().min(20),
    fallback: z.string().min(20),
    resolutionBy: z.string().min(20),
    launchImpact: z.string().min(20),
    blocks: z.array(z.string().min(3)).min(1),
  })
  .strict()
  .superRefine((blocker, context) => {
    if (blocker.priority === "production-blocker" && blocker.status === "deferred-with-fallback") {
      context.addIssue({
        code: "custom",
        path: ["status"],
        message: "A production blocker cannot be treated as a deferred enhancement",
      });
    }
  });

export const unresolvedContentBlockerLedgerSchema = z
  .object({
    version: z.literal(1),
    reviewedOn: partialDateSchema,
    deadlinePolicy: z.string().min(30),
    blockers: z.array(unresolvedContentBlockerSchema).min(1),
  })
  .strict()
  .superRefine((ledger, context) => {
    const ids = new Set<string>();
    ledger.blockers.forEach((blocker, index) => {
      if (ids.has(blocker.id)) {
        context.addIssue({
          code: "custom",
          path: ["blockers", index, "id"],
          message: `Duplicate unresolved-content blocker ID: ${blocker.id}`,
        });
      }
      ids.add(blocker.id);
    });
  });

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

export const profileTeaserSchema = z
  .object({
    eyebrow: z.string().min(3).max(40),
    heading: z.string().min(12).max(100),
    headingAccent: z.string().min(3).max(40).optional(),
    role: z.string().min(12).max(100),
    biography: z.string().min(80).max(500),
    practiceThreads: z.array(z.string().min(3).max(40)).length(4),
    primaryAction: linkSchema,
    secondaryAction: linkSchema,
    verification: z.literal("user-approved"),
    sourceIds: z.array(idSchema).min(1),
  })
  .strict()
  .superRefine((teaser, context) => {
    if (teaser.primaryAction.href === teaser.secondaryAction.href) {
      context.addIssue({
        code: "custom",
        path: ["secondaryAction", "href"],
        message: "Profile teaser actions need distinct destinations",
      });
    }

    if (teaser.primaryAction.external || !teaser.secondaryAction.external) {
      context.addIssue({
        code: "custom",
        path: ["secondaryAction", "external"],
        message: "Profile teaser needs one internal profile path and one external proof path",
      });
    }
  });

export const mediaTeaserSchema = z
  .object({
    eyebrow: z.string().min(3).max(50),
    heading: z.string().min(12).max(120),
    description: z.string().min(40).max(240),
    status: z.string().min(8).max(50),
    formats: z.array(z.string().min(3).max(30)).length(2),
    action: linkSchema,
    verification: z.enum(["reference-approved", "user-approved"]),
    sourceIds: z.array(idSchema).min(1),
  })
  .strict()
  .superRefine((teaser, context) => {
    if (teaser.action.external) {
      context.addIssue({
        code: "custom",
        path: ["action", "external"],
        message: "Media teaser action must preserve the internal preparation route",
      });
    }
  });

export const personalTeaserSchema = z
  .object({
    eyebrow: z.string().min(3).max(50),
    heading: z.string().min(12).max(120),
    description: z.string().min(60).max(300),
    status: z.string().min(8).max(60),
    themes: z.array(z.string().min(3).max(40)).length(2),
    claimsBoundary: z.string().min(30).max(180),
    action: linkSchema,
    verification: z.literal("reference-approved"),
    sourceIds: z.array(idSchema).min(1),
  })
  .strict()
  .superRefine((teaser, context) => {
    if (teaser.action.external || teaser.action.href !== "/cosmos") {
      context.addIssue({
        code: "custom",
        path: ["action", "href"],
        message: "Personal teaser must preserve the internal Cosmos path",
      });
    }
  });

export const contactFooterSchema = z
  .object({
    eyebrow: z.string().min(3).max(40),
    heading: z.string().min(12).max(120),
    description: z.string().min(40).max(240),
    status: z.string().min(8).max(60),
    primaryAction: linkSchema,
    secondaryAction: linkSchema,
    verification: z.literal("reference-approved"),
    sourceIds: z.array(idSchema).min(1),
  })
  .strict()
  .superRefine((footer, context) => {
    if (footer.primaryAction.external || footer.primaryAction.href !== "/contact") {
      context.addIssue({
        code: "custom",
        path: ["primaryAction", "href"],
        message: "Footer primary action must preserve the approved internal contact path",
      });
    }

    if (
      !footer.secondaryAction.external ||
      footer.secondaryAction.href !== "https://github.com/uset82"
    ) {
      context.addIssue({
        code: "custom",
        path: ["secondaryAction", "href"],
        message: "Footer secondary action must use the verified public GitHub profile",
      });
    }
  });

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
    mediaTeaser: mediaTeaserSchema,
    personalTeaser: personalTeaserSchema,
    profileTeaser: profileTeaserSchema,
    footer: contactFooterSchema,
    verification: verificationStateSchema,
    sourceIds: z.array(idSchema).min(1),
  })
  .strict();

export const ccAiPublicKnowledgeRecordSchema = z
  .object({
    id: idSchema,
    type: z.enum(["profile", "project", "media", "experience", "education", "trip", "hobby"]),
    title: z.string().min(2),
    facts: z.array(z.string().min(12)).min(1),
    verification: z.enum(["verified", "user-approved"]),
    rights: z.enum([
      "owned",
      "permission-granted",
      "permissive-license",
      "attribution-required",
      "not-applicable",
    ]),
    sourceIds: z.array(idSchema).min(1),
  })
  .strict();

export const ccAiKnowledgeExclusionSchema = z
  .object({
    id: idSchema,
    scope: z.string().min(3),
    reason: z.string().min(20),
    sourceInventoryIds: z.array(idSchema).min(1),
    safeResponse: z.string().min(20),
  })
  .strict();

export const ccAiPublicKnowledgeLedgerSchema = z
  .object({
    version: z.literal(1),
    reviewedOn: partialDateSchema,
    status: z.literal("approved-public-only"),
    records: z.array(ccAiPublicKnowledgeRecordSchema).min(1),
    exclusions: z.array(ccAiKnowledgeExclusionSchema).min(1),
  })
  .strict()
  .superRefine((ledger, context) => {
    const ids = new Set<string>();
    ledger.records.forEach((record, index) => {
      if (ids.has(record.id)) {
        context.addIssue({
          code: "custom",
          path: ["records", index, "id"],
          message: `Duplicate public-knowledge record ID: ${record.id}`,
        });
      }
      ids.add(record.id);
    });
  });

export const ccAiEvaluationCategorySchema = z.enum([
  "factual",
  "uncertainty",
  "refusal",
  "multilingual",
  "prompt-injection",
  "source-conflict",
]);

export const ccAiEvaluationLocaleSchema = z.enum(["en", "es", "no"]);

export const ccAiEvaluationCaseSchema = z
  .object({
    id: idSchema,
    category: ccAiEvaluationCategorySchema,
    locale: ccAiEvaluationLocaleSchema,
    prompt: z.string().min(8),
    expectedBehavior: z.enum([
      "answer-supported",
      "say-unknown",
      "refuse-private",
      "preserve-boundary",
      "disclose-conflict",
    ]),
    expectedFacts: z.array(z.string().min(12)),
    requiredSourceIds: z.array(idSchema),
    acceptableUncertainty: z.array(z.string().min(8)),
    responseRequirements: z.array(z.string().min(8)).min(1),
    forbiddenClaims: z.array(z.string().min(8)).min(1),
    conflictClaims: z
      .array(
        z
          .object({
            origin: z.enum([
              "approved-ledger",
              "visitor-assertion",
              "held-source",
              "unapproved-source",
            ]),
            claim: z.string().min(8),
          })
          .strict(),
      )
      .optional(),
    rationale: z.string().min(20),
  })
  .strict()
  .superRefine((evaluationCase, context) => {
    if (
      evaluationCase.expectedBehavior === "answer-supported" &&
      (evaluationCase.expectedFacts.length === 0 || evaluationCase.requiredSourceIds.length === 0)
    ) {
      context.addIssue({
        code: "custom",
        path: ["expectedFacts"],
        message: "Supported answers need at least one exact ledger fact and public source",
      });
    }

    if (
      evaluationCase.expectedBehavior !== "answer-supported" &&
      evaluationCase.expectedFacts.length > 0 &&
      evaluationCase.expectedBehavior !== "disclose-conflict"
    ) {
      context.addIssue({
        code: "custom",
        path: ["expectedFacts"],
        message: "Unknown, refusal, and boundary cases must not require unsupported facts",
      });
    }

    if (
      evaluationCase.expectedBehavior === "say-unknown" &&
      evaluationCase.acceptableUncertainty.length === 0
    ) {
      context.addIssue({
        code: "custom",
        path: ["acceptableUncertainty"],
        message: "Unknown cases need an explicit acceptable uncertainty response",
      });
    }

    if (
      evaluationCase.category === "factual" &&
      evaluationCase.expectedBehavior !== "answer-supported"
    ) {
      context.addIssue({
        code: "custom",
        path: ["expectedBehavior"],
        message: "Factual cases must require a supported answer",
      });
    }

    if (evaluationCase.category === "multilingual" && evaluationCase.locale === "en") {
      context.addIssue({
        code: "custom",
        path: ["locale"],
        message: "Multilingual cases must exercise Spanish or Norwegian",
      });
    }

    if (
      evaluationCase.category === "prompt-injection" &&
      !["preserve-boundary", "refuse-private"].includes(evaluationCase.expectedBehavior)
    ) {
      context.addIssue({
        code: "custom",
        path: ["expectedBehavior"],
        message: "Prompt-injection cases must preserve the boundary or refuse private data",
      });
    }

    if (evaluationCase.category === "source-conflict") {
      if (evaluationCase.expectedBehavior !== "disclose-conflict") {
        context.addIssue({
          code: "custom",
          path: ["expectedBehavior"],
          message: "Source-conflict cases must disclose the conflict",
        });
      }
      if (!evaluationCase.conflictClaims || evaluationCase.conflictClaims.length < 2) {
        context.addIssue({
          code: "custom",
          path: ["conflictClaims"],
          message: "Source-conflict cases need at least two conflicting claims",
        });
      }
    } else if (evaluationCase.conflictClaims) {
      context.addIssue({
        code: "custom",
        path: ["conflictClaims"],
        message: "Only source-conflict cases may define conflicting claims",
      });
    }
  });

const requiredCcAiEvaluationCategories = [
  "factual",
  "uncertainty",
  "refusal",
  "multilingual",
  "prompt-injection",
  "source-conflict",
] as const;

export const ccAiEvaluationSetSchema = z
  .object({
    version: z.literal(1),
    reviewedOn: partialDateSchema,
    status: z.literal("specified-for-live-run"),
    knowledgeLedgerVersion: z.literal(1),
    knowledgeRecordIds: z.array(idSchema).min(1),
    exactUnknownAnswer: z.literal(
      "I don't know based on the approved public portfolio information.",
    ),
    cases: z.array(ccAiEvaluationCaseSchema).min(18),
    releaseGate: z
      .object({
        liveModelEvaluationRequired: z.literal(true),
        activationAllowed: z.literal(false),
        passCriteria: z.array(z.string().min(12)).min(4),
      })
      .strict(),
  })
  .strict()
  .superRefine((evaluationSet, context) => {
    const ids = new Set<string>();
    evaluationSet.cases.forEach((evaluationCase, index) => {
      if (ids.has(evaluationCase.id)) {
        context.addIssue({
          code: "custom",
          path: ["cases", index, "id"],
          message: `Duplicate evaluation case ID: ${evaluationCase.id}`,
        });
      }
      ids.add(evaluationCase.id);
    });

    requiredCcAiEvaluationCategories.forEach((category) => {
      const count = evaluationSet.cases.filter(
        (evaluationCase) => evaluationCase.category === category,
      ).length;
      if (count < 3) {
        context.addIssue({
          code: "custom",
          path: ["cases"],
          message: `Evaluation category ${category} needs at least three cases`,
        });
      }
    });

    (["en", "es", "no"] as const).forEach((locale) => {
      if (!evaluationSet.cases.some((evaluationCase) => evaluationCase.locale === locale)) {
        context.addIssue({
          code: "custom",
          path: ["cases"],
          message: `Evaluation set does not cover locale ${locale}`,
        });
      }
    });
  });

export const siteContentSchema = z
  .object({
    sources: z.array(sourceReferenceSchema).min(1),
    metadata: siteMetadataSchema,
    navigation: z.array(linkSchema).min(1),
    projects: z.array(projectSchema),
    laboratoryConcepts: z
      .array(laboratoryConceptSchema)
      .length(2)
      .superRefine((concepts, context) => {
        (["electronics-ai", "drone"] as const).forEach((artifactId) => {
          if (concepts.filter((concept) => concept.artifactId === artifactId).length !== 1) {
            context.addIssue({
              code: "custom",
              message: `Laboratory concepts must contain exactly one ${artifactId} record`,
            });
          }
        });
      }),
    mediaWorks: z.array(mediaWorkSchema).default([]),
    experiences: z.array(experienceSchema).default([]),
    education: z.array(educationSchema).default([]),
    trips: z.array(tripSchema).default([]),
    hobbies: z.array(hobbySchema).default([]),
    knowledgeRecords: z.array(ccAiPublicKnowledgeRecordSchema).default([]),
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
    const metadataLinks = [
      content.metadata.primaryAction,
      content.metadata.secondaryAction,
      content.metadata.mediaTeaser.action,
      content.metadata.personalTeaser.action,
      content.metadata.profileTeaser.primaryAction,
      content.metadata.profileTeaser.secondaryAction,
      content.metadata.footer.primaryAction,
      content.metadata.footer.secondaryAction,
    ];
    metadataLinks.forEach((link, index) => {
      checkId(link.id, ["metadata", "links", index, "id"]);
      checkSources(link.sourceIds, ["metadata", "links", index, "sourceIds"]);
    });
    checkSources(content.metadata.profileTeaser.sourceIds, [
      "metadata",
      "profileTeaser",
      "sourceIds",
    ]);
    checkSources(content.metadata.mediaTeaser.sourceIds, ["metadata", "mediaTeaser", "sourceIds"]);
    checkSources(content.metadata.personalTeaser.sourceIds, [
      "metadata",
      "personalTeaser",
      "sourceIds",
    ]);
    checkSources(content.metadata.footer.sourceIds, ["metadata", "footer", "sourceIds"]);
    content.navigation.forEach((link, index) => {
      checkId(link.id, ["navigation", index, "id"]);
      checkSources(link.sourceIds, ["navigation", index, "sourceIds"]);
    });

    const collections = [
      content.projects,
      content.laboratoryConcepts,
      content.mediaWorks,
      content.experiences,
      content.education,
      content.trips,
      content.hobbies,
      content.knowledgeRecords,
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
export type LaboratoryConcept = z.infer<typeof laboratoryConceptSchema>;
export type FlagshipProjectSummary = z.infer<typeof flagshipProjectSummarySchema>;
export type FlagshipProjectSummaryLedger = z.infer<typeof flagshipProjectSummaryLedgerSchema>;
export type AuditedProjectLink = z.infer<typeof auditedProjectLinkSchema>;
export type ProjectLinkRegister = z.infer<typeof projectLinkRegisterSchema>;
export type ProjectMediaCandidate = z.infer<typeof projectMediaCandidateSchema>;
export type ProjectMediaDecision = z.infer<typeof projectMediaDecisionSchema>;
export type DeferredNonProjectAsset = z.infer<typeof deferredNonProjectAssetSchema>;
export type ProjectMediaInventory = z.infer<typeof projectMediaInventorySchema>;
export type VoiceAndCopyContract = z.infer<typeof voiceAndCopyContractSchema>;
export type AssetLicensingEntry = z.infer<typeof assetLicensingEntrySchema>;
export type AssetLicensingRegister = z.infer<typeof assetLicensingRegisterSchema>;
export type LocalMediaClearanceAsset = z.infer<typeof localMediaClearanceAssetSchema>;
export type LocalMediaClearanceRegister = z.infer<typeof localMediaClearanceRegisterSchema>;
export type UnresolvedContentBlocker = z.infer<typeof unresolvedContentBlockerSchema>;
export type UnresolvedContentBlockerLedger = z.infer<typeof unresolvedContentBlockerLedgerSchema>;
export type CcAiPublicKnowledgeRecord = z.infer<typeof ccAiPublicKnowledgeRecordSchema>;
export type CcAiPublicKnowledgeLedger = z.infer<typeof ccAiPublicKnowledgeLedgerSchema>;
export type CcAiEvaluationCase = z.infer<typeof ccAiEvaluationCaseSchema>;
export type CcAiEvaluationSet = z.infer<typeof ccAiEvaluationSetSchema>;
export type MediaWork = z.infer<typeof mediaWorkSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Education = z.infer<typeof educationSchema>;
export type Trip = z.infer<typeof tripSchema>;
export type Hobby = z.infer<typeof hobbySchema>;
export type SiteMetadata = z.infer<typeof siteMetadataSchema>;
export type SiteContent = z.infer<typeof siteContentSchema>;
export type InventoryItem = z.infer<typeof inventoryItemSchema>;
