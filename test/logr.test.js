var should = require('should');

var lib = '../';
var name = 'logr';

describe('logr', function() {
  var lg;
  before(function(start) {
    lg = require(lib)(name);
    start();
  });
  beforeEach(function(start) {
    lg._removeAdaptors();
    start();
  });
  it('should take a module name', function() {
    lg.name.should.equal(name);
  });

  describe('levels', function() {
    it('should log info', function(done) {
      lg.emitter.once('logr.*.*', function(module, level, message, data) {
        message.should.equal('test');
        module.should.equal(name);
        level.should.equal('INFO');
        done();
      });
      lg.info('test');
    });
  });
});
