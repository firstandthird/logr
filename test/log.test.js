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

test('log - error as object key', (t) => {
  const logr = new Logr({
    reporters: {
      test(options, tags, message) {
        t.deepEqual(tags, ['debug', 'error']);
        t.equal(typeof message, 'object');
        t.equal(message.anError.message, 'hi there');
        t.equal(typeof message.anError.stack, 'string');
        t.equal(message.anError.name, 'Error');
        t.end();
      }
    }
  });
  logr.log(['debug'], { anError: new Error('hi there') });
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

test('log - rate limit all calls to log for each individual reporter', (t) => {
  let invocationCount = 0;
  const logr = new Logr({
    reporters: {
      test: {
        reporter: (options, tags, message) => {
          invocationCount++;
        },
        options: {
          throttle: 1000
        }
      },
      test2: {
        reporter: (options, tags, message) => {
          invocationCount++;
        },
        options: {
          throttle: 1000
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
      t.equal(invocationCount, 4);
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
          throttle: 1000,
          throttleBasedOnTags: true
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

test('log - handle reporter errors', (t) => {
  const oldLog = console.log;
  const logs = [];
  console.log = (data) => {
    logs.push(data);
  };
  const logr = new Logr({
    reporters: {
      test(options, tags, message) {
        throw new Error('an error');
      }
    }
  });
  logr.log(['debug'], {
    value: 1234
  });
  logr.log(['debug'], 'a message');
  console.log = oldLog;
  t.match(logs[0], { tags: ['debug'], message: { value: 1234 } });
  t.match(logs[2], { tags: ['debug'], message: 'a message' });
  t.end();
});

test('can use the blacklist regex to filter out sensitive info', t => {
  const logr = new Logr({
    blacklist: 'spader',
    reporters: {
      test(options, tags, message) {
        t.match(message.james, '1');
        t.match(message.spader, 'xxxxxx');
      }
    }
  });
  logr.log(['debug'], {
    james: '1',
    spader: '2'
  });
  t.end();
});
