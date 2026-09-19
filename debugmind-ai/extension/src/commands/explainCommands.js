const vscode = require('vscode');
const backendClient = require('../services/backendClient');
const languageDetector = require('../utils/languageDetector');
const privacyService = require('../services/privacyService');
const DashboardPanel = require('../webview/dashboardPanel');
const logger = require('../utils/logger');

function registerExplainCommands(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand('debugmind.explainIssue', async (targetIssue, fileUri) => {
      let issue = targetIssue;
      let docUri = fileUri;

      if (!issue || !docUri) {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          vscode.window.showInformationMessage('DebugMind: Please select code or open a file with issues.');
          return;
        }
        docUri = editor.document.uri;

        const cursorLine = editor.selection.active.line + 1;
        const issues = require('../diagnostics/diagnosticManager').getIssuesForFile(docUri);

        if (issues.length === 0) {
          vscode.window.showInformationMessage('DebugMind: No issues detected in this file. Run "Analyze Current File" first.');
          return;
        }

        issue = issues.find(i => i.startLine === cursorLine) || issues[0];
      }

      const approved = await privacyService.confirmSendSource('explain the detected issue');
      if (!approved) return;

      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `DebugMind: Explaining ${issue.title || issue.id}...`,
        cancellable: false
      }, async () => {
        try {
          const document = await vscode.workspace.openTextDocument(docUri);
          const language = languageDetector.detect(document);
          const code = document.getText();

          const payload = {
            issueId: issue.id,
            title: issue.title,
            category: issue.category,
            startLine: issue.startLine,
            endLine: issue.endLine,
            explanation: issue.explanation,
            code,
            language,
            fileName: document.fileName.split(/[/\\]/).pop()
          };

          const response = await backendClient.explainIssue(payload);

          // Render formatted explanation
          const markdownContent = `## 🧠 Explanation: ${issue.title || issue.id}\n\n` +
            `**Location:** \`${payload.fileName}:${issue.startLine || 1}\`\n` +
            `**Severity:** ${issue.severity || 'MEDIUM'} | **Confidence:** ${Math.round((issue.confidence || 0.9) * 100)}%\n\n` +
            `### 1. What is wrong?\n${response.whatIsWrong || response.explanation || issue.explanation}\n\n` +
            `### 2. Why does it happen?\n${response.whyItHappens || 'Unsafe state or missing precondition.'}\n\n` +
            `### 3. Where does it happen?\nLine ${issue.startLine || 1} in \`${payload.fileName}\`.\n\n` +
            `### 4. What is the impact?\n${response.impact || 'Potential runtime crash, security exposure, or data inconsistency.'}\n\n` +
            `### 5. How should it be fixed?\n${response.howToFix || issue.suggestedFix || 'Apply defensive checks or proper error handling.'}`;

          DashboardPanel.createOrShow(context.extensionUri, {
            title: `Explain: ${issue.id}`,
            content: markdownContent
          });
        } catch (err) {
          logger.error('Explain command failed', err);
          vscode.window.showErrorMessage(`DebugMind: ${err.message}`);
        }
      });
    })
  );
}

module.exports = registerExplainCommands;
