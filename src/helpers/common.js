
const crypto = require('crypto');
const path = require('path')
const fs = require('fs')
const distFolderPath = path.join(__dirname, '../uploads/');

exports.readHTMLFile = function (path, cb) {
    // read file
    fs.readFile(path, 'utf-8', function (err, data) {
        if (err) {
            console.log(err)
            throw err;
        } else {
            cb(null, data);
        }
    });
}
