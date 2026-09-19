const vscode = require('vscode');
const DashboardPanel = require('../webview/dashboardPanel');

function registerDashboardCommands(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand('debugmind.openDashboard', (customData) => {
      DashboardPanel.createOrShow(context.extensionUri, customData);
    }),

    vscode.commands.registerCommand('debugmind.configureSettings', () => {
      vscode.commands.executeCommand('workbench.action.openSettings', 'debugmind');
    })
  );
}

module.exports = registerDashboardCommands;
