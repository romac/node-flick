
var should = require('should'),
    flick = require('..');

describe('flick()', function() {
  it('should return a function with "handle", "use", and "stack" properties', function() {
    var handler = flick();
    handler.should.be.a('function').with.lengthOf(3);
    handler.should.have.property('handle');
    handler.should.have.property('use');
    handler.should.have.property('stack');
  });
  describe('handler.use(repository, fn)', function() {
    it('should be a function and take 2 arguments', function() {
      var handler = flick();
      handler.use.should.be.a('function').with.lengthOf(2);
    });
    it('should populate the stack', function() {
      var handler = flick(),
          fn = function() {};
      handler.use('repo_name', fn);
      var last = handler.stack[ handler.stack.length - 1 ];
      last.should.be.a('object');
      last.should.have.property('repository');
      last.should.have.property('handle');
      last.repository.should.be.equal('repo_name');
      last.handle.should.be.equal(fn);
    });
    it('should accept only a function', function() {
      var handler = flick(),
          fn = function() {};
      handler.use(fn);
      var last = handler.stack[ handler.stack.length - 1 ];
      last.should.be.a('object');
      last.should.have.property('repository');
      last.should.have.property('handle');
      last.repository.should.be.equal('*');
      last.handle.should.be.equal(fn);
    });
  });
  describe('handler.handle(req, res, next)', function() {
    function _req(owner, repo) {
      return {
        payload: {
          repository: {
            owner: { name: owner },
            name: repo
          }
        }
      };
    }
    it('should be a function and take 3 arguments', function() {
      var handler = flick();
      handler.handle.should.be.a('function').with.lengthOf(3);
    });
    it('should abort if req.flick isn\'t set', function(done) {
      var handler = flick();
      handler.use(function() {
        should.fail('this handler should not be called.');
      });
      handler.handle({}, {}, done);
    });
    it('should always call the wildcard handler', function(done) {
      var handler = flick(),
          req = _req('romac', 'node-flick');

      handler.use(function() { done(); });
      handler.handle(req, {}, done);
    });
    it('should call the matching handler', function(done) {
      var handler = flick(),
          req = _req('romac', 'node-flick');

      handler.use('romac/node-flick', function() { done(); });
      handler.handle(req, {}, done);
    });
    it('should not call an non-matching handler', function(done) {
      var handler = flick(),
          req = _req('romac', 'node-flick');

      handler.use('johndoe/node-flick', function() {
        should.fail('this handler should not be called.');
      });
      handler.handle(req, {}, done);
    });
  });
});