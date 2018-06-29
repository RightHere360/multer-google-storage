/// <reference types="google-cloud__storage" />
import * as multer from 'multer';
import { ConfigurationObject } from '@google-cloud/storage';
export default class MulterGoogleCloudStorage implements multer.StorageEngine {
    private gcobj;
    private gcsBucket;
    private options;
    private getFilename;
    constructor(opts?: ConfigurationObject & {
        filename?: any;
        bucket?: string;
    });
    _handleFile(req: any, file: any, cb: any): void;
    _removeFile(req: any, file: any, cb: any): void;
}
export declare function storageEngine(opts?: ConfigurationObject & {
    filename?: any;
    bucket?: string;
}): MulterGoogleCloudStorage;
