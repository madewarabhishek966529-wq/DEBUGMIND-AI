# Visual Design & UI Specifications - DebugMind AI

## 1. Design Principles & Engineering Tone

DebugMind AI adheres to three core design principles:
1. **VS Code Native Harmony**: The UI feels like an organic subsystem of Visual Studio Code. Rather than inventing external UI metaphors, it uses VS Code's standard CSS variables, native diff views, notifications, and progress widgets.
2. **High-Signal, Low-Noise Typography**: Information hierarchy is strictly ordered by severity and actionability. Critical errors demand visual attention via saturated left-border accents, while secondary information remains muted.
3. **Deterministic Clarity**: UI never displays ambiguous "Working..." states without explicit progress indicators, nor does it present speculative suggestions as confirmed facts.

---

## 2. Color Palette & Token System

All visual tokens are declared in [`media/style.css`](file:///c:/Git%20Project/VS%20Extensiton%20project/DEBUGMIND%20AI/debugmind-ai/extension/media/style.css) and map directly to VS Code theme properties with robust fallbacks:

### 2.1 Theme Tokens

| Token Name | VS Code Theme Mapping | Default Hex (Dark Mode) | Purpose |
|---|---|---|---|
| `--dm-font` | `--vscode-font-family` | System sans-serif | Primary interface typography |
| `--dm-bg` | `--vscode-sideBar-background` | `#1e1e1e` | Sidebar container background |
| `--dm-fg` | `--vscode-sideBar-foreground` | `#cccccc` | Standard body text |
| `--dm-border` | `--vscode-sideBar-border` | `#333333` | Dividing lines and container borders |
| `--dm-card-bg` | `--vscode-editor-background` | `#252526` | Card and issue item backgrounds |
| `--dm-hover` | `--vscode-list-hoverBackground` | `#2a2d2e` | Interactive item hover state |
| `--dm-btn-bg` | `--vscode-button-background` | `#0e639c` | Primary action button fill |
| `--dm-btn-fg` | `--vscode-button-foreground` | `#ffffff` | Primary button text |
| `--dm-btn-hover` | `--vscode-button-hoverBackground`| `#1177bb` | Primary button hover fill |
| `--dm-btn-sec-bg` | `--vscode-button-secondaryBackground`| `#3a3d41` | Secondary action button fill |
| `--dm-btn-sec-fg` | `--vscode-button-secondaryForeground`| `#ffffff` | Secondary button text |

### 2.2 Diagnostic Severity Colors

| Severity Level | Hex Code | Visual Sample | Usage |
|---|---|---|---|
| **Critical** | `#f87171` | Crimson Red | Security flaws, command injection, build-breaking errors |
| **High** | `#fb923c` | Amber Orange | SQL injection, hardcoded secrets, NPE vulnerabilities |
| **Medium** | `#facc15` | Yellow | Empty catch blocks, resource leaks, potential logic errors |
| **Low** | `#60a5fa` | Sky Blue | Minor code quality warnings, suboptimal patterns |
| **Info** | `#a78bfa` | Lavender Purple | Style hints, documentation suggestions |
| **Success** | `#4ade80` | Emerald Green | High Code Health score (>=80), Fix Verified status |

---

## 3. Typography & Spacing Scale

### 3.1 Typography
- **Code Health Score**: `28px`, `700` weight, font family `var(--vscode-editor-font-family, monospace)`.
- **Brand Title**: `14px`, `600` weight, uppercase, letter-spacing `0.5px`.
- **Section Headers**: `11px`, `600` weight, uppercase, letter-spacing `0.5px`, color `var(--vscode-descriptionForeground)`.
- **Issue Item Titles**: `12px`, `600` weight, text-overflow ellipsis.
- **Code Locations & Badges**: `11px`, `400` weight, font family `monospace`.
- **Body & Explanations**: `12px`–`13px`, `1.4` line-height.

### 3.2 Spacing & Border Radius
- **Container Padding**: `12px` outer body padding.
- **Card Padding**: `12px` on health card, `10px` on issue details.
- **Element Gaps**: `8px` vertical gap in action bars; `6px` vertical gap in issue lists.
- **Border Radii**:
  - Buttons: `3px`
  - Issue Items: `3px` (with `border-left: 4px solid <severity>`)
  - Health & Detail Cards: `4px`
  - Dashboard Panels: `6px`
  - Badges / Pills: `10px`

---

## 4. Reusable UI Components

### 4.1 Primary & Secondary Buttons
```html
<button class="primary-btn" id="btn-analyze-file">
  <span>📄</span> Analyze Current File
</button>
<button class="secondary-btn" id="btn-explain-issue">Explain More</button>
```
- **Primary**: Full width, accent background, bold text, used for top-level workflows.
- **Secondary**: Compact inline-flex button, subtle background, used for contextual item actions ("Generate Fix", "Ignore", "Explain More").

### 4.2 Health Score Card
Renders real-time score with dynamic class binding:
- `score >= 80`: `.score-high` (`#4ade80`)
- `50 <= score < 80`: `.score-med` (`#facc15`)
- `score < 50`: `.score-low` (`#f87171`)
Includes summary counters: `🔴 X Errors`, `🟠 Y Warnings`, `🔵 Z Suggestions`.

### 4.3 Diagnostic Issue Item
Interactive list item with saturated 4px left border matching severity:
```html
<div class="issue-item sev-high selected">
  <div class="issue-header">
    <span class="issue-title">🟠 Possible NullPointerException</span>
  </div>
  <div class="issue-location">UserService.java:42</div>
</div>
```

---

## 5. Screen & View Specifications

### 5.1 Sidebar Webview (`debugmind.sidebarView`)
- **Location**: VS Code Activity Bar (custom Brain + Code Brackets icon: [`media/icon.svg`](file:///c:/Git%20Project/VS%20Extensiton%20project/DEBUGMIND%20AI/debugmind-ai/extension/media/icon.svg)).
- **Layout**:
  1. Top Brand Header ("🧠 DEBUGMIND AI")
  2. Quick Actions Bar ("Analyze Current File", "Analyze Workspace")
  3. Health Card with 0–100 score and badge breakdown
  4. Issues Section Header & dynamic `.issue-list`
  5. Contextual `.issue-details` pane with Why, Severity, Confidence, and Action buttons ("Explain More", "Generate Fix", "Ignore").

### 5.2 Native Diff Editor (`vscode.diff`)
- **Scheme**: `debugmind-fix://<fixKey>`
- **Behavior**: Opens the active disk file on the left and the virtual patched file on the right.
- **Interaction**: Displays an explicit notification prompt:
  ```text
  DebugMind AI proposed fix for DM-001: "Added defensive null check". Review diff in editor.
  [Accept Fix]  [Reject Fix]
  ```
- Upon accepting, applies a `vscode.WorkspaceEdit` to disk and prompts:
  ```text
  Would you like DebugMind to run tests and verify this fix?
  [Run Verification]  [Later]
  ```

### 5.3 Dashboard Panel (`dashboardPanel.js`)
- **Location**: Full editor tab (WebviewPanel in column 1).
- **Contents**:
  - Full markdown explanation view for an issue or error trace.
  - Recent Analysis History table showing file, health score, issue count, and timestamp.
  - Backend configuration summary (URL, active model, sandbox runner status).

### 5.4 In-Editor Diagnostics & Lightbulb QuickFix
- **Squiggles**: Red (Error), Orange (Warning), Blue (Info), and Gray (Hint) squiggles placed directly over problematic tokens.
- **Code Actions**: Clicking the QuickFix lightbulb provides:
  - `🧠 DebugMind: Explain <IssueId>`
  - `⚡ DebugMind: Fix <IssueId>` (Marked as preferred QuickFix)
  - `🚫 DebugMind: Ignore <IssueId>`

---

## 6. Loading, Empty, and Error State Patterns

- **Empty State**:
  Renders centered `.empty-state` container:
  `Open a file and click "Analyze Current File" to detect issues.`
  When an analysis yields 0 findings: `No issues detected! 🎉`.
- **Loading State**:
  Uses `vscode.window.withProgress` with spinning notification and descriptive status messages:
  `DebugMind: Analyzing UserService.java...`
  `DebugMind: Generating AI fix for DM-001...`
  `DebugMind: Verifying fixes and running tests for UserService.java...`
- **Error State**:
  Actionable `vscode.window.showErrorMessage` with guidance:
  `DebugMind backend is unavailable. Please make sure the backend is running at: http://localhost:8080`.

---

## 7. UI Inconsistencies & Gaps Found

1. **Dashboard Panel CSS Scoping**:
   - `dashboardPanel.js` uses an inline `<style>` tag rather than linking the centralized `media/style.css`, causing slight differences in card border colors between sidebar and dashboard.
2. **Scroll Retention on Re-analysis**:
   - Re-running analysis re-renders the issue list DOM from scratch, resetting any scroll position the developer had in the sidebar.
3. **Hardcoded Fallbacks in CSS**:
   - Fallback colors in `style.css` (e.g. `--dm-bg: var(--vscode-sideBar-background, #1e1e1e)`) assume a dark theme if VS Code variables fail to resolve, which could produce low contrast in a pure Light theme under edge cases.
