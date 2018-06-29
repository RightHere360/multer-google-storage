import { expect } from 'chai';
import * as mockery from  'mockery';


describe('multer-google-storage', () => {
    before(() => {
        mockery.enable();
        const storageMock = function() { this.bucket = () => {}};
        mockery.registerMock('@google-cloud/storage', storageMock);
    });

    it('should define multer storage engine interface',() => {

        const MulterGoogleCloudStorage = require('./index').default;
        const cloudStorage = new MulterGoogleCloudStorage({
            bucket: 'test',
            credentials: {},
        });

        expect(cloudStorage._handleFile).to.be.a('function');
        expect(cloudStorage._removeFile).to.be.a('function');
    });

    after(() => mockery.disable());
})

