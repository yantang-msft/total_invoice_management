const winston = require("winston");
const JsonLines = require('./jsonLines');

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

const messageIntoLogRewriter = (level, message, meta) => {
  return Object.assign({
    level: level,
    log: message
  }, meta);
};

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
  return new JsonLines({
    url: "http://localhost:8887/ApplicationInsightsHttpChannel",
    level: loggingLevel,
    rewriter: messageIntoLogRewriter
  });
}

module.exports.loggingLevel = loggingLevel;
module.exports.TimConsoleLogger = TimConsoleLogger;
module.exports.TimHttpLogger = TimHttpLogger;
module.exports.TimDebugLogger = TimDebugLogger;
