
var connect = require( 'connect' ),
    bait = require( '..' ),
    app = connect();

var actions = {
        'romac/romac.github.com': bait.actions.gitPull( {
            root: '/var/www/romac.me',
            rebase: true
        } )
    },
    handler = bait.handler( {
        whitelist: {
            ips: [ '127.0.0.1' ]
        },
        actions: actions
    } );

app.use( connect.bodyParser() );
app.use( handler );
app.use( function( req, res )
{
    res.writeHead( 200 );
    res.end( 'Thank you, dear friend.\n' );
} );

app.listen( 4001 );
console.log( 'bait is listening on port 4001' );
