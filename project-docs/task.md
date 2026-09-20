# Project Task List & Execution Roadmap - DebugMind AI

All tasks follow the format: `- [ ] T-XXX | description | depends on | est. time`.  
Completed tasks are marked `- [x]` based on verifiable code implementations. Cross-references point to [prd.md](file:///c:/Git%20Project/VS%20Extensiton%20project/DEBUGMIND%20AI/project-docs/prd.md) and [architecture.md](file:///c:/Git%20Project/VS%20Extensiton%20project/DEBUGMIND%20AI/project-docs/architecture.md).

---

## 1. Completed Tasks (Verified in Codebase)

### 1.1 Client Tier (VS Code Extension)
- [x] **T-001** | Create extension manifest `package.json` with commands, menus, and configuration properties | None | 2h | [prd.md#4-feature-list--status](file:///c:/Git%20Project/VS%20Extensiton%20project/DEBUGMIND%20AI/project-docs/prd.md)
- [x] **T-002** | Implement `LanguageDetector` and `DEFAULT_FRAMEWORKS` mapping in `languageDetector.js` | None | 1h | [architecture.md#2-repository-structure--layer-responsibilities](file:///c:/Git%20Project/VS%20Extensiton%20project/DEBUGMIND%20AI/project-docs/architecture.md)
- [x] **T-003** | Implement regex heuristic static analyzer in `staticAnalyzer.js` for SQL injection, secrets, empty catches | T-002 | 2h | [prd.md#4-feature-list--status](file:///c:/Git%20Project/VS%20Extensiton%20project/DEBUGMIND%20AI/project-docs/prd.md)
- [x] **T-004** | Implement `DiagnosticManager` to translate backend issues into VS Code squiggles | T-001 | 2h | [architecture.md#31-vs-code-extension-client](file:///c:/Git%20Project/VS%20Extensiton%20project/DEBUGMIND%20AI/project-docs/architecture.md)
- [x] **T-005** | Implement `DebugMindCodeActionProvider` for QuickFix lightbulb actions (Explain, Fix, Ignore) | T-004 | 2h | [rules.md#11-javascript--vs-code-extension](file:///c:/Git%20Project/VS%20Extensiton%20project/DEBUGMIND%20AI/project-docs/rules.md)
- [x] **T-006** | Implement `DiffService` with `debugmind-fix:` scheme provider and line replacement algorithm | T-001 | 3h | [prd.md#4-feature-list--status](file:///c:/Git%20Project/VS%20Extensiton%20project/DEBUGMIND%20AI/project-docs/prd.md)
- [x] **T-007** | Implement `PrivacyService` consent gate with session & persistent opt-in | T-001 | 1h | [architecture.md#71-privacy-architecture](file:///c:/Git%20Project/VS%20Extensiton%20project/DEBUGMIND%20AI/project-docs/architecture.md)
- [x] **T-008** | Implement `BackendClient` HTTP service with JSON parsing and connection refusal handlers | T-001 | 2h | [architecture.md#5-api-specification](file:///c:/Git%20Project/VS%20Extensiton%20project/DEBUGMIND%20AI/project-docs/architecture.md)
- [x] **T-009** | Build reactive Sidebar Webview with Health Score, severity badges, and issue action buttons | T-008 | 4h | [design.md#51-sidebar-webview](file:///c:/Git%20Project/VS%20Extensiton%20project/DEBUGMIND%20AI/project-docs/design.md)
- [x] **T-010** | Implement `DashboardPanel` Webview for rich markdown explanations and analysis history | T-008 | 3h | [design.md#53-dashboard-panel](file:///c:/Git%20Project/VS%20Extensiton%20project/DEBUGMIND%20AI/project-docs/design.md)
- [x] **T-011** | Implement `TerminalProvider` to capture clipboard and active terminal error text | T-001 | 1h | [prd.md#32-user-stories](file:///c:/Git%20Project/VS%20Extensiton%20project/DEBUGMIND%20AI/project-docs/prd.md)
- [x] **T-012** | Implement `WorkspaceScanner` detecting project types, manifests, and primary entry points | T-002 | 2h | [architecture.md#2-repository-structure--layer-responsibilities](file:///c:/Git%20Project/VS%20Extensiton%20project/DEBUGMIND%20AI/project-docs/architecture.md)
- [x] **T-013** | Implement sanitized logging channel `Logger` redacting API keys and passwords | T-001 | 1h | [rules.md#6-hard-never-do-list-for-ai-agents](file:///c:/Git%20Project/VS%20Extensiton%20project/DEBUGMIND%20AI/project-docs/rules.md)

### 1.2 Backend Tier (Spring Boot 3 + Java 21)
- [x] **T-014** | Configure Maven `pom.xml` with Spring Boot 3.3.4, Validation, Actuator, Jackson, and Test starters | None | 2h | [architecture.md#2-repository-structure--layer-responsibilities](file:///c:/Git%20Project/VS%20Extensiton%20project/DEBUGMIND%20AI/project-docs/architecture.md)
- [x] **T-015** | Implement `AIProvider` interface and `GeminiProvider` with live REST call & offline mock fallback | T-014 | 3h | [architecture.md#6-third-party-services--ai-integration-flow](file:///c:/Git%20Project/VS%20Extensiton%20project/DEBUGMIND%20AI/project-docs/architecture.md)
- [x] **T-016** | Create `PromptTemplates` with strict system rules (no hallucinated verification, minimal patches) | T-015 | 2h | [rules.md#6-hard-never-do-list-for-ai-agents](file:///c:/Git%20Project/VS%20Extensiton%20project/DEBUGMIND%20AI/project-docs/rules.md)
- [x] **T-017** | Implement `JsonResponseValidator` stripping markdown code fences and extracting raw JSON | T-014 | 2h | [architecture.md#61-google-gemini-ai-integration](file:///c:/Git%20Project/VS%20Extensiton%20project/DEBUGMIND%20AI/project-docs/architecture.md)
- [x] **T-018** | Implement `FindingNormalizer` converting client static findings into normalized `IssueDto` objects | T-014 | 2h | [architecture.md#41-in-memory--dto-object-model](file:///c:/Git%20Project/VS%20Extensiton%20project/DEBUGMIND%20AI/project-docs/architecture.md)
- [x] **T-019** | Implement `Deduplicator` giving absolute precedence to deterministic static findings | T-018 | 2h | [rules.md#2-architecture--layer-boundary-rules](file:///c:/Git%20Project/VS%20Extensiton%20project/DEBUGMIND%20AI/project-docs/rules.md)
- [x] **T-020** | Implement `CodeHealthCalculator` with weighted deductions (Critical -25, High -15, etc.) | T-014 | 1h | [prd.md#4-feature-list--status](file:///c:/Git%20Project/VS%20Extensiton%20project/DEBUGMIND%20AI/project-docs/prd.md)
- [x] **T-021** | Implement `ProcessSandboxService` with env sanitization, timeout enforcement, and temp folders | T-014 | 4h | [architecture.md#72-sandbox-security](file:///c:/Git%20Project/VS%20Extensiton%20project/DEBUGMIND%20AI/project-docs/architecture.md)
- [x] **T-022** | Implement REST Controllers: Health, Analysis, Issue, Test, Error, and FixVerification | T-015..T-021 | 4h | [architecture.md#5-api-specification](file:///c:/Git%20Project/VS%20Extensiton%20project/DEBUGMIND%20AI/project-docs/architecture.md)
- [x] **T-023** | Implement `GlobalExceptionHandler` mapping validation, AI, and generic runtime exceptions | T-022 | 2h | [architecture.md#73-error-handling](file:///c:/Git%20Project/VS%20Extensiton%20project/DEBUGMIND%20AI/project-docs/architecture.md)
- [x] **T-024** | Define Flyway database migration schema `V1__initial_schema.sql` for PostgreSQL | None | 2h | [architecture.md#42-relational-database-schema-v1__initial_schemasql](file:///c:/Git%20Project/VS%20Extensiton%20project/DEBUGMIND%20AI/project-docs/architecture.md)

### 1.3 Tooling, Automation & Verification
- [x] **T-025** | Configure official Maven Wrapper (`mvnw` / `mvnw.cmd`) and update User `PATH` with bundled Maven | None | 1h | [memory.md#3-decisions-log](file:///c:/Git%20Project/VS%20Extensiton%20project/DEBUGMIND%20AI/project-docs/memory.md)
- [x] **T-026** | Create VS Code launch configurations (`launch.json`) and tasks (`tasks.json`) for F5 execution | None | 1h | [memory.md#3-decisions-log](file:///c:/Git%20Project/VS%20Extensiton%20project/DEBUGMIND%20AI/project-docs/memory.md)
- [x] **T-027** | Create `run-backend.bat` and `run-backend.ps1` with automated port 8080 collision clearing | None | 1h | [memory.md#3-decisions-log](file:///c:/Git%20Project/VS%20Extensiton%20project/DEBUGMIND%20AI/project-docs/memory.md)
- [x] **T-028** | Create `run-all-tests.bat` verifying 100% green test execution across extension and backend | None | 1h | [rules.md#5-testing-requirements](file:///c:/Git%20Project/VS%20Extensiton%20project/DEBUGMIND%20AI/project-docs/rules.md)
- [x] **T-029** | Package `debugmind-ai-0.0.1.vsix` and install into host Visual Studio Code instance | T-028 | 1h | [memory.md#2-current-status--system-health](file:///c:/Git%20Project/VS%20Extensiton%20project/DEBUGMIND%20AI/project-docs/memory.md)

---

## 2. Remaining Roadmap Tasks

### Phase 1: Bugs & Edge-Case Fixes
- [ ] **T-030** | Graceful fallback in `ProcessSandboxService` when host test runners (e.g. `pytest`) are missing | T-021 | 2h
- [ ] **T-031** | Unify CSS styling in `dashboardPanel.js` by linking `media/style.css` rather than inline styles | T-010 | 1h

### Phase 2: Missing Features & Enhancements
- [ ] **T-032** | Implement "Save Tests to File" command in `testService.js` to write generated tests directly to workspace | T-010 | 2h
- [ ] **T-033** | Expand `WorkspaceScanner` to batch-analyze all detected entry points and compute project-wide health | T-012 | 4h
- [ ] **T-034** | Implement persistent analysis history using Spring Data JPA with embedded H2 / PostgreSQL profile | T-024 | 4h
- [ ] **T-035** | Add `.debugmindrc.json` configuration loader to allow teams to define custom regex static rules | T-003 | 3h

### Phase 3: Refactoring & Developer Experience
- [ ] **T-036** | Add TypeScript JSDoc type definitions (`@typedef`) across all client services for strict IDE autocompletion | None | 2h
- [ ] **T-037** | Preserve sidebar scroll position and selected issue ID across file save and re-analysis events | T-009 | 2h

### Phase 4: Additional Automated Testing
- [ ] **T-038** | Add Mockito unit tests for `GeminiProvider` simulating HTTP 429 rate limits and 503 service outages | T-015 | 2h
- [ ] **T-039** | Add VS Code Extension Host integration test using `@vscode/test-electron` to verify command execution | T-001 | 3h

### Phase 5: Production Release
- [ ] **T-040** | Generate high-resolution marketplace banners, animated workflow GIF, and documentation site | T-029 | 4h
- [ ] **T-041** | Publish `debugmind-ai` to Visual Studio Code Marketplace and Open VSX Registry | T-040 | 1h
