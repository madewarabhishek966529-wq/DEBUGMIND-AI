# DebugMind AI

### Tagline
> **Detect. Explain. Fix. Verify.**

DebugMind AI is an AI-powered developer assistant that runs directly inside Visual Studio Code. It analyzes code, detects potential bugs and security vulnerabilities, explains problems with deep engineering rationale, suggests surgical fixes with native side-by-side diff previews, generates comprehensive unit tests, analyzes compiler and runtime errors, and deterministically verifies fixes.

---

## 1. Core Architecture & Workflow

```text
Developer writes code
        ↓
Analyze (Selected / File / Workspace)
        ↓
Static Analysis + Gemini AI
        ↓
Issues Detected & Categorized
        ↓
Explain Issue (What, Why, Where, Impact, Remedy)
        ↓
Generate Fix Patch
        ↓
VS Code Native Diff Preview
        ↓
User Accepts or Rejects
        ↓
Deterministic Execution / Run Tests
        ↓
Analyze Test Results
        ↓
VERIFIED / FAILED
```

### Key Differentiators
- **No Hallucinated Success**: Never claims "Fix Verified" solely because an LLM claims it. Verification is executed deterministically against compilers and test suites.
- **Pure JavaScript Extension**: Built purely with vanilla JavaScript, Node.js, and VS Code API for zero compilation lag, high portability, and low memory consumption.
- **Spring Boot 3 + Java 21 Backend**: Robust, scalable REST backend managing Google Gemini API communications, prompt orchestration, finding normalization, and isolated execution runners.
- **Privacy First**: Explicit user opt-in before sending any code snippet. No user code is permanently stored.

---

## 2. Technology Stack

| Layer | Technologies |
|---|---|
| **VS Code Extension** | Plain JavaScript (ES6+), Node.js, VS Code Extension API, Webview HTML5/CSS3 |
| **Backend Service** | Java 21 LTS, Spring Boot 3.3.4, Maven, Spring Web, Spring Validation |
| **AI Layer** | Google Gemini API (via decoupled `AIProvider` abstraction) |
| **Database** | PostgreSQL (Production) / In-Memory (Local MVP fallback) |
| **Execution Sandbox** | Isolated local process runner with sandboxed directories, timeouts, and sanitized environments |
| **Analyzers** | ESLint, SpotBugs, Pylint, Ruff, PHPStan, compiler diagnostics, heuristic rules |

---

## 3. Repository Structure

```text
debugmind-ai/
│
├── extension/                       # VS Code Extension (Plain JavaScript)
│   ├── extension.js                 # Extension activation entrypoint
│   ├── package.json                 # Extension manifest & commands
│   ├── README.md                    # Extension user guide
│   ├── CHANGELOG.md                 # Release history
│   ├── media/
│   │   ├── icon.svg                 # Custom Activity Bar icon (Brain + Code Brackets)
│   │   ├── icon.png                 # Marketplace 128x128 package icon
│   │   ├── style.css                # VS Code theme-compatible sidebar styling
│   │   └── webview.js               # Reactive sidebar client script
│   ├── src/
│   │   ├── commands/                # Command handlers (Analyze, Explain, Fix, etc.)
│   │   ├── services/                # Backend client, diff service, privacy, etc.
│   │   ├── diagnostics/             # VS Code squiggles and CodeActionProvider
│   │   ├── webview/                 # Sidebar, Welcome, and Dashboard providers
│   │   ├── providers/               # Terminal text integration
│   │   └── utils/                   # Language detection, scanner, static analyzer
│   └── test/                        # Extension test runner & test suites
│
├── backend/                         # Spring Boot 3.3.4 Backend (Java 21)
│   ├── pom.xml                      # Maven project configuration
│   └── src/
│       ├── main/
│       │   ├── java/com/debugmind/
│       │   │   ├── DebugMindApplication.java
│       │   │   ├── ai/              # AIProvider & GeminiProvider
│       │   │   ├── analyzer/        # CodeHealthCalculator, Deduplicator, Normalizer
│       │   │   ├── config/          # Cors, AppConfig, SecurityHeaders
│       │   │   ├── controller/      # REST API controllers
│       │   │   ├── dto/             # Request & Response DTOs
│       │   │   ├── execution/       # ProcessSandboxService
│       │   │   └── service/         # Business logic services
│       │   └── resources/
│       │       ├── application.yml
│       │       └── db/migration/    # Flyway schema migrations
│       └── test/                    # Backend unit & integration test suites
│
├── .env.example                     # Environment template
├── .gitignore                       # Git ignore rules
└── README.md                        # Project documentation
```

---

## 4. Supported Languages & Testing Frameworks

| Language | Static Analyzers | Default Test Framework |
|---|---|---|
| **Java** | SpotBugs, Checkstyle, `javac` | JUnit 5 |
| **JavaScript** | ESLint, `node --check` | Jest / Vitest / Mocha |
| **TypeScript** | ESLint, TypeScript language service | Jest / Vitest |
| **Python** | Ruff, Pylint, `py_compile` | pytest / unittest |
| **C / C++** | Clang tooling, `gcc -fsyntax-only` | Google Test / Unity |
| **Dart** | Dart analyzer | `flutter_test` |
| **PHP** | PHPStan, `php -l` | PHPUnit |

---

## 5. Getting Started & Local Setup

### Prerequisites
- Node.js 18+ (tested on Node 24)
- Java 21 LTS
- Apache Maven 3.9+
- Visual Studio Code 1.85+

### 1. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Edit `.env` to provide your Gemini API key (optional for local mock testing):
```env
GEMINI_API_KEY=your_google_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
SERVER_PORT=8080
```

### 2. Run the Spring Boot Backend
Navigate to `debugmind-ai/backend`:
```bash
cd debugmind-ai/backend
mvn clean spring-boot:run
```
Verify the backend is running:
```bash
curl http://localhost:8080/api/v1/health
```
Expected response:
```json
{
  "status": "UP",
  "aiProvider": "gemini",
  "model": "gemini-1.5-flash",
  "sandboxAvailable": true,
  "timestamp": "2026-09-19T10:15:00.000Z"
}
```

### 3. Run and Debug the VS Code Extension
1. Open VS Code in `debugmind-ai/extension`.
2. Install extension dependencies:
   ```bash
   npm install
   ```
3. Press `F5` (Run Extension) to launch a new VS Code Extension Development Host window.
4. In the Extension Development Host window:
   - Click on the **DebugMind AI** Activity Bar icon (Brain + Code Brackets).
   - Open any source code file (e.g. `UserService.java` or `app.js`).
   - Click **Analyze Current File**.
   - Review detected issues, health score, explanations, and diff preview!

---

## 6. Testing

### Run Extension Unit Tests
```bash
cd debugmind-ai/extension
npm test
```

### Run Backend Unit & Integration Tests
```bash
cd debugmind-ai/backend
mvn test
```

---

## 7. Packaging the Extension (.vsix)

Package the extension for offline distribution or VS Code Marketplace:
```bash
cd debugmind-ai/extension
npm run package
```
This generates `debugmind-ai-0.0.1.vsix`.

To install the `.vsix` into your local VS Code:
```bash
code --install-extension debugmind-ai-0.0.1.vsix
```

---

## 8. Privacy & Security

- **User Consent**: `debugmind.askBeforeSending` is set to `true` by default. You will always be informed before source code leaves your local environment.
- **Safe Logging**: The extension and backend sanitize all logs, redacting API keys, passwords, and sensitive tokens.
- **Isolated Execution**: Code compilation and test runs execute in sandboxed temporary folders with non-shell invocations and strict timeout limits.
- **Key Protection**: The extension never stores or communicates your Gemini API key. All AI interaction is mediated securely by the Spring Boot backend.

---

## 9. Roadmap

- **v1.1**: Git diff awareness, changed-files only scanning, custom project rulebooks.
- **v1.2**: GitHub PR automated review integration, security CVE database cross-referencing.
- **v2.0**: Autonomous multi-step debugging agent, workspace-wide symbol reasoning.

---

## 10. License
MIT License. Copyright (c) 2026 DebugMind AI Team.
