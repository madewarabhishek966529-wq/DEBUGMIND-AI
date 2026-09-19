const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

const IGNORED_DIRS = [
  'node_modules',
  '.git',
  'target',
  'build',
  'dist',
  'vendor',
  '.idea',
  '.vscode',
  'bin',
  'obj',
  '__pycache__',
  '.gradle'
];

class WorkspaceScanner {
  async scan() {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
      return null;
    }

    const rootUri = folders[0].uri;
    const projectInfo = {
      rootPath: rootUri.fsPath,
      name: folders[0].name,
      projectTypes: [],
      languages: new Set(),
      entryPoints: [],
      dependencies: {},
      relevantFiles: [],
      changedFiles: []
    };

    // Detect Project Types and manifests
    await this.detectManifests(rootUri.fsPath, projectInfo);

    // Find relevant source files (capped to 50 files for safety)
    const files = await vscode.workspace.findFiles(
      '**/*.{java,js,jsx,ts,tsx,py,c,cpp,dart,php}',
      `**/{${IGNORED_DIRS.join(',')}}/**`,
      50
    );

    for (const file of files) {
      const relPath = path.relative(rootUri.fsPath, file.fsPath);
      projectInfo.relevantFiles.push(relPath);

      const ext = path.extname(file.fsPath).toLowerCase();
      if (['.js', '.jsx'].includes(ext)) projectInfo.languages.add('javascript');
      else if (['.ts', '.tsx'].includes(ext)) projectInfo.languages.add('typescript');
      else if (ext === '.java') projectInfo.languages.add('java');
      else if (ext === '.py') projectInfo.languages.add('python');
      else if (['.c', '.h'].includes(ext)) projectInfo.languages.add('c');
      else if (['.cpp', '.cc', '.cxx'].includes(ext)) projectInfo.languages.add('cpp');
      else if (ext === '.dart') projectInfo.languages.add('dart');
      else if (ext === '.php') projectInfo.languages.add('php');

      // Identify potential entry points
      const baseName = path.basename(file.fsPath).toLowerCase();
      if (['index.js', 'main.js', 'server.js', 'app.js', 'main.py', 'app.py', 'main.dart', 'index.php'].includes(baseName) ||
          baseName.endsWith('application.java')) {
        projectInfo.entryPoints.push(relPath);
      }
    }

    // Check dirty (changed) unsaved documents
    const openDocs = vscode.workspace.textDocuments;
    for (const doc of openDocs) {
      if (doc.isDirty && !doc.isUntitled) {
        projectInfo.changedFiles.push(path.relative(rootUri.fsPath, doc.fileName));
      }
    }

    return {
      ...projectInfo,
      languages: Array.from(projectInfo.languages)
    };
  }

  async detectManifests(rootPath, projectInfo) {
    const checkFile = (filename) => fs.existsSync(path.join(rootPath, filename));

    if (checkFile('package.json')) {
      projectInfo.projectTypes.push('Node.js / npm');
      try {
        const pkg = JSON.parse(fs.readFileSync(path.join(rootPath, 'package.json'), 'utf8'));
        projectInfo.dependencies.npm = Object.keys(pkg.dependencies || {}).slice(0, 15);
      } catch (e) {
        // ignore parse errors
      }
    }

    if (checkFile('pom.xml')) {
      projectInfo.projectTypes.push('Java Maven');
    } else if (checkFile('build.gradle') || checkFile('build.gradle.kts')) {
      projectInfo.projectTypes.push('Java Gradle');
    }

    if (checkFile('requirements.txt') || checkFile('pyproject.toml') || checkFile('Pipfile')) {
      projectInfo.projectTypes.push('Python');
    }

    if (checkFile('pubspec.yaml')) {
      projectInfo.projectTypes.push('Dart / Flutter');
    }

    if (checkFile('composer.json')) {
      projectInfo.projectTypes.push('PHP Composer');
    }

    if (checkFile('CMakeLists.txt') || checkFile('Makefile')) {
      projectInfo.projectTypes.push('C / C++');
    }
  }
}

module.exports = new WorkspaceScanner();
