const vscode = require('vscode');
const path = require('path');
const backendClient = require('./backendClient');
const languageDetector = require('../utils/languageDetector');
const privacyService = require('./privacyService');
const logger = require('../utils/logger');

class TestService {
  async generateTests() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showInformationMessage('DebugMind: Please open a code file to generate tests for.');
      return;
    }

    const approved = await privacyService.confirmSendSource('generate unit tests for this code');
    if (!approved) return;

    const document = editor.document;
    const language = languageDetector.detect(document);
    const code = editor.selection.isEmpty ? document.getText() : document.getText(editor.selection);
    const framework = languageDetector.detectFramework(language);
    const fileName = path.basename(document.fileName);

    await vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: `DebugMind: Generating ${framework.toUpperCase()} tests for ${fileName}...`,
      cancellable: false
    }, async () => {
      try {
        const payload = {
          language,
          framework,
          fileName,
          code
        };

        const response = await backendClient.generateTests(payload);

        if (!response || !response.testCode) {
          vscode.window.showWarningMessage('DebugMind: Backend did not return generated test code.');
          return;
        }

        // Open generated test code in a new untitled tab with appropriate language
        const langId = document.languageId || language;
        const newDoc = await vscode.workspace.openTextDocument({
          language: langId,
          content: response.testCode
        });

        await vscode.window.showTextDocument(newDoc, {
          viewColumn: vscode.ViewColumn.Beside,
          preview: false
        });

        const suggestedPath = response.suggestedFilePath || `tests/test_${fileName}`;
        vscode.window.showInformationMessage(
          `DebugMind AI: Generated test suite (${response.testCount || 'comprehensive'} tests). Suggested file: ${suggestedPath}`
        );
      } catch (err) {
        logger.error('Test generation failed', err);
        vscode.window.showErrorMessage(`DebugMind: ${err.message}`);
      }
    });
  }

  async runVerification(fileUri, issue) {
    const editor = vscode.window.activeTextEditor;
    const document = fileUri ? await vscode.workspace.openTextDocument(fileUri) : (editor ? editor.document : null);

    if (!document) {
      vscode.window.showInformationMessage('DebugMind: Please open a file to verify fixes for.');
      return;
    }

    const language = languageDetector.detect(document);
    const fileName = path.basename(document.fileName);
    const code = document.getText();

    await vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: `DebugMind: Verifying fixes and running tests for ${fileName}...`,
      cancellable: false
    }, async () => {
      try {
        const payload = {
          language,
          fileName,
          code,
          issueId: issue ? issue.id : null,
          workspacePath: vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : null
        };

        const result = await backendClient.verifyFix(payload);

        // Notify and update UI
        this.displayVerificationResult(result);
        return result;
      } catch (err) {
        logger.error('Verification failed', err);
        vscode.window.showErrorMessage(`DebugMind: Verification failed - ${err.message}`);
      }
    });
  }

  displayVerificationResult(result) {
    const status = result.status; // VERIFIED, FAILED, PARTIAL, NOT_RUN, UNSUPPORTED
    let msg = `Verification Status: ${status} | Passed: ${result.passed || 0}, Failed: ${result.failed || 0}`;

    if (status === 'VERIFIED') {
      vscode.window.showInformationMessage(`✅ DebugMind AI: FIX VERIFIED! All ${result.passed || 0} checks passed.`);
    } else if (status === 'FAILED') {
      vscode.window.showErrorMessage(
        `❌ DebugMind AI: Verification Failed! ${result.failed} test(s) failed.\n${result.summary || ''}`,
        'Analyze Failure'
      ).then(choice => {
        if (choice === 'Analyze Failure') {
          vscode.commands.executeCommand('debugmind.analyzeError', result.output || result.summary);
        }
      });
    } else if (status === 'NOT_RUN') {
      vscode.window.showWarningMessage(`⚠️ DebugMind AI: Tests not run: ${result.summary || 'No test runner configured.'}`);
    } else {
      vscode.window.showInformationMessage(`ℹ️ DebugMind AI: ${msg}`);
    }
  }
}

module.exports = new TestService();
