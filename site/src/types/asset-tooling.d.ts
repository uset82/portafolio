declare module "draco3dgltf" {
  type DracoModuleFactory = (options?: Record<string, unknown>) => Promise<unknown>;

  const draco3d: {
    createDecoderModule: DracoModuleFactory;
    createEncoderModule: DracoModuleFactory;
  };

  export default draco3d;
}

declare module "gltf-validator" {
  export type ValidationMessage = {
    code: string;
    message: string;
    pointer?: string;
    severity: 0 | 1 | 2 | 3;
  };

  export type ValidationReport = {
    issues: {
      numErrors: number;
      numWarnings: number;
      numInfos: number;
      numHints: number;
      messages: ValidationMessage[];
      truncated?: boolean;
    };
  };

  export type ValidationOptions = {
    uri?: string;
    format?: "glb" | "gltf";
    writeTimestamp?: boolean;
    maxIssues?: number;
    ignoredIssues?: string[];
    onlyIssues?: string[];
    severityOverrides?: Record<string, 0 | 1 | 2 | 3>;
    externalResourceFunction?: (uri: string) => Promise<Uint8Array>;
  };

  export function validateBytes(
    data: Uint8Array,
    options?: ValidationOptions,
  ): Promise<ValidationReport>;
}
