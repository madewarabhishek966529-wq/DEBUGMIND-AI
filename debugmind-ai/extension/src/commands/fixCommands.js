const vscode = require('vscode');
const fixService = require('../services/fixService');
const diffService = require('../services/diffService');

function registerFixCommands(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand('debugmind.fixIssue', async (targetIssue, fileUri) => {
      await fixService.fixIssue(targetIssue, fileUri);
    }),

    vscode.commands.registerCommand('debugmind.acceptDiffFix', async (fixKey) => {
      await diffService.acceptFix(fixKey);
    }),

    vscode.commands.registerCommand('debugmind.rejectDiffFix', (fixKey) => {
      diffService.rejectFix(fixKey);
    })
  );
}

module.exports = registerFixCommands;
