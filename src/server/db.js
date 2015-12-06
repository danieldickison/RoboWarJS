'use strict';

var fs = require('fs'),
    sqlite3 = require('sqlite3').verbose(),
    scrypt = require('scrypt'),
    scryptParams = scrypt.paramsSync(0.1);

var db;

exports.init = function (filePath) {
    db = new sqlite3.Database(filePath);
    db.serialize(function () {
        db.run(`
            CREATE TABLE IF NOT EXISTS User (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                passwordHash TEXT NOT NULL,
                newDate INTEGER NOT NULL,
                loginDate INTEGER
            )
        `);
    });
};

exports.getDB = function () {
    return db;
};

// callback(error, userID)
exports.User = {
    create: function (name, passwordHash, callback) {
        db.run(`
            INSERT INTO User (name, passwordHash, newDate, loginDate)
            VALUES ($name, $passwordHash, $now, $now)
        `, {
            $name: name, $passwordHash: passwordHash, $now: Date.now()
        }, function (error) {
            callback(error, this.lastID);
        });
    },

    lookupID: function (id, callback) {
        db.get(`SELECT * FROM User WHERE id = ?`, id, callback);
    },

    lookupName: function (name, callback) {
        db.get(`SELECT * FROM User WHERE name = ?`, name, callback);
    },

    bumpLoginDate: function (id) {
        db.run(`
            UPDATE User
            SET loginDate = $now
            WHERE id = $id
        `, {
            $id: id, $now: Date.now()
        });
    },

    updatePassword: function (id, passwordHash, callback) {
        db.run(`
            UPDATE User
            SET passwordHash = $passwordHash
            WHERE id = $id
        `, {
            $id: id, $passwordHash: passwordHash
        }, function (error) {
            if (error) callback(error);
            else if (this.changes === 0) callback('User id not found');
            else callback();
        });
    }
};
