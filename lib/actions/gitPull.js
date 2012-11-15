
require( 'shelljs/global' );

module.exports = function( options )
{
    options = options || {};

    if( !options.root ) throw new Error( '[bait] git-pull: No working copy path specified.' );

    var rebase = options.rebase || options.rebase === undefined && true,
        cmd = 'git pull' + ( rebase ? ' --rebase' : '' );

    return function gitPull( payload, callback )
    {
        var err;

        cd( options.root );

        if( exec( cmd ).code !== 0 )
        {
            err = new Error( '[bait] git-pull: Command "' + cmd + '" failed.' )
            err.status = 500;
        }

        callback( err );
    };

};