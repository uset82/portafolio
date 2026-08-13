import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";

const sourceRoot = resolve(process.cwd(), "src");
const runtimeSdkModule = resolve(sourceRoot, "lib/ai/openrouter-client.ts");
const sourceExtensions = new Set([".ts", ".tsx"]);

const collectSourceFiles = (directory: string): string[] =>
  readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory()
      ? collectSourceFiles(path)
      : sourceExtensions.has(extname(path))
        ? [path]
        : [];
  });

const violations: string[] = [];

collectSourceFiles(sourceRoot).forEach((file) => {
  const contents = readFileSync(file, "utf8");
  const projectPath = relative(process.cwd(), file);
  const isClientModule = /^\s*["']use client["'];/m.test(contents);
  const importsOpenRouterRuntime = /import(?!\s+type)[\s\S]*?from\s+["']@openrouter\/sdk["']/.test(
    contents,
  );

  if (
    isClientModule &&
    /@openrouter\/sdk|openrouter-client|openrouter-chat-provider|cc-ai-service|OPENROUTER_API_KEY|CC_AI_ENABLED/.test(
      contents,
    )
  ) {
    violations.push(`${projectPath} exposes an OpenRouter server concern to a client module.`);
  }

  if (
    isClientModule &&
    /@\/ana\/(?:memory|privacy|sandbox|security|discovery|debug)|ana\/(?:memory|privacy|sandbox|security|discovery|debug)/.test(
      contents,
    )
  ) {
    violations.push(`${projectPath} imports ANA private context into a client module.`);
  }

  if (importsOpenRouterRuntime && file !== runtimeSdkModule) {
    violations.push(`${projectPath} imports the OpenRouter runtime outside the server boundary.`);
  }

  if (/sk-or-(?:v1-)?[a-z0-9_-]{12,}/i.test(contents)) {
    violations.push(`${projectPath} appears to contain an OpenRouter credential.`);
  }
});

const runtimeModule = readFileSync(runtimeSdkModule, "utf8");
if (!/^import ["']server-only["'];/m.test(runtimeModule)) {
  violations.push("The OpenRouter runtime module is missing the server-only guard.");
}

if (violations.length > 0) {
  console.error(violations.join("\n"));
  process.exitCode = 1;
} else {
  console.log("Server boundary valid: OpenRouter runtime and credentials remain server-only.");
}
