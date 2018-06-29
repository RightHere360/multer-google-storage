"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bluebird_1 = require("bluebird");
var debug_1 = require("debug");
var uuid = require("uuid/v1");
var storage = require('@google-cloud/storage');
// const storage: (options?: ConfigurationObject) => Storage = require('@google-cloud/storage');
var debug = debug_1.default('multergcs');
var getFilename = function (req, file, cb) {
    cb(null, uuid() + "_" + file.originalname);
};
var getDestination = function (req, file, cb) {
    cb(null, '');
};
//
//
var MulterGoogleCloudStorage = /** @class */ (function () {
    function MulterGoogleCloudStorage(opts) {
        opts = opts || {};
        this.getFilename = opts.filename || getFilename;
        opts.bucket = opts.bucket || null;
        opts.credentials = opts.credentials || null;
        if (!opts.bucket) {
            throw new Error('You have to specify bucket for Google Cloud Storage to work.');
        }
        if (!opts.credentials) {
            throw new Error('You have to specify credentials for Google Cloud Storage to work.');
        }
        this.gcobj = new storage({
            credentials: opts.credentials,
            promise: bluebird_1.default,
        });
        this.gcsBucket = this.gcobj.bucket(opts.bucket);
        this.options = opts;
    }
    MulterGoogleCloudStorage.prototype._handleFile = function (req, file, cb) {
        var _this = this;
        debug('_handleFile()', file);
        getDestination(req, file, function (err, destination) {
            if (err) {
                debug('_handleFile() > getDestination > error', err);
                return cb(err);
            }
            debug('_handleFile() > getDestination', destination);
            _this.getFilename(req, file, function (err, filename) {
                if (err) {
                    debug('_handleFile() > getFilename > error', err);
                    return cb(err);
                }
                debug('_handleFile() > getFilename', filename);
                var gcFile = _this.gcsBucket.file(filename);
                file.stream
                    .pipe(gcFile.createWriteStream({
                    predefinedAcl: _this.options.acl || 'private',
                }))
                    .on('error', function (err) {
                    debug('_handleFile() > error', err);
                    cb(err);
                })
                    .on('finish', function (file) {
                    debug('_handleFile() > finish');
                    cb(null, {
                        path: "https://" + _this.options.bucket + ".storage.googleapis.com/" + filename,
                        filename: filename,
                    });
                });
            });
        });
    };
    ;
    MulterGoogleCloudStorage.prototype._removeFile = function (req, file, cb) {
        debug('_removeFile()');
        var gcFile = this.gcsBucket.file(file.filename);
        gcFile.delete();
    };
    ;
    return MulterGoogleCloudStorage;
}());
exports.default = MulterGoogleCloudStorage;
function storageEngine(opts) {
    debug('init storageEngine Multer GCS ...', opts);
    return new MulterGoogleCloudStorage(opts);
}
exports.storageEngine = storageEngine;
//# sourceMappingURL=index.js.map