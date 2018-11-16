/* eslint-disable no-console */
const tap = require('tap');
const Logr = require('../');
const wreck = require('wreck');
const Hapi = require('hapi');

tap.runOnly = true;

tap.test('handle wreck errors', async t => {
  const server = new Hapi.Server({ port: 8080 });
  await server.start();
  let first = true;
  const logr = new Logr({
    unhandledRejection: true,
    reporters: {
      test(options, tags, message) {
        if (first) {
          first = false;
          t.equal(tags[0], 'error');
          t.match(message, {
            message: 'Response Error: 404  Not Found',
            statusCode: 404,
            payload: undefined
          });
        } else {
          t.notEqual(tags[0], 'error');
          t.match(message, {
            error: {
              message: 'Response Error: 404  Not Found',
              statusCode: 404,
              payload: undefined
            }
          });
        }
      }
    }
  });
  try {
    await wreck.get('http://localhost:8080/', {});
  } catch (e) {
    logr.log(e);
    logr.log({ error: e });
  }
  setTimeout(async () => {
    await server.stop();
    t.end();
  }, 2000);
});
