const test = require('tap').test;
const Logr = require('../');
const wreck = require('wreck');
const Hapi = require('hapi');

test('handle wreck errors', async t => {
  const server = new Hapi.Server({ port: 8080 });
  await server.start();
  let first = true;
  const logr = new Logr({
    unhandledRejection: true,
    reporters: {
      test(options, tags, message) {
        t.equal(tags[0], 'error');
        if (first) {
          first = false;
          t.match(message, {
            message: 'Response Error: 404  Not Found',
            statusCode: 404,
            payload: undefined
          });
        } else {
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
