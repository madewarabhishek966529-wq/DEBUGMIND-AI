# Engineering Guidelines & Rules - DebugMind AI

## 1. Coding Conventions & Naming Patterns

### 1.1 JavaScript / VS Code Extension
- **Module Format**: Pure CommonJS (`const vscode = require('vscode');` / `module.exports = ...`). Do not mix with ES Modules (`import/export`) unless compiling with a bundler.
- **Class & Instance Pattern**: Business services and providers are authored as ES6 classes and exported as singleton instances:
  ```javascript
  class BackendClient { ... }
  module.exports = new BackendClient();
  ```
- **Command Registration Pattern**: Each feature domain defines a command registrar function taking `context` and pushing disposables to `context.subscriptions`:
  ```javascript
  function registerAnalyzeCommands(context) {
    context.subscriptions.push(
      vscode.commands.registerCommand('debugmind.analyzeSelection', async () => { ... })
    );
  }
  module.exports = registerAnalyzeCommands;
  ```
- **Naming Conventions**:
  - Variables & Functions: `camelCase` (e.g., `collectFindings`, `applyEditsToText`).
  - Classes & Providers: `PascalCase` (e.g., `SidebarViewProvider`, `DiagnosticManager`).
  - Global Lookup Tables: `UPPER_SNAKE_CASE` (e.g., `EXTENSION_MAP`, `DEFAULT_FRAMEWORKS`).
  - Custom Scheme URIs: `debugmind-fix://<fixKey>`.
- **Indexing Conventions**:
  - VS Code API Range and Position coordinates are **0-indexed**.
  - DebugMind backend DTOs, compiler errors, and line numbers are **1-indexed**.
  - All conversions must use explicit clamping:
    ```javascript
    const startLine = Math.max(0, (issue.startLine || 1) - 1);
    ```

### 1.2 Java / Spring Boot Backend
- **Java Standard**: Java 21 LTS with Spring Boot 3.3.4 conventions.
- **Dependency Injection**: Strict **constructor injection** for all components; never use field `@Autowired`:
  ```java
  @Service
  public class IssueService {
      private final AIProvider aiProvider;
      public IssueService(AIProvider aiProvider) {
          this.aiProvider = aiProvider;
      }
  }
  ```
- **Logging**: Standard SLF4J logger instantiated via `LoggerFactory.getLogger(Class.class)`:
  ```java
  private static final Logger log = LoggerFactory.getLogger(IssueService.class);
  ```
- **Data Transfer Objects (DTOs)**:
  - Placed strictly under `com.debugmind.dto.request` and `com.debugmind.dto.response`.
  - Must include no-arg constructors, getters, setters, and Jakarta Bean Validation (`@NotBlank`, `@Valid`).
- **Package Structure**:
  - `com.debugmind.controller` (REST entrypoints)
  - `com.debugmind.service` (Domain logic)
  - `com.debugmind.analyzer` (Deterministic scoring, deduplication, normalization)
  - `com.debugmind.ai` (LLM communication and JSON validation)
  - `com.debugmind.execution` (Sandbox process management)
  - `com.debugmind.config` (WebMvc and security filters)
  - `com.debugmind.exception` (GlobalExceptionHandler and custom exceptions)

---

## 2. Architecture & Layer Boundary Rules

1. **Client Layer Boundary**:
   - The VS Code Extension must never directly invoke external LLM APIs (Gemini, OpenAI, etc.). All AI orchestrations, prompt templates, and finding normalizations must pass through the Spring Boot backend via `BackendClient`.
2. **Deterministic Precedence Rule**:
   - Compiler diagnostics and deterministic static findings (ESLint, AST regex patterns) have absolute priority over AI suggestions. In `Deduplicator.java`, static findings are preserved; AI issues sharing the same line and category are discarded.
3. **Surgical Patch Integrity**:
   - Fixes must be generated as targeted `CodeEditDto` line replacements. Broad file refactoring or stylistic reformatting outside the problem scope is strictly forbidden.
4. **Isolated Sandbox Execution**:
   - Code verification must never run directly in the user's active workspace root. Execution is confined to a sanitized temporary directory created and destroyed by `ProcessSandboxService`.

---

## 3. State Management & Error Handling Rules

### 3.1 State Management Rules
- **No Global Leakage**: Keep extension state encapsulated in their respective singleton managers (`diagnosticManager`, `diffService`, `analysisService`).
- **Document Sync**: When clearing diagnostics, always invoke `diagnosticManager.clear()` to sync the VS Code `DiagnosticCollection` and remove squiggles.
- **Diff Management**: Every generated fix must have a unique identifier key stored in `diffService.pendingFixes` and purged upon either `acceptFix()` or `rejectFix()`.

### 3.2 Error Handling Rules
- **No Swallowed Exceptions**: Never create empty catch blocks (`catch (e) {}`). Always log warnings via `logger.warn()` or `log.warn()`.
- **User-Facing Error Clarity**: Errors shown to developers via `vscode.window.showErrorMessage` must be actionable (e.g., provide backend URL or specific guidance if connection is refused).
- **Graceful Fallbacks**: If the Gemini API fails, is rate-limited (429), or receives malformed JSON, services must fall back to deterministic mock/heuristic outputs without crashing the backend.

---

## 4. Git, Commit & Environment Rules

### 4.1 Commit Conventions
Follow Conventional Commits:
- `feat: <description>` (New capability in extension or backend)
- `fix: <description>` (Bug fix in analysis, diffing, or sandbox)
- `refactor: <description>` (Internal code improvements without behavior changes)
- `test: <description>` (Unit or integration test additions)
- `docs: <description>` (Updates to documentation or READMEs)

### 4.2 Environment Hygiene
- **Never Commit Secrets**: Never commit `.env` files containing `GEMINI_API_KEY`.
- **Cross-Platform Compatibility**: Path operations must use `path.join()`, `Path.of()`, or regex normalizing forward/backward slashes (`split(/[/\\]/)`).

---

## 5. Testing Requirements

1. **Extension Tests**:
   - Every static analyzer heuristic in `staticAnalyzer.js` must have a corresponding test case in `test/suite/staticAnalyzer.test.js`.
   - Run extension tests via `npm test`.
2. **Backend Tests**:
   - Every REST controller must be verified with MockMvc in `src/test/java/com/debugmind/controller/`.
   - All sandbox compile and test runners must have unit tests in `ProcessSandboxServiceTest.java`.
   - Run backend tests via `mvn test` or `.\mvnw.cmd test`.
3. **End-to-End Regression Verification**:
   - Before submitting changes, run `run-all-tests.bat` to confirm 100% green pass rate across both tiers.

---

## 6. Hard "Never Do" List for AI Agents

- [ ] **NEVER** write or commit hardcoded Gemini API keys or tokens anywhere in the codebase.
- [ ] **NEVER** write directly to the user's source file without displaying a native diff preview via `diffService` and receiving explicit user acceptance.
- [ ] **NEVER** claim that an issue is "VERIFIED" without executing `ProcessSandboxService` against real compilers or test runners.
- [ ] **NEVER** modify production code to use unverified, non-existent third-party npm packages or Maven artifacts.
- [ ] **NEVER** remove or bypass `PrivacyService.confirmSendSource()` prompt gates.
- [ ] **NEVER** spawn sandbox processes without scrubbing environment variables containing `KEY`, `SECRET`, `TOKEN`, or `PASSWORD`.
- [ ] **NEVER** leave lingering Java or Node background processes holding port 8080.
