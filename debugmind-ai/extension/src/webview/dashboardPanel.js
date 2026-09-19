const vscode = require('vscode');
const backendClient = require('../services/backendClient');
const logger = require('../utils/logger');

class DashboardPanel {
  static currentPanel = undefined;

  static createOrShow(extensionUri, customData = null) {
    const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;

    if (DashboardPanel.currentPanel) {
      DashboardPanel.currentPanel.panel.reveal(column);
      if (customData) {
        DashboardPanel.currentPanel.updateWithCustomData(customData);
      }
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      'debugmindDashboard',
      customData && customData.title ? `DebugMind: ${customData.title}` : 'DebugMind AI Dashboard',
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [extensionUri]
      }
    );

    DashboardPanel.currentPanel = new DashboardPanel(panel, extensionUri, customData);
  }

  constructor(panel, extensionUri, customData) {
    this.panel = panel;
    this.extensionUri = extensionUri;
    this.customData = customData;

    this.update();
    this.panel.onDidDispose(() => this.dispose(), null, []);
  }

  updateWithCustomData(customData) {
    this.customData = customData;
    this.update();
  }

  async update() {
    this.panel.webview.html = await this.getHtml();
  }

  async getHtml() {
    let historyHtml = '<p style="color: var(--vscode-descriptionForeground);">No recent analyses recorded.</p>';

    if (!this.customData) {
      try {
        const analyses = await backendClient.getRecentAnalyses();
        if (analyses && analyses.length > 0) {
          historyHtml = analyses.map(a => `
            <div style="background: var(--vscode-editor-background); padding: 10px; margin-bottom: 8px; border-radius: 4px; border: 1px solid var(--vscode-widget-border);">
              <div style="font-weight: 600; font-size: 13px;">${escapeHtml(a.fileName || 'Analysis')}</div>
              <div style="color: var(--vscode-descriptionForeground); font-size: 11px;">
                Health Score: <strong>${a.healthScore || 'N/A'}/100</strong> | Issues: <strong>${(a.issues || []).length}</strong> | ${new Date(a.createdAt || Date.now()).toLocaleTimeString()}
              </div>
            </div>
          `).join('');
        }
      } catch (e) {
        historyHtml = '<p style="color: var(--vscode-descriptionForeground);">Connect to Spring Boot backend to see analysis history.</p>';
      }
    }

    const customContent = this.customData && this.customData.content
      ? `<div style="background: var(--vscode-editor-background); padding: 14px; border-radius: 4px; border: 1px solid var(--vscode-widget-border); white-space: pre-wrap; font-family: var(--vscode-editor-font-family); font-size: 13px; line-height: 1.5;">${escapeHtml(this.customData.content)}</div>`
      : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: var(--vscode-font-family);
      color: var(--vscode-editor-foreground);
      background-color: var(--vscode-editor-background);
      padding: 24px;
      line-height: 1.6;
    }
    h1, h2, h3 { font-weight: 600; }
    .card {
      background: var(--vscode-sideBar-background);
      border: 1px solid var(--vscode-widget-border, #333);
      border-radius: 6px;
      padding: 16px;
      margin-bottom: 20px;
    }
    .badge-tag {
      background: var(--vscode-badge-background);
      color: var(--vscode-badge-foreground);
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 11px;
    }
  </style>
</head>
<body>
  <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
    <span style="font-size: 28px;">🧠</span>
    <div>
      <h1 style="margin: 0; font-size: 20px;">DebugMind AI Dashboard</h1>
      <span style="color: var(--vscode-descriptionForeground); font-size: 12px;">Detect. Explain. Fix. Verify.</span>
    </div>
  </div>

  ${customContent}

  <div class="card">
    <h2>Analysis History</h2>
    ${historyHtml}
  </div>

  <div class="card">
    <h2>Backend Status & Configuration</h2>
    <p>Backend URL: <code>${vscode.workspace.getConfiguration('debugmind').get('backendUrl', 'http://localhost:8080')}</code></p>
    <p>AI Provider: <code>Gemini (Google AI)</code></p>
    <p>Sandbox Execution: <code>Isolated Local Process Runner (Sandboxed Environment)</code></p>
  </div>
</body>
</html>`;
  }

  dispose() {
    DashboardPanel.currentPanel = undefined;
    this.panel.dispose();
  }
}

function escapeHtml(text) {
  if (!text) return '';
  return text.replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[m]));
}

module.exports = DashboardPanel;
