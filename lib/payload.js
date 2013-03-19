
"use strict";

module.exports = function payload( param )
{
    param = param || 'payload';

    return function( req, res, next )
    {
        var err;

        req.flick = {};

        if( req.method !== 'POST' ) {
            err = new Error( '[flick] payload: Not a POST request.' );
            err.status = 400;

            return next( err );
        }

        if( !req.body[ param ] ) {
            err = new Error( '[flick] payload: No payload supplied.' );
            err.status = 400;

            return next( err );
        }

        req.flick.payload = JSON.parse( req.body[ param ] );

        if( !req.flick.payload ) {
            err = new Error( '[flick] payload: Invalid payload.' );
            err.status = 400;

            return next( err );
        }

        next();
    };
};
