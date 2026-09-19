const vscode = require('vscode');
const logger = require('./src/utils/logger');
const diagnosticManager = require('./src/diagnostics/diagnosticManager');
const DebugMindCodeActionProvider = require('./src/diagnostics/codeActionProvider');
const diffService = require('./src/services/diffService');
const SidebarViewProvider = require('./src/webview/sidebarViewProvider');
const WelcomeViewProvider = require('./src/webview/welcomeViewProvider');
const terminalProvider = require('./src/providers/terminalProvider');

// Command Registrars
const registerAnalyzeCommands = require('./src/commands/analyzeCommands');
const registerExplainCommands = require('./src/commands/explainCommands');
const registerFixCommands = require('./src/commands/fixCommands');
const registerTestCommands = require('./src/commands/testCommands');
const registerErrorCommands = require('./src/commands/errorCommands');
const registerDashboardCommands = require('./src/commands/dashboardCommands');

/**
 * Extension activation entrypoint.
 * @param {vscode.ExtensionContext} context 
 */
function activate(context) {
  logger.log('DebugMind AI extension activating...');

  // 1. Register Activity Bar / Sidebar View
  const sidebarProvider = new SidebarViewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('debugmind.sidebarView', sidebarProvider)
  );

  // 2. Register Diff Provider (debugmind-fix scheme)
  context.subscriptions.push(
    vscode.workspace.registerTextDocumentContentProvider('debugmind-fix', diffService)
  );

  // 3. Register Code Actions Provider for all supported languages
  const supportedSelector = [
    { language: 'java' },
    { language: 'javascript' },
    { language: 'javascriptreact' },
    { language: 'typescript' },
    { language: 'typescriptreact' },
    { language: 'python' },
    { language: 'c' },
    { language: 'cpp' },
    { language: 'dart' },
    { language: 'php' }
  ];

  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      supportedSelector,
      new DebugMindCodeActionProvider(),
      {
        providedCodeActionKinds: [vscode.CodeActionKind.QuickFix]
      }
    )
  );

  // 4. Register Terminal Provider
  terminalProvider.register(context);

  // 5. Register all commands
  registerAnalyzeCommands(context);
  registerExplainCommands(context);
  registerFixCommands(context);
  registerTestCommands(context);
  registerErrorCommands(context);
  registerDashboardCommands(context);

  // 6. Check first-run onboarding screen
  WelcomeViewProvider.checkFirstActivation(context);

  // 7. Optional auto-analyze on save listener
  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument((doc) => {
      const config = vscode.workspace.getConfiguration('debugmind');
      if (config.get('autoAnalyze', false)) {
        vscode.commands.executeCommand('debugmind.analyzeCurrentFile');
      }
    })
  );

  logger.log('DebugMind AI extension activated successfully.');
}

function deactivate() {
  diagnosticManager.clear();
  diagnosticManager.dispose();
  logger.log('DebugMind AI extension deactivated.');
}

module.exports = {
  activate,
  deactivate
};
