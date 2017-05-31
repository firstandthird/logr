'use strict';
const test = require('tap').test;
const Logr = require('../');

test('log - tags optional', (t) => {
  const logr = new Logr({
    reporters: {
      test(options, tags, message) {
        t.deepEqual(tags, []);
        t.equal(message, 'test');
        t.end();
      }
    }
  });
  logr.log('test');
});

test('log - tags', (t) => {
  const logr = new Logr({
    reporters: {
      test(options, tags, message) {
        t.deepEqual(tags, ['debug']);
        t.equal(message, 'test');
        t.end();
      }
    }
  });
  logr.log(['debug'], 'test');
});

test('log - error', (t) => {
  const logr = new Logr({
    reporters: {
      test(options, tags, message) {
        t.deepEqual(tags, ['debug', 'error']);
        t.equal(typeof message, 'object');
        t.equal(message.message, 'hi there');
        t.equal(typeof message.stack, 'string');
        t.end();
      }
    }
  });
  logr.log(['debug'], new Error('hi there'));
});

test('log - error - dont add dupe', (t) => {
  const logr = new Logr({
    reporters: {
      test(options, tags, message) {
        t.deepEqual(tags, ['debug', 'error']);
        t.equal(typeof message, 'object');
        t.equal(message.message, 'hi there');
        t.equal(typeof message.stack, 'string');
        t.end();
      }
    }
  });
  logr.log(['debug', 'error'], new Error('hi there'));
});

test('log - single filter', (t) => {
  let count = 0;
  const logr = new Logr({
    filter: ['debug'],
    reporters: {
      test(options, tags, message) {
        count++;
      }
    }
  });
  logr.log(['debug'], '1');
  logr.log(['warning'], '2');
  t.equal(count, 1);
  t.end();
});

test('log - multiple filters', (t) => {
  let count = 0;
  const logr = new Logr({
    filter: ['debug', 'info'],
    reporters: {
      test(options, tags, message) {
        count++;
      }
    }
  });
  logr.log(['debug'], '1');
  logr.log(['warning'], '2');
  logr.log(['info'], '3');
  t.equal(count, 2);
  t.end();
});

test('log - exclude', (t) => {
  let count = 0;
  const logr = new Logr({
    exclude: ['debug'],
    reporters: {
      test(options, tags, message) {
        count++;
      }
    }
  });
  logr.log(['debug'], '1');
  logr.log(['warning'], '2');
  logr.log(['info'], '3');
  t.equal(count, 2);
  t.end();
});

test('log - default tags', (t) => {
  const logr = new Logr({
    defaultTags: ['default'],
    reporters: {
      test(options, tags, message) {
        t.deepEquals(tags, ['default', 'debug']);
        t.end();
      }
    }
  });
  logr.log(['debug'], '1');
});

test('log - rate limit all calls to log', (t) => {
  let invocationCount = 0;
  const logr = new Logr({
    reporters: {
      test: {
        reporter: (options, tags, message) => {
          invocationCount++;
        },
        options: {
          throttle: { rate: 1000 }
        }
      }
    }
  });
  logr.log(['s1', 'tag1', 'tag2'], 'test');
  logr.log(['s2', 'tag1', 'tag2'], 'test');
  logr.log(['s2', 'tag1'], 'test');
  setTimeout(() => {
    logr.log(['s1', 'tag1', 'tag2'], 'test');
    logr.log(['s2', 'tag1', 'tag2'], 'test');
    logr.log(['s2', 'tag1'], 'test');
    setTimeout(() => {
      logr.log(['s1', 'tag1', 'tag2'], 'test');
      logr.log(['s2', 'tag1', 'tag2'], 'test');
      logr.log(['s2', 'tag1'], 'test');
      t.equal(invocationCount, 2);
      t.end();
    }, 1000);
  }, 500);
});

test('log - rate limit by tag signature', (t) => {
  let invocationCount = 0;
  const logr = new Logr({
    throttle: { throttleBasedOnTags: true, rate: 1000 },
    reporters: {
      test: {
        reporter: (options, tags, message) => {
          invocationCount++;
        },
        options: {
          throttle: { throttleBasedOnTags: true, rate: 1000 }
        }
      }
    }
  });
  logr.log(['s1', 'tag1', 'tag2'], 'test');
  logr.log(['s2', 'tag1', 'tag2'], 'test');
  logr.log(['s2', 'tag1'], 'test');
  setTimeout(() => {
    logr.log(['s1', 'tag1', 'tag2'], 'test');
    logr.log(['s2', 'tag1', 'tag2'], 'test');
    logr.log(['s2', 'tag1'], 'test');
    setTimeout(() => {
      logr.log(['s1', 'tag1', 'tag2'], 'test');
      logr.log(['s2', 'tag1', 'tag2'], 'test');
      logr.log(['s2', 'tag1'], 'test');
      t.equal(invocationCount, 6);
      t.end();
    }, 1000);
  }, 500);
});
