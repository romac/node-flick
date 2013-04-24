
// First, import everything we need (I assume that you installed Flick via the above command).
var connect = require('connect'),
    shell = require('shelljs'),
    flick = require('flick'),
    handler = flick(),
    app = connect();

// Then, define the action to run once we'll receive the notification from GitHub.
function gitPull(root, options)
{
    return function(req, res, next)
    {
        console.log('[flick] Web hook called.');
        
        var cmd = 'git pull' + (options.rebase ? ' --rebase' : '');

        shell.cd(root);
        shell.exec(cmd, function(code, output) {
            console.log(cmd + ' exited with code ' + code);
        });

        next();
    };
}

// Tell Flick to run that action everytime we receive a notification for a specific repository.
handler.use('your-username/a-repository', gitPull('/path/to/working-copy', { rebase: true }));

// Make sure to be able to parse POST body.
app.use(connect.bodyParser());

// Hook Flick in
app.post('/flick', flick.whitelist({ local: true }));
app.post('/flick', flick.payload());
app.post('/flick', handler);
app.post('/flick', function(req, res) {
    res.writeHead(200);
    res.end('Thank you, dear friend.\n');
});

app.listen(4001);
console.log('flick is listening on port 4001');
