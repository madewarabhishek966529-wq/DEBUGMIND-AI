const assert = require('assert');
const languageDetector = require('../../src/utils/languageDetector');
const staticAnalyzer = require('../../src/utils/staticAnalyzer');
const diffService = require('../../src/services/diffService');

describe('DebugMind AI - Extension Unit Tests', () => {
  describe('LanguageDetector', () => {
    it('should detect languages from file extensions correctly', () => {
      assert.strictEqual(languageDetector.detect({ fileName: 'UserService.java' }), 'java');
      assert.strictEqual(languageDetector.detect({ fileName: 'app.js' }), 'javascript');
      assert.strictEqual(languageDetector.detect({ fileName: 'index.ts' }), 'typescript');
      assert.strictEqual(languageDetector.detect({ fileName: 'script.py' }), 'python');
      assert.strictEqual(languageDetector.detect({ fileName: 'main.c' }), 'c');
      assert.strictEqual(languageDetector.detect({ fileName: 'server.cpp' }), 'cpp');
      assert.strictEqual(languageDetector.detect({ fileName: 'widget.dart' }), 'dart');
      assert.strictEqual(languageDetector.detect({ fileName: 'index.php' }), 'php');
    });

    it('should map testing frameworks according to language', () => {
      assert.strictEqual(languageDetector.detectFramework('java'), 'junit');
      assert.strictEqual(languageDetector.detectFramework('javascript'), 'jest');
      assert.strictEqual(languageDetector.detectFramework('python'), 'pytest');
      assert.strictEqual(languageDetector.detectFramework('dart'), 'flutter_test');
      assert.strictEqual(languageDetector.detectFramework('php'), 'phpunit');
    });
  });

  describe('StaticAnalyzer Heuristics', () => {
    it('should detect SQL injection concatenation', () => {
      const mockDoc = {
        uri: { toString: () => 'file:///test.js' },
        getText: () => 'const query = "SELECT * FROM users WHERE id = " + userId;'
      };
      // Mock vscode.languages.getDiagnostics
      const vscode = require('vscode');
      vscode.languages = vscode.languages || {};
      vscode.languages.getDiagnostics = () => [];

      const findings = staticAnalyzer.collectFindings(mockDoc, 'javascript');
      const sqlFinding = findings.find(f => f.code === 'SEC-SQL-CONCAT');
      assert.ok(sqlFinding, 'Should flag SQL injection via concatenation');
      assert.strictEqual(sqlFinding.severity, 'HIGH');
    });

    it('should detect hardcoded secrets', () => {
      const mockDoc = {
        uri: { toString: () => 'file:///config.js' },
        getText: () => 'const api_key = "AIzaSyDxyz123456789SecretKey";'
      };
      const findings = staticAnalyzer.collectFindings(mockDoc, 'javascript');
      const secretFinding = findings.find(f => f.code === 'SEC-HARDCODED-SECRET');
      assert.ok(secretFinding, 'Should flag hardcoded secret');
      assert.strictEqual(secretFinding.severity, 'HIGH');
    });

    it('should detect empty catch blocks', () => {
      const mockDoc = {
        uri: { toString: () => 'file:///service.js' },
        getText: () => 'try { doSomething(); } catch (err) {}'
      };
      const findings = staticAnalyzer.collectFindings(mockDoc, 'javascript');
      const catchFinding = findings.find(f => f.code === 'ERR-EMPTY-CATCH');
      assert.ok(catchFinding, 'Should flag empty catch block');
    });
  });

  describe('DiffService Line Editing', () => {
    it('should replace lines correctly based on edit ranges', () => {
      const original = 'line 1\nuser.getName();\nline 3';
      const edits = [
        {
          startLine: 2,
          endLine: 2,
          replacement: 'if (user != null) {\n  user.getName();\n}'
        }
      ];

      const patched = diffService.applyEditsToText(original, edits);
      assert.ok(patched.includes('if (user != null) {'));
      assert.ok(patched.includes('line 1'));
      assert.ok(patched.includes('line 3'));
    });
  });
});
