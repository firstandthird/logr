/* eslint-disable no-console */
const test = require('tap').test;

const consoleReporter = require('../lib/console');


test('console - basic output', (t) => {
  const msg = consoleReporter.log({}, ['test'], 'hi there');
  t.equals(msg, '[test] hi there');
  t.end();
});

test('console - enable timestamp', (t) => {
  const msg = consoleReporter.log({ timestamp: true }, ['test'], 'hi there');
  t.notEqual(msg.indexOf('[test] hi there'), 0);
  t.end();
});

test('console - json', (t) => {
  const msg = consoleReporter.log({ }, ['test'], { hi: 'there' });
  t.equals(msg, '[test] {"hi":"there"}');
  t.end();
});
