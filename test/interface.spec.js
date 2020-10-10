const chai = require("chai");
const FsDriver = require("../app/fsdriver");
const CloudDriver = require("../app/clouddriver");
const sinon = require("sinon");
const { mockRequest, mockResponse } = require("mock-req-res");
const LogFactory = require("../app/logfactory");

const expect = chai.expect;

chai.use(require("sinon-chai"));

function assertContractOf(classInstance, displayName) {
  return describe(displayName, () => {
    let instance;

    before(() => {
      instance = Reflect.construct(classInstance, {});
    });

    it("should have a static create method with no args", () => {
      const expectedFn = classInstance.create;

      expect(expectedFn).to.exist;
      expect(expectedFn).to.be.instanceOf(Function);
      expect(expectedFn.length).to.equal(0);
    });

    it("should have a interface member", () => {
      expect(instance.interface).to.exist;
      expect(instance.interface).to.be.instanceOf(Object);
    });

    describe("interface member", () => {
      it("should have a download method that takes 2 arguments", () => {
        expect(instance.interface.download).to.be.instanceOf(Function);
        expect(instance.interface.download.length).to.equal(2);
      });

      it("should have a upload method that takes 2 arguments", () => {
        expect(instance.interface.upload).to.be.instanceOf(Function);
        expect(instance.interface.upload.length).to.equal(2);
      });
    });

    describe("upload", () => {
      let instance;

      beforeEach(() => {
        instance = Reflect.construct(classInstance, {});
      });

      it("should invoke upload method", () => {
        let buffer = Buffer.from("buffer"),
          req = mockRequest({
            path: "/path/to/asset",
            body: buffer,
          }),
          res = mockResponse();

        instance.upload = sinon.fake.resolves();

        return instance.interface.upload(req, res).then(() => {
          expect(instance.upload).to.have.been.calledWith(
            "/path/to/asset",
            buffer
          );
          expect(res.status).to.have.been.calledWith(200);
        });
      });
    });

    describe("download", () => {
      let instance;

      beforeEach(() => {
        instance = Reflect.construct(classInstance, {});
      });

      it("should invoke download method", () => {
        let req = mockRequest({ path: "/path/to/asset" }),
          res = mockResponse();

        instance.download = sinon.fake.resolves(Buffer.from("buffer"));

        return instance.interface.download(req, res).then(() => {
          expect(instance.download).to.have.been.calledWith("/path/to/asset");
          expect(res.status).to.have.been.calledWith(200);
          expect(res.send).to.have.been.calledWith(Buffer.from("buffer"));
        });
      });
    });
  });
}

describe("implementations", () => {
  before(() => {
    LogFactory.adjust();
  });

  assertContractOf(FsDriver, "FsDriver");
  assertContractOf(CloudDriver, "CloudDriver");
});
