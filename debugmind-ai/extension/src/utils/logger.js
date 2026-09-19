const vscode = require('vscode');

class Logger {
  constructor() {
    this.channel = vscode.window.createOutputChannel('DebugMind AI');
  }

  log(message, context = null) {
    const timestamp = new Date().toISOString();
    let entry = `[${timestamp}] [INFO] ${message}`;
    if (context) {
      entry += ` ${this.sanitize(context)}`;
    }
    this.channel.appendLine(entry);
  }

  warn(message, context = null) {
    const timestamp = new Date().toISOString();
    let entry = `[${timestamp}] [WARN] ${message}`;
    if (context) {
      entry += ` ${this.sanitize(context)}`;
    }
    this.channel.appendLine(entry);
  }

  error(message, error = null) {
    const timestamp = new Date().toISOString();
    let entry = `[${timestamp}] [ERROR] ${message}`;
    if (error) {
      const errText = error instanceof Error ? error.stack || error.message : JSON.stringify(error);
      entry += ` - ${this.sanitize(errText)}`;
    }
    this.channel.appendLine(entry);
  }

  show() {
    this.channel.show(true);
  }

  sanitize(input) {
    if (!input) return '';
    let text = typeof input === 'string' ? input : JSON.stringify(input);
    // Redact potential API keys or secrets
    text = text.replace(/AIza[0-9A-Za-z\-_]{35}/g, '[REDACTED_API_KEY]');
    text = text.replace(/(api[_-]?key[:=]\s*)["']?[a-zA-Z0-9_\-]+["']?/gi, '$1[REDACTED]');
    text = text.replace(/(password[:=]\s*)["']?[^\s"']+["']?/gi, '$1[REDACTED]');
    return text;
  }
}

module.exports = new Logger();
