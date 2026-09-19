const vscode = require('vscode');
const logger = require('../utils/logger');

class DiffService {
  constructor() {
    this.pendingFixes = new Map();
    this.onDidChangeEmitter = new vscode.EventEmitter();
    this.onDidChange = this.onDidChangeEmitter.event;
  }

  provideTextDocumentContent(uri) {
    const fixKey = uri.path;
    const fixData = this.pendingFixes.get(fixKey);
    return fixData ? fixData.proposedContent : '';
  }

  /**
   * Applies structured line edits to original text.
   */
  applyEditsToText(originalText, edits) {
    const lines = originalText.split(/\r?\n/);
    // Sort edits descending by startLine so earlier line numbers remain valid
    const sortedEdits = [...edits].sort((a, b) => b.startLine - a.startLine);

    for (const edit of sortedEdits) {
      const startIdx = Math.max(0, edit.startLine - 1);
      const endIdx = Math.max(startIdx, edit.endLine - 1);
      const deleteCount = (endIdx - startIdx) + 1;
      const replacementLines = edit.replacement.split(/\r?\n/);
      lines.splice(startIdx, deleteCount, ...replacementLines);
    }

    return lines.join('\n');
  }

  async showDiff(fileUri, fixResponse, issue) {
    const document = await vscode.workspace.openTextDocument(fileUri);
    const originalText = document.getText();
    const proposedText = this.applyEditsToText(originalText, fixResponse.edits);

    const fixKey = `/${issue.id || 'fix'}_${Date.now()}/${document.fileName.split(/[/\\]/).pop()}`;
    const diffUri = vscode.Uri.from({
      scheme: 'debugmind-fix',
      path: fixKey
    });

    this.pendingFixes.set(fixKey, {
      fileUri,
      proposedContent: proposedText,
      edits: fixResponse.edits,
      issue,
      description: fixResponse.description
    });

    this.onDidChangeEmitter.fire(diffUri);

    const title = `DebugMind: Fix ${issue.id || ''} (${issue.title || 'Diff'})`;
    await vscode.commands.executeCommand('vscode.diff', fileUri, diffUri, title);

    // Prompt user in status/notification with explicit Accept / Reject
    vscode.window.showInformationMessage(
      `DebugMind AI proposed fix for ${issue.title || issue.id}: "${fixResponse.description}". Review diff in editor.`,
      'Accept Fix',
      'Reject Fix'
    ).then(selection => {
      if (selection === 'Accept Fix') {
        this.acceptFix(fixKey);
      } else if (selection === 'Reject Fix') {
        this.rejectFix(fixKey);
      }
    });

    return fixKey;
  }

  async acceptFix(fixKey) {
    const fixData = this.pendingFixes.get(fixKey);
    if (!fixData) {
      vscode.window.showWarningMessage('No pending DebugMind fix found to apply.');
      return false;
    }

    try {
      const doc = await vscode.workspace.openTextDocument(fixData.fileUri);
      const fullRange = new vscode.Range(
        doc.positionAt(0),
        doc.positionAt(doc.getText().length)
      );

      const edit = new vscode.WorkspaceEdit();
      edit.replace(fixData.fileUri, fullRange, fixData.proposedContent);
      const success = await vscode.workspace.applyEdit(edit);

      if (success) {
        await doc.save();
        this.pendingFixes.delete(fixKey);
        vscode.window.showInformationMessage(
          `✅ DebugMind AI: Fix applied successfully for ${fixData.issue.id}!`
        );
        logger.log(`Fix accepted and applied for issue ${fixData.issue.id}`);
        // Trigger verification option
        vscode.window.showInformationMessage(
          `Would you like DebugMind to run tests and verify this fix?`,
          'Run Verification',
          'Later'
        ).then(choice => {
          if (choice === 'Run Verification') {
            vscode.commands.executeCommand('debugmind.runVerification', fixData.fileUri, fixData.issue);
          }
        });
        return true;
      } else {
        vscode.window.showErrorMessage('DebugMind AI: Failed to apply fix to workspace.');
        return false;
      }
    } catch (err) {
      logger.error('Error applying fix', err);
      vscode.window.showErrorMessage(`DebugMind AI: Error applying fix: ${err.message}`);
      return false;
    }
  }

  rejectFix(fixKey) {
    if (this.pendingFixes.has(fixKey)) {
      const fixData = this.pendingFixes.get(fixKey);
      this.pendingFixes.delete(fixKey);
      vscode.window.showInformationMessage(`DebugMind AI: Fix for ${fixData.issue.id} rejected.`);
      logger.log(`Fix rejected by user for issue ${fixData.issue.id}`);
    }
  }
}

module.exports = new DiffService();
