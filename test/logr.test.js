var should = require('should');


var Logger = require('../lib/logger');

describe('logr', function() {

  var logr;
  beforeEach(function() {
    var lib = '../';
    delete require.cache[require.resolve(lib)];
    logr = require(lib);

  });
  it('should require module name', function() {
    (function() {
      logr();
    }).should.throw();
  });

  it('should return logger', function() {
    var l = logr('module');
    l.should.be.instanceof(Logger);
  });

  it('should take name and section and pass to logger instance', function() {
    var l = logr('module', 'section');
    l.module.should.equal('module');
    l.section.should.equal('section');
  });

  it('should only create one instance of dispatcher', function() {
    var l1 = logr('module1');
    var l2 = logr('module2');
    l1.dispatcher.should.equal(l2.dispatcher);
  });

  it('should optionally take section', function() {
    var l = logr('module1', {
      levels: ['TEST1', 'TEST2']
    });
    should.equal(l.section, '');
    l.options.levels.length.should.equal(2);
  });

  it('should pass options to dispatcher and logger', function() {
    var l = logr('module1', {
      levels: ['TEST1', 'TEST2'],
      console: false,
      filter: ['module1']
    });
    l.options.levels.length.should.equal(2);
    l.dispatcher.options.console.should.be.false;
    l.dispatcher.filters.should.include('module1');
  });

  it('should add to dispatcher loggers', function() {
    var l1 = logr('module1');
    l1.dispatcher.loggers.should.include(l1);
  });
});
