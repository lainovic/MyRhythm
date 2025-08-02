// Shared logger utility for the application

export type LogLevel = "debug" | "info" | "warn" | "error" | "trace";

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
  private enableTrace = import.meta.env.VITE_ENABLE_TRACE_LOGGING === "true";

  private getColorForLevel(level: LogLevel): string {
    switch (level) {
      case "error":
        return "color: #dc2626; font-weight: bold;";
      case "warn":
        return "color: #d97706; font-weight: bold;";
      case "info":
        return "color: #2563eb; font-weight: bold;";
      case "debug":
        return "color: #059669; font-weight: bold;";
      case "trace":
        return "color: #6b7280; font-weight: bold;";
      default:
        return "color: inherit;";
    }
  }

  private formatColoredMessage(
    level: LogLevel,
    message: string,
    context?: string,
  ): { message: string; style: string } {
    const timestamp = new Date().toISOString();
    const contextStr = context ? `${context}` : "";
    const emoji = getEmojiForLevel(level);
    const color = this.getColorForLevel(level);

    return {
      message: `${emoji} ${timestamp} ${level.toUpperCase()} [${contextStr}] ${message}`,
      style: color,
    };
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
      const { message: formattedMessage, style } = this.formatColoredMessage(
        "debug",
        message,
        context,
      );
      console.debug(`%c${formattedMessage}`, style, data);
    }
  }

  info(message: string, data?: any, context?: string) {
    this.addLog("info", message, data, context);
    if (this.isDevelopment) {
      const { message: formattedMessage, style } = this.formatColoredMessage(
        "info",
        message,
        context,
      );
      console.info(`%c${formattedMessage}`, style, data);
    }
  }

  warn(message: string, data?: any, context?: string) {
    this.addLog("warn", message, data, context);
    const { message: formattedMessage, style } = this.formatColoredMessage(
      "warn",
      message,
      context,
    );
    console.warn(`%c${formattedMessage}`, style, data);
  }

  error(message: string, data?: any, context?: string) {
    this.addLog("error", message, data, context);
    const { message: formattedMessage, style } = this.formatColoredMessage(
      "error",
      message,
      context,
    );
    console.error(`%c${formattedMessage}`, style, data);
  }

  trace(message: string, data?: any, context?: string) {
    this.addLog("trace", message, data, context);
    if (this.enableTrace) {
      const { message: formattedMessage, style } = this.formatColoredMessage(
        "trace",
        message,
        context,
      );
      console.log(`%c${formattedMessage}`, style, data);
    }
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

const getEmojiForLevel = (level: LogLevel) => {
  switch (level) {
    case "error":
      return "🔴";
    case "warn":
      return "⚠️";
    case "info":
      return "ℹ️";
    case "debug":
      return "🔍";
    case "trace":
      return "⚫";
    default:
      return "❓";
  }
};

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
