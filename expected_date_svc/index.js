const express = require("express");
const moment = require("moment");
const expressWinston = require("express-winston");
const logging = require('../logging');
const activities = require('../activities');

const app = express()
const router = express.Router();
const logger = logging.TimDebugLogger();

router.get("/api/expected-date/:invoiceId", (req, res) => {
  const invoiceId = parseInt(req.params.invoiceId)

  // ¯\_(ツ)_/¯
  const bump = Math.floor(Math.random() * 10) + 1

  const expectedDate = moment().add(bump, 'days').toISOString()

  res.json({
    invoiceId,
    expectedDate
  })
})

const port = process.env.PORT || 8080;

const getRequestIdProperties = (req, _) => {
  const activityId = activities.getRequestActivityId(req);
  const requestIdProperties = activityId.addRequestIdProperties({});
  return requestIdProperties;
};

app.use(expressWinston.logger({
  winstonInstance: logger,
  level: logging.loggingLevel,
  colorize: false,
  dynamicMeta: getRequestIdProperties
}));

app.use(router);

app.use(expressWinston.errorLogger({
  winstonInstance: logger
}));

app.listen(port, () => {
  logger.info(`expected_date_svc listening on ${port}`, {port:port})
})
