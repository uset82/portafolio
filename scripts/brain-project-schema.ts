import { z } from "../site/node_modules/zod/index.js";
import {
  publicationStateSchema,
  rightsStateSchema,
  sourceReferenceSchema,
  verificationStateSchema,
} from "../site/src/content/schemas";

const sourceIdSchema = sourceReferenceSchema.shape.id;
const checkedOnSchema = sourceReferenceSchema.shape.checkedOn;

const projectTypeSchema = z.enum([
  "software",
  "hardware",
  "media",
  "research",
  "game",
  "tool",
]);

const projectStatusSchema = z.enum([
  "concept",
  "prototype",
  "active",
  "shipped",
  "archived",
]);

const githubProjectSchema = z
  .object({
    repo: z
      .string()
      .regex(
        /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/,
        "Use a GitHub owner/repository name",
      ),
    public: z.boolean(),
    checkedOn: checkedOnSchema,
  })
  .strict();

const playableProjectSchema = z
  .object({
    tier: z.enum(["A", "B", "C"]),
    buildSizeMb: z.number().nonnegative(),
    engine: z.string().trim().min(1),
    input: z.string().trim().min(1),
    mobile: z.enum(["supported", "degraded", "desktop-only"]),
  })
  .strict();

export const brainProjectSchema = z
  .object({
    slug: sourceIdSchema,
    title: z.string().trim().min(1),
    type: projectTypeSchema,
    status: projectStatusSchema,
    public: z.boolean(),
    publication: publicationStateSchema,
    verification: verificationStateSchema,
    rights: rightsStateSchema,
    summary: z.string().trim().min(1),
    github: githubProjectSchema.optional(),
    playable: playableProjectSchema.optional(),
    sourceIds: z.array(sourceIdSchema),
    siteRoute: z
      .string()
      .regex(/^\/work\/[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use /work/<slug>"),
    tags: z.array(sourceIdSchema),
  })
  .strict()
  .superRefine((project, context) => {
    if (project.siteRoute !== `/work/${project.slug}`) {
      context.addIssue({
        code: "custom",
        path: ["siteRoute"],
        message: `Expected /work/${project.slug}`,
      });
    }

    if (project.slug === "pinaculo" && project.status !== "concept") {
      context.addIssue({
        code: "custom",
        path: ["status"],
        message: "pinaculo is a concept and its status may not be raised",
      });
    }
  });

const privatePathSchema = z
  .string()
  .trim()
  .min(1)
  .refine(
    (value) => !/[\r\n]/.test(value),
    "Private source paths must be one line",
  )
  .refine(
    (value) => /(?:^|[\\/])brain-private(?:[\\/]|$)/i.test(value),
    "Use a path inside the sibling brain-private repository",
  );

const pageReferenceSchema = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(
    /^[\p{L}\p{N} .,:;()/_-]+$/u,
    "Page references may contain locators, not quoted text",
  );

export const brainPrivateSourcesSchema = z
  .object({
    version: z.literal(1),
    sources: z.array(
      z
        .object({
          id: sourceIdSchema,
          path: privatePathSchema,
          pageRefs: z.array(pageReferenceSchema).optional(),
        })
        .strict(),
    ),
  })
  .strict();

export type BrainProject = z.infer<typeof brainProjectSchema>;
export type BrainPrivateSources = z.infer<typeof brainPrivateSourcesSchema>;
