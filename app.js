var fs = require('fs'),
    indexHTML = fs.readFileSync(__dirname + '/index.html'),
    requireJS = fs.readFileSync(__dirname + '/node_modules/requirejs/require.js'),
    express = require('express'),
    app = express(),
    ko = require('knockout');

app.use(express.logger('dev'));

['css', 'src', 'lib'].forEach(function (dir) {
    app.use('/' + dir, express.static(__dirname + '/' + dir));
});
app.use('/img', express.static(__dirname + '/img', {maxAge: 60000}));

app.get('/', staticFile('index.html', 'text/html; charset=utf-8'));
app.get('/jswrapped/require.js', staticFile('node_modules/requirejs/require.js'));
app.get('/jswrapped/*', wrappedJS('src'));

function staticFile(path, contentType) {
    var content = fs.readFileSync(__dirname + '/' + path);
    return function (req, res) {
        res.set('Content-Type', contentType);
        res.send(content);
    };
}

function wrappedJS(dir) {
    var cache = {};
    return function (req, res, next) {
        var path = req.params[0],
            val = cache[path];
        res.set('Content-Type', 'text/javascript');
        if (val) {
            res.send(val);
        }
        else {
            fs.readFile(__dirname + '/' + dir + '/' + path, function (err, script) {
                if (err) return next(err);

                val = 'define(function (require, exports, module) {\n' + script + '\n});\n';
                if (app.get('env') !== 'development') {
                    cache[path] = script
                }
                res.send(val);
            });
        }
    }
}

app.listen(process.env.VCAP_APP_PORT || 3000);
