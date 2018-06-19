
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
const logging = require('../logging');

const app = express();
const router = express.Router();
const logger = logging.TimConsoleLogger();

router.use((req, res) => {  
  if (req.header('authorization') === process.env.TOKEN) {
    res.json({
      ok: true
    })
  } else {
    res.status(401).json({
      ok: false
    })
  }
})

const port = process.env.PORT || 8080

app.use(router);

app.listen(port, () => {
  logger.info(`auth_svc listening on ${port}`, {port:port});
})