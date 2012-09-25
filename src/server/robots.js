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
        throw 'TODO: Non-example bots not yet supported';
    }
};

exports.examples = function () {
    return _.sortBy(exampleRobots, 'name');
}

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