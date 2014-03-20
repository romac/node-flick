[![Build Status](https://secure.travis-ci.org/romac/node-flick.png?branch=master)](https://travis-ci.org/romac/node-flick)
[![Dependencies Status](https://david-dm.org/romac/node-flick.png)](https://david-dm.org/romac/node-flick)
# node-flick

node-flick is a [GitHub post-receive hooks](https://help.github.com/articles/post-receive-hooks) handler for Node.js.

## Installation

Install the latest version by running

    $ npm install flick

## Usage

Let's say you want to run `git pull --rebase` on a repository clone every time commits are pushed to GitHub.

First, import everything we need (this assumes that you installed node-flick via the above command).

```js
var connect = require('connect'),
    shell = require('shelljs'),
    flick = require('flick'),
    app = connect();
```

Then, define the action to run once we'll receive the notification from GitHub.

```js
function gitPull(root, options)
{
    return function(req, res, next) {
        var cmd = 'git pull' + (options.rebase ? ' --rebase' : '');

        shell.cd(root);
        shell.exec(cmd, function(code, output) {
            console.log(cmd + ' exited with code ' + code);
        });

        next();
    };
}
```

Tell node-flick to run that action everytime we receive a notification for a specific repository.

```js
var handler = flick();

handler.use('your-username/a-repository', gitPull('/path/to/working-copy', { rebase: true }));
```

Let's then configure connect.

```js
// Parse body of POST requests
app.use(connect.bodyParser());

// Hook flick with express
app.use(flick.secret(process.env.GITHUB_SECRET));
app.use(flick.payload());
app.use(handler);
```

Launch the HTTP server.

```js
// Thank GitHub for their niceness
app.use(function(req, res) {
    res.writeHead(200);
    res.end('Thank you, dear friend.\n');
});

app.listen(4001);
console.log('flick is listening on port 4001');
```

Now, run the app with

    $ node update.js

And configure the endpoint in your repository settings on GitHub, under the **WebHooks** section.

From now on, everytime you will push something to GitHub, the handler above will be triggered and the repository clone on the server will get updated.

## Documentation

node-flick works very much like express. In fact, its API is a lot like express' one:

### flick()

Create a middleware for express.

```js
var express = require('express'),
    flick = require('flick'),
    app = express(),
    handler = flick();

handler.use(function(req, res, next) {
    console.log('Got a WebHook!');
    next();
});

app.use('/webhook', handler);
app.listen(3000);
```

### flick.github(secret)

Create a middleware for express, that makes sure that the incoming request comes from GitHub.  
It takes a single argument, which is the GitHub secret key that you configured in
the "web" [service hook](http://developer.github.com/v3/repos/hooks/).

```js
var express = require('express'),
    flick = require('flick'),
    app = express(),
    handler = flick();

handler.use(function(req, res, next) {
    console.log('Got a WebHook!');
    next();
});

app.use('/webhook', flick.secret(process.env.GITHUB_SECRET));
app.use('/webhook', handler);
app.listen(3000);
```

### flick.whitelist([options])

**If you want to make sure the request comes from GitHub, use flick.github() instead.**

Create a middleware for express, that makes sure that the incoming request comes from a whitelisted IP.  
It takes an optional object argument with can hold the following properties:
* `known` Check the request's remote IP against the known GitHub IPs. Defaults to `true`. (deprecated)
* `ips` An array of allowed IPs, that will be merged with GitHub's known IPs if `known` is enabled. Defaults to `[]`.
* `local` Allow requests from the local machine. It's basically a shortcut for `ips: ['127.0.0.1']`. Defaults to `false`.

```js
var express = require('express'),
    flick = require('flick'),
    app = express(),
    handler = flick();

handler.use(function(req, res, next) {
    console.log('Got a WebHook!');
    next();
});

app.use('/webhook', flick.whitelist({ known: true, ips: ['192.168.1.23'], local: true }));
app.use('/webhook', handler);
app.listen(3000);
```

### flick.payload([name])

Create a middleware for express, that checks if the payload sent by GitHub is there, parse it, and assign it to `req.flick.payload`.  
You don't have to use it, but it's quite handy to avoid doing that check and calling `JSON.parse` on `req.body.payload` manually.

Takes an optional argument holding the name of the POST body field that holds the payload. Defaults to `payload`, which is what GitHub uses.

```js
var express = require('express'),
    flick = require('flick'),
    app = express(),
    handler = flick();

handler.use(function(req, res, next) {
    var repository = req.flick.payload.repository;
    console.log('Got WebHook for %s/%s', repository.owner.name, repository.name);
    next();
});

app.use('/webhook', flick.secret(process.env.GITHUB_SECRET));
app.use('/webhook', flick.payload());
app.use('/webhook', handler);
app.listen(3000);
```

### handler.use([repo], fn)

Use the given handler `fn(req, res, next)` with optional `repo`, whose form is `username/repository`, defaulting to `*`.  

`req` represents the current HTTP request. It's the same object that express would give us, only augmented with a `flick` property which is an object with for now only one property `payload`, holding the payload GitHub sent us.  

`res` represents the current HTTP response. It's exactly the same object that express would give us.  

Calling `next` will call the next flick handler, or give the control back to express if there aren't any.

Say you want to log to the console whenever a WebHook is fired, for any repository this hook is configured for:
```js
handler.use(function(req, res, next) {
    var repository = req.flick.payload.repository;
    console.log('Got WebHook for %s/%s', repository.owner.name, repository.name);
    next();
});
```

Or maybe you only want to do that for a specific repository:
```js
handler.use('romac/node-houdini', function(req, res, next) {
    console.log('Got WebHook for Houdini!');
    next();
});
```

## License

node-flick is released under the [MIT License](http://romac.mit-license.org).
