'use strict';
/*
const test = require('tap').test;
const Logr = require('../');

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
