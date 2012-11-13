
var whitelist = require( './whitelist' ),
    payload = require( './payload' ),
    invoke = require( './invoke' );

module.exports = function handle( options )
{
    options = options || {};

    var _whitelist = whitelist( options.whitelist ),
        _payload = payload( options.payload ),
        _invoke = invoke( options.actions );

    return function( req, res, next )
    {
        return _whitelist( req, res, function( err )
        {
            if( err ) return next( err );

            _payload( req, res, function( err )
            {
                if( err ) return next( err );

                _invoke( req, res, next );
            } )
        } )
    };
};
