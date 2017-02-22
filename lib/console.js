'use strict';

exports.defaults = {
  timestamp: true
}
exports.log = function(options, tags, message) {

  const ts = options.timestamp ? `${new Date().toLocaleTimeString()} ` : '';
  const tagStr = `[${tags.join(',')}]`;
  const messageStr = (typeof message === 'string') ? message : JSON.stringify(message);
  const out = `${ts}${tagStr} ${messageStr}`;
  return out;
};
