const winston = require("winston")
const winstonEndpoint = require("winston-endpoint")

const loggingLevel = 'debug';

function TimConsoleLogger() {
  return logger( [consoleTransport()] );
}

function TimHttpLogger() {
  return logger( [httpTransport()] );
}

function TimDebugLogger() {
  return logger([
    consoleTransport(),
    httpTransport()
  ]);
}

function logger(transports) {
  let logger = new winston.Logger({
    transports: transports
  });
  logger.level = loggingLevel;
  logger.emitErrs = false; // Do not emit error events from logger infrastructure
  logger.rewriters = [(level, msg, meta) => {
    meta.timestamp = new Date().toISOString();
    return meta;
  }];
  return logger;
}

function consoleTransport() {
  return new winston.transports.Console({
    level: loggingLevel,
    timestamp: false,
    json: true,
    stringify: true,
    stderrLevels: [] // Output everything to stdout
  });
}

function httpTransport() {
  return new winstonEndpoint({
    url: "http://localhost:8887/ApplicationInsightsHttpChannel",
    json: true,
    level: loggingLevel
  });
}

module.exports.loggingLevel = loggingLevel;
module.exports.TimConsoleLogger = TimConsoleLogger;
module.exports.TimHttpLogger = TimHttpLogger;
module.exports.TimDebugLogger = TimDebugLogger;
