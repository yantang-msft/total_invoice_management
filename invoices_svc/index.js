const express = require("express");
const request = require("request-promise");
const expressWinston = require("express-winston");
const logging = require('../logging');
const activities = require('../activities');

const app = express();
const router = express.Router();
const logger = logging.TimDebugLogger();
let expectedDateUri = process.env.EXPECTED_DATE_URI;
if (expectedDateUri && expectedDateUri.endsWith('/')) {
  expectedDateUri = expectedDateUri.substr(0, expectedDateUri.length - 1);
}

const addExpectedDate = async (invoice, activityId) => {
  try {
    let options = {
      uri: `${expectedDateUri}/api/expected-date/${invoice.id}`,
      json: true, // Automatically parses JSON string in the response
      headers: { }
    };
    options.headers[activities.RequestIdHeader] = activityId.getChildId();

    const { expectedDate } = await request(options);
    return Object.assign({}, invoice, { expectedDate })
  } 
  catch (error) {
    logger.warn('Failed to add expected date', activityId.addRequestIdProperties(error));

    return invoice
  }
}

router.get("/api/invoices/:id", async (req, res, next) => {
  const activityId = activities.getRequestActivityId(req);

  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).send(activityId.addRequestIdProperties({error: 'Invoice id is invalid'}));
    return;
  }

  try {
    const invoice = await addExpectedDate({
      id: id,
      ref: `INV-${id}`,
      amount: id * 100,
      balance: (id * 100) - 10,
      ccy: "GBP"
    }, activityId);

    res.json(invoice);
  } 
  catch (error) {
    next(activityId.addRequestIdProperties(error));
  }
});

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
  logger.info(`invoices_svc listening on ${port}`, {port: port})
})