[![Build Status](https://secure.travis-ci.org/romac/node-flick.png?branch=master)](https://travis-ci.org/romac/node-flick)

# Flick

Flick is a [GitHub post-receive hooks](https://help.github.com/articles/post-receive-hooks) handler for Node.js.

## Installation

Install the latest version by running

    $ npm install flick

## Usage

Let's say you want to run `git pull --rebase` on a repository clone every time commits are pushed to GitHub.

First, import everything we need (this assumes that you installed Flick via the above command).

```js
var connect = require( 'connect' ),
    shell = require( 'shelljs' ),
    flick = require( 'flick' ),
    handler = flick(),
    app = connect();
```

Then, define the action to run once we'll receive the notification from GitHub.

```js
function gitPull( root, options )
{
    return function( req, res, next ) {
        var cmd = 'git pull' + ( options.rebase ? ' --rebase' : '' );

        shell.cd( root );
        shell.exec( cmd, function( code, output ) {
            console.log( cmd + ' exited with code ' + code );
        } );

        next();
    };
}
```

Tell Flick to run that action everytime we receive a notification for a specific repository.

```js
handler.use( 'romac/romac.github.com', gitPull( '/var/www/romac.me', { rebase: true } ) );
```

Let's then configure connect.

```js
app.use( connect.bodyParser() );

// Ensure only requests from GitHub (or, in that case, the same computer) will get processed.
app.use( flick.whitelist( { local: true } ) );

// Parse the payload we get from GitHub
app.use( flick.payload() );

// Supply it to Flick's handler
app.use( handler );
```

Launch the HTTP server.

```js
// Thank GitHub for their niceness
app.use( function( req, res ) {
    res.writeHead( 200 );
    res.end( 'Thank you, dear friend.\n' );
} );

app.listen( 4001 );
console.log( 'flick is listening on port 4001' );
```

Now, run the app with

    $ node update.js

And configure the endpoint in your repository settings on GitHub, under the **WebHooks** section.

From now on, everytime you will push something to GitHub, the handler above will be triggered and the repository clone on the server will get updated.

## License

Flick is released under the [MIT License](http://romac.mit-license.org).
