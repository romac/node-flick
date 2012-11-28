
// First, import everything we need (I assume that you installed Flick via the above command).
var connect = require( 'connect' ),
    shell = require( 'shelljs' ),
    flick = require( '..' ),
    handler = flick(),
    app = connect();

// Then, define the action to run once we'll receive the notification from GitHub.
function gitPull( root, options )
{
    return function( req, res, next )
    {
        var cmd = 'git pull' + ( options.rebase ? ' --rebase' : '' );

        shell.cd( root );
        shell.exec( cmd, function( code, output )
        {
            console.log( cmd + ' exited with code ' + code );
        } );

        next();
    };
}

// tell Flick to run that action everytime we receive a notification for a specific repository.
handler.use( 'romac/romac.github.com', gitPull( '/var/www/romac.me', { rebase: true } ) );

app.use( connect.bodyParser() );

// Ensure only requests from GitHub or, in that case, the same computer will get processed.
app.use( flick.whitelist( { local: true } ) );

// Parse the payload we get from GitHub
app.use( flick.payload() );

// Supply it to Flick's handler
app.use( handler );

// Thank GitHub for their niceness
app.use( function( req, res )
{
    res.writeHead( 200 );
    res.end( 'Thank you, dear friend.\n' );
} );

app.listen( 4001 );
console.log( 'flick is listening on port 4001' );
