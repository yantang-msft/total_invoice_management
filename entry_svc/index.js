
const appInsights = require('../ai_setup');
appInsights.start();

const express = require("express");
const request = require("request-promise");
const logging = require('../logging');

const app = express();
const router = express.Router();
const logger = logging.TimConsoleLogger();

let authUrl = process.env.AUTH_URI;
let invoiceUrl = process.env.INVOICE_URI;
if (!authUrl) {
    logger.error("Upstream service (auth) URI not set");
    process.exitCode = 1;
}
if (!invoiceUrl) {
    logger.error("Upstream service (invoice) URI not set");
    process.exitCode = 1;
}

const doAuthentication = async (req) => {
    try {
        console.log(req.headers)
        let options = {
            uri: `${authUrl}`,
            json: true,
            headers: req.headers
        };

        await request(options);
        return true;
    }
    catch (error) {
        logger.warn('Failed to do authentication', error);

        return false;
    }
}

router.get("/invoices/:id", async (req, res, next) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        res.status(400).send({ error: 'Invoice id is invalid' });
        return;
    }

    if (await doAuthentication(req)) {
        try {
            console.log(req.headers)
            let options = {
                uri: `${invoiceUrl}/api/invoices/${id}`,
                json: true,
                headers: req.headers
            };

            let invoice = await request(options);
            res.json(invoice);
        }
        catch (error) {
            request.status(500).json({message: error});
        }
    } else {
        res.status(401).json({message: "Authentication Failed"});
    }
});

const port = process.env.PORT || 8080

app.use(router);

app.listen(port, () => {
    logger.info(`entry_svc listening on ${port}`, {port: port})
})
