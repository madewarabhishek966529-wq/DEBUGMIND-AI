const vscode = require('vscode');
const path = require('path');
const backendClient = require('./backendClient');
const privacyService = require('./privacyService');
const languageDetector = require('../utils/languageDetector');
const staticAnalyzer = require('../utils/staticAnalyzer');
const workspaceScanner = require('../utils/workspaceScanner');
const diagnosticManager = require('../diagnostics/diagnosticManager');
const logger = require('../utils/logger');

class AnalysisService {
  constructor() {
    this.latestAnalysis = null;
    this.onAnalysisUpdatedEmitter = new vscode.EventEmitter();
    this.onAnalysisUpdated = this.onAnalysisUpdatedEmitter.event;
  }

  async analyzeSelection() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showInformationMessage('DebugMind: Please open a file and select code to analyze.');
      return;
    }

    const selection = editor.selection;
    if (selection.isEmpty) {
      vscode.window.showInformationMessage('DebugMind: No code selected. Please highlight a code snippet.');
      return;
    }

    const approved = await privacyService.confirmSendSource('analyze your selected code');
    if (!approved) return;

    const document = editor.document;
    const selectedText = document.getText(selection);
    const language = languageDetector.detect(document);
    const fileName = path.basename(document.fileName);

    // Limit selection size
    if (selectedText.length > 50000) {
      vscode.window.showErrorMessage('DebugMind: Selected code is too large (> 50KB). Please select a smaller snippet.');
      return;
    }

    await vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: 'DebugMind: Analyzing selected code with Gemini...',
      cancellable: false
    }, async () => {
      try {
        const staticFindings = staticAnalyzer.collectFindings(document, language);
        const payload = {
          language,
          fileName,
          code: selectedText,
          lineOffset: selection.start.line,
          staticFindings
        };

        const response = await backendClient.analyzeCode(payload);
        this.handleAnalysisResponse(document.uri, response, fileName);
      } catch (err) {
        logger.error('Analyze selection failed', err);
        vscode.window.showErrorMessage(`DebugMind: ${err.message}`);
      }
    });
  }

  async analyzeCurrentFile() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showInformationMessage('DebugMind: No active file open to analyze.');
      return;
    }

    const document = editor.document;
    const approved = await privacyService.confirmSendSource('analyze this file');
    if (!approved) return;

    const language = languageDetector.detect(document);
    const fileName = path.basename(document.fileName);
    const fullText = document.getText();

    if (fullText.length > 200000) {
      vscode.window.showErrorMessage('DebugMind: File exceeds maximum analysis size (200KB).');
      return;
    }

    await vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: `DebugMind: Analyzing ${fileName}...`,
      cancellable: false
    }, async () => {
      try {
        const staticFindings = staticAnalyzer.collectFindings(document, language);
        const payload = {
          language,
          fileName,
          code: fullText,
          lineOffset: 0,
          staticFindings
        };

        const response = await backendClient.analyzeCode(payload);
        this.handleAnalysisResponse(document.uri, response, fileName);
      } catch (err) {
        logger.error('Analyze file failed', err);
        vscode.window.showErrorMessage(`DebugMind: ${err.message}`);
      }
    });
  }

  async analyzeWorkspace() {
    const config = vscode.workspace.getConfiguration('debugmind');
    const enabled = config.get('enableWorkspaceAnalysis', true);
    if (!enabled) {
      const enableNow = await vscode.window.showInformationMessage(
        'Workspace analysis is currently disabled in settings.',
        'Enable & Run',
        'Cancel'
      );
      if (enableNow === 'Enable & Run') {
        await config.update('enableWorkspaceAnalysis', true, vscode.ConfigurationTarget.Global);
      } else {
        return;
      }
    }

    const approved = await privacyService.confirmSendSource('scan project architecture and entry points');
    if (!approved) return;

    await vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: 'DebugMind: Scanning workspace...',
      cancellable: false
    }, async () => {
      try {
        const projectInfo = await workspaceScanner.scan();
        if (!projectInfo) {
          vscode.window.showInformationMessage('DebugMind: No workspace folder found.');
          return;
        }

        // Analyze key entry points or open files
        logger.log('Workspace scanned', projectInfo);
        vscode.window.showInformationMessage(
          `DebugMind Workspace Scan: Detected ${projectInfo.projectTypes.join(', ') || 'General project'} with ${projectInfo.relevantFiles.length} source files. Analyzing key files...`
        );

        if (projectInfo.relevantFiles.length > 0) {
          // Open and analyze the primary file/entry point
          const primaryFile = projectInfo.entryPoints[0] || projectInfo.relevantFiles[0];
          const fullPath = path.join(projectInfo.rootPath, primaryFile);
          const doc = await vscode.workspace.openTextDocument(fullPath);
          await vscode.window.showTextDocument(doc);
          await this.analyzeCurrentFile();
        }
      } catch (err) {
        logger.error('Analyze workspace failed', err);
        vscode.window.showErrorMessage(`DebugMind: ${err.message}`);
      }
    });
  }

  handleAnalysisResponse(fileUri, response, fileName) {
    this.latestAnalysis = {
      ...response,
      fileName,
      fileUri: fileUri.toString(),
      timestamp: new Date().toISOString()
    };

    // Update in-editor diagnostics
    diagnosticManager.setIssues(fileUri, response.issues || []);

    // Notify listeners (e.g. Sidebar webview)
    this.onAnalysisUpdatedEmitter.fire(this.latestAnalysis);

    const count = (response.issues || []).length;
    const score = response.healthScore != null ? response.healthScore : 100;
    vscode.window.showInformationMessage(
      `DebugMind AI: Analysis complete for ${fileName}. Health Score: ${score}/100. Found ${count} potential issue(s).`
    );
  }
}

module.exports = new AnalysisService();
