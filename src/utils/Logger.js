export class Logger {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === "development";
  }

  info(message) {
    console.log(`ℹ️  ${message}`);
  }

  success(message) {
    console.log(`✅ ${message}`);
  }

  warning(message) {
    console.warn(`⚠️  ${message}`);
  }

  error(message, error = null) {
    console.error(`❌ ${message}`);
    if (error && this.isDevelopment) {
      console.error(error.stack);
    }
  }

  debug(message) {
    if (this.isDevelopment) {
      console.log(`🐛 ${message}`);
    }
  }

  logDiff(diff) {
    if (this.isDevelopment) {
      console.log("📝 Staged changes:");
      console.log(diff);
      console.log("---");
    }
  }
}

// Singleton instance
let loggerInstance = null;

export function getLogger() {
  if (!loggerInstance) {
    loggerInstance = new Logger();
  }
  return loggerInstance;
}

export default getLogger;
