
module.exports = function payload( param )
{
    param = param || 'payload';

    return function( req, res, next )
    {
        var err;

        if( req.method !== 'POST' )
        {
            err = new Error( '[bait] payload: Not a POST request.' );
            err.status = 400;   
        }
        else if( !req.body[ param ] )
        {
            err = new Error( '[bait] payload: No payload supplied.' );
            err.status = 400;
        }

        next( err );
    };
};
