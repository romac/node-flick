
'use strict';

var crypto = require('crypto');

// Adapted from Tobie Langel's Ganesh.
// https://github.com/tobie/ganesh/blob/b2c1fe29d9bf6b366cf0902822177f8461685842/index.js#L17-L22
function requestComesFromGitHub(req, secret)
{
    // console.log('req', req);
    var hash = crypto.createHmac('sha1', secret).update(req.body).digest('hex');
    var hubSig = (req.headers['x-hub-signature'] || '').replace('sha1=', '');

    return hash === hubSig;
}

function github(secret)
{
    if(typeof secret !== 'string') {
        throw new Error('flick.github(): first argument should be a string, "' + secret + '" given.');
    }

    return function(req, res, next)
    {
        var err;

        if(!requestComesFromGitHub(req, secret)) {
            err = new Error('[flick] github: The remote\'s signature doesn\'t match.');
            err.status = 401;
        }

        next(err);
    };
};

module.exports = github;
