const express = require("express")
const request = require("request-promise")
const winston = require("winston")

const app = express()

var logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      level: 'debug',
      timestamp: true,
      json: true,
      stringify: true,
      stderrLevels: [] // Output everything to stdout
    })
  ]
});
logger.emitErrs = false; // Do not emit error events from logger infrastructure

const addExpectedDate = async invoice => {
  try {
    const { expectedDate } = await request(`${process.env.EXPECTED_DATE_URI}/api/expected-date/${invoice.id}`, {
      json: true
    })

    return Object.assign({}, invoice, { expectedDate })
  } catch (error) {
    logger.warn('Failed to add expected date', {
      error: error
    });

    return invoice
  }
}

app.get("/api/invoices/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      logger.debug('Request failure', {
        status: '400 Bad Request',
        invoice_id: req.params.id,
        details: 'Invoice id is invalid'
      })

      res.status(400).send({error: 'Invoice id is invalid'})
      return
    }

    const invoice = await addExpectedDate({
      id: id,
      ref: `INV-${id}`,
      amount: id * 100,
      balance: (id * 100) - 10,
      ccy: "GBP"
    })

    logger.debug('Request success', {
      status: '200 OK',
      invoice_id: req.params.id,
      invoice: invoice
    })

    res.json(invoice)
  } catch (error) {
    logger.warn('Unexpected error occurred while processing request for invoice', {
      status: '500 Internal Server Error',
      invoice_id: req.params.id,
      error: error
    })

    next(error)
  }
})

const port = process.env.PORT || 8080

app.listen(port, () => {
  logger.info(`invoices_svc listening on ${port}`, {port: port})
})