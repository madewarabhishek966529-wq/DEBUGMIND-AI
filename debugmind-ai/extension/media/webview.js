(function () {
  // Acquire the VS Code API
  const vscode = acquireVsCodeApi();

  // State
  let currentAnalysis = null;
  let selectedIssue = null;

  // DOM Elements
  const btnAnalyzeFile = document.getElementById('btn-analyze-file');
  const btnAnalyzeWorkspace = document.getElementById('btn-analyze-workspace');
  const healthScoreEl = document.getElementById('health-score');
  const errorCountEl = document.getElementById('count-errors');
  const warningCountEl = document.getElementById('count-warnings');
  const suggestionCountEl = document.getElementById('count-suggestions');
  const issueListEl = document.getElementById('issue-list');
  const issueDetailsEl = document.getElementById('issue-details');
  const detailsContentEl = document.getElementById('details-content');
  const emptyStateEl = document.getElementById('empty-state');

  // Event Listeners
  if (btnAnalyzeFile) {
    btnAnalyzeFile.addEventListener('click', () => {
      vscode.postMessage({ command: 'analyzeCurrentFile' });
    });
  }

  if (btnAnalyzeWorkspace) {
    btnAnalyzeWorkspace.addEventListener('click', () => {
      vscode.postMessage({ command: 'analyzeWorkspace' });
    });
  }

  // Handle messages sent from the extension to the webview
  window.addEventListener('message', (event) => {
    const message = event.data;
    switch (message.type) {
      case 'updateAnalysis':
        currentAnalysis = message.data;
        renderAnalysis(currentAnalysis);
        break;
      case 'clear':
        currentAnalysis = null;
        selectedIssue = null;
        renderEmpty();
        break;
    }
  });

  function renderEmpty() {
    healthScoreEl.textContent = '-- / 100';
    healthScoreEl.className = 'health-score';
    errorCountEl.textContent = '0 Errors';
    warningCountEl.textContent = '0 Warnings';
    suggestionCountEl.textContent = '0 Suggestions';
    issueListEl.innerHTML = '';
    issueDetailsEl.style.display = 'none';
    emptyStateEl.style.display = 'block';
  }

  function renderAnalysis(analysis) {
    if (!analysis) {
      renderEmpty();
      return;
    }

    emptyStateEl.style.display = 'none';

    // Health Score
    const score = analysis.healthScore != null ? analysis.healthScore : 100;
    healthScoreEl.textContent = `${score} / 100`;
    healthScoreEl.className = 'health-score ' + (score >= 80 ? 'score-high' : score >= 50 ? 'score-med' : 'score-low');

    // Counts
    const issues = analysis.issues || [];
    const errors = issues.filter(i => ['CRITICAL', 'HIGH'].includes((i.severity || '').toUpperCase())).length;
    const warnings = issues.filter(i => (i.severity || '').toUpperCase() === 'MEDIUM').length;
    const suggestions = issues.filter(i => ['LOW', 'INFO'].includes((i.severity || '').toUpperCase())).length;

    errorCountEl.textContent = `🔴 ${errors} Error${errors === 1 ? '' : 's'}`;
    warningCountEl.textContent = `🟠 ${warnings} Warning${warnings === 1 ? '' : 's'}`;
    suggestionCountEl.textContent = `🔵 ${suggestions} Suggestion${suggestions === 1 ? '' : 's'}`;

    // Issue List
    issueListEl.innerHTML = '';
    if (issues.length === 0) {
      issueListEl.innerHTML = '<div class="empty-state">No issues detected! 🎉</div>';
      issueDetailsEl.style.display = 'none';
      return;
    }

    issues.forEach((issue) => {
      const item = document.createElement('div');
      const sevClass = `sev-${(issue.severity || 'medium').toLowerCase()}`;
      item.className = `issue-item ${sevClass}`;

      const icon = getSeverityIcon(issue.severity);
      const loc = `${issue.file || analysis.fileName || 'file'}:${issue.startLine || 1}`;

      item.innerHTML = `
        <div class="issue-header">
          <span class="issue-title">${icon} ${escapeHtml(issue.title || issue.category)}</span>
        </div>
        <div class="issue-location">${escapeHtml(loc)}</div>
      `;

      item.addEventListener('click', () => {
        document.querySelectorAll('.issue-item').forEach(el => el.classList.remove('selected'));
        item.classList.add('selected');
        selectIssue(issue, analysis);
      });

      issueListEl.appendChild(item);
    });

    // Auto-select first issue
    if (issues.length > 0) {
      selectIssue(issues[0], analysis);
      const firstChild = issueListEl.firstChild;
      if (firstChild) firstChild.classList.add('selected');
    }
  }

  function selectIssue(issue, analysis) {
    selectedIssue = issue;
    issueDetailsEl.style.display = 'block';

    const icon = getSeverityIcon(issue.severity);
    const loc = `${issue.file || analysis.fileName || 'file'}:${issue.startLine || 1}`;
    const confidencePct = issue.confidence != null ? `${Math.round(issue.confidence * 100)}%` : 'N/A';

    detailsContentEl.innerHTML = `
      <div style="font-weight: 600; margin-bottom: 6px;">
        ${icon} ${escapeHtml(issue.title || issue.category)}
      </div>
      <div class="issue-location" style="margin-bottom: 8px;">
        ${escapeHtml(loc)}
      </div>

      <div class="detail-row">
        <div class="detail-label">WHY?</div>
        <div class="detail-value">${escapeHtml(issue.explanation || 'Potential issue detected.')}</div>
      </div>

      <div class="detail-row">
        <div class="detail-label">SEVERITY</div>
        <div class="detail-value" style="font-weight: 600;">${escapeHtml(issue.severity || 'MEDIUM')}</div>
      </div>

      <div class="detail-row">
        <div class="detail-label">CONFIDENCE</div>
        <div class="detail-value">${escapeHtml(confidencePct)}</div>
      </div>

      <div class="detail-actions">
        <button class="secondary-btn" id="btn-explain-issue">Explain More</button>
        <button class="secondary-btn" id="btn-fix-issue" style="background-color: var(--dm-btn-bg);">Generate Fix</button>
        <button class="secondary-btn" id="btn-ignore-issue">Ignore</button>
      </div>
    `;

    document.getElementById('btn-explain-issue').addEventListener('click', () => {
      vscode.postMessage({
        command: 'explainIssue',
        issue: selectedIssue,
        fileUri: analysis.fileUri
      });
    });

    document.getElementById('btn-fix-issue').addEventListener('click', () => {
      vscode.postMessage({
        command: 'fixIssue',
        issue: selectedIssue,
        fileUri: analysis.fileUri
      });
    });

    document.getElementById('btn-ignore-issue').addEventListener('click', () => {
      vscode.postMessage({
        command: 'ignoreIssue',
        issueId: selectedIssue.id
      });
    });
  }

  function getSeverityIcon(severity) {
    switch ((severity || '').toUpperCase()) {
      case 'CRITICAL': return '🔴';
      case 'HIGH': return '🟠';
      case 'MEDIUM': return '🟡';
      case 'LOW':
      case 'INFO': return '🔵';
      default: return '⚪';
    }
  }

  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
})();
