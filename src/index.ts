import * as multer from 'multer';
import Promise from 'bluebird';
import _debug from 'debug';
import { Storage, Bucket, ConfigurationObject } from '@google-cloud/storage';
import * as uuid from 'uuid/v1';

const storage = require('@google-cloud/storage');
// const storage: (options?: ConfigurationObject) => Storage = require('@google-cloud/storage');
const debug = _debug('multergcs');

const getFilename = (req, file, cb) => {
  cb(null, `${uuid()}_${file.originalname}`);
};

const getDestination = (req, file, cb) => {
  cb(null, '');
};

//
//
export default class MulterGoogleCloudStorage implements multer.StorageEngine {
  private gcobj: Storage;
  private gcsBucket: Bucket;
  private options: ConfigurationObject & { acl?: string; bucket?: string };

  private getFilename: Function;

  constructor(opts?: ConfigurationObject & { filename?: any; bucket?: string }) {
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
      promise: Promise,
    });
    this.gcsBucket = this.gcobj.bucket(opts.bucket);
    this.options = opts;
  }

  _handleFile(req, file, cb) {
    debug('_handleFile()', file);
    getDestination(req, file, (err, destination) => {
      if (err) {
        debug('_handleFile() > getDestination > error', err);
        return cb(err);
      }

      debug('_handleFile() > getDestination', destination);

      this.getFilename(req, file, (err, filename) => {
        if (err) {
          debug('_handleFile() > getFilename > error', err);
          return cb(err);
        }
        debug('_handleFile() > getFilename', filename);
        var gcFile = this.gcsBucket.file(filename);
        file.stream
          .pipe(
            gcFile.createWriteStream({
              predefinedAcl: this.options.acl || 'private',
            })
          )
          .on('error', err => {
            debug('_handleFile() > error', err);
            cb(err);
          })
          .on('finish', file => {
            debug('_handleFile() > finish');
            cb(null, {
              path: `https://${this.options.bucket}.storage.googleapis.com/${filename}`,
              filename: filename,
            });
          });
      });
    });
  };
  _removeFile(req, file, cb) {
    debug('_removeFile()');
    const gcFile = this.gcsBucket.file(file.filename);
    gcFile.delete();
  };
}

export function storageEngine(opts?: ConfigurationObject & { filename?: any; bucket?: string }) {
  debug('init storageEngine Multer GCS ...', opts);
  return new MulterGoogleCloudStorage(opts);
}
