const vscode = require('vscode');

class DiagnosticManager {
  constructor() {
    this.collection = vscode.languages.createDiagnosticCollection('DebugMind');
    // Map fileUriString -> array of issues
    this.issuesByFile = new Map();
    this.ignoredIssueIds = new Set();
  }

  setIssues(fileUri, issues) {
    const uriKey = fileUri.toString();
    const activeIssues = issues.filter(iss => !this.ignoredIssueIds.has(iss.id));
    this.issuesByFile.set(uriKey, activeIssues);

    const diagnostics = activeIssues.map(issue => {
      // VS Code line is 0-indexed; backend issues are 1-indexed
      const startLine = Math.max(0, (issue.startLine || 1) - 1);
      const startCol = Math.max(0, (issue.startColumn || 1) - 1);
      const endLine = Math.max(0, (issue.endLine || issue.startLine || 1) - 1);
      const endCol = Math.max(startCol + 1, (issue.endColumn || startCol + 10) - 1);

      const range = new vscode.Range(startLine, startCol, endLine, endCol);
      const severity = this.mapSeverity(issue.severity);

      const confidenceText = issue.confidence != null ? ` [Confidence: ${Math.round(issue.confidence * 100)}%]` : '';
      const diagMessage = `[${issue.id}] ${issue.title || issue.category}: ${issue.explanation || ''}${confidenceText}`;

      const diagnostic = new vscode.Diagnostic(range, diagMessage, severity);
      diagnostic.code = issue.id;
      diagnostic.source = 'DebugMind';
      // Attach full issue metadata
      diagnostic._debugmindIssue = issue;

      return diagnostic;
    });

    this.collection.set(fileUri, diagnostics);
  }

  getIssuesForFile(fileUri) {
    return this.issuesByFile.get(fileUri.toString()) || [];
  }

  getAllIssues() {
    const all = [];
    for (const [, issues] of this.issuesByFile.entries()) {
      all.push(...issues);
    }
    return all;
  }

  ignoreIssue(issueId) {
    this.ignoredIssueIds.add(issueId);
    // Refresh all collections
    for (const [uriStr, issues] of this.issuesByFile.entries()) {
      const uri = vscode.Uri.parse(uriStr);
      this.setIssues(uri, issues);
    }
  }

  clear() {
    this.collection.clear();
    this.issuesByFile.clear();
    this.ignoredIssueIds.clear();
  }

  mapSeverity(severity) {
    switch ((severity || '').toUpperCase()) {
      case 'CRITICAL':
        return vscode.DiagnosticSeverity.Error;
      case 'HIGH':
        return vscode.DiagnosticSeverity.Warning;
      case 'MEDIUM':
        return vscode.DiagnosticSeverity.Information;
      case 'LOW':
      case 'INFO':
        return vscode.DiagnosticSeverity.Hint;
      default:
        return vscode.DiagnosticSeverity.Warning;
    }
  }

  dispose() {
    this.collection.dispose();
  }
}

module.exports = new DiagnosticManager();
