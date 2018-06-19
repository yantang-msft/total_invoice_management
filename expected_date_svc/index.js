
const appInsights = require('applicationinsights');
appInsights.setup(process.env.INSTRUMENTATION_KEY)
  .setAutoCollectConsole(true)
  .setAutoCollectDependencies(true)
  .setAutoCollectExceptions(true)
  .setAutoCollectRequests(true)
  .setAutoDependencyCorrelation(true)
  .setUseDiskRetryCaching(false)
  .start();

const express = require("express");
const moment = require("moment");
const logging = require('../logging');

const app = express()
const router = express.Router();
const logger = logging.TimConsoleLogger();

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

app.use(router);

app.listen(port, () => {
  logger.info(`expected_date_svc listening on ${port}`, {port:port})
})
