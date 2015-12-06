'use strict';

var fs = require('fs'),
    _ = require('underscore');

exports.getRobotData = function (name, cb) {
    if (name in exampleRobots) {
        var bot = exampleRobots[name];
        process.nextTick(function () {
            cb(null, bot);
        });
    }
    else {
        // TODO: db
        fs.readFile(__dirname + '/../../robots/' + name + '.json', function (err, str) {
            if (err) return cb(err);
            else if (str) return cb(null, JSON.parse(str));
            else return cb(null, null);
        });
    }
};

exports.setRobotData = function (name, data, cb) {
    // TODO: db
    fs.writeFile(__dirname + '/../../robots/' + name + '.json', JSON.stringify(data), cb);
};

exports.examples = function () {
    return _.sortBy(exampleRobots, 'name');
};

var exampleRobots = {};

exports.reloadExamplesSync = function () {
    var files = fs.readdirSync(__dirname + '/../../robots');
    files.forEach(function (file) {
        if (/\.json$/.test(file)) {
            var bot = JSON.parse(fs.readFileSync(__dirname + '/../../robots/' + file, 'utf-8'));
            exampleRobots[bot.name] = bot;
        }
    });
};