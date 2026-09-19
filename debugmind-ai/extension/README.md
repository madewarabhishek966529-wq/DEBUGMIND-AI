# DebugMind AI — VS Code Extension

### Tagline
**Detect. Explain. Fix. Verify.**

DebugMind AI is an AI-powered developer assistant that runs directly inside Visual Studio Code. It analyzes code, detects potential bugs, explains problems, suggests fixes with native side-by-side diff previews, generates unit tests, analyzes compiler/runtime errors, and verifies fixes using deterministic tests.

---

## Features

- 🧠 **Smart Code Analysis**: Detects null references, injection vulnerabilities, resource leaks, logic errors, and performance bottlenecks using local static analysis combined with Google Gemini AI.
- 💬 **Explain Issue**: Deep 5-stage technical breakdown: *What is wrong?*, *Why does it happen?*, *Where does it happen?*, *What is the impact?*, and *How to fix it*.
- ⚡ **AI Fix Generation & Diff Preview**: Review proposed code patches in VS Code's native diff interface before accepting.
- 🧪 **Deterministic Fix Verification**: Verifies accepted fixes against real compilation and unit test executions. Never claims "Verified" unless tests pass!
- 🔍 **Error & Stack Trace Analyzer**: Pinpoints offending files and lines directly from exceptions or terminal outputs.
- 📊 **Code Health Dashboard**: Real-time explainable code quality and risk score (0–100).
- 🔒 **Privacy First**: Explicit user consent before transmitting any code snippets to the AI backend.

---

## Extension Commands

| Command | Identifier | Description |
|---|---|---|
| **DebugMind: Analyze Selected Code** | `debugmind.analyzeSelection` | Analyzes highlighted code snippet |
| **DebugMind: Analyze Current File** | `debugmind.analyzeCurrentFile` | Analyzes the active editor document |
| **DebugMind: Analyze Workspace** | `debugmind.analyzeWorkspace` | Scans project structure and key entry points |
| **DebugMind: Explain Issue** | `debugmind.explainIssue` | Explains root cause and technical impact |
| **DebugMind: Fix Issue** | `debugmind.fixIssue` | Generates patch and opens diff preview |
| **DebugMind: Generate Tests** | `debugmind.generateTests` | Generates comprehensive test suite |
| **DebugMind: Analyze Error** | `debugmind.analyzeError` | Analyzes compiler/runtime errors |
| **DebugMind: Run Verification** | `debugmind.runVerification` | Executes tests to verify fixes |
| **DebugMind: Open Dashboard** | `debugmind.openDashboard` | Opens Code Health & History dashboard |
| **DebugMind: Clear Diagnostics** | `debugmind.clearDiagnostics` | Clears all DebugMind markers |

---

## Extension Settings

- `debugmind.backendUrl`: Base URL of the DebugMind backend (default: `http://localhost:8080`).
- `debugmind.aiProvider`: AI provider (default: `gemini`).
- `debugmind.geminiModel`: Configurable Gemini model (default: `gemini-1.5-flash`).
- `debugmind.askBeforeSending`: Prompt before sending source code (default: `true`).
- `debugmind.sendSourceCode`: Permission to send code to AI service (default: `true`).
- `debugmind.autoAnalyze`: Automatically analyze files on save (default: `false`).
- `debugmind.enableWorkspaceAnalysis`: Enable workspace-level scanning (default: `false`).

---

## License
MIT
