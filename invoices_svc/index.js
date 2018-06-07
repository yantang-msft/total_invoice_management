const express = require("express")
const request = require("request-promise")
const expressWinston = require("express-winston")
const logging = require('../logging')

const app = express();
const router = express.Router();
const logger = logging.TimHttpLogger();

const addExpectedDate = async invoice => {
  try {
    const { expectedDate } = await request(`${process.env.EXPECTED_DATE_URI}/api/expected-date/${invoice.id}`, {
      json: true
    })

    return Object.assign({}, invoice, { expectedDate })
  } catch (error) {
    logger.warn('Failed to add expected date', error);

    return invoice
  }
}

router.get("/api/invoices/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
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

    res.json(invoice)
  } catch (error) {
    next(error)
  }
})

const port = process.env.PORT || 8080

app.use(expressWinston.logger({
  winstonInstance: logger,
  level: logging.loggingLevel,
  colorize: false
}));

app.use(router);

app.use(expressWinston.errorLogger({
  winstonInstance: logger
}));

app.listen(port, () => {
  logger.info(`invoices_svc listening on ${port}`, {port: port})
})