
const appInsights = require('../ai_setup');
appInsights.start();

const express = require("express");
const request = require("request-promise");
const logging = require('../logging');

const app = express();
const router = express.Router();
const logger = logging.TimConsoleLogger();
let expectedDateUri = process.env.EXPECTED_DATE_URI;
if (expectedDateUri && expectedDateUri.endsWith('/')) {
  expectedDateUri = expectedDateUri.substr(0, expectedDateUri.length - 1);
}

const addExpectedDate = async (invoice) => {
  try {
    let options = {
      uri: `${expectedDateUri}/api/expected-date/${invoice.id}`,
      json: true, // Automatically parses JSON string in the response
      headers: { }
    };

    const { expectedDate } = await request(options);
    return Object.assign({}, invoice, { expectedDate })
  } 
  catch (error) {
    logger.warn('Failed to add expected date', error);

    return invoice
  }
}

router.get("/api/invoices/:id", async (req, res, next) => {

  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).send({error: 'Invoice id is invalid'});
    return;
  }

  try {
    const invoice = await addExpectedDate({
      id: id,
      ref: `INV-${id}`,
      amount: id * 100,
      balance: (id * 100) - 10,
      ccy: "GBP"
    });

    res.json(invoice);
  } 
  catch (error) {
    next(error);
  }
});

const port = process.env.PORT || 8080

app.use(router);

app.listen(port, () => {
  logger.info(`invoices_svc listening on ${port}`, {port: port})
})