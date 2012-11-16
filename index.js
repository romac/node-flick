
var fs = require( 'fs' ),
    basename = require( 'path' ).basename,
    proto = require( './lib/handler' ),
    utils = require( './utils' );

// All of this is obviously inspired by connect: https://github.com/senchalabs/connect
// Since flick integrates with it, I figured it'd be a good idea
// to make its API look alike, which means I've reused a few patterns used by connect.

function createHandler()
{
    function handler( req, res, next )
    {
        handler.handle( req, res, next );
    }

    utils.merge( handler, proto );

    handler.repository = '*';
    handler.stack = [];

    return handler;
}

exports = module.exports = createHandler;

function defaultHandler()
{
    var handler = createHandler();

    handler.use( flick.whitelist() );
    handler.use( flick.payload() );

    return handler;
}

exports.default = defaultHandler;

exports.payload = require( './lib/payload' );
exports.whitelist = require( './lib/whitelist' );
