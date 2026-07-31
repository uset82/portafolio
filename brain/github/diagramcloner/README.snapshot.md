<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/diagramcloner/blob/main/README.md; checkedOn: 2026-07-31; redactions: 0 -->

# Diagram Cloner

A browser-based editor that reconstructs diagrams from images using visual detection, manual annotation, and vector overlay export. It enables pixel-accurate reproduction of technical diagrams and exports them as structured data and code for downstream use.

> Project status: Work-in-progress (WIP). This is a wishlist/experimental project and not yet complete. Some features are scaffolds or prototypes and may be partially implemented or unstable. Community help to fix, complete, and harden the implementation is very welcome.


## 1. Project Overview

Diagram Cloner is a Next.js application for rebuilding existing diagrams from screenshots or scans into precise, editable vectors. It combines:
- Visual detection (auto-detect shapes, connectors, and optionally text via OCR)
- Manual editing with alignment and snapping tools
- Export to reusable formats (JSON, React TSX, SVG, PNG, and n8n workflow JSON)
- A verification layer that compares the original image against the code-generated reconstruction for accuracy

Typical use cases include reverse-engineering technical drawings, flowcharts, automation pipelines, and UI/system schematics into clean, reproducible assets that integrate with developer workflows.


## 2. How It Works

High-level user flow:
1) Upload an image
   - Supported: PNG, JPEG/JPG, SVG
   - The image becomes the locked background for reference
2) Run detection (optional)
   - Auto-detect nodes and connectors from the image
   - Tuning controls let you refine thresholds (e.g., blue channel filters, minimum area, circularity, join distance)
3) Manually edit the diagram
   - Add circles, rounded rectangles, straight lines, polylines, and text
   - Multi-select, snap-to-grid, guides, alignment, z-order controls
   - Smart connectors anchor to node centers when source/target are assigned
4) Verify reconstruction
   - Dual view: “Original” vs. “Reconstructed by AI” (rendered from pasted/uploaded exported code)
   - OCR-based comparison overlays highlight matched/partial/missing text regions
   - Optional auto-correct uses the detection pipeline to suggest adjusted elements
5) Export
   - JSON (project-native structure)
   - React TSX (renders the vector overlay)
   - SVG (vector)
   - PNG (rasterized)
   - n8n workflow JSON (for automation workflows)

Rendering model:
- Background image: locked in place at native pixel resolution
- SVG overlay: all vector elements (rect, circle, polyline/connector, text) are drawn in the same pixel-space coordinates as the image. This ensures pixel-perfect alignment and simplifies export.
- Side-by-side preview: for verification, the app can render the generated vectors into a second panel to compare visually and via OCR.

Verification system (optional but included by default in this repo):
- Dual rendering: left = original uploaded image, right = reconstruction produced from pasted/uploaded JSON
- OCR pass (Tesseract.js) on both sides extracts words and bounding boxes
- CSS overlay draws color-coded boxes:
  - Green = matched
  - Yellow = partial match
  - Red = missing
- Auto-correct prompt can re-run detection and apply refined elements


## 3. Tech Stack / Tools Used

Core
- Frontend: Next.js (App Router), React, TypeScript
- UI/Styling: Tailwind CSS, shadcn/ui, Radix primitives, Geist fonts, lucide-react icons
- Rendering: SVG (vector); PNG export via canvas-based rasterization during export
- OCR: Tesseract.js (client-side)
- State: Local React state with undo/redo stacks persisted to localStorage
- Exporters: JSON, TSX, SVG, PNG, n8n workflow JSON

Verification Layer (this repo)
- OCR comparison: Tesseract.js for text extraction; CSS overlays to visualize diffs
- Reconstruction rendering: JSON → SVG string, then optional rasterization for OCR

Optional/Pluggable (roadmap or integrable by design)
- Image Detection: OpenCV.js (via WebWorker) for robust edge/shape detection
- State Management: Zustand or Redux (current app uses React state; can be swapped)
- Validation/Diff: pixelmatch for image-level diffs; file-saver for download helpers
- AI Agent: Playwright MCP + OCR diff to drive automatic self-correction workflows

Note: The codebase ships with Tesseract.js and a detection entry point; OpenCV.js, pixelmatch, and Zustand/Redux are optional additions depending on your needs.


## 4. Key Features

- Pixel-perfect vector overlay in native image coordinates
- Auto-detection of nodes (circles, rectangles, text) and connectors (lines/polylines) with tunable thresholds
- Multi-selection, marquee selection, snap-to-grid, and alignment tools (left/center/right, top/middle/bottom)
- Smart connectors that follow node centers when anchored
- Z-order controls (bring to front/back, step forward/backward)
- Undo/Redo with local history stacks
- Exports: JSON, React TSX, SVG, PNG, n8n workflow JSON
- Interactive verification view: dual display with OCR-based diff overlays
- Side-by-side reconstruction preview


## 5. Benefits

- Turn screenshots or legacy diagrams into clean, reusable code and data
- Accelerate visual-to-logic transformation for tools like n8n
- Improve accuracy with AI-assisted detection plus a verification loop
- Suitable for technical drawings, flowcharts, network/automation diagrams, and schematics
- Designed for precision (pixel-space alignment) and modular exports to fit into CI/design systems
- Extensible: plug in OpenCV.js for advanced vision, add pixelmatch for image diffs, or integrate MCP-based agents for auto-correction


## Application Details

Folders & important files
- app/
  - page.tsx: Main client-side editor, canvas logic, tools, alignment, exports, and shortcuts
  - layout.tsx: Global styles and fonts
  - globals.css: Tailwind base styles
- components/
  - verification-panel.tsx: Dual rendering, OCR compare overlays, and auto-correct action
  - ui/*: shadcn/ui primitives
- lib/
  - detection: Image analysis entry point used by Auto-detect (implementation can be backed by your preferred vision stack)
  - exporters: JSON/TSX/SVG/PNG/n8n export utilities
  - types: Diagram element types, helpers (bounds, node centers, type guards)
  - id/utils: random ID generation and small utilities
  - verification.ts: OCR helpers, SVG serialization, rasterization, and text comparison

Editor capabilities
- Tools: select, pan, circle, rect, line (2-click polyline), polyline, text
- Keyboard: undo/redo (Ctrl/Cmd+Z / Y), select-all (Ctrl/Cmd+A), arrow keys to nudge (Shift for larger steps), z-order shortcuts, alignment/auto-select shortcuts
- Guides: snap-to-grid, alignment guides to common centers
- Text editing: inline, double-click to edit
- Persistence: autosave to localStorage (diagram-cloner)

Verification flow
1) Paste exported JSON in the Verification Panel (or upload a JSON file)
2) Render Reconstruction to generate the right-side SVG
3) Compare with OCR to visualize text-level matches/mismatches
4) Optionally Auto-correct to re-run detection and apply suggested elements


## Running Locally

Prerequisites
- Node.js 18+
- pnpm (recommended) or npm

Install & run
- pnpm install
- pnpm dev
- Open http://localhost:3000

Build
- pnpm build
- pnpm start


## Export Formats

- JSON
  - Native format: `{ width, height, elements: DiagramElement[] }` or just `DiagramElement[]`
- React TSX
  - Renders the elements in an SVG using native pixel-space coordinates
- SVG
  - Vector export for downstream design tools
- PNG
  - Rasterized rendering; useful for documentation or quick sharing
- n8n workflow JSON
  - Converts the overlay to an n8n-compatible workflow structure


## Extensibility \u0026 Roadmap

- Detection
  - Drop in OpenCV.js (WebWorker) to improve circle/rect/line detection, Hough transforms, contour analysis
- Geometry verification
  - Add polyline/shape IoU or Chamfer distance to complement OCR-based text verification
  - Use pixelmatch to compute image-level diffs and summarize error metrics
- TSX parsing
  - Add a TSX → DiagramElement[] pipeline so the verification panel can validate TSX directly
- State management
  - Abstract current React state to Zustand/Redux for larger-scale features or collaborative editing
- Agentic auto-correction (MCP)
  - Integrate Playwright MCP agents to iteratively adjust nodes/connectors based on diff feedback


## Contributing

Contributions are welcome. If you'd like to help stabilize features, complete missing pieces, or improve detection/verification:
- Open an issue describing the bug/feature and proposed approach
- Submit a PR with focused changes and clear testing steps
- Areas especially helpful: OpenCV.js-based detection, geometry diff/IoU, TSX parsing for verification, pixel-level diff integration, state management refactor (Zustand/Redux), and MCP-driven auto-correction

This codebase is shared in the spirit of "it works on my machine" prototypes—expect rough edges. Your improvements will help make it production-ready.

## Why Diagram Cloner?

Because valuable diagrams often live only as pixels. Diagram Cloner turns them into precise, versionable, and programmable artifacts—ready for reuse across apps, documentation, and automation workflows.
