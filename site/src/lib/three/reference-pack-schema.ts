import { z } from "zod";

import { observatoryAssetIds, observatoryAssetIdSchema } from "./asset-registry-schema";

const idSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const repositoryPathSchema = z.string().regex(/^(?:docs|site)\/[a-zA-Z0-9/_.-]+$/);
const sha256Schema = z.string().regex(/^[A-F0-9]{64}$/);
const scaleSchema = z.tuple([
  z.number().nonnegative(),
  z.number().nonnegative(),
  z.number().nonnegative(),
]);

export const referenceSheetSchema = z
  .object({
    id: idSchema,
    file: repositoryPathSchema.regex(/\.png$/),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    bytes: z.number().int().positive(),
    sha256: sha256Schema,
    panelCount: z.number().int().positive().max(12),
    generationTool: z.string().min(10),
    promptIds: z.array(idSchema).min(1),
    sourceImages: z
      .array(
        z
          .object({
            path: repositoryPathSchema,
            sha256: sha256Schema,
            role: z.string().min(20),
          })
          .strict(),
      )
      .min(1),
    rightsState: z.literal("pending"),
    approvedForPublicRuntime: z.literal(false),
  })
  .strict();

export const referenceAssetBriefSchema = z
  .object({
    id: observatoryAssetIdSchema,
    sheetId: idSchema,
    panels: z.array(z.number().int().positive()).min(1),
    views: z.array(z.string().min(3)).min(1),
    targetScaleMeters: scaleSchema,
    materials: z.array(z.string().min(3)).min(1),
    negativeConstraints: z.array(z.string().min(20)).min(2),
    modelingNotes: z.string().min(40),
  })
  .strict()
  .superRefine((asset, context) => {
    if (asset.panels.length !== asset.views.length) {
      context.addIssue({
        code: "custom",
        path: ["views"],
        message: "Every referenced panel needs one view description",
      });
    }
  });

export const referencePackManifestSchema = z
  .object({
    version: z.literal(1),
    status: z.literal("internal-reference-only"),
    generatedOn: z.iso.date(),
    units: z.literal("meters"),
    coordinateSystem: z.literal("Y-up"),
    providerNeutralRule: z.string().min(60),
    rightsBoundary: z.string().min(60),
    promptDocument: repositoryPathSchema,
    paletteReference: z
      .object({
        path: repositoryPathSchema,
        sha256: sha256Schema,
      })
      .strict(),
    globalNegativeConstraints: z.array(z.string().min(20)).min(3),
    sheets: z.array(referenceSheetSchema).length(4),
    assets: z.array(referenceAssetBriefSchema).length(observatoryAssetIds.length),
  })
  .strict()
  .superRefine((manifest, context) => {
    const sheetIds = new Set<string>();
    manifest.sheets.forEach((sheet, sheetIndex) => {
      if (sheetIds.has(sheet.id)) {
        context.addIssue({
          code: "custom",
          path: ["sheets", sheetIndex, "id"],
          message: `Duplicate reference-sheet ID: ${sheet.id}`,
        });
      }
      sheetIds.add(sheet.id);
    });

    const assetIds = new Set<string>();
    manifest.assets.forEach((asset, assetIndex) => {
      if (assetIds.has(asset.id)) {
        context.addIssue({
          code: "custom",
          path: ["assets", assetIndex, "id"],
          message: `Duplicate reference asset ID: ${asset.id}`,
        });
      }
      assetIds.add(asset.id);

      const sheet = manifest.sheets.find((candidate) => candidate.id === asset.sheetId);
      if (!sheet) {
        context.addIssue({
          code: "custom",
          path: ["assets", assetIndex, "sheetId"],
          message: `Unknown reference-sheet ID: ${asset.sheetId}`,
        });
      } else if (asset.panels.some((panel) => panel > sheet.panelCount)) {
        context.addIssue({
          code: "custom",
          path: ["assets", assetIndex, "panels"],
          message: `Panel exceeds ${sheet.id}'s ${sheet.panelCount}-panel layout`,
        });
      }
    });

    observatoryAssetIds.forEach((assetId) => {
      if (!assetIds.has(assetId)) {
        context.addIssue({
          code: "custom",
          path: ["assets"],
          message: `Missing reference guidance for ${assetId}`,
        });
      }
    });
  });

const provenanceSourceImageSchema = z
  .object({
    path: repositoryPathSchema,
    sha256: sha256Schema,
    rightsState: z.enum(["pending", "approved", "not-applicable", "rejected"]),
    purpose: z.string().min(20),
  })
  .strict();

const provenanceIntermediateSchema = z
  .object({
    sha256: sha256Schema,
    retainedInRepository: z.literal(false),
    reason: z.string().min(20),
  })
  .strict();

export const threeReferenceCandidateProvenanceSchema = z
  .object({
    id: idSchema,
    sheetId: idSchema,
    kind: z.literal("generated-reference-image"),
    file: repositoryPathSchema.regex(/\.png$/),
    sha256: sha256Schema,
    outputDate: z.iso.date(),
    promptIds: z.array(idSchema).min(1),
    sourceImages: z.array(provenanceSourceImageSchema).min(1),
    intermediateSources: z.array(provenanceIntermediateSchema),
    authorship: z
      .object({
        directionOwner: z.string().min(3),
        promptAuthor: z.string().min(3),
        generationService: z.string().min(10),
        generationModel: z.null(),
        modelVersion: z.null(),
        unavailableReason: z.string().min(30),
      })
      .strict(),
    terms: z
      .object({
        governingAgreement: z.literal("unknown-account-type"),
        exactAccountAgreementConfirmed: z.literal(false),
        snapshotIds: z.array(idSchema).min(2),
        reviewPath: repositoryPathSchema,
      })
      .strict(),
    territory: z
      .object({
        requestContext: z.string().min(20),
        processingLocation: z.null(),
        reviewedServiceRestriction: z.string().min(30),
        publicDisplayRights: z.literal("held"),
      })
      .strict(),
    noticeAttribution: z
      .object({
        reviewedTermsRequirement: z.string().min(20),
        repositoryDisclosure: z.string().min(20),
        finalPublicDecision: z.literal("pending"),
      })
      .strict(),
    thirdPartyInfluence: z.array(z.string().min(20)).min(1),
    humanLikenessRisk: z.enum(["none-visible-human", "low-non-human-humanoid"]),
    likenessReview: z.string().min(30),
    engineeringClaimRisk: z.enum(["low", "moderate"]),
    engineeringReview: z.string().min(30),
    permittedReuse: z.array(z.string().min(10)).min(1),
    prohibitedReuse: z.array(z.string().min(10)).min(2),
    rightsState: z.literal("pending"),
    approvedForPublicRuntime: z.literal(false),
  })
  .strict();

export const threeProvenanceRegisterSchema = z
  .object({
    version: z.literal(1),
    reviewedOn: z.iso.date(),
    policy: z.string().min(60),
    termsReviewPath: repositoryPathSchema,
    publicModelCandidateCount: z.literal(0),
    candidates: z.array(threeReferenceCandidateProvenanceSchema).length(4),
  })
  .strict()
  .superRefine((register, context) => {
    const ids = new Set<string>();
    const sheetIds = new Set<string>();
    register.candidates.forEach((candidate, index) => {
      if (ids.has(candidate.id)) {
        context.addIssue({
          code: "custom",
          path: ["candidates", index, "id"],
          message: `Duplicate provenance candidate ID: ${candidate.id}`,
        });
      }
      if (sheetIds.has(candidate.sheetId)) {
        context.addIssue({
          code: "custom",
          path: ["candidates", index, "sheetId"],
          message: `Duplicate provenance sheet coverage: ${candidate.sheetId}`,
        });
      }
      ids.add(candidate.id);
      sheetIds.add(candidate.sheetId);
    });
  });

export type ReferencePackManifest = z.infer<typeof referencePackManifestSchema>;
export type ThreeProvenanceRegister = z.infer<typeof threeProvenanceRegisterSchema>;
