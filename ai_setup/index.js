const appInsights = require('applicationinsights');

function start() {
  appInsights.setup(process.env.INSTRUMENTATION_KEY)
    .setAutoCollectConsole(true)
    .setAutoCollectDependencies(true)
    .setAutoCollectExceptions(true)
    .setAutoCollectRequests(true)
    .setAutoDependencyCorrelation(true)
    .setUseDiskRetryCaching(false);

  const aiContext = appInsights.defaultClient.context;
  aiContext.tags[aiContext.keys.cloudRole] = process.env.SOURCE_CONTAINER_NAME;
  aiContext.tags[aiContext.keys.cloudRoleInstance] = process.env.POD_NAME;

  if (process.env.APPLICATIONINSIGHTS_ENDPOINT) {
    appInsights.defaultClient.config.endpointUrl = process.env.APPLICATIONINSIGHTS_ENDPOINT;
  }

  appInsights.start();
}

module.exports.start = start;
