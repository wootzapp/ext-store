// Debug logger for development
export const DebugLogType = {
  BACKGROUND: 'BACKGROUND',
  CONTENT: 'CONTENT',
  OFFSCREEN: 'OFFSCREEN',
  POPUP: 'POPUP',
  CLAIM: 'CLAIM',
  PROOF: 'PROOF',
  NETWORK: 'NETWORK',
  GENERAL: 'GENERAL'
};

export class DebugLogger {
  constructor() {
    this.enabled = false;
    this.logs = [];
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }

  log(type, ...args) {
    if (!this.enabled) return;
    
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      type,
      args
    };
    
    this.logs.push(logEntry);
  }

  info(type, ...args) {
    this.log(type, ...args);
  }

  warn(type, ...args) {
    this.log(type, ...args);
  }

  error(type, ...args) {
    this.log(type, ...args);
  }

  getLogs() {
    return this.logs;
  }

  clear() {
    this.logs = [];
  }
}

export const debugLogger = new DebugLogger(); 