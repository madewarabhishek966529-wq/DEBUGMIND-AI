const vscode = require('vscode');

class WelcomeViewProvider {
  static checkFirstActivation(context) {
    const hasSeenWelcome = context.globalState.get('debugmind.hasSeenWelcome', false);
    if (!hasSeenWelcome) {
      context.globalState.update('debugmind.hasSeenWelcome', true);
      vscode.commands.executeCommand('setContext', 'debugmind.showWelcome', true);
      this.showWelcomeModal();
    }
  }

  static async showWelcomeModal() {
    const choice = await vscode.window.showInformationMessage(
      '🧠 Welcome to DebugMind AI!\n\nAI debugging inside VS Code:\n✓ Detect bugs\n✓ Explain errors\n✓ Generate fixes\n✓ Generate tests\n✓ Verify fixes\n\nPowered by Google Gemini API via Spring Boot backend.',
      'Configure',
      'Configure Later'
    );

    if (choice === 'Configure') {
      vscode.commands.executeCommand('workbench.action.openSettings', 'debugmind');
    }
  }
}

module.exports = WelcomeViewProvider;
