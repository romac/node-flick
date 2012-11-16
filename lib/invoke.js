
// FIXME: Get rid of 'async', and write the async loop myself
var forEachSeries = require( 'async' ).forEachSeries;

module.exports = function invoke( allActions )
{
    allActions = allActions || {};
    
    return function( req, res, next )
    {
        var err;

        if( !allActions )
        {
            return next();
        }

        var payload = JSON.parse( req.body.payload );

        if( !payload )
        {
            err = new Error( '[flick] invoke: Invalid payload.' );
            err.status = 400;

            return next( err );
        }

        var repository = payload.repository.owner.name + '/' + payload.repository.name;

        if( !allActions[ repository ] )
        {
            return next();
        }

        var actions = allActions[ repository ];

        if( !Array.isArray( actions ) )
        {
            actions = [ actions ];
        }

        forEachSeries(
            actions,
            function( action, callback )
            {
                action( payload, callback );
            },
            function( err )
            {
                next( err );
            }
        );
    };
};
