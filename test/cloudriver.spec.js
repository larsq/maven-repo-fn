const chai = require("chai");
const expect = chai.expect;
const CloudDriver = require("../app/clouddriver");
const sinon = require("sinon");
const { mockRequest, mockResponse } = require("mock-req-res");

chai.use(require("chai-sinon"));

describe("CloudDriver", () => {
  describe("Create", () => {
    it("should create driver with specified bucket", () => {
      let instance = new CloudDriver("bucket");

      expect(instance._bucket).to.equals("bucket");
    });
  });

  describe("Members", () => {
    it("should return the name of the bucket", () => {
      let instance = new CloudDriver("bucket");

      expect(instance.bucket).to.equals("bucket");
    });
  });

  describe("Interface", () => {
    let instance;

    beforeEach(() => {
      instance = new CloudDriver("bucket");
    });
  });
});
