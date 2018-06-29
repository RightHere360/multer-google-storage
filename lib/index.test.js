"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var mockery = require("mockery");
describe('multer-google-storage', function () {
    before(function () {
        mockery.enable();
        var storageMock = function () { this.bucket = function () { }; };
        mockery.registerMock('@google-cloud/storage', storageMock);
    });
    it('should define multer storage engine interface', function () {
        var MulterGoogleCloudStorage = require('./index').default;
        var cloudStorage = new MulterGoogleCloudStorage({
            bucket: 'test',
            credentials: {},
        });
        chai_1.expect(cloudStorage._handleFile).to.be.a('function');
        chai_1.expect(cloudStorage._removeFile).to.be.a('function');
    });
    after(function () { return mockery.disable(); });
});
//# sourceMappingURL=index.test.js.map