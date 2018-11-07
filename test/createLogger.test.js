/* eslint-disable no-console */
'use strict';
const test = require('tap').test;
const Logr = require('../');

test('createLogger - is function', (t) => {
  t.equals(typeof Logr.createLogger, 'function');
  t.end();
});

test('createLogger - creates new logger and returns instance', (t) => {
  const log = Logr.createLogger({
    reporters: {
      test(options, tags, msg) {
        t.equals(msg, 'hi there');
        t.end();
      }
    }
  });
  log('hi there');
});
