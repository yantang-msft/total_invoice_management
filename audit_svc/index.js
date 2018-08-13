
const appInsights = require('../ai_setup');
appInsights.start();

const express = require("express");
const request = require("request-promise");
const logging = require('../logging');

const app = express();
const router = express.Router();
const logger = logging.TimConsoleLogger();

let invoices = {}

router.post("/api/invoices/:id", (req, res, next) => {
    logger.info(`Creating invoice with id ${req.params.id}`);
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        res.status(400).send({error: 'Invoice id is invalid'});
        return;
    }

    if (invoices[id]) {
        logger.error(`Invoice with id ${id} already exists!`);
        throw new Error(`Invoice with id ${id} already exists!`);
    } else {
        invoices[id] = true;
        res.json({totalInvoices: Object.keys(invoices).length});
    }
});

router.delete("/api/invoices/:id", (req, res, next) => {
    logger.info(`Deleting invoice with id ${req.params.id}`);
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        res.status(400).send({error: 'Invoice id is invalid'});
        return;
    }

    if (!invoices[id]) {
        logger.error(`Invoice with id ${id} doesn't exist!`);
        throw new Error(`Invoice with id ${id} doesn't exist!`);
    } else {
        delete invoices[id];
        res.json({totalInvoices: Object.keys(invoices).length});
    }
});

router.get("/api/invoices", (req, res, next) => {
    logger.info(`Getting all invoices`);
    // There is some problem with the services, it takes relatively long to get the list of invoices
    setTimeout(() => {
        let ret = Object.keys(invoices);
        res.json({invoices: ret});
    }, 5000);
})

const port = process.env.PORT || 8080

app.use(router);

app.listen(port, () => {
  logger.info(`audit_svc listening on ${port}`, {port: port})
})