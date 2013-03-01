
whitelist.knownRemotes = [
    '207.97.227.253',
    '50.57.128.197',
    '108.171.174.178',
    '50.57.231.61',
    '54.235.183.49',
    '54.235.183.23',
    '54.235.118.251',
    '54.235.120.57',
    '54.235.120.61',
    '54.235.120.62'
];

function whitelist( options )
{
    options = options || {};

    var ips = options.ips || [];

    if( !ips.length || options.known ) {
        ips = ips.concat( whitelist.knownRemotes );
    }

    if( options.local ) {
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
