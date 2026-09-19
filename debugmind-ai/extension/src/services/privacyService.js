const vscode = require('vscode');

class PrivacyService {
  constructor() {
    this.sessionApproved = false;
  }

  async confirmSendSource(contextDescription = 'analyze your code') {
    const config = vscode.workspace.getConfiguration('debugmind');
    const sendSource = config.get('sendSourceCode', true);
    const askBefore = config.get('askBeforeSending', true);

    if (!sendSource) {
      vscode.window.showWarningMessage(
        'DebugMind AI: "debugmind.sendSourceCode" is disabled. Analysis cannot proceed without sending code context.'
      );
      return false;
    }

    if (!askBefore || this.sessionApproved) {
      return true;
    }

    const choice = await vscode.window.showInformationMessage(
      `DebugMind AI will send the selected code snippet to the backend to ${contextDescription}. No code is stored permanently. Do you wish to continue?`,
      { modal: false },
      'Allow Once',
      'Allow for Session',
      'Always Allow',
      'Cancel'
    );

    if (choice === 'Allow Once') {
      return true;
    }

    if (choice === 'Allow for Session') {
      this.sessionApproved = true;
      return true;
    }

    if (choice === 'Always Allow') {
      await config.update('askBeforeSending', false, vscode.ConfigurationTarget.Global);
      return true;
    }

    return false;
  }
}

module.exports = new PrivacyService();
