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
    });

    proxy.on('proxyRes', function (proxyRes, req, res) {
      let bodyHandler = stream_util.concat((data) => {
        let log = undefined;
        let message = "";

        if (proxyRes.statusCode < 300) {
            log = logger.info;
            message = `entry_svc: request ${req.requestId} was successful`;
        }
        else if (proxyRes.statusCode >=400 && proxyRes.statusCode < 500) {
            log = logger.info;
            message = `entry_svc: request ${req.requestId} was a failure`;
        }
        else if (proxyRes.statusCode >= 500) {
            log = logger.warn;
            message = `entry_svc: request ${req.requestId} was a failure`;
        }

        if (log) {
          const dataStr = data.toString('utf8');
          const meta = req.activityId.addRequestIdProperties({
            statusCode: proxyRes.statusCode,
            data: dataStr
          });

          log(message, meta);
        }
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