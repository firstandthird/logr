var should = require('should');

var lib = '../';

describe('custom adaptors', function() {
  beforeEach(function(done) {
    delete require.cache[require.resolve(lib)];
    done();
  });
  it('should allow custom adaptors', function(done) {
    var lg = require(lib)('adaptors', { console: false });
    lg.use(function(module, section, level, message, data) {
      module.should.equal('adaptors');
      level.should.equal('INFO');
      message.should.equal('testing');
      done();
    });
    lg.info('testing');
  });

  it('should be able to filter by level', function(done) {
    var lg = require(lib)('adaptors', { console: false });
    var logCount = 0;
    lg.use(function(module, section, level, message, data) {
      logCount++;
    }, 'INFO', 'adaptors');
    lg.info('test 1');
    lg.debug('test 2');
    logCount.should.equal(1);
    done();
  });

  it('should be able to filter multiple levels', function(done) {
    var lg = require(lib)('adaptors', { console: false });
    var logCount = 0;
    lg.use(function(module, section, level, message, data) {
      logCount++;
    }, 'INFO,ERROR', 'adaptors');
    lg.info('test 1');
    lg.error('test 1');
    lg.debug('test 2');
    logCount.should.equal(2);
    done();
  });

  /* disabling for now
  it('should trigger higher levels', function(done) {
    lg.use(function(module, level, message, data) {
      level.should.equal('ERROR');
      done();
    }, 'INFO', 'adaptors');
    lg.error('test');
  });

  it('should not trigger lower levels', function(done) {
    lg.use(function(module, level, message, data) {
      level.should.equal('ERROR');
    }, 'INFO', 'adaptors');
    lg.debug('test');
    done();
  });
  */

});

