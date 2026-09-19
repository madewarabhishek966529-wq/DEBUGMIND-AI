const vscode = require('vscode');
const http = require('http');
const https = require('https');
const { URL } = require('url');
const logger = require('../utils/logger');

class BackendClient {
  getBaseUrl() {
    const config = vscode.workspace.getConfiguration('debugmind');
    return config.get('backendUrl', 'http://localhost:8080').replace(/\/+$/, '');
  }

  request(endpoint, method = 'GET', data = null, timeoutMs = 30000) {
    return new Promise((resolve, reject) => {
      const baseUrl = this.getBaseUrl();
      let fullUrl;
      try {
        fullUrl = new URL(baseUrl + endpoint);
      } catch (err) {
        return reject(new Error(`Invalid backend URL configured: "${baseUrl}"`));
      }

      const isHttps = fullUrl.protocol === 'https:';
      const client = isHttps ? https : http;

      const postData = data ? JSON.stringify(data) : null;
      const options = {
        hostname: fullUrl.hostname,
        port: fullUrl.port || (isHttps ? 443 : 80),
        path: fullUrl.pathname + fullUrl.search,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'DebugMind-VSCode-Extension/0.0.1'
        },
        timeout: timeoutMs
      };

      if (postData) {
        options.headers['Content-Length'] = Buffer.byteLength(postData);
      }

      const req = client.request(options, (res) => {
        let rawBody = '';
        res.setEncoding('utf8');

        res.on('data', (chunk) => {
          rawBody += chunk;
        });

        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const json = rawBody ? JSON.parse(rawBody) : {};
              resolve(json);
            } catch (err) {
              logger.error('Failed to parse backend JSON response', rawBody);
              reject(new Error(`Invalid JSON received from DebugMind backend (HTTP ${res.statusCode}).`));
            }
          } else {
            let errorMsg = `Backend request failed (HTTP ${res.statusCode})`;
            try {
              const errObj = JSON.parse(rawBody);
              if (errObj.message) errorMsg = errObj.message;
            } catch (e) {
              if (rawBody) errorMsg = `${errorMsg}: ${rawBody.slice(0, 200)}`;
            }
            reject(new Error(errorMsg));
          }
        });
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`Request timed out after ${timeoutMs / 1000}s while communicating with backend.`));
      });

      req.on('error', (err) => {
        if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
          reject(new Error(
            `DebugMind backend is unavailable.\n\nPlease make sure the backend is running at:\n${baseUrl}`
          ));
        } else {
          reject(new Error(`Backend network error: ${err.message}`));
        }
      });

      if (postData) {
        req.write(postData);
      }
      req.end();
    });
  }

  async checkHealth() {
    return this.request('/api/v1/health', 'GET', null, 5000);
  }

  async analyzeCode(requestPayload) {
    return this.request('/api/v1/analyze', 'POST', requestPayload, 45000);
  }

  async explainIssue(requestPayload) {
    return this.request('/api/v1/issues/explain', 'POST', requestPayload, 30000);
  }

  async generateFix(requestPayload) {
    return this.request('/api/v1/issues/fix', 'POST', requestPayload, 45000);
  }

  async generateTests(requestPayload) {
    return this.request('/api/v1/tests/generate', 'POST', requestPayload, 45000);
  }

  async analyzeError(requestPayload) {
    return this.request('/api/v1/errors/analyze', 'POST', requestPayload, 30000);
  }

  async verifyFix(requestPayload) {
    return this.request('/api/v1/fixes/verify', 'POST', requestPayload, 60000);
  }

  async getRecentAnalyses() {
    return this.request('/api/v1/analyses', 'GET', null, 10000);
  }
}

module.exports = new BackendClient();
