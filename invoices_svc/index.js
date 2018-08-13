
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
let auditUri = process.env.AUDIT_URI;
if (auditUri && auditUri.endsWith('/')) {
  auditUri = auditUri.substr(0, auditUri.length - 1);
}

const addExpectedDate = (invoice) => {
    let options = {
      uri: `${expectedDateUri}/api/expected-date/${invoice.id}`,
      json: true, // Automatically parses JSON string in the response
      headers: { }
    };

    return request(options).then((expectedDate) => {
      return Object.assign({}, invoice, expectedDate );
    }, (error) => {
      logger.warn('Failed to add expected date', error);
      return invoice;
    });
}

router.get("/api/invoices/:id", (req, res, next) => {

  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).send({error: 'Invoice id is invalid'});
    return;
  }

  addExpectedDate({
    id: id,
    ref: `INV-${id}`,
    amount: id * 100,
    balance: (id * 100) - 10,
    ccy: "GBP"
  }).then((invoice) => {
    res.json(invoice);
  }, (error) => {
    next(error);
  });
});

router.get("/api/invoices", (req, res, next) => {
  // This API is impatient and can't wait for more than 2 seconds
  res.setTimeout(2000);

  let options = {
    uri: `${auditUri}/api/invoices`,
    json: true
  };

  request(options).then((invoices) => {
    res.json(invoices);
  });
});

router.post("/api/invoices/:id", (req, res, next) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).send({error: 'Invoice id is invalid'});
    return;
  }

  let options = {
    method: 'POST',
    uri: `${auditUri}/api/invoices/${id}`,
    json: true
  };

  request(options).then((response) => {
    res.json(response);
  }, (err) => {
    res.status(400).send({error: err});
  });
});

router.delete("/api/invoices/:id", (req, res, next) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).send({error: 'Invoice id is invalid'});
    return;
  }

  let options = {
    method: 'DELETE',
    uri: `${auditUri}/api/invoices/${id}`,
    json: true
  };

  request(options).then((response) => {
    res.json(response);
  }, (err) => {
    res.status(400).send({error: err});
  });
});

const port = process.env.PORT || 8080

app.use(router);

app.listen(port, () => {
  logger.info(`invoices_svc listening on ${port}`, {port: port})
})