# Product Requirements Document (PRD) - DebugMind AI

## 1. Project Overview & Problem Statement

### 1.1 Project Name
**DebugMind AI**  
**Tagline:** *Detect. Explain. Fix. Verify.*

### 1.2 Problem Statement
Modern software developers experience cognitive overload when investigating complex bugs, triaging linter warnings, debugging stack traces, and fixing security vulnerabilities. Existing AI code generation tools frequently suffer from four critical deficiencies:
1. **Hallucinated Verification**: Tools claim a patch is "verified" purely because an LLM predicted it, without executing code against actual compilers or test suites.
2. **Destructive or Over-Scoped Fixes**: AI assistants rewrite hundreds of lines or change system architectures when a two-line defensive guard was needed.
3. **Opaque Recommendations**: Explanations lack structured engineering rationale (root cause, failure mechanism, runtime impact).
4. **Privacy Ambiguity**: Codebases are transmitted to third-party endpoints without granular user consent or local environment sanitization.

### 1.3 Solution
DebugMind AI is a hybrid developer assistant running natively inside Visual Studio Code backed by a lightweight Java 21 / Spring Boot 3 REST service. It pairs deterministic static analysis (ESLint, language diagnostics, AST regex patterns) with Google Gemini AI. Every fix is delivered as a surgical, line-targeted patch previewed inside VS Code's native diff viewer, and verified using an isolated local process execution sandbox before claiming resolution.

---

## 2. Goals & Non-Goals

### 2.1 Goals
- **Deterministic-First Analysis**: Always give precedence to confirmed compiler/linter diagnostics and high-confidence static patterns over uncorroborated LLM suggestions.
- **Explainable Code Health**: Compute a 0–100 Code Health Score with transparent, weighted deductions based on verified issue severities.
- **Structured 5-Part Explanations**: Detail *What is wrong*, *Why it happens*, *Where it happens*, *What the impact is*, and *How to fix it*.
- **Surgical Diff Previews**: Render line-targeted edits side-by-side using VS Code's native diff editor with explicit Accept/Reject actions.
- **Deterministic Sandbox Verification**: Run syntax checks (`javac`, `node --check`, `py_compile`, `gcc -fsyntax-only`) and unit tests in an isolated sandbox with sanitized environment variables and execution timeouts.
- **Privacy Controls**: Require explicit user opt-in before sending any code snippet; never permanently persist raw user code in remote cloud storage.
- **Offline Resilience**: Automatically fall back to deterministic heuristic static analysis and structured mocks if no Gemini API key is configured.

### 2.2 Non-Goals
- **Autonomous Unsupervised Patching**: The tool will never commit, push, or apply changes to disk without explicit developer inspection and approval.
- **Full IDE Replacement**: DebugMind AI does not replace language servers (LSP) or full test runners; it orchestrates and supplements them.
- **Cloud-Hosted Multi-Tenant Code Repository**: User code is analyzed statelessly in-flight; persistence is restricted to local metadata and analysis history.

---

## 3. Target Users & User Stories

### 3.1 Target Users
- **Polyglot Software Engineers**: Developers working across Java, JavaScript, TypeScript, Python, C/C++, Dart/Flutter, and PHP.
- **Security-Minded Developers**: Engineers requiring immediate detection of SQL injection, command execution, and hardcoded credentials.
- **Code Reviewers & Maintainers**: Developers needing rapid impact assessment and test suite generation for legacy code.

### 3.2 User Stories

| ID | As a... | I want to... | So that... | Cross-Reference |
|---|---|---|---|---|
| **US-1** | Developer | Highlight code and run "Analyze Selected Code" | I can spot vulnerabilities and bugs in isolated snippets without analyzing whole projects. | [architecture.md#41-analysis-pipeline](file:///c:/Git%20Project/VS%20Extensiton%20project/DEBUGMIND%20AI/project-docs/architecture.md) |
| **US-2** | Developer | Click an issue in the sidebar and view "Explain Issue" | I understand the exact failure mechanism, reproduction conditions, and runtime consequence. | [design.md#53-dashboard-panel](file:///c:/Git%20Project/VS%20Extensiton%20project/DEBUGMIND%20AI/project-docs/design.md) |
| **US-3** | Developer | Click "Generate Fix" for a detected issue | I can inspect a side-by-side native diff and accept/reject minimal surgical changes. | [rules.md#2-architecture--layer-rules](file:///c:/Git%20Project/VS%20Extensiton%20project/DEBUGMIND%20AI/project-docs/rules.md) |
| **US-4** | Developer | Paste a compiler error or terminal stack trace | DebugMind parses the offending file and line, reveals the code in editor, and explains root cause. | [architecture.md#5-api-specification](file:///c:/Git%20Project/VS%20Extensiton%20project/DEBUGMIND%20AI/project-docs/architecture.md) |
| **US-5** | QA / Developer | Run "Generate Tests" on an active file | I receive complete unit test suites matching my project framework (JUnit, Jest, PyTest, etc.). | [task.md#phase-2-missing-features--enhancements](file:///c:/Git%20Project/VS%20Extensiton%20project/DEBUGMIND%20AI/project-docs/task.md) |
| **US-6** | Developer | Click "Run Verification" after applying a fix | I know with 100% certainty whether the fix passes compiler and test checks in an isolated sandbox. | [architecture.md#7-verification-sandbox-architecture](file:///c:/Git%20Project/VS%20Extensiton%20project/DEBUGMIND%20AI/project-docs/architecture.md) |
| **US-7** | Developer | Open the Activity Bar Sidebar | I see my real-time Code Health Score, error/warning badges, and active issue hierarchy. | [design.md#51-sidebar-webview](file:///c:/Git%20Project/VS%20Extensiton%20project/DEBUGMIND%20AI/project-docs/design.md) |

---

## 4. Feature List & Status

| Feature ID | Feature Name | Description | Status | Priority | Acceptance Criteria |
|---|---|---|---|---|---|
| **FEAT-01** | Static Heuristic Analysis | Detects SQL injection, hardcoded secrets, empty catches, command injection. | **Done** | High | Matches regex heuristics, flags lines with 1.0 confidence, populates squiggles. |
| **FEAT-02** | Gemini AI Analysis | Deep contextual inspection of source code via Gemini 1.5 Flash. | **Done** | High | Valid JSON parsed into `AnalyzeResponse`, merges with static findings. |
| **FEAT-03** | Finding Normalization & Deduplication | Merges static findings and AI issues, prioritizing static diagnostics. | **Done** | High | Prevents duplicate issues on same line and category; assigns stable IDs (`STA-xxx`, `DM-xxx`). |
| **FEAT-04** | Code Health Calculator | Explainable 0-100 health score calculation. | **Done** | High | Starts at 100; deducts 25 (Critical), 15 (High), 8 (Med), 3 (Low), 1 (Info). Bounds 0–100. |
| **FEAT-05** | Structured Issue Explanations | 5-part engineering explanation (What, Why, Where, Impact, HowToFix). | **Done** | High | Renders in Webview Dashboard with markdown formatting and location metadata. |
| **FEAT-06** | Surgical Fix Generation | Generates replacement line edits mapped to 1-indexed source lines. | **Done** | High | Backend outputs valid `CodeEditDto` array; validates start/end lines within file bounds. |
| **FEAT-07** | VS Code Native Diff Preview | Opens virtual `debugmind-fix` URI against disk file for side-by-side diffing. | **Done** | High | Prompts user with "Accept Fix" / "Reject Fix"; applies `WorkspaceEdit` on accept. |
| **FEAT-08** | Automated Unit Test Generation | Generates framework-specific test suites based on detected project file type. | **Done** | Medium | Correctly identifies JUnit, Jest, PyTest, Flutter Test, PHPUnit; outputs executable test code. |
| **FEAT-09** | Error Trace & Stack Trace Analyzer | Parses stack traces from clipboard/selection/input, opens file at line. | **Done** | High | Regex parsers for Java, JS/TS, Python, C/C++, PHP, Dart; opens editor and reveals line. |
| **FEAT-10** | Deterministic Process Sandbox | Executes compile checks and test suites in isolated temp folders. | **Done** | High | Enforces timeout (15s), sanitizes environment variables (removes keys/tokens), returns structured result. |
| **FEAT-11** | Privacy Opt-in Gate | Prompts user before transmitting source code snippets. | **Done** | High | Supports "Allow Once", "Allow for Session", "Always Allow", and cancellation. |
| **FEAT-12** | Database Persistence (PostgreSQL) | Flyway migration schema defined (`V1__initial_schema.sql`). | **Partial** | Low | SQL migration file exists; Spring Boot app currently excludes `DataSourceAutoConfiguration` (uses in-memory history). |
| **FEAT-13** | Multi-file Workspace Analysis | Scans workspace manifests and detects architecture and primary entry points. | **Partial** | Medium | Scans manifests up to 50 files; currently auto-analyzes only the first entry point. |
| **FEAT-14** | Automated Test Generation to Disk | One-click saving of generated unit test code into project test directories. | **Missing** | Medium | Generates code string and suggested path, but user currently manually copies code. |
| **FEAT-15** | Configurable Custom Rules Engine | User-defined custom linting patterns and static rules in `.debugmindrc.json`. | **Missing** | Low | Currently patterns are hardcoded in `staticAnalyzer.js`. |

---

## 5. Out-of-Scope Items & Open Questions

### 5.1 Out-of-Scope
- **Cloud-hosted Team Dashboard**: Real-time team-wide telemetry or remote code indexing.
- **Automated Git Commits**: Automatically creating git commits or opening GitHub PRs without developer review.
- **Dockerized Remote Sandbox Execution**: The sandbox executes processes locally on the developer machine using available host compilers rather than remote microVMs or Docker daemons.

### 5.2 Open Questions
1. *Assumption on PostgreSQL activation*: Should the backend continue defaulting to In-Memory MVP mode for lightweight single-developer usage, or should an auto-detecting H2/PostgreSQL profile be activated for persistent team history?
2. *Language runtime dependencies*: If a developer verifies a Python file on a machine without `pytest` installed, the sandbox reports execution failure. Should the sandbox fallback to pure syntax validation when test runners are absent from the host `PATH`?
