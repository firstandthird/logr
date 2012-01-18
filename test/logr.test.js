var should = require('should');

var lib = '../';

describe('logr', function() {
  beforeEach(function(start) {
    delete require.cache[require.resolve(lib)];
    start();
  });
  it('should take a module name', function() {
    var lg = require(lib)('logr');
    lg.module.should.equal('logr');
  });

  it('should add console adaptor by default', function() {
    var lg = require(lib)('logr');
    lg.core.emitter.listenerTree.logr.should.be.ok;
  });

  it('should disable console through options', function() {
    var lg = require(lib)('logr', { console: false });
    should.not.exist(lg.core.emitter.listenerTree.logr);
  });

  describe('levels', function() {
    it('should log info', function(done) {
      var lg = require(lib)('logr', { console: false });
      lg.use(function(module, section, level, message, data) {
        message.should.equal('test');
        module.should.equal('logr');
        level.should.equal('INFO');
        done();
      });
      lg.info('test');
    });
  });
  describe('multiple modules', function() {
    it('should log all modules that have been defined', function(done) {
      var lg = require(lib)('logr', { console: false });
      var l2 = require(lib)('module2', { console: false });
      var count = 0;
      lg.use(function(module, section, level, message, data) {
        count++; 
        message.should.equal('test2');
      });
      lg.info('test2');
      l2.info('test2');
      count.should.equal(2);
      done();
    });
  });
  describe('filter', function() {
    it('should only log selected modules when filter applied', function(done) {
      var lg = require(lib)('logr', { console: false });
      var l2 = require(lib)('module2');
      lg.filter('logr');
      var count = 0;
      lg.use(function(module, section, level, message, data) {
        count++; 
        module.should.equal('logr');
      });
      lg.info('test1');
      l2.info('test2');
      count.should.equal(1);
      done();
    });
    it('should take multiple modules as filters', function(done) {
      var lg = require(lib)('logr', { console: false });
      var l2 = require(lib)('module2');
      var l3 = require(lib)('module3');
      lg.filter(['logr', 'module2']);
      var count = 0;
      lg.use(function(module, section, level, message, data) {
        count++; 
      });
      lg.info('test1');
      l2.info('test2');
      l3.info('test3');
      count.should.equal(2);
      done();
    });
    it('should take filters as options', function(done) {
      var lg = require(lib)('logr', { console: false, filter: 'logr' });
      var l2 = require(lib)('module2');
      var l3 = require(lib)('module3');
      var count = 0;
      lg.use(function(module, section, level, message, data) {
        count++; 
      });
      lg.info('test1');
      l2.info('test2');
      l3.info('test3');
      count.should.equal(1);
      done();
    });
    //it('should take submodules with their parent');
  });
});
