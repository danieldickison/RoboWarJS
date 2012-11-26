var fs = require('fs'),
    express = require('express'),
    app = express();

app.use(express.logger('dev'));
app.use(express.cookieParser());
app.use(express.cookieSession({
    secret: process.env.SESSION_SECRET || 'zebra',
    cookie: { maxAge: 60 * 60 * 24 * 365 }
}))
app.use(express.urlencoded());
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

['css', 'src', 'lib'].forEach(function (dir) {
    app.use('/' + dir, express.static(__dirname + '/' + dir));
});
app.use('/img', express.static(__dirname + '/img', {maxAge: 60000}));

app.get('/', function (req, res) {
    res.render('index');
});
app.get('/lib/require.js', staticFile('node_modules/requirejs/require.js'));
app.get('/lib/underscore-min.js', staticFile('node_modules/underscore/underscore-min.js'));
app.get('/jswrapped/*', wrappedJS('src'));
app.use('/api', require('./src/server/api'));

function staticFile(path, contentType) {
    var content = fs.readFileSync(__dirname + '/' + path);
    return function (req, res) {
        if (app.get('env') === 'development') {
            res.sendfile(__dirname + '/' + path);
        }
        else {
            res.set('Content-Type', contentType);
            res.send(content);
        }
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

var port = process.env.VCAP_APP_PORT || 3000;
app.listen(port);
console.log('Listening on port ' + port);
