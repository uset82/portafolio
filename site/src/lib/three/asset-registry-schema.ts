import { z } from "zod";

export const observatoryAssetIds = [
  "observatory-shell",
  "water-basin",
  "robot-guide",
  "drone",
  "astraea",
  "pinaculo",
  "sound-lab",
  "future-energy",
  "electronics-ai-module",
  "props-and-plants",
  "lighting-environment",
  "camera-rig",
] as const;

export const threeMaterialRoles = [
  "observatoryArchitecture",
  "ceramicRobot",
  "ceramicRobotShadow",
  "waterBasin",
  "waterHighlight",
  "astraea",
  "pinaculo",
  "soundLab",
  "futureEnergy",
  "electronics",
  "warmIndicator",
] as const;

const publicAssetPathSchema = z.string().regex(/^\/[a-z0-9/_-]+\.(?:glb|png|jpg|webp)$/);
const repositoryPathSchema = z.string().regex(/^(?:docs|site)\/[a-zA-Z0-9/_.-]+$/);

export const observatoryAssetIdSchema = z.enum(observatoryAssetIds);
export const threeMaterialRoleSchema = z.enum(threeMaterialRoles);

export const assetLodSchema = z
  .object({
    level: z.number().int().min(0).max(2),
    url: publicAssetPathSchema.nullable(),
    maxTriangles: z.number().int().nonnegative(),
  })
  .strict();

export const assetClipSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    source: z.enum(["authored", "procedural"]),
    required: z.boolean(),
  })
  .strict();

export const assetInteractionSchema = z
  .object({
    targetId: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    accessibleLabel: z.string().min(3),
    action: z.enum(["overview", "focus", "pause-scene"]),
    href: z
      .string()
      .regex(/^(?:\/|#)/)
      .nullable(),
    domEquivalent: z.string().min(8),
  })
  .strict();

export const assetProvenanceSchema = z
  .object({
    owner: z.string().min(2),
    sourceDescription: z.string().min(8),
    manifestPath: repositoryPathSchema,
    author: z.string().min(2).nullable(),
    copyrightOwner: z.string().min(2).nullable(),
    license: z.string().min(2).nullable(),
    termsSnapshot: repositoryPathSchema.nullable(),
    rightsState: z.enum(["pending", "approved", "not-applicable", "rejected"]),
    approvedForPublicRuntime: z.boolean(),
  })
  .strict();

export const assetRegistryEntrySchema = z
  .object({
    id: observatoryAssetIdSchema,
    kind: z.enum(["model", "procedural", "environment", "camera"]),
    status: z.enum([
      "planned",
      "planned-rights-review-required",
      "planned-rights-and-audio-review-required",
      "specified",
      "specified-audio-review-required",
    ]),
    scaleMeters: z.tuple([
      z.number().nonnegative(),
      z.number().nonnegative(),
      z.number().nonnegative(),
    ]),
    nodes: z.array(z.string().regex(/^[A-Z][A-Za-z0-9]+$/)).min(1),
    clips: z.array(assetClipSchema),
    materials: z.array(threeMaterialRoleSchema),
    lods: z.array(assetLodSchema).min(1).max(3),
    fallback: z
      .object({
        mode: z.enum(["full-poster", "poster-region", "dom-only", "omit"]),
        posterUrl: publicAssetPathSchema,
        description: z.string().min(8),
        domHref: z
          .string()
          .regex(/^(?:\/|#)/)
          .nullable(),
      })
      .strict(),
    interaction: assetInteractionSchema.nullable(),
    provenance: assetProvenanceSchema,
    loadingPriority: z.enum(["hero-critical", "deferred", "on-demand"]),
  })
  .strict()
  .superRefine((asset, context) => {
    const lodLevels = asset.lods.map((lod) => lod.level);
    const expectedLevels = asset.lods.map((_, index) => index);

    if (lodLevels.some((level, index) => level !== expectedLevels[index])) {
      context.addIssue({
        code: "custom",
        path: ["lods"],
        message: "LOD levels must be consecutive and ordered from zero",
      });
    }

    if (!asset.provenance.approvedForPublicRuntime && asset.lods.some((lod) => lod.url)) {
      context.addIssue({
        code: "custom",
        path: ["lods"],
        message: "Unapproved assets cannot expose a public runtime URL",
      });
    }

    if (
      asset.provenance.approvedForPublicRuntime &&
      asset.provenance.rightsState !== "approved" &&
      asset.provenance.rightsState !== "not-applicable"
    ) {
      context.addIssue({
        code: "custom",
        path: ["provenance", "rightsState"],
        message: "Public runtime approval requires an approved or not-applicable rights state",
      });
    }

    if (!asset.provenance.approvedForPublicRuntime && asset.provenance.rightsState === "approved") {
      context.addIssue({
        code: "custom",
        path: ["provenance", "approvedForPublicRuntime"],
        message: "Approved rights must be explicitly approved for the public runtime",
      });
    }

    if (
      asset.provenance.approvedForPublicRuntime &&
      asset.provenance.rightsState === "approved" &&
      (!asset.provenance.copyrightOwner || !asset.provenance.license)
    ) {
      context.addIssue({
        code: "custom",
        path: ["provenance"],
        message: "Approved external assets need copyright and license metadata",
      });
    }
  });

export const observatoryAssetRegistrySchema = z
  .object({
    version: z.literal(1),
    units: z.literal("meters"),
    coordinateSystem: z.literal("Y-up"),
    assets: z.array(assetRegistryEntrySchema).length(observatoryAssetIds.length),
  })
  .strict()
  .superRefine((registry, context) => {
    const seen = new Set<string>();

    registry.assets.forEach((asset, index) => {
      if (seen.has(asset.id)) {
        context.addIssue({
          code: "custom",
          path: ["assets", index, "id"],
          message: `Duplicate 3D asset ID: ${asset.id}`,
        });
      }
      seen.add(asset.id);
    });

    observatoryAssetIds.forEach((assetId) => {
      if (!seen.has(assetId)) {
        context.addIssue({
          code: "custom",
          path: ["assets"],
          message: `Missing 3D asset ID: ${assetId}`,
        });
      }
    });
  });

export type ObservatoryAssetId = z.infer<typeof observatoryAssetIdSchema>;
export type ObservatoryAssetRegistry = z.infer<typeof observatoryAssetRegistrySchema>;
export type ObservatoryAsset = z.infer<typeof assetRegistryEntrySchema>;
