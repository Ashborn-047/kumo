# ☁️ Kumo Spatial Assistant Workbench — Design System Specification
**RFC-2025-ARCH: Warm Tactile Spatial Canvas & Component Library**

The official ergonomic and visual foundation powering the Kumo infinite desktop AI copilot workbench. Where boundless spatial creative freedom merges with the razor-sharp precision demanded by power developers, systems automators, and visual researchers.

Live Showcase & Interactive Workbench: [design-system/index.html](file:///g:/My%20Projects/Mochi/design-system/index.html) or [http://localhost:3000/design](http://localhost:3000/design)

---

## 1. Design Philosophy: Warm Tactile Minimalism

Kumo discards cold clinical developer darkness in favor of inviting, organic warmth:
- **Tangible Index Cards**: Surfaces feel like crisp index cards, smooth frosted acrylic rulers, and tailored stationery laid out upon a daylight-lit drafting table.
- **24px Spatial Coordinate Grid**: All canvas cards, terminal daemons, and connection vectors snap fluidly to an underlying 24px coordinate step.
- **Signature Tilted Badges**: Micro-status tags with a playful `-2.5deg` rotation (`transform: rotate(-2.5deg)`) evoking physical adhesive sticky tags with spring hover transitions.
- **4-Tier Elevation Hierarchy**: From infinite matte canvas base to Level 3 floating frosted acrylic glass capsules.

---

## 2. Core Token Spectrum

### 🎨 Brand Core & Neutrals

| Token | Variable | Hex / Value | WCAG Contrast | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Primary Iris** | `--kumo-primary-container` | `#6355d8` | 4.8:1 (AA vs `#fff`) | Primary brand action, focal rings, active state |
| **Primary Deep** | `--kumo-primary` | `#4a3abe` | 6.2:1 (AAA) | High-contrast brand headers and badges |
| **Primary Fixed** | `--kumo-primary-fixed` | `#e4dfff` | - | Active pill background, selected tab surface |
| **Midnight Slate** | `--kumo-midnight-slate` | `#2e3b52` | 8.2:1 (AAA vs `#fff`) | Primary copy, obsidian terminal background, deep anchors |
| **Coral Punch** | `--kumo-coral-punch` | `#ff7e67` | 4.5:1 (AA vs `#2e3b52`)| Alert badges, error states, destructive triggers |
| **Canvas Surface** | `--kumo-canvas-base` | `#fbf8fc` | 9.4:1 (AAA vs `#2e3b52`)| Infinite 24px dot-matrix workbench base surface |
| **Pure Card Surface**| `--kumo-card-surface` | `#ffffff` | 4.8:1 (AA vs `#6355d8`)| Rested tool cards, inspector panels |

---

### 🗂️ The 5 Workbench Pastel Archetypes (48px Header Standards)

Every tool card on the spatial canvas utilizes a designated 48px header archetype:

| Archetype | Background | Border | Ink Text | Semantic Role & Workflow Blocks |
| :--- | :--- | :--- | :--- | :--- |
| **Sky Blue** | `#dcedff` | `#c3dfff` | `#1b5ba5` | **App Launcher & System**: Dock operations, telemetry nodes, system tools |
| **Soft Lilac** | `#eadfff` | `#dac8ff` | `#4a3abe` | **AI Drafting & Co-Pilots**: Copilot reasoning loops, neural drafting, multi-turn streams |
| **Soft Mint** | `#dcf5e7` | `#bbf0cf` | `#166534` | **Terminal & Automation**: PowerShell consoles, CLI jobs, live daemon outputs |
| **Soft Peach** | `#ffe9d6` | `#ffd2af` | `#b84a14` | **Design Studio & Tokens**: Typographic ladders, color inspectors, visual canvas |
| **Warm Butter** | `#fff5c8` | `#ffec99` | `#856404` | **Ideas & Sprint Notes**: Sticky notes, milestones, tactile checklist post-its |

---

## 3. Typographic Architecture

Kumo pairs 3 specialized typefaces:

| Role | Font Family | Weights | Token Class | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Display & Headings** | `Plus Jakarta Sans` | 600, 700 | `font-headline-xl`, `font-headline-lg` | Spatial workbench headers, tool cards, modal hero copy |
| **Body & UI Interface** | `Inter` | 400, 500 | `font-body-lg`, `font-body-md`, `font-body-sm` | Primary operational card copy, parameter labels, prompts |
| **Terminal & Telemetry**| `JetBrains Mono` | 500, 600 | `font-label-lg`, `font-label-md`, `font-label-sm` | Syntax highlighting, tilted badges, latency counters, coordinate snaps |

---

## 4. 4-Tier Spatial Depth & Elevation

| Tier | Name | Visual Treatment | Box Shadow & Backdrop |
| :--- | :--- | :--- | :--- |
| **Level 0** | Base Surface | `#fbf8fc` infinite plane | 24px dot-matrix coordinate grid (`radial-gradient`) |
| **Level 1** | Resting Tool Card | `#ffffff`, 18px corners | `0 1px 2px rgba(46,59,82,0.04), 0 8px 24px -4px rgba(46,59,82,0.06)` |
| **Level 2** | Active / Focused Node | 18px corners, Iris ring | `0 0 0 1px rgba(99,85,216,0.15), 0 12px 32px -6px rgba(99,85,216,0.12)`, `-translate-y-1` |
| **Level 3** | Floating Glass Dock | `rgba(255,255,255,0.75)`, 22px / pill | `backdrop-filter: blur(16px) saturate(180%)`, `0 16px 36px -8px rgba(46,59,82,0.12)` |

---

## 5. Modular File Structure

The design system is partitioned into clean HTML, CSS, JavaScript, and React/TypeScript modules:

```text
design-system/
├── index.html                   # Official interactive showcase page
├── tokens.css                   # Core CSS custom properties (:root variables)
├── kumo.css                     # Component utilities (.bg-dot-matrix, .tilted-tag, .kumo-card, .kumo-dock)
├── showcase.js                  # Micro-interactions, toast feedback, Cmd+K palette listener
├── tailwind-preset.js           # Tailwind v3 preset configuration
└── components/                  # Reusable React / TypeScript (TSX) components
    ├── types.ts                 # Archetypes, elevation, and component interfaces
    ├── TiltedBadge.tsx          # Micro-badge with -2.5deg tilt and spring hover
    ├── WorkbenchCard.tsx        # 48px functional pastel header tool card (18px radii)
    ├── TopNavBar.tsx            # Floating Level 3 navigation bar with search & shortcuts
    ├── TerminalWell.tsx         # Dark obsidian PowerShell/CLI execution pane
    ├── StickyNote.tsx           # Warm butter sprint checklist note
    ├── CompanionDock.tsx        # Floating Level 3 bottom dock with zoom & pan controls
    ├── InteractiveControls.tsx  # Pill buttons, coordinate snap toggle, blur slider
    ├── ColorSwatch.tsx          # Token color swatch with WCAG contrast ratios
    └── index.ts                 # Central barrel export
```

---

## 6. React / TSX Usage Example

```tsx
import React from 'react';
import { 
  WorkbenchCard, 
  TiltedBadge, 
  TerminalWell, 
  StickyNote, 
  TopNavBar, 
  CompanionDock 
} from './design-system/components';

export function CanvasView() {
  return (
    <div className="bg-dot-matrix min-h-screen text-on-surface">
      <TopNavBar brandTitle="Kumo" version="v2.4 Spec" />

      <main className="max-w-7xl mx-auto pt-28 px-6 grid grid-cols-12 gap-6">
        {/* Tool Node with Lilac AI Archetype */}
        <div className="col-span-7">
          <WorkbenchCard
            archetype="lilac"
            title="Neural Co-Pilot Reasoning"
            badgeLabel="GPT-4O ACTIVE"
            nodeId="node_9921_ai"
          >
            <textarea className="w-full rounded-xl border border-outline-variant/40 p-3" rows={2} />
            <button className="px-4 py-2 bg-primary text-white rounded-lg font-mono">
              Execute Stream
            </button>
          </WorkbenchCard>
        </div>

        {/* Script Terminal Well with Mint Runner Archetype */}
        <div className="col-span-5">
          <TerminalWell title="powershell.exe — kumo-daemon" />
        </div>
      </main>

      <CompanionDock zoomLevel="100%" />
    </div>
  );
}
```
