const http = require('http');
const httpProxy = require('http-proxy');
const stream_util = require('mississippi');
const logging = require('../logging');
const activities = require('../activities');

const logger = logging.TimDebugLogger();

let ambassadorUrl = process.env.AMBASSADOR_URI;
if (!ambassadorUrl) {
    logger.error("Upstream service (ambassador) URI not set");
    process.exitCode = 1;
}
else {
    const proxy = httpProxy.createProxyServer({
      proxyTimeout: 5000
    });

    proxy.on('proxyReq', (upstreamReq, req, res, options) => {
        // Disregard Request-Id even if present on client request 
        // (we do not trust external clients to set request IDs properly)
        let activityId = new activities.ActivityId();
        let requestId = activityId.getChildId();
        upstreamReq.setHeader(activities.RequestIdHeader, requestId);

        // Handle timeouts
        upstreamReq.on('abort', () => {
           res.writeHead(502);
          res.end("Upstream request timed out");
        });

        // Also add the activity ID and request ID to the request so we have it when processing the response
        req.activityId = activityId;
        req.requestId = requestId;

        logger.info(`Added request ID ${requestId} to request '${upstreamReq.method} ${upstreamReq.path}'`); 
    });

    proxy.on('proxyRes', function (proxyRes, req, res) {
      let bodyHandler = stream_util.concat((data) => {
        logger.info(`Response for request ${req.requestId}: status ${proxyRes.statusCode} ${data}`);
      });
      
      stream_util.pipe(proxyRes, bodyHandler, err => {});
    });

    proxy.on('error', (err, req, res) => {
        logger.error("ProxyServer: unexpected error when proxying request", {error: err, activityId: req.activityId.id});
        res.writeHead(500);
        res.end("Unexpected error proxying request");
    });

    const server = http.createServer(function(req, res) {
        proxy.web(req, res, { target: ambassadorUrl }, err => {
            logger.error("ProxyServer.web: unexpected error when proxying request", {error: err, activityId: req.activityId.id});
            res.writeHead(500);
            res.end("Unexpected error proxying request");
        });
    });

    const port = process.env.PORT || 8080;
    logger.info(`entry_svc listening on ${port}`, {port: port});
    server.listen(port);
}