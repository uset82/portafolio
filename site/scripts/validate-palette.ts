import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, resolve } from "node:path";

import { naturalPalette, threeMaterialPalette } from "../src/styles/palette";

const normalize = (value: string) => value.toLowerCase();
const approvedColors = new Set(Object.values(naturalPalette).map(normalize));
const hexPattern = /#[0-9a-f]{6}\b/gi;
const sourceRoot = resolve(process.cwd(), "src");
const extensions = new Set([".css", ".ts", ".tsx"]);

const collectFiles = (directory: string): string[] =>
  readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory()
      ? collectFiles(path)
      : extensions.has(extname(path))
        ? [path]
        : [];
  });

const violations: string[] = [];

collectFiles(sourceRoot).forEach((file) => {
  const contents = readFileSync(file, "utf8");
  for (const match of contents.matchAll(hexPattern)) {
    const color = normalize(match[0]);
    if (!approvedColors.has(color)) {
      const line = contents.slice(0, match.index).split("\n").length;
      violations.push(`${file}:${line} uses unapproved color ${match[0]}`);
    }
  }
});

const materialViolations = Object.entries(threeMaterialPalette).filter(
  ([, color]) => !approvedColors.has(normalize(color)),
);
materialViolations.forEach(([name, color]) =>
  violations.push(`Three.js material ${name} uses unapproved color ${color}`),
);

const forbiddenSentinels = ["#00ffff", "#7f00ff", "#050505"];
if (forbiddenSentinels.some((color) => approvedColors.has(color))) {
  violations.push(
    "The palette contract admits a forbidden cyan, violet, neon, or near-black sentinel.",
  );
}

if (violations.length > 0) {
  console.error(violations.join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    `Palette valid: ${approvedColors.size} approved colors and ${Object.keys(threeMaterialPalette).length} Three.js material roles.`,
  );
  console.log(`Forbidden-color sentinel checks passed: ${forbiddenSentinels.length}.`);
}
