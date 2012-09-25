var express = require('express'),
    api = express(),
    robots = require('./robots');

module.exports = api;

api.get('/examples', function (req, res) {
    if (api.get('env') === 'development') {
        robots.reloadExamplesSync();
    }
    res.json({exampleRobots: robots.examples()});
});
