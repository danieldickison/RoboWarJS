'use script';

var scrypt = require('scrypt'),
    scryptParameters = scrypt.paramsSync(0.1),
    db = require('./db');

exports.create = function (name, password, callback) {
    scrypt.kdf(password, scryptParameters, function (err, result) {
        if (err) return callback(err);
        var passwordHash = result.toString('base64');
        db.User.create(name, passwordHash, callback);
    });
};

exports.login = function (name, password, callback) {
    db.User.lookupName(name, function (err, user) {
        if (err) return callback(err);
        if (!user) return callback('Wrong name');
        scrypt.verifyKdf(user.passwordHash, password, function (err, result) {
            if (err) return callback(err);
            if (!result) return callback("Wrong password");
            
            db.User.bumpLoginDate(user.id);
            callback(null, user);
        });
    });
};

exports.changePassword = function (id, oldPassword, newPassword, callback) {
    db.User.lookupID(id, function (err, user) {
        if (err) return callback(err);
        if (!user) return callback('User id not found');
        scrypt.verifyKdf(user.passwordHash, oldPassword, function (err, result) {
            if (err) return callback(err);
            if (!result) return callback("Wrong password");

            scrypt.kdf(newPassword, scryptParameters, function (err, result) {
                if (err) return callback(err);
                var newHash = result.toString('base64');
                db.User.updatePassword(user.id, newHash, callback);
            });
        });
    });
};
