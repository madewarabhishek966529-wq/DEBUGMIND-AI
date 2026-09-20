<!-- Read this file first every session; update it at the end. -->

# Project Memory & Session State - DebugMind AI

## 1. Project Summary
DebugMind AI is an AI-powered developer assistant operating directly inside Visual Studio Code backed by a lightweight Java 21 / Spring Boot 3 REST service. It bridges deterministic static analysis (ESLint, language diagnostics, AST regex patterns) with Google Gemini AI to detect potential bugs, explain engineering root causes, generate surgical line-based patches, and produce comprehensive unit tests. Patches are previewed side-by-side in VS Code's native diff editor and deterministically verified in a sanitized process execution sandbox before claiming resolution.

---

## 2. Current Status & System Health

- **Current Phase**: Phase 1 (MVP Complete & Local Hardening)
- **Client Tier**: Fully functional vanilla JavaScript VS Code extension. Packaged as `debugmind-ai-0.0.1.vsix` and installed into the local VS Code instance. All 6 unit tests passing.
- **Backend Tier**: Spring Boot 3.3.4 (Java 21) running cleanly on port 8080. All 13 unit/integration tests passing.
- **API Status**: All 8 REST endpoints verified and responding with HTTP 200 OK (`/health`, `/analyze`, `/issues/explain`, `/issues/fix`, `/tests/generate`, `/errors/analyze`, `/fixes/verify`, `/analyses`).
- **Build & Launch Infrastructure**: Maven Wrapper (`mvnw`/`mvnw.cmd`) configured; bundled Maven linked to User `PATH`; automated port-clearing scripts (`run-backend.bat`/`run-backend.ps1`) in place; `.vscode/launch.json` ready for instant <kbd>F5</kbd> debugging.

---

## 3. Decisions Log

| Date | Decision | Rationale |
|---|---|---|
| **2026-09-20** | Added Maven Wrapper (`mvnw`, `mvnw.cmd`, `.mvn`) | Standalone Windows developer machines may not have `mvn` installed globally. Maven Wrapper provides a self-contained, reproducible build. |
| **2026-09-20** | Linked bundled Maven (`tools/apache-maven-3.9.6/bin`) to User `PATH` | Enables standard command line execution (`mvn clean spring-boot:run`) in any terminal session. |
| **2026-09-20** | Added auto-free port 8080 logic to `run-backend.bat` & `run-backend.ps1` | Prevents `Web server failed to start. Port 8080 was already in use` when relaunching the backend service. |
| **2026-09-20** | Created root and extension-level `.vscode/launch.json` and `tasks.json` | VS Code requires an explicit `extensionHost` configuration for <kbd>F5</kbd> Extension Development Host debugging. |
| **2026-09-20** | Excluded `DataSourceAutoConfiguration` in `DebugMindApplication.java` | Allows instant out-of-the-box local developer startup using in-memory history without mandating a live PostgreSQL service. |
| **2026-09-20** | Implemented deterministic offline mock generator in `GeminiProvider` | Ensures all unit tests, sandbox workflows, and demo evaluations run 100% reliably without requiring an internet connection or paid API quota. |
| **2026-09-20** | Chose pure JavaScript (ES6+ CommonJS) for the VS Code extension | Eliminates compile/transpile latency, reduces extension bundle footprint, and provides instant activation on startup. |

---

## 4. Known Issues & Edge Cases

1. **Port 8080 Collision on Duplicate Launch**:
   - *Issue*: Starting a second instance while the backend is already running causes a port collision.
   - *Status*: Resolved in `run-backend.bat` and `run-backend.ps1` via automatic process termination prior to boot.
2. **Host-Missing Test Toolchains**:
   - *Issue*: If the host OS lacks `pytest` or `gcc`, `ProcessSandboxService` reports verification failure for those specific languages.
   - *Status*: Compile check handles missing compilers cleanly; unit test execution requires host installation.
3. **In-Memory Analysis History Reset**:
   - *Issue*: History is kept in-memory (`CopyOnWriteArrayList`), resetting upon backend shutdown.
   - *Status*: Flyway migration `V1__initial_schema.sql` is prepared for PostgreSQL activation.

---

## 5. Gotchas & Key Learnings

- **PowerShell Session Environment Variables**: Updating the registry User `PATH` does not propagate to active PowerShell sub-shells unless explicitly refreshed via `$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")`.
- **Coordinate Indexing Discrepancy**: VS Code API coordinates (`Range`, `Selection`) are **0-indexed**, while backend DTOs, compiler errors, and stack traces are **1-indexed**. Always clamp conversions with `Math.max(0, line - 1)`.
- **JSON Markdown Stripping**: LLMs frequently wrap JSON responses in markdown code blocks (` ```json ... ``` `). `JsonResponseValidator.extractAndCleanJson()` is essential to prevent Jackson parsing failures.
- **Sanitized ProcessBuilder Environment**: Child processes inherit parent environment variables by default. To prevent accidental leakage of secrets to test scripts, `ProcessSandboxService` scrubs all environment variables matching `KEY`, `SECRET`, `TOKEN`, or `PASSWORD`.

---

## 6. Next Steps

1. **Test Suite Persistence**: Implement a "Save Test to Workspace" command in `testService.js` allowing one-click export of generated unit tests to disk (Task `T-032`).
2. **Graceful Sandbox Fallbacks**: Add fallback to syntax-only validation in `ProcessSandboxService` when a language test runner (like `pytest`) is absent from the host `PATH` (Task `T-030`).
3. **Persistent Storage Activation**: Enable an optional Spring profile for H2 embedded database storage to preserve analysis history across restarts (Task `T-034`).

---

## 7. Assumptions Made During Analysis

- **Assumption 1 (AI Mode)**: When `GEMINI_API_KEY` is not present in `.env` or system environment, the system is designed to seamlessly operate in deterministic heuristic offline mode without throwing runtime errors.
- **Assumption 2 (Port Default)**: Port 8080 is the intended standard local endpoint for the Spring Boot backend, configurable via `SERVER_PORT` or the VS Code setting `debugmind.backendUrl`.
- **Assumption 3 (Persistence Model)**: The PostgreSQL schema (`V1__initial_schema.sql`) represents the planned production/multi-user target architecture, while the current active in-memory implementation serves local single-developer workflows.
