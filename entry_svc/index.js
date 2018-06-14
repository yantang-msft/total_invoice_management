const http = require('http');
const httpProxy = require('http-proxy');
const stream_util = require('mississippi');
const logging = require('../logging');
const ActivityId = require('../activity_id');

const logger = logging.TimDebugLogger();

let ambassadorUrl = process.env.AMBASSADOR_URI;
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
        logger.info(`Added request ID ${activityId.id} to request '${clientReq.method} ${clientReq.path}'`); 
    });

    proxy.on('proxyRes', function (proxyRes, req, res) {
      let bodyHandler = stream_util.concat((data) => {
        logger.info(`Response for request ${proxyRes.headers["Request-Id"]}: status ${proxyRes.statusCode} ${data}`);
      });
      
      stream_util.pipe(proxyRes, bodyHandler, (error) => {});
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