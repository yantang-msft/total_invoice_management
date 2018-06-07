const winston = require("winston")

const loggingLevel = 'debug';

function TimConsoleLogger() {
    let logger = new winston.Logger({
      transports: [
        consoleTransport()
      ]
    });
    logger.level = loggingLevel;
    logger.emitErrs = false; // Do not emit error events from logger infrastructure
    return logger;
}

function TimHttpLogger() {
  let logger = new winston.Logger({
    transports: [
      httpTransport()
    ]
  });
  logger.level = loggingLevel;
  logger.emitErrs = false; // Do not emit error events from logger infrastructure
  return logger;
}

function TimDebugLogger() {
  let logger = new winston.Logger({
    transports: [
      consoleTransport(),
      httpTransport()
    ]
  });
  logger.level = loggingLevel;
  logger.emitErrs = false; // Do not emit error events from logger infrastructure
  return logger;
}

function consoleTransport() {
  return new winston.transports.Console({
    level: loggingLevel,
    timestamp: true,
    json: true,
    stringify: true,
    stderrLevels: [] // Output everything to stdout
  });
}

function httpTransport() {
  return new winston.transports.Http({
    port: 8887,
    path: "/ApplicationInsightsHttpChannel"
  });
}

module.exports.loggingLevel = loggingLevel;
module.exports.TimConsoleLogger = TimConsoleLogger;
module.exports.TimHttpLogger = TimHttpLogger;
module.exports.TimDebugLogger = TimDebugLogger;
