const http = require('http');
const httpProxy = require('http-proxy');
const logging = require('../logging');
const ActivityId = require('../activity_id');

const ambassadorUrl = process.env.AMBASSADOR_URI;
const logger = logging.TimHttpLogger();

if (!ambassadorUrl) {
    logger.error("Upstream service (ambassador) URI not set");
    process.exitCode = 1;
}
else {
    const proxy = httpProxy.createProxyServer({});

    proxy.on('proxyReq', (clientReq, incomingMsg, response, options) => {
        // Disregard Request-Id even if present on client request 
        // (we do not trust external clients to set request IDs properly)
        let activityId = new ActivityId();
        clientReq.setHeader("Request-Id", activityId.id);
    });

    const server = http.createServer(function(req, res) {
        proxy.web(req, res, {
            target: ambassadorUrl
        });
    });

    const port = process.env.PORT || 8080;
    logger.info(`entry_svc listening on ${port}`, {port: port});
    server.listen(port);
}