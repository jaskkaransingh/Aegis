# AEGIS Master Design System Specification
## Autonomous Evidence-Grounded Investigation System
### Version: 1.0.0 | Status: Active Foundation

---

## 1. Visual Identity & Creative Philosophy

AEGIS (**Autonomous Evidence-Grounded Investigation System**) is a forensic incident intelligence platform engineered for investigating complex infrastructure outages, cascading distributed failures, and telemetry anomalies.

Unlike consumer AI chatbots or generic enterprise dashboards, AEGIS operates under the rigorous demands of **forensic investigation**. The user interface serves as a high-precision workstation where investigators demand absolute clarity, verifiable provenance, and zero ambiguity.

### Core Product Tenets

1. **Investigative Intelligence Over Decorative Noise**  
   Every visual mark—border hairline, status beacon, badge tint, or typographic treatment—communicates meaning. Unmotivated gradients, glowing particle effects, and gratuitous animations are prohibited.

2. **The Signature Physical Metaphor: The Investigation Cupboard**  
   AEGIS anchors its mental model in a physical artifact: **The Archival Investigation Cupboard**. In high-stakes forensic environments, evidence is classified into modular, labeled drawers, sliding inspection trays, and sealed compartments. This tactile, mechanical aesthetic grounds the abstract cloud infrastructure into something structured, durable, and orderly.

3. **Strict Epistemic Separation (Fact vs. Conjecture)**  
   The interface strictly segregates **observed facts** (immutable telemetry logs, timestamped traces, metric alerts) from **inferred conjectures** (agent hypotheses, counterfactual projections, preliminary explanations).

---

## 2. Color System & Obsidian Palette

The AEGIS color architecture employs deep obsidian tones with precise hairline borders and restrained functional accents. It achieves high contrast (WCAG 2.1 AA/AAA) while minimizing eye fatigue during critical midnight incidents.

### 2.1 Base Canvas & Surface Depths

| Token Name | Hex Code | Purpose & Application |
|---|---|---|
| `--aegis-bg` | `#07090F` | True obsidian root viewport; void depth behind all panels |
| `--aegis-bg-elevated` | `#0B0E17` | Secondary workstation backplanes, navigation shell, sidebars |
| `--aegis-surface` | `#101522` | Primary container panels, table viewports, canvas backdrops |
| `--aegis-surface-raised` | `#151B2A` | Elevated cards, inspectable drawer trays, active modals |
| `--aegis-surface-hover` | `#1A2233` | Interactive hover highlight state for clickable surfaces |
| `--aegis-surface-glass` | `rgba(16, 21, 34, 0.82)` | Semi-translucent HUD overlays, floating toolbars, backdrop blur |

### 2.2 Hairline Borders & Structural Grids

| Token Name | Hex Code | Purpose & Application |
|---|---|---|
| `--aegis-border-subtle` | `#1B2232` | Nested subsection dividers, table row lines, inactive tabs |
| `--aegis-border` | `#252D40` | Standard card boundaries, pane separators, input outlines |
| `--aegis-border-strong` | `#36415B` | Active panel frames, focused cards, elevated borders |
| `--aegis-border-focus` | `#9875FF` | Keyboard focus ring (`2px solid`, `2px offset`) |

### 2.3 Typography & Contrast Hierarchy

| Token Name | Hex Code | Purpose & Application | Contrast on `#07090F` |
|---|---|---|---|
| `--aegis-text-primary` | `#F1F4FB` | Primary headings, active metrics, critical identifiers | 16.2:1 (AAA) |
| `--aegis-text-secondary` | `#A3ADC2` | Body copy, section descriptions, secondary metadata | 8.8:1 (AAA) |
| `--aegis-text-muted` | `#727F98` | Labels, timestamps, hash fingerprints, inactive captions | 5.2:1 (AA) |
| `--aegis-text-inverse` | `#07090F` | High-contrast text on bright accent buttons | 16.2:1 (AAA) |

### 2.4 Functional Semantic Accents

Accents are strictly functional. Each color denotes a specific investigation domain:

```
+--------------------------------------------------------------------------------+
| ACCENT COLOR       | TOKEN             | INVESTIGATION ROLE                    |
+--------------------------------------------------------------------------------+
| Tactile Violet     | #9875FF / #B29AFF | Agentic AI reasoning & deep inference |
| Ice Cyan           | #7ADCF5           | Verified evidence, telemetry & traces |
| Amber Alert        | #F2C66D           | Clock skew, latency & anomalies       |
| Critical Rose      | #F27886           | Outages, breaches & circuit trips     |
| Resilient Emerald  | #76D6A4           | Nominal health, baseline & verified   |
| Structural Slate   | #8D9AB1           | Dormant structural wireframes         |
+--------------------------------------------------------------------------------+
```

---

## 3. Typography & Information Architecture

### 3.1 Typeface Families

1. **Interface Display & Body Stack (Sans-Serif):**  
   `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`  
   - Used for primary navigation, headings, report prose, and control labels.
   - Engineered for clarity, neutral tone, and immediate readability across screen densities.

2. **Forensic Telemetry Stack (Monospace):**  
   `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`  
   - Used for all timestamps, ISO dates, latency measurements (`ms`, `s`), evidence IDs (`EV-1049`), service names, JSON payloads, and SHA-256 hashes.
   - Tabular numerals ensure clean column alignment in dense investigation feeds.

### 3.2 Typographic Scale

| Class | Size / Line Height | Tracking | Usage |
|---|---|---|---|
| `text-[10px]` | 10px / 14px | `tracking-widest uppercase` | Eyebrow badges, drawer numbers, index tags |
| `text-xs` | 12px / 16px | `tracking-tight` | Dense data tables, metadata, telemetry properties |
| `text-sm` | 14px / 20px | `tracking-normal` | Primary body, card titles, control buttons |
| `text-base` | 16px / 24px | `tracking-tight` | Section headings, modal titles |
| `text-lg` | 18px / 28px | `tracking-tight` | Major view titles, summary highlights |
| `text-2xl` | 24px / 32px | `tracking-tight font-semibold`| Investigation header, critical KPI values |

---

## 4. Spatial Architecture & Layout Grid

AEGIS utilizes a dual-density layout system:

1. **Tactical Dense Grid (4px / 8px Increments):**  
   - Used in Evidence Explorer, Timeline Explorer, and Topology Canvas.  
   - Maximizes data density without clutter, allowing investigators to observe multiple correlated anomalies side-by-side.

2. **Analytical Reading Flow (16px / 24px Increments):**  
   - Used in Hypothesis Arena, Counterfactual Lab, and Investigation Reports.  
   - Provides generous breathing room, structured columns, and prominent evidence link cards.

### Layering & Depth Architecture

```
[Level 4: Modals & Drawers]   -->  #151B2A (Raised) + 0 8px 32px Shadow + #36415B Border
[Level 3: Inspectable Cards]  -->  #101522 (Surface) + 0 4px 20px Shadow + #252D40 Border
[Level 2: Workstation Panes]  -->  #0B0E17 (Elevated Backplane) + #1B2232 Hairline
[Level 1: System Foundation]  -->  #07090F (Obsidian Canvas)
```

---

## 5. The Signature Cupboard Concept

The **Investigation Cupboard** is the central design metaphor of AEGIS:

```
+--------------------------------------------------------------------------+
|                       AEGIS ARCHIVAL WORKSTATION                         |
+--------------------------------------------------------------------------+
| [ DRAWER 01: RAW INGEST & CHRONO LOGS               | CAPACITY: 1,420 ]  |
|   ├── Timestamped raw logs, HTTP spans, DNS latency logs                 |
+--------------------------------------------------------------------------+
| [ DRAWER 02: TOPOLOGY INTERCONNECTS                 | NODES: 8 / DEPS: 12]
|   ├── Dynamic dependency graph, failure cascading propagation paths      |
+--------------------------------------------------------------------------+
| [ DRAWER 03: FORENSIC EVIDENCE VAULT                | 14 CORRELATED      ]
|   ├── Clock-skew-corrected events, causal relationships, confirmed facts |
+--------------------------------------------------------------------------+
| [ DRAWER 04: HYPOTHESIS ARENA COMPARTMENTS          | 3 COMPETING        ]
|   ├── Sliding comparison trays, confidence scoring, falsification tests  |
+--------------------------------------------------------------------------+
| [ DRAWER 05: COUNTERFACTUAL LAB SIMULATION CELL     | ACTIVE FORK        ]
|   ├── What-if perturbation sliders, projected delta impact               |
+--------------------------------------------------------------------------+
| [ DRAWER 06: SEALED INVESTIGATION REPORT BRIEFING    | READY TO EXPORT    ]
|   ├── Executive synthesis, timeline reconstruction, recommended fixes    |
+--------------------------------------------------------------------------+
```

### Materiality & Tactile Mechanics
- **Physical Construction:** Dark anodized matte titanium chassis with brushed aluminum drawer pulls and laser-etched index labels.
- **Drawer Slide Physics:** Smooth mechanical deceleration (`cubic-bezier(0.16, 1.0, 0.3, 1.0)`) emulating heavy ball-bearing slides.
- **Observation Windows:** Inspectable glass viewports (`rgba(16, 21, 34, 0.82)` with `backdrop-filter: blur(12px)`) revealing the internal telemetry structure before full drawer extraction.

---

## 6. Motion System & Physics

All motion in AEGIS must feel deliberate, mechanical, and tactile. Floaty or springy consumer animations are strictly avoided.

### Timing Tokens & Standard Easing

| Motion Token | Duration | Cubic Bezier Curve | Usage |
|---|---|---|---|
| `DURATION_MICRO` | 150ms | `cubic-bezier(0.2, 0.0, 0.0, 1.0)` | Button active states, icon rotations, badge pills |
| `DURATION_HOVER` | 200ms | `cubic-bezier(0.0, 0.0, 0.2, 1.0)` | Surface elevation lifts, border highlights |
| `DURATION_PANEL` | 300ms | `cubic-bezier(0.2, 0.0, 0.0, 1.0)` | Accordion expand/collapse, tab transitions |
| `DURATION_DRAWER`| 450ms | `cubic-bezier(0.16, 1.0, 0.3, 1.0)`| Cupboard drawer sliding, modal envelope entrance |

### Accessibility & Reduced Motion
- When `prefers-reduced-motion: reduce` is enabled, all CSS transitions and animations collapse to `0.01ms`.
- State transitions remain functional via instant cuts.

---

## 7. 3D Art Direction & Future WebGL Architecture

For future 3D canvas integration (e.g. Three.js / WebGL Cupboard representation):

1. **Lighting Model:**  
   - Minimal ambient light (`#07090F`, intensity 0.2).  
   - Key light: Focused cool white studio spot (angle 45°, penumbra 0.4).  
   - Rim lights: Dual directional grazing lights in restrained violet (`#9875FF`, intensity 0.8) and ice cyan (`#7ADCF5`, intensity 0.6) catching the metallic beveled edges.

2. **Materials:**  
   - `MeshStandardMaterial` with `roughness: 0.65`, `metalness: 0.85` for the dark titanium chassis.  
   - `MeshPhysicalMaterial` with `transmission: 0.7`, `roughness: 0.2` for inspection glass viewports.

3. **Performance Budget:**  
   - Max 60 draw calls.  
   - Target 60 FPS on integrated GPUs.  
   - Graceful CSS fallback for machines lacking WebGL2 hardware acceleration.

---

## 8. Forensic Integrity & Anti-Hallucination Guidelines

1. **Evidence Grounding Requirement:**  
   Every inference presented by an agent must provide a direct, inspectable hyperlink to an evidence token (e.g., `EV-1042`).
2. **Confidence Calibration:**  
   Hypothesis probabilities are explicitly labeled with their empirical uncertainty band.
3. **No Synthetic Metrics in Operational Views:**  
   Live telemetry displays only genuine backend responses or explicitly identified offline mock data with visible status badges (`DEMO MODE`).

---

## 9. Next Implementation Roadmap

- **Phase 1 (Complete):** Design tokens, CSS variables, Tailwind configuration, component primitives (`AegisButton`, `AegisBadge`, `AegisSurface`, `AegisSectionHeading`, `AegisStatusIndicator`), motion tokens, specification document, and `/design-system` preview page.
- **Phase 2 (Subsequent):** Cupboard 3D / WebGL exploration and scroll-narrative landing page.
- **Phase 3 (Subsequent):** Progressive integration of Phase 1 primitives across core operational views (`/investigations`, `/timeline`, `/topology`, `/evidence`, `/hypotheses`, `/counterfactual`, `/reports`).

