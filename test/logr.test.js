'use strict';
const test = require('tap').test;
const Logr = require('../');

test('logger defaults to console.log', (t) => {
  const oldConsole = console.log; //eslint-disable-line no-console
  console.log = function(msg) { //eslint-disable-line no-console
    t.equals(msg, 'test');
  };
  const logr = new Logr();
  logr.logger('test');
  console.log = oldConsole; //eslint-disable-line no-console
  t.end();
});

test('can override logger - defaults to console.log', (t) => {
  const logr = new Logr({
    logger: (msg) => {
      t.equal(msg, 'test');
      t.end();
    }
  });
  logr.logger('test');
});

test('defaults to console reporter if none passed in', (t) => {
  const logr = new Logr();
  t.equal(Object.keys(logr.reporters).length, 1);
  t.equal(typeof logr.reporters.console, 'object');
  t.end();
});

test('setup reporter - need reporter key', (t) => {
  t.throws(() => {
    new Logr({
      filter: ['test'],
      reporters: {
        test: {}
      }
    });
  });
  t.end();
});

test('setup reporter - super shorthand', (t) => {
  const logr = new Logr({
    filter: ['test'],
    reporters: {
      test(options, tags, message) { }
    }
  });
  t.equals(typeof logr.reporters.test.reporter.log, 'function');
  t.equals(typeof logr.reporters.test.options, 'object');
  t.end();
});

test('setup reporter - shorthand', (t) => {
  const logr = new Logr({
    filter: ['test'],
    reporters: {
      test: {
        reporter(options, tags, message) {}
      }
    }
  });
  t.equals(typeof logr.reporters.test.reporter.log, 'function');
  t.equals(typeof logr.reporters.test.options, 'object');
  t.end();
});

test('setup reporter', (t) => {
  const logr = new Logr({
    filter: ['test'],
    reporters: {
      test: {
        reporter: {
          defaults: {},
          log(options, tags, message) {
          }
        }
      }
    }
  });
  t.equals(typeof logr.reporters.test.reporter.log, 'function');
  t.equals(typeof logr.reporters.test.options, 'object');
  t.end();
});

test('setup reporter - log must be function', (t) => {
  t.throws(() => {
    new Logr({
      filter: ['test'],
      reporters: {
        test: {
          reporter: {
            defaults: {},
            log: 123
          }
        }
      }
    });
  });
  t.end();
});

test('setup reporter - defaults optional', (t) => {
  const logr = new Logr({
    filter: ['test'],
    reporters: {
      test: {
        reporter: {
          log(options, tags, message) {
          }
        }
      }
    }
  });
  t.equals(typeof logr.reporters.test.reporter.log, 'function');
  t.equals(typeof logr.reporters.test.options, 'object');
  t.end();
});

test('LOGR_FILTER sets filters', (t) => {
  process.env.LOGR_FILTER = 'test,test2';
  const logr = new Logr();
  t.deepEqual(logr.config.filter, ['test', 'test2']);
  delete process.env.LOGR_FILTER;
  t.end();
});

test('global filters get passed to reporters', (t) => {
  const logr = new Logr({
    filter: ['test']
  });
  t.deepEqual(logr.reporters.console.options.filter, ['test']);
  t.end();
});

test('global filters merged with reporter', (t) => {
  const logr = new Logr({
    filter: ['test'],
    reporters: {
      test: {
        reporter(options, tag, message) { },
        options: {
          filter: ['test2']
        }
      }
    }
  });
  t.deepEqual(logr.reporters.test.options.filter, ['test2', 'test']);
  t.end();
});

test('LOGR_EXCLUDE sets exclude', (t) => {
  process.env.LOGR_EXCLUDE = 'test,test2';
  const logr = new Logr();
  t.deepEqual(logr.config.exclude, ['test', 'test2']);
  delete process.env.LOGR_EXCLUDE;
  t.end();
});

test('global exclude get passed to reporters', (t) => {
  const logr = new Logr({
    exclude: ['test']
  });
  t.deepEqual(logr.reporters.console.options.exclude, ['test']);
  t.end();
});

test('global exclude merged with reporter', (t) => {
  const logr = new Logr({
    exclude: ['test'],
    reporters: {
      test: {
        reporter(options, tag, message) { },
        options: {
          exclude: ['test2']
        }
      }
    }
  });
  t.deepEqual(logr.reporters.test.options.exclude, ['test2', 'test']);
  t.end();
});
