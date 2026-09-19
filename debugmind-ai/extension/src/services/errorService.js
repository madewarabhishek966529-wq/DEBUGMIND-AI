const vscode = require('vscode');
const path = require('path');
const backendClient = require('./backendClient');
const languageDetector = require('../utils/languageDetector');
const privacyService = require('./privacyService');
const logger = require('../utils/logger');

class ErrorService {
  async analyzeError(inputErrorText) {
    let rawError = inputErrorText;

    if (!rawError || typeof rawError !== 'string') {
      // Prompt user or check active selection
      const editor = vscode.window.activeTextEditor;
      if (editor && !editor.selection.isEmpty) {
        rawError = editor.document.getText(editor.selection);
      } else {
        rawError = await vscode.window.showInputBox({
          prompt: 'Paste compiler error, stack trace, or terminal exception output:',
          placeHolder: 'e.g. java.lang.NullPointerException at UserService.java:42',
          ignoreFocusOut: true
        });
      }
    }

    if (!rawError || !rawError.trim()) {
      return;
    }

    const approved = await privacyService.confirmSendSource('analyze this error trace');
    if (!approved) return;

    // Parse trace to extract potential file and line
    const parsedLocation = this.extractLocationFromError(rawError);
    let surroundingCode = '';
    let language = 'unknown';

    if (parsedLocation && parsedLocation.fileName) {
      const files = await vscode.workspace.findFiles(`**/${parsedLocation.fileName}`, '**/node_modules/**', 1);
      if (files.length > 0) {
        try {
          const doc = await vscode.workspace.openTextDocument(files[0]);
          language = languageDetector.detect(doc);
          const editor = await vscode.window.showTextDocument(doc);

          const lineIdx = Math.max(0, parsedLocation.line - 1);
          const lineRange = doc.lineAt(Math.min(lineIdx, doc.lineCount - 1)).range;

          // Reveal and highlight line in editor
          editor.selection = new vscode.Selection(lineRange.start, lineRange.end);
          editor.revealRange(lineRange, vscode.TextEditorRevealType.InCenter);

          // Extract surrounding 10 lines of context
          const startContext = Math.max(0, lineIdx - 5);
          const endContext = Math.min(doc.lineCount - 1, lineIdx + 5);
          surroundingCode = doc.getText(new vscode.Range(startContext, 0, endContext, 100));
        } catch (e) {
          logger.warn('Could not open file from error trace', e);
        }
      }
    }

    await vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: 'DebugMind: Analyzing error and identifying root cause...',
      cancellable: false
    }, async () => {
      try {
        const payload = {
          error: rawError,
          code: surroundingCode,
          language,
          detectedFile: parsedLocation ? parsedLocation.fileName : null,
          detectedLine: parsedLocation ? parsedLocation.line : null
        };

        const response = await backendClient.analyzeError(payload);

        // Display root cause and suggested fix in an interactive panel
        const rootCause = response.rootCause || 'Root cause analyzed';
        const remedy = response.suggestedFix || 'Check referenced lines for null checks or type mismatches.';

        const choice = await vscode.window.showWarningMessage(
          `DebugMind Root Cause: ${rootCause}`,
          'Show Full Explanation',
          parsedLocation ? 'Generate Fix' : 'Dismiss'
        );

        if (choice === 'Show Full Explanation') {
          vscode.commands.executeCommand('debugmind.openDashboard', {
            title: 'Error Analysis',
            content: `### Error Analysis\n\n**Offending Error:**\n\`\`\`\n${rawError}\n\`\`\`\n\n**Root Cause:**\n${rootCause}\n\n**Impact & Fix Recommendation:**\n${remedy}\n\n**Explanation:**\n${response.explanation || ''}`
          });
        } else if (choice === 'Generate Fix' && parsedLocation) {
          const doc = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.document : null;
          if (doc) {
            vscode.commands.executeCommand('debugmind.fixIssue', {
              id: 'ERR-FIX',
              title: rootCause,
              explanation: response.explanation || remedy,
              startLine: parsedLocation.line,
              endLine: parsedLocation.line
            }, doc.uri);
          }
        }
      } catch (err) {
        logger.error('Error analysis failed', err);
        vscode.window.showErrorMessage(`DebugMind: ${err.message}`);
      }
    });
  }

  extractLocationFromError(text) {
    // Java stack trace: at com.example.UserService.getUser(UserService.java:42)
    const javaMatch = text.match(/([A-Za-z0-9_]+\.java):(\d+)/i);
    if (javaMatch) {
      return { fileName: javaMatch[1], line: parseInt(javaMatch[2], 10) };
    }

    // Node/JS trace: at Object.<anonymous> (/path/to/server.js:42:15) or server.js:42
    const jsMatch = text.match(/([A-Za-z0-9_\-]+\.(?:js|ts|jsx|tsx)):(\d+)/i);
    if (jsMatch) {
      return { fileName: jsMatch[1], line: parseInt(jsMatch[2], 10) };
    }

    // Python trace: File "app.py", line 42
    const pyMatch = text.match(/File\s+["']?([A-Za-z0-9_\-]+\.py)["']?,\s+line\s+(\d+)/i);
    if (pyMatch) {
      return { fileName: pyMatch[1], line: parseInt(pyMatch[2], 10) };
    }

    // C/C++ compiler: main.cpp:42:10: error:
    const cMatch = text.match(/([A-Za-z0-9_\-]+\.(?:c|cpp|cc|h)):(\d+)/i);
    if (cMatch) {
      return { fileName: cMatch[1], line: parseInt(cMatch[2], 10) };
    }

    // Dart/PHP
    const dartPhpMatch = text.match(/([A-Za-z0-9_\-]+\.(?:dart|php)):(\d+)/i);
    if (dartPhpMatch) {
      return { fileName: dartPhpMatch[1], line: parseInt(dartPhpMatch[2], 10) };
    }

    return null;
  }
}

module.exports = new ErrorService();
