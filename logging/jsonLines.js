
const got = require('got');
const util = require('util');
const winston = require('winston');

const JsonLines = winston.transports.JsonLines = function(opt) {
  opt = opt || {};
  if (!opt.url) throw new Error('JsonLines: must provide URL');

  winston.Transport.call(this, opt);

  this.name = 'jsonLines';
  this.url = opt.url;
  this.http = opt.http || {};
  this.rewriter = opt.rewriter || {};
};

util.inherits(JsonLines, winston.Transport);

JsonLines.prototype.name = 'jsonLines';

JsonLines.prototype.log = function log(level, message, meta, callback) {
  if (this.silent) {
    return callback(null, true);
  }

  const headers = Object.assign({}, {'content-type': 'application/json'}, this.http.headers);

  let bodySource = {};
  if (this.rewriter) {
    bodySource = this.rewriter(level, message, meta);
  }
  else {
    bodySource = Object.assign({level, message}, meta);
  }

  const body = JSON.stringify(bodySource);

  return got(this.url, Object.assign({ method: 'POST' }, this.http, { headers, body }))
    .then(callback.bind(null, null)).catch(callback);
};

module.exports = JsonLines;