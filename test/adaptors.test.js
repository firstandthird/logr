var should = require('should');

var lib = '../';
var name = 'adaptors';

describe('custom adaptors', function() {
  var lg;
  before(function(done) {
    lg = require(lib)(name);
    done();
  });
  beforeEach(function(done) {
    lg._removeAdaptors();
    done();
  });
  it('should allow custom adaptors', function(done) {
    lg.use(function(module, level, message, data) {
      module.should.equal(name);
      level.should.equal('INFO');
      message.should.equal('testing');
      done();
    });
    lg.info('testing');
  });

  it('should be able to filter by level', function(done) {
    var logCount = 0;
    lg.use(function(module, level, message, data) {
      logCount++;
    }, 'INFO', name);
    lg.info('test 1');
    lg.debug('test 2');
    logCount.should.equal(1);
    done();
  });

  it('should be able to filter multiple levels', function(done) {
    var logCount = 0;
    lg.use(function(module, level, message, data) {
      logCount++;
    }, 'INFO,ERROR', name);
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
    }, 'INFO', name);
    lg.error('test');
  });

  it('should not trigger lower levels', function(done) {
    lg.use(function(module, level, message, data) {
      level.should.equal('ERROR');
    }, 'INFO', name);
    lg.debug('test');
    done();
  });
  */

});

