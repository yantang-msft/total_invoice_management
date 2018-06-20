
const appInsights = require('applicationinsights');
appInsights.setup(process.env.INSTRUMENTATION_KEY)
  .setAutoCollectConsole(true)
  .setAutoCollectDependencies(true)
  .setAutoCollectExceptions(true)
  .setAutoCollectRequests(true)
  .setAutoDependencyCorrelation(true)
  .setUseDiskRetryCaching(false)
  .start();

const http = require('http');
const httpProxy = require('http-proxy');
const stream_util = require('mississippi');
const logging = require('../logging');

const logger = logging.TimConsoleLogger();

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
        // Handle timeouts
        upstreamReq.on('abort', () => {
          res.writeHead(502);
          res.end("Upstream request timed out");
        });
    });

    proxy.on('error', (err, req, res) => {
        logger.error("ProxyServer: unexpected error when proxying request", err);
        res.writeHead(500);
        res.end("Unexpected error proxying request");
    });

    const server = http.createServer(function(req, res) {
        proxy.web(req, res, { target: ambassadorUrl }, err => {
            logger.error("ProxyServer.web: unexpected error when proxying request", err);
            res.writeHead(500);
            res.end("Unexpected error proxying request");
        });
    });

    const port = process.env.PORT || 8080;
    logger.info(`entry_svc listening on ${port}`, {port: port});
    server.listen(port);
}