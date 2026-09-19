const vscode = require('vscode');

class DebugMindCodeActionProvider {
  provideCodeActions(document, range, context) {
    const actions = [];

    // Filter diagnostics that originate from DebugMind
    const debugMindDiagnostics = context.diagnostics.filter(d => d.source === 'DebugMind');

    for (const diag of debugMindDiagnostics) {
      const issue = diag._debugmindIssue;
      const issueId = diag.code || (issue ? issue.id : 'Issue');

      // 1. Action: Explain Issue
      const explainAction = new vscode.CodeAction(
        `🧠 DebugMind: Explain ${issueId}`,
        vscode.CodeActionKind.QuickFix
      );
      explainAction.command = {
        command: 'debugmind.explainIssue',
        title: 'Explain Issue',
        arguments: [issue, document.uri]
      };
      explainAction.diagnostics = [diag];
      actions.push(explainAction);

      // 2. Action: Fix Issue
      const fixAction = new vscode.CodeAction(
        `⚡ DebugMind: Fix ${issueId}`,
        vscode.CodeActionKind.QuickFix
      );
      fixAction.isPreferred = true;
      fixAction.command = {
        command: 'debugmind.fixIssue',
        title: 'Fix Issue',
        arguments: [issue, document.uri]
      };
      fixAction.diagnostics = [diag];
      actions.push(fixAction);

      // 3. Action: Ignore Issue
      const ignoreAction = new vscode.CodeAction(
        `🚫 DebugMind: Ignore ${issueId}`,
        vscode.CodeActionKind.QuickFix
      );
      ignoreAction.command = {
        command: 'debugmind.clearDiagnostics',
        title: 'Ignore Issue',
        arguments: [issueId]
      };
      actions.push(ignoreAction);
    }

    return actions;
  }
}

module.exports = DebugMindCodeActionProvider;
