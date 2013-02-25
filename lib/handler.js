
function handle( req, res, done )
{
    if( !req.flick ) {
        return done();
    }

    var payload = req.flick.payload,
        repository = payload.repository.owner.name + '/' + payload.repository.name,
        index = 0,
        self = this;

    function next( err )
    {
        var handler = self.stack[ index++ ];

        if( !handler || err ) {
            return done( err );
        }

        if( !~[ '*', repository ].indexOf( handler.repository ) ) {
            return next();
        }

        handler.handle( req, res, next );
    }

    next();
}

exports.handle = handle;

function use( repository, fn )
{
    if( !fn ) {
        fn = repository;
        repository = '*';
    }

    this.stack.push( {
        repository: repository,
        handle: fn
    } );
}

exports.use = use;
