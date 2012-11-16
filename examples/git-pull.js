
var connect = require( 'connect' ),
    flick = require( '..' ),
    handler = flick(),
    app = connect();

handler.use( 'romac/romac.github.com', gitPull );

function gitPull( req, res, next )
{
    console.log( req.flick );
    next();
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
