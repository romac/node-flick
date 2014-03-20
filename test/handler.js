
var should = require('should'),
    flick = require('..');

describe('flick()', function() {
  it('should return a function with "handle", "use", and "stack" properties', function() {
    var handler = flick();
    handler.should.be.a.Function.with.lengthOf(3);
    handler.should.have.property('handle');
    handler.should.have.property('use');
    handler.should.have.property('stack');
  });
  describe('handler.use(repository, fn)', function() {
    it('should be a function and take 2 arguments', function() {
      var handler = flick();
      handler.use.should.be.a.Function.with.lengthOf(2);
    });
    it('should populate the stack', function() {
      var handler = flick(),
          fn = function() {};
      handler.use('repo_name', fn);
      var last = handler.stack[ handler.stack.length - 1 ];
      last.should.be.a.Object;
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
      last.should.be.a.Object;
      last.should.have.property('repository');
      last.should.have.property('handle');
      last.repository.should.be.equal('*');
      last.handle.should.be.equal(fn);
    });
  });
  describe('handler.handle(req, res, next, done)', function() {
    function _req(owner, repo) {
      return {
        flick: {
          payload: {
            repository: {
              owner: { name: owner },
              name: repo
            }
          }
        }
      };
    }
    it('should be a function and take 3 arguments', function() {
      var handler = flick();
      handler.handle.should.be.a.Function.with.lengthOf(3);
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

      handler.use('romac/node-flick', function(req, res, next) { next(); });
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
    it('should take a `next` argument that forward to the next flick handler', function(done) {
      var handler = flick(),
          req = _req('romac', 'node-flick');

      handler.use(function(req, res, next) {
        req.firstHandlerCalled = true;
        next();
      });
      handler.use(function(req, res, next) {
        should.exist(req.firstHandlerCalled);
        req.firstHandlerCalled.should.equal(true);

        req.secondHandlerCalled = true;

        next();
      });
      handler.handle(req, {}, function() {
        should.exist(req.firstHandlerCalled);
        req.firstHandlerCalled.should.equal(true);

        should.exist(req.secondHandlerCalled);
        req.secondHandlerCalled.should.equal(true);

        done();
      });
    });
    it('should take a `done` argument that forward to the next express handler', function(_done) {
      var handler = flick(),
          req = _req('romac', 'node-flick');

      handler.use(function(req, res, next, done) {
        done();
      });
      handler.use(function() {
        should.fail('this handler should not be called.');
      });
      handler.handle(req, {}, _done);
    });
  });
});
