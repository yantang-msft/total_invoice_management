const winston = require("winston")

const loggingLevel = 'debug';

function TimConsoleLogger() {
    let logger = new winston.Logger({
        transports: [
          new winston.transports.Console({
            level: loggingLevel,
            timestamp: true,
            json: true,
            stringify: true,
            stderrLevels: [] // Output everything to stdout
          })
        ]
      });
      logger.emitErrs = false; // Do not emit error events from logger infrastructure
      return logger;
}

module.exports.loggingLevel = loggingLevel;
module.exports.TimConsoleLogger = TimConsoleLogger;
