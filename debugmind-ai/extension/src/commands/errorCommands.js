const vscode = require('vscode');
const errorService = require('../services/errorService');

function registerErrorCommands(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand('debugmind.analyzeError', async (errorText) => {
      await errorService.analyzeError(errorText);
    })
  );
}

module.exports = registerErrorCommands;
