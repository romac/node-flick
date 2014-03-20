
var should = require('should'),
    payload = require('../lib/payload');

describe('payload', function() {
    describe('payload()', function() {
        it('should return a function that takes 3 arguments when invoked', function() {
            payload().should.be.a.Function.with.lengthOf(3);
        });
    });

    describe('payload()(req, res, next)', function() {
        var res = {};

        it('should continue with an Error with non-POST requests', function(done) {
            var _payload = payload(),
                req = { method: 'GET' },
                next = function(err)
                {
                    should.exist(err);
                    err.should.be.an.instanceOf(Error);

                    should.exist(err.status);
                    err.status.should.equal(400);

                    done();
                };

            _payload(req, res, next);
        });

        it('should error if there is no POST argument named "payload', function(done) {
            var _payload = payload(),
                req = { method: 'POST', body: {} },
                next = function(err)
                {
                    should.exist(err);
                    err.should.be.an.instanceOf(Error);

                    should.exist(err.status);
                    err.status.should.equal(400);

                    done();
                };

            _payload(req, res, next);
        });

        it('should work if there is a POST argument named "payload', function(done) {
            var _payload = payload(),
                req = { method: 'POST', body: { payload: '"Hello, World"' } },
                next = function(err)
                {
                    should.not.exist(err);
                    done();
                };

            _payload(req, res, next);
        });

        it('should error if there is no POST argument whose name has been configured', function(done) {
            var _payload = payload('checkforme'),
                req = { method: 'POST', body: { payload: '"Hello, World"' } },
                next = function(err) {
                    should.exist(err);
                    err.should.be.an.instanceOf(Error);

                    should.exist(err.status);
                    err.status.should.equal(400);

                    done();
                };

            _payload(req, res, next);
        });

        it('should work if there is a POST argument whose name has been configured', function(done)
        {
            var _payload = payload('checkforme'),
                req = { method: 'POST', body: { checkforme: '"Hello, World"' } },
                next = function(err) {
                    should.not.exist(err);
                    done();
                };

            _payload(req, res, next);
        });

        it('should set a "flick.payload" property on the request, holding GitHub\'s payload', function(done)
        {
            var _payload = payload(),
                req = { method: 'POST', body: { payload: '"Hello, World"' } },
                next = function(err) {
                    should.exist(req.flick);
                    should.exist(req.flick.payload);
                    req.flick.payload.should.equal('Hello, World');

                    done();
                };

            _payload(req, res, next);
        });
    });

});
