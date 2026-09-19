const vscode = require('vscode');

class TerminalProvider {
  register(context) {
    const command = vscode.commands.registerCommand('debugmind.analyzeTerminalSelection', async () => {
      // Prompt user or use clipboard/active terminal
      await vscode.commands.executeCommand('workbench.action.terminal.copySelection');
      const clipboardText = await vscode.env.clipboard.readText();

      if (!clipboardText || !clipboardText.trim()) {
        vscode.window.showInformationMessage('DebugMind: Please highlight an error or stack trace in the terminal first.');
        return;
      }

      vscode.commands.executeCommand('debugmind.analyzeError', clipboardText);
    });

    context.subscriptions.push(command);
  }
}

module.exports = new TerminalProvider();
