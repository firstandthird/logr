var lg = require('../')('app');

/* console is enabled by default
lg.use(lg.adaptors.console({
  //color: false
}));
*/

//custom adaptor for error levels (could be email or some sort of push notification)
lg.use(function(module, level, message, data) {
  console.error('FIX THIS NOW: ' + message);
}, 'ERROR');

lg.debug('starting up');
require('./module');
lg.info('this is from the app');
lg.error('oh no!!!!!');
lg.info('test json data', { test: 1, woot: 2 });
