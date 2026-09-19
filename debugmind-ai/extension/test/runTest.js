/**
 * Test runner for DebugMind AI extension.
 * Supports Node.js built-in runner, Mocha, and VS Code test runner.
 */
const path = require('path');
const Module = require('module');
const originalRequire = Module.prototype.require;

// Mock 'vscode' module if run outside of VS Code Extension Host
Module.prototype.require = function (request) {
  if (request === 'vscode') {
    return {
      window: {
        createOutputChannel: () => ({
          appendLine: () => {},
          show: () => {}
        }),
        showInformationMessage: async () => {},
        showWarningMessage: async () => {},
        showErrorMessage: async () => {},
        showInputBox: async () => null,
        withProgress: async (opts, task) => task(),
        registerWebviewViewProvider: () => ({ dispose: () => {} })
      },
      workspace: {
        getConfiguration: () => ({
          get: (key, def) => def,
          update: async () => {}
        }),
        registerTextDocumentContentProvider: () => ({ dispose: () => {} }),
        onDidSaveTextDocument: () => ({ dispose: () => {} }),
        findFiles: async () => [],
        openTextDocument: async () => ({ getText: () => '', lineCount: 10 }),
        applyEdit: async () => true,
        workspaceFolders: [{ uri: { fsPath: process.cwd() }, name: 'test-ws' }]
      },
      languages: {
        createDiagnosticCollection: () => ({
          set: () => {},
          clear: () => {},
          dispose: () => {}
        }),
        getDiagnostics: () => [],
        registerCodeActionsProvider: () => ({ dispose: () => {} })
      },
      commands: {
        registerCommand: () => ({ dispose: () => {} }),
        executeCommand: async () => {}
      },
      Diagnostic: class {
        constructor(range, message, severity) {
          this.range = range;
          this.message = message;
          this.severity = severity;
        }
      },
      DiagnosticSeverity: { Error: 0, Warning: 1, Information: 2, Hint: 3 },
      Range: class {
        constructor(startLine, startCol, endLine, endCol) {
          this.start = { line: startLine, character: startCol };
          this.end = { line: endLine, character: endCol };
        }
      },
      Selection: class {},
      Uri: {
        parse: (str) => ({ toString: () => str, fsPath: str }),
        file: (str) => ({ toString: () => `file://${str}`, fsPath: str }),
        from: (obj) => ({ toString: () => `${obj.scheme}://${obj.path}`, ...obj })
      },
      EventEmitter: class {
        constructor() { this.event = () => {}; }
        fire() {}
      },
      CodeAction: class {
        constructor(title, kind) { this.title = title; this.kind = kind; }
      },
      CodeActionKind: { QuickFix: 'quickfix' },
      WorkspaceEdit: class {
        replace() {}
      }
    };
  }
  return originalRequire.apply(this, arguments);
};

// If describe / it are not globally defined, define mini runner
if (typeof global.describe === 'undefined') {
  global.describe = (name, fn) => {
    console.log(`\n--- ${name} ---`);
    fn();
  };
  global.it = (name, fn) => {
    try {
      fn();
      console.log(`  ✓ ${name}`);
    } catch (err) {
      console.error(`  ✗ ${name}`);
      console.error(err);
      process.exitCode = 1;
    }
  };
}

try {
  const Mocha = require('mocha');
  const mocha = new Mocha({ ui: 'bdd', color: true });
  mocha.addFile(path.resolve(__dirname, 'suite/staticAnalyzer.test.js'));
  mocha.run(failures => {
    process.exitCode = failures ? 1 : 0;
  });
} catch (err) {
  require('./suite/staticAnalyzer.test.js');
  if (process.exitCode !== 1) {
    console.log('\nAll DebugMind extension tests passed successfully!');
  }
}
