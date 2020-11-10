/* eslint-disable no-console */
const tap = require('tap');
const test = tap.test;
const Logr = require('../');

//tap.runOnly = true;

test('reporter - allow strings to load reporters', (t) => {
  const logr = new Logr({
    logger(msg) {
      t.equals(msg, '[tag] hi');
      t.end();
    },
    reporters: {
      test: {
        reporter: './lib/console',
        options: {
          timestamp: false
        }
      }
    }
  });
  logr.log(['tag'], 'hi');
});

test('reporter - log what reporter returns', (t) => {
  const logr = new Logr({
    logger(msg) {
      t.equals(msg, 'hi');
      t.end();
    },
    reporters: {
      test(options, tags, message) {
        return message;
      }
    }
  });
  logr.log('hi');
});

test('reporter - dont log if reporter returns nothing', (t) => {
  let check = false;
  const logr = new Logr({
    logger(msg) {
      check = true;
    },
    reporters: {
      test() {
      }
    }
  });
  logr.log(['debug'], '1');
  t.equals(check, false);
  t.end();
});

test('reporter - default options', (t) => {
  const logr = new Logr({
    reporters: {
      test: {
        reporter: {
          defaults: {
            test: true
          },
          log(options, tags, message) {
            t.deepEqual(options, {
              filter: [],
              exclude: [],
              test: true,
              throttle: false,
              throttleBasedOnTags: false
            });
            t.end();
          }
        }
      }
    }
  });
  logr.log(['debug'], '1');
});

test('reporter - init', (t) => {
  const logr = new Logr({
    reporters: {
      test: {
        reporter: {
          init(options) {
            t.deepEqual(options, {
              filter: [],
              exclude: [],
              heyooo: '123',
              throttle: false,
              throttleBasedOnTags: false
            });
            t.end();
          },
          log(options, tags, message) {
          }
        },
        options: {
          heyooo: '123'
        }
      }
    }
  });
  logr.log(['debug'], '1');
});

test('reporter - init only if enabled', (t) => {
  const logr = new Logr({
    reporters: {
      test: {
        reporter: {
          init(options) {
            t.ok(false);
          },
          log(options, tags, message) {
          }
        },
        options: {
          enabled: false,
          heyooo: '123'
        }
      }
    }
  });
  logr.log(['debug'], '1');
  t.end();
});

test('reporter - local options', (t) => {
  const logr = new Logr({
    reporters: {
      test: {
        options: {
          test: false,
          log: 'info'
        },
        reporter: {
          defaults: {
            test: true
          },
          log(options, tags, message) {
            t.deepEqual(options, {
              filter: [],
              throttle: false,
              throttleBasedOnTags: false,
              exclude: [],
              test: false,
              log: 'info'
            });
            t.end();
          }
        }
      }
    }
  });
  logr.log(['debug'], '1');
});

test('reporter - local options', (t) => {
  const logr = new Logr({
    reporters: {
      test: {
        options: {
          test: false,
          log: 'info'
        },
        reporter: {
          defaults: {
            test: true
          },
          log(options, tags, message) {
            t.deepEqual(options, {
              filter: [],
              throttle: false,
              throttleBasedOnTags: false,
              exclude: [],
              test: false,
              log: 'test info'
            });
            t.end();
          }
        }
      }
    }
  });
  logr.log(['debug'], '1', { test: { log: 'test info' } });
});

test('log - multiple reporters', (t) => {
  let count = 0;
  const logr = new Logr({
    reporters: {
      test(options, tags, message) {
        count++;
      },
      test2(options, tags, message) {
        count++;
      }
    }
  });
  logr.log(['debug'], '1');
  t.equal(count, 2);
  t.end();
});

test('log - clone tags so reporters cant muck with them', (t) => {
  const logr = new Logr({
    reporters: {
      test(options, tags, message) {
        tags[0] = 'muck';
      },
      test2(options, tags, message) {
        t.equal(tags[0], 'debug');
      }
    }
  });
  logr.log(['debug'], '1');
  t.end();
});

test('log - clone message so reporters cant muck with them', (t) => {
  const logr = new Logr({
    reporters: {
      test(options, tags, message) {
        message.run++;
      },
      test2(options, tags, message) {
        t.equal(message.run, 1);
      }
    }
  });
  logr.log(['debug'], { run: 1 });
  t.end();
});

test('log - disable reporter', (t) => {
  let count = 0;
  const logr = new Logr({
    reporters: {
      test(options, tags, message) {
        count++;
      },
      test2: {
        reporter(options, tags, message) {
          count++;
        },
        options: {
          enabled: false
        }
      }
    }
  });
  logr.log(['debug'], '1');
  t.equal(count, 1);
  t.end();
});

test('log - initLog', (t) => {
  const oldLog = console.log;
  const vals = [];
  console.log = (val) => {
    vals.push(val);
  };
  new Logr({
    initLog: true,
    reporters: {
      test: {
        reporter: './lib/console',
        options: {
          timestamp: false
        }
      },
      test2: {
        reporter: () => {},
        options: {
          filter: ['hapi']
        }
      },
      test3: {
        reporter: './lib/console',
        options: {
          enabled: false
        }
      }
    }
  });
  console.log = oldLog;
  t.equal(vals[0], '[logr,init] {"message":"Logr initialized","enabledReporters":"test,test2","testFilter":[],"test2Filter":["hapi"]}');
  t.end();
});
