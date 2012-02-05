var should = require('should');

var Dispatcher = require('../lib/dispatcher');

describe('Dispatcher', function() {
  describe('#init', function() {
    it('should initialize vars', function() {
      var d = new Dispatcher();
      d.filters.should.be.instanceof(Array);
      d.loggers.should.be.instanceof(Array);
      d.emitter.should.be.ok;
    });

    it('should set default options', function() {
      var d = new Dispatcher();
      d.options.console.should.be.true;
      d.options.filter.should.be.false;
    });

    it('should allow overriding options', function() {
      var d = new Dispatcher({ console: false, filter: 'test' });
      d.options.console.should.be.false;
      d.options.filter.should.equal('test');
    });

    it('should use console adapter by default', function() {
      var d = new Dispatcher();
      should.exist(d.emitter.listenerTree.logr);
    });

    it('should disable console with option', function() {
      var d = new Dispatcher({ console: false });
      should.not.exist(d.emitter.listenerTree.logr);
    });

    it('should add a filter if passed in', function() {
      var d = new Dispatcher({ filter: 'test' });
      d.filters.should.include('test');
    });
  });

  describe('#getEventName', function() {
    it('should default to wildcards', function() {
      var d = new Dispatcher();
      d.getEventName().should.equal('logr.*.*.*');
    });
    it('should take 3 parameters', function() {
      var d = new Dispatcher();
      d.getEventName('module', 'section', 'level').should.equal('logr.module.section.level');
    });
  });

  describe('#useAdapter', function() {
    it('should bind to emitter', function() {
      var d = new Dispatcher({ console: false });
      d.useAdapter(function(module, section, message, data) { });
      should.exist(d.emitter.listenerTree.logr);
    });

    it('should default to all levels', function() {
      var d = new Dispatcher({ console: false });
      var f = function(module, section, message, data) { };
      d.useAdapter(f);
      should.exist(d.emitter.listenerTree.logr['*']['*']['*']);
      d.emitter.listenerTree.logr['*']['*']['*']._listeners.should.equal(f);
    });

    it('should allow level to filter', function() {
      var d = new Dispatcher({ console: false });
      var f = function(module, section, message, data) { };
      d.useAdapter(f, 'INFO');
      d.emitter.listenerTree.logr['*']['*'].INFO._listeners.should.equal(f);
      should.exist(d.emitter.listenerTree.logr['*']['*'].INFO);
    });

    it('should allow multiple levels to filter', function() {
      var d = new Dispatcher({ console: false });
      var f = function(module, section, message, data) { };
      d.useAdapter(f, ['INFO', 'ERROR']);
      should.exist(d.emitter.listenerTree.logr['*']['*'].INFO);
      should.exist(d.emitter.listenerTree.logr['*']['*'].ERROR);
      d.emitter.listenerTree.logr['*']['*'].INFO._listeners.should.equal(f);
      d.emitter.listenerTree.logr['*']['*'].ERROR._listeners.should.equal(f);
    });

    it('should allow module and section filtering', function() {
      var d = new Dispatcher({ console: false });
      var f = function(module, section, message, data) { };
      d.useAdapter(f, 'INFO', 'module', 'section');
      should.exist(d.emitter.listenerTree.logr.module.section.INFO);
      d.emitter.listenerTree.logr.module.section.INFO._listeners.should.equal(f);
    });
  });

  describe('#filter', function() {
    it('should take a string', function() {
      var d = new Dispatcher();
      d.filter('test');
      d.filters.should.include('test');
    });

    it('should take an array', function() {
      var d = new Dispatcher();
      d.filter(['test', 'test2']);
      d.filters.should.include('test');
      d.filters.should.include('test2');
    });
  });

  describe('#emit', function() {
    it('should trigger event', function(done) {
      var d = new Dispatcher({ console: false });
      d.useAdapter(function(module, section, level, message, data) {
        module.should.equal('module');
        section.should.equal('section'); 
        level.should.equal('INFO');
        message.should.equal('message');
        data.should.equal('data');
        done();
      });
      d.emit('module', 'section', 'INFO', 'message', 'data');
    });

    it('should not trigger a filtered event', function() {
      var d = new Dispatcher({ console: false });
      var eventCount = 0;
      d.useAdapter(function(module, section, level, message, data) {
        module.should.equal('module');
        eventCount++;
      });
      d.filter('module');
      d.emit('module', 'section', 'INFO', 'message', 'data');
      d.emit('module2', 'section', 'INFO', 'message', 'data');
      eventCount.should.equal(1);
    });
  });

  /*TODO
  describe('#removeAdapters', function() {
    it('should unbind all events', function() {
      var d = new Dispatcher();
      should.exist(d.emitter.listenerTree.logr);
      d.removeadapters();
      should.not.exist(d.emitter.listenerTree.logr);
    });
  });
  */

  describe('#useLogger', function() {
    it('should add to the loggers array', function() {
      var d = new Dispatcher();
      d.useLogger('logger');
      d.loggers.should.include('logger');
    });
  });
});
