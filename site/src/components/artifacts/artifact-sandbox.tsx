"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ParsedArtifact } from "./artifact-parser";

export type ViewportMode = "desktop" | "tablet" | "mobile";

type ArtifactSandboxProps = {
  artifact: ParsedArtifact;
  viewport?: ViewportMode;
  className?: string;
  onLoad?: () => void;
};

const SUPPORTED_LUCIDE_ICONS = [
  "Play", "Pause", "RefreshCw", "Copy", "Check", "Sparkles", "ChevronRight", "ChevronLeft",
  "ChevronDown", "ChevronUp", "Settings", "Star", "Heart", "Trash", "Trash2", "Plus", "Minus",
  "Search", "X", "Menu", "Home", "User", "Calendar", "Clock", "Volume2", "VolumeX", "Code",
  "ExternalLink", "Download", "Eye", "Terminal", "Zap", "Flame", "Compass", "Globe", "Sliders",
  "Layers", "Cpu", "Database", "Activity", "Shield", "Lock", "Unlock", "Folder", "File", "Music",
  "Sun", "Moon", "Send", "Share", "Info", "AlertCircle", "AlertTriangle", "Maximize2", "Minimize2"
] as const;

/**
 * Builds a standalone, secure HTML document for the iframe preview
 */
export function buildSandboxHtml(artifact: ParsedArtifact): string {
  if (artifact.type === "text/html") {
    if (artifact.code.includes("<html") || artifact.code.includes("<!DOCTYPE")) {
      return artifact.code;
    }
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    body { margin: 0; padding: 1rem; font-family: system-ui, -apple-system, sans-serif; background: rgb(11 9 7); color: rgb(254 244 234); }
  </style>
</head>
<body>
  ${artifact.code}
  <script>if (window.lucide) lucide.createIcons();</script>
</body>
</html>`;
  }

  // Clean React Code: convert imports to global references
  const rawCode = artifact.code;

  // Remove import lines from code since we provide React & Lucide in global scope
  const sanitizedCode = rawCode
    .replace(/import\s+React(?:\s*,\s*\{[^}]*\})?\s+from\s+['"]react['"];?/g, "")
    .replace(/import\s+\{[^}]*\}\s+from\s+['"]react['"];?/g, "")
    .replace(/import\s+\{[^}]*\}\s+from\s+['"]react-dom(?:\/client)?['"];?/g, "")
    .replace(/import\s+\{[^}]*\}\s+from\s+['"]lucide-react['"];?/g, "")
    .replace(/import\s+.*from\s+['"][^'"]+['"];?/g, "");

  const iconAssignments = SUPPORTED_LUCIDE_ICONS
    .map((name) => `const ${name} = icons['${name}'];`)
    .join("\n    ");

  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(artifact.title)}</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            brand: {
              50: 'rgb(250 246 240)',
              100: 'rgb(243 235 217)',
              500: 'rgb(178 140 88)',
              600: 'rgb(140 107 62)',
              900: 'rgb(38 30 20)',
            }
          }
        }
      }
    }
  </script>
  <!-- React 19 & ReactDOM -->
  <script crossorigin src="https://unpkg.com/react@19/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@19/umd/react-dom.production.min.js"></script>
  <!-- Babel Standalone for live JSX transpilation -->
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <!-- Lucide Icons -->
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      min-height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: rgb(11 9 7);
      color: rgb(254 244 234);
    }
    #root {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .error-card {
      margin: 1.5rem;
      padding: 1.25rem;
      background: rgb(42 29 22);
      border: 1px solid rgb(207 161 138);
      border-radius: 0.75rem;
      color: rgb(254 244 234);
      font-family: monospace;
      font-size: 0.875rem;
      line-height: 1.5;
    }
  </style>
</head>
<body class="bg-stone-950 text-stone-100 antialiased selection:bg-amber-900 selection:text-amber-100">
  <div id="root"></div>

  <script type="text/babel">
    const { useState, useEffect, useMemo, useCallback, useRef, useId, useReducer } = React;

    // Dynamic Lucide React Icon Proxy Component
    const LucideIcon = ({ name, size = 20, className = "", ...props }) => {
      const ref = useRef(null);
      useEffect(() => {
        if (ref.current && window.lucide) {
          ref.current.innerHTML = '';
          const icon = window.lucide.icons[name] || window.lucide.icons[name.toLowerCase()] || window.lucide.icons['sparkles'];
          if (icon) {
            const svg = icon.toSvg({ size, class: className, ...props });
            ref.current.innerHTML = svg;
          }
        }
      }, [name, size, className, props]);

      return <span ref={ref} className={"inline-flex items-center justify-center " + className} />;
    };

    const icons = {};
    ${JSON.stringify(SUPPORTED_LUCIDE_ICONS)}.forEach(name => {
      icons[name] = (props) => <LucideIcon name={name} {...props} />;
    });

    // Make icon components globally available inside Babel scope
    ${iconAssignments}

    // Error Boundary
    class ErrorBoundary extends React.Component {
      constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
      }
      static getDerivedStateFromError(error) {
        return { hasError: true, error };
      }
      render() {
        if (this.state.hasError) {
          return (
            <div className="error-card">
              <div className="font-bold text-amber-300 mb-2 flex items-center gap-2">
                <span>⚠️ Runtime Error in Generated Component</span>
              </div>
              <p className="text-xs text-stone-300 font-mono whitespace-pre-wrap">
                {this.state.error?.message || String(this.state.error)}
              </p>
            </div>
          );
        }
        return this.props.children;
      }
    }

    try {
      ${sanitizedCode}

      // Determine the main component to mount
      let ComponentToMount = null;
      if (typeof App !== 'undefined') {
        ComponentToMount = App;
      } else if (typeof Main !== 'undefined') {
        ComponentToMount = Main;
      } else if (typeof Application !== 'undefined') {
        ComponentToMount = Application;
      } else {
        // Find any function defined that looks like a component
        const globalKeys = Object.keys(window).filter(k => /^[A-Z]/.test(k));
        for (const k of globalKeys) {
          if (typeof window[k] === 'function') {
            ComponentToMount = window[k];
            break;
          }
        }
      }

      if (ComponentToMount) {
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(
          <ErrorBoundary>
            <ComponentToMount />
          </ErrorBoundary>
        );
      } else {
        document.getElementById('root').innerHTML = '<div class="error-card">⚠️ No exported React component found. Ensure the component is named <code>App</code> or <code>export default function App()</code>.</div>';
      }
    } catch (err) {
      document.getElementById('root').innerHTML = '<div class="error-card"><div class="font-bold text-amber-300 mb-2">⚠️ Compilation or Execution Error</div><pre class="text-xs text-stone-300 whitespace-pre-wrap">' + err.message + '</pre></div>';
    }
  </script>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function ArtifactSandbox({
  artifact,
  viewport = "desktop",
  className = "",
  onLoad,
}: ArtifactSandboxProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const titleId = useId();
  const [srcDoc, setSrcDoc] = useState<string>("");

  useEffect(() => {
    const html = buildSandboxHtml(artifact);
    setSrcDoc(html);
  }, [artifact]);

  const viewportStyles: Record<ViewportMode, string> = {
    desktop: "w-full h-full",
    tablet: "w-[768px] max-w-full h-full mx-auto shadow-2xl border-x border-stone-800",
    mobile: "w-[375px] max-w-full h-full mx-auto shadow-2xl border-x border-stone-800 rounded-2xl",
  };

  return (
    <div className={`artifact-sandbox-wrapper relative w-full h-full bg-stone-950 flex items-center justify-center overflow-hidden ${className}`}>
      <iframe
        ref={iframeRef}
        title={`Sandbox Preview: ${artifact.title}`}
        aria-labelledby={titleId}
        srcDoc={srcDoc}
        className={`artifact-sandbox-iframe border-0 transition-all duration-300 ${viewportStyles[viewport]}`}
        sandbox="allow-scripts allow-modals allow-same-origin"
        onLoad={onLoad}
      />
    </div>
  );
}
