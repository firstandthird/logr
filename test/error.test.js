'use strict';
const test = require('tap').test;
const Logr = require('../');
const wreck = require('wreck');
const Hapi = require('hapi');

test('handle wreck errors', async t => {
  t.plan(2);
  const  server = new Hapi.Server({ port: 8080 });
  await server.start();
  const logr = new Logr({
    unhandledRejection: true,
    reporters: {
      test(options, tags, message) {
        t.equal(tags[0], 'error');
        t.match(message, {
          message: 'Response Error: 404  Not Found',
          statusCode: 404,
          payload: undefined
        });
      }
    }
  });
  try {
    const res = await wreck.get('http://localhost:8080/', {});
  } catch (e) {
    logr.log(e);
  }
  setTimeout(async () => {
    await server.stop();
    t.end();
  }, 2000);
});

/*

test('error - uncaught promise', (t) => {
  new Logr({
    unhandledRejection: true,
    reporters: {
      test(options, tags, message) {
        t.deepEqual(tags, ['promise', 'error']);
        t.equal(typeof message, 'object');
        t.equal(message.message, 'this is an error');
        t.equal(typeof message.stack, 'string');
        t.end();
      }
    }
  });
  function foo() {
    Promise.reject(new Error('this is an error'));
  }
  foo();
});

test('error - uncaught exception', (t) => {
  new Logr({
    uncaughtException: true,
    reporters: {
      test(options, tags, message) {
        t.deepEqual(tags, ['promise', 'error']);
        t.equal(typeof message, 'object');
        t.equal(message.message, 'this is an error');
        t.equal(typeof message.stack, 'string');
        t.end();
      }
    }
  });
  t.throws(() => {
    nonexustingfun(); //eslint-disable-line
  });
});
*/
