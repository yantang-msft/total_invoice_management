const http = require('http');
const httpProxy = require('http-proxy');
const logging = require('../logging');

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
    });
}