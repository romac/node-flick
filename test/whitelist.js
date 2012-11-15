
var should = require( 'should' ),
    whitelist = require( '../lib/whitelist' );

function _nextOk( done )
{
    return function( err )
    {
        should.not.exist( err );
        done();
    };
}

function _nextErr( done )
{
    return function( err )
    {
        should.exist( err );
        err.should.be.an.instanceOf( Error );

        should.exist( err.status );
        err.status.should.equal( 403 );

        done();
    };
}

describe( 'whitelist', function()
{
    describe( 'whitelist()', function()
    {
        it( 'should return a function that takes 3 arguments when invoked', function()
        {
            whitelist().should.be.a( 'function' ).with.lengthOf( 3 );
        } );
    } );

    describe( 'whitelist()( req, res, next )', function()
    {
        var req = function( type )
            {
                var addresses = {
                        known: whitelist.knownRemotes[ 0 ],
                        unknown: '10.32.1.43',
                        local: '127.0.0.1'
                    },
                    _req = {
                        socket: {
                            remoteAddress: '127.0.0.1'
                        }
                    };

                if( addresses[ type ] ) {
                    _req.socket.remoteAddress = addresses[ type ];
                }
                else {
                    _req.socket.remoteAddress = type;
                }

                return _req;
            },
            res = {};

        it( 'should check against the known remotes if "ips" is not configured: known IP', function( done )
        {
            var _whitelist = whitelist();

            _whitelist( req( 'known' ), res, _nextOk( done ) );
        } );

        it( 'should check against the known remotes if "ips" is not configured: unknown IP', function( done )
        {
            var _whitelist = whitelist();

            _whitelist( req( 'unknown' ), res, _nextErr( done ) );
        } );

        it( 'should not check against local IP if "ips" is not configured: local IP', function( done )
        {
            var _whitelist = whitelist();

            _whitelist( req( 'local' ), res, _nextErr( done ) );
        } );

        it( 'should not check against the known remotes if only "ips" are configured', function( done )
        {
            var _whitelist = whitelist( { ips: [ '1.2.3.4' ] } );

            _whitelist( req( 'known' ), res, _nextErr( done ) );
        } );

        it( 'should check against the configured "ips": good IP', function( done )
        {
            var _whitelist = whitelist( { ips: [ '1.2.3.4' ] } );

            _whitelist( req( '1.2.3.4' ), res, _nextOk( done ) );
        } );

        it( 'should check against the configured "ips": bad IP', function( done )
        {
            var _whitelist = whitelist( { ips: [ '1.2.3.4' ] } );

            _whitelist( req( '4.3.2.1' ), res, _nextErr( done ) );
        } );

        it( 'should also check against the local IP if "local" is true: local IP', function( done )
        {
            var _whitelist = whitelist( { ips: [ '1.2.3.4' ], local: true } );

            _whitelist( req( 'local' ), res, _nextOk( done ) );
        } );

        it( 'should also check against the local IP if "local" is true: bad IP', function( done )
        {
            var _whitelist = whitelist( { ips: [ '1.2.3.4' ], local: true } );

            _whitelist( req( '4.3.2.1' ), res, _nextErr( done ) );
        } );
    } );

} );
