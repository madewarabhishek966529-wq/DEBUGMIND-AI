const vscode = require('vscode');
const testService = require('../services/testService');

function registerTestCommands(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand('debugmind.generateTests', async () => {
      await testService.generateTests();
    }),

    vscode.commands.registerCommand('debugmind.runVerification', async (fileUri, issue) => {
      await testService.runVerification(fileUri, issue);
    })
  );
}

module.exports = registerTestCommands;
