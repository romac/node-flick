
var should = require('should'),
    crypto = require('crypto'),
    github = require('../lib/github');

function _nextOk(done)
{
    return function(err) {
        should.not.exist(err);
        done();
    };
}

function _nextErr(done)
{
    return function(err) {
        should.exist(err);
        err.should.be.an.instanceOf(Error);

        should.exist(err.status);
        err.status.should.equal(401);

        done();
    };
}
function request() {
    return {
        body: new Buffer('Some content.', 'utf8'),
        headers: {}
    };
}

function signature(req, secret) {
    var hash = crypto.createHmac('sha1', secret).update(req.body).digest('hex');
    return 'sha1=' + hash;
}

function sign(req, secret) {
    req.headers['x-hub-signature'] = signature(req, secret);
}

describe('github', function() {
    describe('github()', function() {
        it('should be a function that takes 1 argument', function() {
            github.should.be.a('function').with.lengthOf(1);
        });
        it('should throw an error when the first argument is not a string', function() {
            (function() { github(); }).should.throw();
            (function() { github(42); }).should.throw();
            (function() { github([1, 2, 3]); }).should.throw();
            (function() { github({a: '1', b: '2'}); }).should.throw();
            (function() { github(new Buffer('Hello')); }).should.throw();
        });
        it('should return a function that takes 3 arguments when invoked', function() {
            github('GITHUB_SECRET').should.be.a('function').with.lengthOf(3);
        });
    });

    describe('github()(req, res, next)', function() {
        var res = {},
            secret = '9xUo1JFCY48aZwXywR+hLcUij+3ZGiIq7pJEvboTEQI=';

        it('should accept a request with a valid "x-hub-signature" header.', function(done) {
            var _github = github(secret),
                req = request();

            sign(req, secret);
            _github(req, res, _nextOk(done));
        });

        it('should reject a request with a missing "x-hub-signature" header.', function(done) {
            var _github = github(secret),
                req = request();

            _github(req, res, _nextErr(done));
        });

        it('should reject a request with a invalid "x-hub-signature" header.', function(done) {
            var _github = github(secret),
                req = request();

            sign(req, 'InvalidSecret');
            _github(req, res, _nextErr(done));
        });
    });

});
