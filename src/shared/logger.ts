// Shared logger utility for the application

export type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  context?: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private isDevelopment = import.meta.env.DEV;

  private formatMessage(
    level: LogLevel,
    message: string,
    data?: any,
    context?: string,
  ): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? `[${context}]` : "";
    const dataStr = data ? ` ${JSON.stringify(data)}` : "";
    return `${timestamp} ${level.toUpperCase()} ${contextStr} ${message}${dataStr}`;
  }

  private addLog(
    level: LogLevel,
    message: string,
    data?: any,
    context?: string,
  ) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      context,
    };

    this.logs.push(entry);

    // Keep only last 1000 logs
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }
  }

  debug(message: string, data?: any, context?: string) {
    this.addLog("debug", message, data, context);
    if (this.isDevelopment) {
      console.debug(this.formatMessage("debug", message, data, context));
    }
  }

  info(message: string, data?: any, context?: string) {
    this.addLog("info", message, data, context);
    if (this.isDevelopment) {
      console.info(this.formatMessage("info", message, data, context));
    }
  }

  warn(message: string, data?: any, context?: string) {
    this.addLog("warn", message, data, context);
    console.warn(this.formatMessage("warn", message, data, context));
  }

  error(message: string, data?: any, context?: string) {
    this.addLog("error", message, data, context);
    console.error(this.formatMessage("error", message, data, context));
  }

  // Get all logs (useful for debugging)
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
  }

  // Export logs as JSON
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Create singleton instance
export const logger = new Logger();

// Convenience functions
export const log = {
  debug: (message: string, data?: any, context?: string) =>
    logger.debug(message, data, context),
  info: (message: string, data?: any, context?: string) =>
    logger.info(message, data, context),
  warn: (message: string, data?: any, context?: string) =>
    logger.warn(message, data, context),
  error: (message: string, data?: any, context?: string) =>
    logger.error(message, data, context),
};
