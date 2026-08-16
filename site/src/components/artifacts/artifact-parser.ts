export type ArtifactType = "application/react" | "text/html" | "text/markdown" | "code";

export type ParsedArtifact = {
  id: string;
  type: ArtifactType;
  title: string;
  code: string;
  language: string;
  raw: string;
};

export type MessageSegment =
  | { type: "text"; content: string }
  | { type: "artifact"; artifact: ParsedArtifact };

/**
 * Extracts artifact blocks (<artifact ...>...</artifact>) or standalone React/HTML code blocks
 * from an assistant message.
 */
export function parseArtifactsFromMessage(content: string): {
  segments: MessageSegment[];
  artifacts: ParsedArtifact[];
} {
  if (!content) {
    return { segments: [], artifacts: [] };
  }

  const artifacts: ParsedArtifact[] = [];
  const segments: MessageSegment[] = [];

  // Match <artifact identifier="..." type="..." title="...">...</artifact>
  const artifactRegex = /<artifact(?:\s+identifier="([^"]*)")?(?:\s+type="([^"]*)")?(?:\s+title="([^"]*)")?[^>]*>([\s\S]*?)<\/artifact>/gi;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = artifactRegex.exec(content)) !== null) {
    const textBefore = content.slice(lastIndex, match.index);
    if (textBefore) {
      segments.push({ type: "text", content: textBefore });
    }

    const id = match[1] || `artifact-${artifacts.length + 1}`;
    const typeStr = (match[2] || "application/react").toLowerCase();
    const type: ArtifactType =
      typeStr.includes("html") ? "text/html" : "application/react";
    const title = match[3] || "Interactive App";
    const innerContent = match[4] || "";

    // Extract code from inside markdown code fences if present
    const fenceMatch = /```(?:tsx|jsx|javascript|typescript|html|react)?\s*([\s\S]*?)```/i.exec(innerContent);
    const code = (fenceMatch && fenceMatch[1] ? fenceMatch[1] : innerContent).trim();

    const parsed: ParsedArtifact = {
      id,
      type,
      title,
      code,
      language: type === "text/html" ? "html" : "tsx",
      raw: match[0],
    };

    artifacts.push(parsed);
    segments.push({ type: "artifact", artifact: parsed });
    lastIndex = artifactRegex.lastIndex;
  }

  // If no explicit <artifact> tags were found, check for substantial standalone code blocks (```tsx or ```jsx with export default)
  if (artifacts.length === 0) {
    const standaloneCodeBlockRegex = /```(tsx|jsx|html|javascript|typescript)\s*([\s\S]*?)```/gi;
    let codeMatch: RegExpExecArray | null;
    let codeLastIndex = 0;

    while ((codeMatch = standaloneCodeBlockRegex.exec(content)) !== null) {
      const codeLang = (codeMatch[1] ?? "tsx").toLowerCase();
      const codeBody = (codeMatch[2] ?? "").trim();

      // Only treat as artifact if it contains React component structure or HTML document
      const isReactApp =
        (codeLang === "tsx" || codeLang === "jsx" || codeLang === "typescript" || codeLang === "javascript") &&
        /(export\s+default\s+function|function\s+\w+\s*\([^)]*\)\s*\{[\s\S]*return\s*\(|<[A-Z]\w+)/.test(codeBody);
      const isHtmlDoc = codeLang === "html" && /(<!DOCTYPE|<html|<div|<main)/i.test(codeBody);

      if (isReactApp || isHtmlDoc) {
        const textBefore = content.slice(codeLastIndex, codeMatch.index);
        if (textBefore) {
          segments.push({ type: "text", content: textBefore });
        }

        const type: ArtifactType = isHtmlDoc ? "text/html" : "application/react";
        const title = isReactApp ? "React Application" : "Web Page";
        const parsed: ParsedArtifact = {
          id: `code-artifact-${artifacts.length + 1}`,
          type,
          title,
          code: codeBody,
          language: codeLang,
          raw: codeMatch[0],
        };

        artifacts.push(parsed);
        segments.push({ type: "artifact", artifact: parsed });
        codeLastIndex = standaloneCodeBlockRegex.lastIndex;
      }
    }

    if (codeLastIndex < content.length && artifacts.length > 0) {
      const remaining = content.slice(codeLastIndex);
      if (remaining) {
        segments.push({ type: "text", content: remaining });
      }
    }
  } else if (lastIndex < content.length) {
    const textAfter = content.slice(lastIndex);
    if (textAfter) {
      segments.push({ type: "text", content: textAfter });
    }
  }

  if (segments.length === 0) {
    segments.push({ type: "text", content });
  }

  return { segments, artifacts };
}
