const path = require('path');

const EXTENSION_MAP = {
  '.java': 'java',
  '.js': 'javascript',
  '.mjs': 'javascript',
  '.cjs': 'javascript',
  '.jsx': 'javascript',
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.py': 'python',
  '.pyw': 'python',
  '.c': 'c',
  '.h': 'c',
  '.cpp': 'cpp',
  '.cc': 'cpp',
  '.cxx': 'cpp',
  '.hpp': 'cpp',
  '.dart': 'dart',
  '.php': 'php',
  '.phtml': 'php'
};

const LANGUAGE_ID_MAP = {
  'java': 'java',
  'javascript': 'javascript',
  'javascriptreact': 'javascript',
  'typescript': 'typescript',
  'typescriptreact': 'typescript',
  'python': 'python',
  'c': 'c',
  'cpp': 'cpp',
  'dart': 'dart',
  'php': 'php'
};

const DEFAULT_FRAMEWORKS = {
  'java': 'junit',
  'javascript': 'jest',
  'typescript': 'jest',
  'python': 'pytest',
  'c': 'unity',
  'cpp': 'gtest',
  'dart': 'flutter_test',
  'php': 'phpunit'
};

class LanguageDetector {
  detect(document) {
    if (!document) return 'unknown';

    if (document.languageId && LANGUAGE_ID_MAP[document.languageId.toLowerCase()]) {
      return LANGUAGE_ID_MAP[document.languageId.toLowerCase()];
    }

    const fileName = document.fileName || (typeof document === 'string' ? document : '');
    const ext = path.extname(fileName).toLowerCase();
    if (EXTENSION_MAP[ext]) {
      return EXTENSION_MAP[ext];
    }

    return 'unknown';
  }

  detectFramework(language, projectFiles = []) {
    const lang = (language || '').toLowerCase();
    const filesStr = projectFiles.join(' ').toLowerCase();

    if (lang === 'javascript' || lang === 'typescript') {
      if (filesStr.includes('vitest.config')) return 'vitest';
      if (filesStr.includes('mocha') || filesStr.includes('.mocharc')) return 'mocha';
      return 'jest';
    }

    if (lang === 'python') {
      if (filesStr.includes('unittest') && !filesStr.includes('pytest')) return 'unittest';
      return 'pytest';
    }

    if (lang === 'java') {
      return 'junit';
    }

    if (lang === 'dart') {
      return 'flutter_test';
    }

    if (lang === 'php') {
      return 'phpunit';
    }

    return DEFAULT_FRAMEWORKS[lang] || 'generic';
  }
}

module.exports = new LanguageDetector();
