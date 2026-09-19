const vscode = require('vscode');
const analysisService = require('../services/analysisService');
const diagnosticManager = require('../diagnostics/diagnosticManager');

function registerAnalyzeCommands(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand('debugmind.analyzeSelection', async () => {
      await analysisService.analyzeSelection();
    }),

    vscode.commands.registerCommand('debugmind.analyzeCurrentFile', async () => {
      await analysisService.analyzeCurrentFile();
    }),

    vscode.commands.registerCommand('debugmind.analyzeWorkspace', async () => {
      await analysisService.analyzeWorkspace();
    }),

    vscode.commands.registerCommand('debugmind.clearDiagnostics', (issueId) => {
      if (issueId && typeof issueId === 'string') {
        diagnosticManager.ignoreIssue(issueId);
        vscode.window.showInformationMessage(`DebugMind: Issue ${issueId} ignored.`);
      } else {
        diagnosticManager.clear();
        vscode.window.showInformationMessage('DebugMind: All diagnostics cleared.');
      }
    })
  );
}

module.exports = registerAnalyzeCommands;
