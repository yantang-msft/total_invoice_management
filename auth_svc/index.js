const express = require("express");
const expressWinston = require("express-winston");
const logging = require('../logging');
const activities = require('../activities');

const app = express();
const router = express.Router();
const logger = logging.TimDebugLogger();

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
  logger.info(`auth_svc listening on ${port}`, {port:port});
})