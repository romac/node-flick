
var fs = require( 'fs' ),
    basename = require( 'path' ).basename;

// Awesome snippet from https://github.com/senchalabs/connect/blob/master/lib/connect.js#L87
// by TJ Holowaychuk
fs.readdirSync( __dirname + '/actions' ).forEach( function( filename )
{
    if( !/\.js$/.test( filename ) ) return;

    var name = basename( filename, '.js' );

    function load()
    {
        return require( __dirname + '/actions/' + name );
    }

    exports.__defineGetter__( name, load );
} );
