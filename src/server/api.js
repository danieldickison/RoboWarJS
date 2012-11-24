var express = require('express'),
    api = express(),
    robots = require('./robots');

module.exports = api;

api.post('/login', function (req, res) {
    var user = req.body.user,
        password = req.body.password;
    // TODO: actually check the password (in db)
    req.session.user = user;
    res.json({user: user, authenticated: true});
});

api.post('/logout', function (req, res) {
    req.session = null;
    res.json({user: null});
});

api.get('/examples', function (req, res) {
    if (api.get('env') === 'development') {
        robots.reloadExamplesSync();
    }
    res.json({exampleRobots: robots.examples()});
});

api.get('/robot/:robot', function (req, res) {
    robots.getRobotData(req.params.robot, function (err, bot) {
        res.json({robot: bot});
    });
});

api.post('/robot/:robot', function (req, res) {
    if (!req.session.user) return res.send(403, 'Not logged in');
    robots.getRobotData(req.params.robot, function (err, bot) {
        if (err && err.code !== 'ENOENT') return res.send(404, err);
        if (bot && bot.user !== req.session.user) return res.send(403, 'Not authorized to modify robot');

        var robotData = req.body;
        robotData.user = req.session.user;
        robots.setRobotData(req.params.robot, robotData, function (err) {
            res.json({ok: true});
        });
    });
});
