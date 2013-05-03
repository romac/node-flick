
// FIXME: should be in its own NPM package

"use strict";

var Netmask = require('netmask').Netmask;

whitelist.knownRemotes = [
    '207.97.227.224/27',
    '173.203.140.192/27',
    '204.232.175.64/27',
    '72.4.117.96/27',
    '204.232.175.64/27',
    '192.30.252.0/22',
    // '2620:112:3000::/44',
    '207.97.227.253',
    '50.57.128.197',
    '108.171.174.178',
    '50.57.231.61'
];

function contains(netmasks, ip)
{
    return netmasks.reduce(function(prev, cur) {
        return prev || cur.contains(ip);
    }, false);
}

function whitelist(options)
{
    options = options || {};

    var ips = options.ips || [];

    if(!ips.length || options.known) {
        ips = ips.concat(whitelist.knownRemotes);
    }

    if(options.local) {
        ips.push('127.0.0.1');
    }

    var netmasks = ips.map(function(ip) {
        return new Netmask(ip);
    });

    return function(req, res, next)
    {
        var err;

        if(!contains(netmasks, req.socket.remoteAddress)) {
            err = new Error('[flick] whitelist: Remote is not whitelisted (' + req.socket.remoteAddress + ').');
            err.status = 401;
        }

        next(err);
    };
};

module.exports = whitelist;
