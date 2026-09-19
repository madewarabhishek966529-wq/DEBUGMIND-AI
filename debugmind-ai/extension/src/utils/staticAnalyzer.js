const vscode = require('vscode');

class StaticAnalyzer {
  /**
   * Collects existing VS Code language diagnostics and runs heuristic static checks.
   * @param {vscode.TextDocument} document 
   * @param {string} language 
   * @returns {Array} Array of static findings
   */
  collectFindings(document, language) {
    const findings = [];

    // 1. Gather active VS Code diagnostics from existing tools (ESLint, compiler, etc.)
    const existingDiagnostics = vscode.languages.getDiagnostics(document.uri);
    for (const diag of existingDiagnostics) {
      // Ignore DebugMind's own diagnostics to avoid recursion
      if (diag.source === 'DebugMind') continue;

      findings.push({
        source: diag.source || 'Linter/Compiler',
        code: diag.code ? String(diag.code) : 'DIAG',
        message: diag.message,
        severity: this.mapSeverity(diag.severity),
        startLine: diag.range.start.line + 1,
        startColumn: diag.range.start.character + 1,
        endLine: diag.range.end.line + 1,
        endColumn: diag.range.end.character + 1
      });
    }

    // 2. Perform lightweight heuristic pattern checks
    const text = document.getText();
    const lines = text.split(/\r?\n/);

    for (let i = 0; i < lines.length; i++) {
      const lineNum = i + 1;
      const line = lines[i];

      // Check: SQL Injection Risk via string concatenation
      if (/(select|insert|update|delete)\s+.*(\+|\.concat|\$\{|\%s)/i.test(line)) {
        findings.push({
          source: 'StaticPatternAnalyzer',
          code: 'SEC-SQL-CONCAT',
          message: 'Potential SQL injection risk: query constructed using dynamic string concatenation.',
          severity: 'HIGH',
          startLine: lineNum,
          startColumn: 1,
          endLine: lineNum,
          endColumn: line.length + 1
        });
      }

      // Check: Hard-coded secrets/credentials
      if (/(password|secret|api[_-]?key|private[_-]?key)\s*[:=]\s*["'][^"'\s]{8,}["']/i.test(line)) {
        findings.push({
          source: 'StaticPatternAnalyzer',
          code: 'SEC-HARDCODED-SECRET',
          message: 'Potential hardcoded secret or API credential detected.',
          severity: 'HIGH',
          startLine: lineNum,
          startColumn: 1,
          endLine: lineNum,
          endColumn: line.length + 1
        });
      }

      // Check: Empty catch block
      if (/catch\s*\([^\)]*\)\s*\{\s*\}/.test(line) || (/catch\s*\([^\)]*\)/.test(line) && lines[i + 1] && /^\s*\{\s*\}\s*$/.test(lines[i + 1]))) {
        findings.push({
          source: 'StaticPatternAnalyzer',
          code: 'ERR-EMPTY-CATCH',
          message: 'Empty catch block suppresses exceptions and conceals runtime errors.',
          severity: 'MEDIUM',
          startLine: lineNum,
          startColumn: 1,
          endLine: lineNum,
          endColumn: line.length + 1
        });
      }

      // Check: Command injection risk
      if (/(exec|spawn|popen|Runtime\.getRuntime\(\)\.exec)\s*\(.*(\+|\$)/i.test(line)) {
        findings.push({
          source: 'StaticPatternAnalyzer',
          code: 'SEC-COMMAND-INJECTION',
          message: 'Command execution using unvalidated string concatenation.',
          severity: 'CRITICAL',
          startLine: lineNum,
          startColumn: 1,
          endLine: lineNum,
          endColumn: line.length + 1
        });
      }
    }

    return findings;
  }

  mapSeverity(vscodeSeverity) {
    switch (vscodeSeverity) {
      case vscode.DiagnosticSeverity.Error:
        return 'CRITICAL';
      case vscode.DiagnosticSeverity.Warning:
        return 'HIGH';
      case vscode.DiagnosticSeverity.Information:
        return 'MEDIUM';
      case vscode.DiagnosticSeverity.Hint:
        return 'INFO';
      default:
        return 'LOW';
    }
  }
}

module.exports = new StaticAnalyzer();
