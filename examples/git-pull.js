
var connect = require( 'connect' ),
    shell = require( 'shelljs' ),
    flick = require( '..' ),
    handler = flick(),
    app = connect();

handler.use( 'romac/romac.github.com', gitPull( '/var/www/romac.me', { rebase: true } ) );

function gitPull( root, options )
{
    return function( req, res, next )
    {
        var cmd = 'git pull' + ( options.rebase ? ' --rebase' : '' );

        shell.cd( root );
        shell.exec( cmd, function( code, output )
        {
            console.log( cmd ' exited with code ' + code );
        } );

        next();
    };
}

app.use( connect.bodyParser() );
app.use( flick.whitelist( { local: true } ) );
app.use( flick.payload() );
app.use( handler );
app.use( function( req, res )
{
    res.writeHead( 200 );
    res.end( 'Thank you, dear friend.\n' );
} );

app.listen( 4001 );
console.log( 'flick is listening on port 4001' );
