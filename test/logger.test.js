var should = require('should');

var Dispatcher = require('../lib/dispatcher');
var Logger = require('../lib/logger');


describe('Logger', function() {

  var dispatcher;
  beforeEach(function() {
    dispatcher = new Dispatcher({ console: false });
  });


  describe('#init', function() {
    it('should require dispatcher and module name', function() {
      (function() {
        var l = new Logger();
      }).should.throw();
      (function() {
        var l = new Logger(dispatcher);
      }).should.throw();
    });

    /*
    it('should not require section', function() {
      var l = new Logger(dispatcher, 'module');
      should.equal(l.section, '');
    });
    */

    it('should have default levels', function() {
      var l = new Logger(dispatcher, 'module');
      l.options.levels.length.should.be.above(0);
    });


    it('should create a method for each level', function() {
      var l = new Logger(dispatcher, 'module');
      l.info.should.be.a('function');
      l.debug.should.be.a('function');
      l.notice.should.be.a('function');
      l.warn.should.be.a('function');
      l.error.should.be.a('function');
      l.critical.should.be.a('function');
      l.emergency.should.be.a('function');
    });

    it('should allow custom levels', function() {
      var l = new Logger(dispatcher, 'module', {
        levels: ['test1', 'test2']
      });

      l.test1.should.be.a('function');
      l.test2.should.be.a('function');
      should.not.exist(l.info);

    });
  });


  describe('#createLogLevel', function() {
    it('should lowercase the level and create a log function', function() {
      var l = new Logger(dispatcher, 'module');
      l.createLogLevel('TESTING');
      l.testing.should.be.a('function');
    });
  });

  describe('#use', function() {
    it('should pass on to dispatcher', function() {
      
      var l = new Logger(dispatcher, 'module');
      var f = function(module, section, level, message, data) {

      };
      l.use(f, 'INFO', 'module', 'section');
      should.exist(dispatcher.emitter.listenerTree.logr.module.section.INFO);
    });
  });

  describe('#log', function() {
    it('should pass on to dispatcher', function(done) {
      var l = new Logger(dispatcher, 'module');
      var f = function(module, section, level, message, data) {
        module.should.equal('module');
        should.not.exist(section);
        level.should.equal('INFO');
        message.should.equal('message');
        data.should.equal('data');
        done();
      };
      l.use(f, 'INFO', 'module');
      l.log('INFO', 'message', 'data');
    });

    it('custom level methods should trigger from dispatcher', function(done) {
      var l = new Logger(dispatcher, 'module');
      var f = function(module, section, level, message, data) {
        module.should.equal('module');
        should.not.exist(section);
        level.should.equal('INFO');
        message.should.equal('message');
        data.should.equal('data');
        done();
      };
      l.use(f, 'INFO', 'module');
      l.info('message', 'data');
    });
  });

  describe('#filter', function() {
    it('should pass on to dispatcher', function() {
      var l = new Logger(dispatcher, 'module');
      l.filter('test');
      dispatcher.filters.should.include('test');
    });
  });
});
