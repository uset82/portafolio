"use client";

import { useCallback, useState } from "react";
import type { ParsedArtifact } from "./artifact-parser";
import { ArtifactSandbox, buildSandboxHtml, type ViewportMode } from "./artifact-sandbox";

type ArtifactViewProps = {
  artifact: ParsedArtifact;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  className?: string;
};

export function ArtifactView({
  artifact,
  isExpanded = false,
  onToggleExpand,
  className = "",
}: ArtifactViewProps) {
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [viewport, setViewport] = useState<ViewportMode>("desktop");
  const [copied, setCopied] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCopyCode = useCallback(() => {
    navigator.clipboard.writeText(artifact.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [artifact.code]);

  const handleDownload = useCallback(() => {
    const htmlContent = buildSandboxHtml(artifact);
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${artifact.id || "app"}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [artifact]);

  const handleRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  return (
    <div
      className={`artifact-card relative my-4 rounded-xl border border-stone-800 bg-stone-900/90 shadow-2xl backdrop-blur-md overflow-hidden transition-all duration-300 ${
        isExpanded
          ? "fixed inset-4 z-50 flex flex-col my-0 bg-stone-950 border-stone-700"
          : "flex flex-col h-[520px]"
      } ${className}`}
    >
      {/* Top Toolbar */}
      <div className="artifact-toolbar flex items-center justify-between px-3.5 py-2.5 bg-stone-950/80 border-b border-stone-800/80 text-xs text-stone-300 select-none">
        {/* Left: App Title & Badge */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex items-center justify-center w-5 h-5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-semibold">
            ⚡
          </span>
          <span className="font-medium text-stone-200 truncate max-w-[200px] sm:max-w-[280px]">
            {artifact.title}
          </span>
          <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-stone-800/80 text-stone-400 border border-stone-700/50">
            {artifact.type === "application/react" ? "React" : "HTML"}
          </span>
        </div>

        {/* Center: Preview / Code Tabs */}
        <div className="flex items-center bg-stone-900 rounded-lg p-0.5 border border-stone-800/90">
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              activeTab === "preview"
                ? "bg-amber-950/60 text-amber-200 shadow-sm border border-amber-800/50"
                : "text-stone-400 hover:text-stone-200"
            }`}
          >
            Preview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("code")}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              activeTab === "code"
                ? "bg-amber-950/60 text-amber-200 shadow-sm border border-amber-800/50"
                : "text-stone-400 hover:text-stone-200"
            }`}
          >
            Code
          </button>
        </div>

        {/* Right: Actions (Viewport, Copy, Download, Refresh, Expand) */}
        <div className="flex items-center gap-1.5">
          {activeTab === "preview" && (
            <div className="hidden md:flex items-center bg-stone-900 rounded-lg p-0.5 border border-stone-800 mr-1">
              <button
                type="button"
                onClick={() => setViewport("desktop")}
                title="Desktop View"
                className={`p-1 rounded text-xs ${
                  viewport === "desktop"
                    ? "bg-stone-800 text-stone-100"
                    : "text-stone-500 hover:text-stone-300"
                }`}
              >
                🖥️
              </button>
              <button
                type="button"
                onClick={() => setViewport("tablet")}
                title="Tablet View (768px)"
                className={`p-1 rounded text-xs ${
                  viewport === "tablet"
                    ? "bg-stone-800 text-stone-100"
                    : "text-stone-500 hover:text-stone-300"
                }`}
              >
                💻
              </button>
              <button
                type="button"
                onClick={() => setViewport("mobile")}
                title="Mobile View (375px)"
                className={`p-1 rounded text-xs ${
                  viewport === "mobile"
                    ? "bg-stone-800 text-stone-100"
                    : "text-stone-500 hover:text-stone-300"
                }`}
              >
                📱
              </button>
            </div>
          )}

          {activeTab === "preview" && (
            <button
              type="button"
              onClick={handleRefresh}
              title="Refresh Preview"
              className="p-1.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700 transition"
            >
              🔄
            </button>
          )}

          <button
            type="button"
            onClick={handleCopyCode}
            title="Copy Code"
            className="p-1.5 px-2 rounded-lg bg-stone-900 border border-stone-800 text-stone-300 hover:text-stone-100 hover:border-stone-700 transition flex items-center gap-1 text-[11px]"
          >
            <span>{copied ? "✓" : "📋"}</span>
            <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            title="Download Standalone HTML App"
            className="p-1.5 px-2 rounded-lg bg-stone-900 border border-stone-800 text-stone-300 hover:text-stone-100 hover:border-stone-700 transition flex items-center gap-1 text-[11px]"
          >
            <span>⬇️</span>
            <span className="hidden sm:inline">Export</span>
          </button>

          {onToggleExpand && (
            <button
              type="button"
              onClick={onToggleExpand}
              title={isExpanded ? "Collapse" : "Full Screen Canvas"}
              className="p-1.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700 transition ml-1"
            >
              {isExpanded ? "✕" : "⛶"}
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="artifact-body flex-1 relative bg-stone-950 overflow-hidden">
        {activeTab === "preview" ? (
          <ArtifactSandbox
            key={refreshKey}
            artifact={artifact}
            viewport={viewport}
            className="w-full h-full"
          />
        ) : (
          <div className="w-full h-full overflow-auto p-4 bg-stone-950 text-stone-200 font-mono text-xs leading-relaxed selection:bg-amber-900 selection:text-amber-100">
            <pre className="whitespace-pre-wrap">{artifact.code}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
