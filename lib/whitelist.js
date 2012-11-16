
whitelist.knownRemotes = [
    '207.97.227.253',
    '50.57.128.197',
    '108.171.174.178'
];

function whitelist( options )
{
    options = options || {};

    var ips = options.ips || [];

    if( !ips.length || options.known )
    {
        ips = ips.concat( whitelist.knownRemotes );
    }

    if( options.local )
    {
        ips.push( '127.0.0.1' );
    }

    return function( req, res, next )
    {
        var err;

        if( ips.indexOf( req.socket.remoteAddress ) < 0 ) {
            err = new Error( '[flick] whitelist: Remote is not whitelisted (' + req.socket.remoteAddress + ').' );
            err.status = 403;
        }

        next( err );
    };
};

module.exports = whitelist;
