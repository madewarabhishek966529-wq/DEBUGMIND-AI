const vscode = require('vscode');
const analysisService = require('../services/analysisService');
const diagnosticManager = require('../diagnostics/diagnosticManager');
const logger = require('../utils/logger');

class SidebarViewProvider {
  constructor(extensionUri) {
    this.extensionUri = extensionUri;
    this.view = null;

    // Listen to analysis updates from analysisService
    analysisService.onAnalysisUpdated(analysis => {
      if (this.view) {
        this.view.webview.postMessage({
          type: 'updateAnalysis',
          data: analysis
        });
      }
    });
  }

  resolveWebviewView(webviewView) {
    this.view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri]
    };

    webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);

    // Message handler
    webviewView.webview.onDidReceiveMessage(async (message) => {
      try {
        switch (message.command) {
          case 'analyzeCurrentFile':
            await vscode.commands.executeCommand('debugmind.analyzeCurrentFile');
            break;
          case 'analyzeWorkspace':
            await vscode.commands.executeCommand('debugmind.analyzeWorkspace');
            break;
          case 'explainIssue':
            await vscode.commands.executeCommand('debugmind.explainIssue', message.issue, message.fileUri);
            break;
          case 'fixIssue':
            await vscode.commands.executeCommand('debugmind.fixIssue', message.issue, message.fileUri);
            break;
          case 'ignoreIssue':
            diagnosticManager.ignoreIssue(message.issueId);
            if (analysisService.latestAnalysis) {
              const remaining = (analysisService.latestAnalysis.issues || []).filter(i => i.id !== message.issueId);
              analysisService.latestAnalysis.issues = remaining;
              this.view.webview.postMessage({
                type: 'updateAnalysis',
                data: analysisService.latestAnalysis
              });
            }
            break;
        }
      } catch (err) {
        logger.error('Error handling webview message', err);
      }
    });

    // If analysis already exists, restore it
    if (analysisService.latestAnalysis) {
      setTimeout(() => {
        webviewView.webview.postMessage({
          type: 'updateAnalysis',
          data: analysisService.latestAnalysis
        });
      }, 200);
    }
  }

  getHtmlForWebview(webview) {
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'media', 'webview.js'));
    const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'media', 'style.css'));

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DebugMind AI</title>
  <link href="${styleUri}" rel="stylesheet">
</head>
<body>
  <header class="brand">
    <span style="font-size: 18px;">🧠</span>
    <h2>DebugMind AI</h2>
  </header>

  <div class="actions-bar">
    <button class="primary-btn" id="btn-analyze-file">
      <span>📄</span> Analyze Current File
    </button>
    <button class="secondary-btn" id="btn-analyze-workspace">
      <span>📁</span> Analyze Workspace
    </button>
  </div>

  <div class="health-card">
    <div class="health-label">CODE HEALTH</div>
    <div id="health-score" class="health-score">-- / 100</div>
    <div class="summary-badges">
      <span class="badge" id="count-errors">🔴 0 Errors</span>
      <span class="badge" id="count-warnings">🟠 0 Warnings</span>
      <span class="badge" id="count-suggestions">🔵 0 Suggestions</span>
    </div>
  </div>

  <div class="section-title">ISSUES</div>
  <div id="empty-state" class="empty-state">
    Open a file and click "Analyze Current File" to detect issues.
  </div>
  <div id="issue-list" class="issue-list"></div>

  <div id="issue-details" class="issue-details" style="display: none;">
    <div class="section-title" style="margin-bottom: 6px;">ISSUE DETAILS</div>
    <div id="details-content"></div>
  </div>

  <script src="${scriptUri}"></script>
</body>
</html>`;
  }
}

module.exports = SidebarViewProvider;
