const chai = require("chai");
const { IOError } = require("../app/exceptions");
const {
  rewire,
  givenAssets,
  clearAssets,
  getAssetSync,
} = require("./gcpstorage");

const expect = chai.expect;

const CloudDriver = rewire("../app/clouddriver");

describe("CloudDriver", () => {
  describe("Create", () => {
    it("should create driver with specified bucket", () => {
      let instance = new CloudDriver("bucket");

      expect(instance._bucket).to.equals("bucket");
    });
  });

  describe("Download", () => {
    let instance;

    beforeEach(() => {
      instance = new CloudDriver("bucket");
      givenAssets(["/path/to/asset"]);
    });

    afterEach(() => {
      clearAssets();
    });

    it("should download asset from gcp", () => {
      return instance.download("/path/to/asset").then((buffer) => {
        expect(buffer).to.eqls(Buffer.from("downloaded"));
      });
    });

    it("should reject download if asset does not exists", () => {
      return instance.download("/path/to/other/assets").then(
        () => {
          expect.fail();
        },
        (err) => {
          expect(err).to.be.instanceOf(IOError);
          expect(err.code).to.equals("ENOENT");
        }
      );
    });
  });

  describe("Upload", () => {
    let instance;

    beforeEach(() => {
      instance = new CloudDriver("bucket");
      clearAssets();
    });

    afterEach(() => {
      clearAssets();
    });

    it("should upload asset to gcp", () => {
      return instance
        .upload("/path/to/assets", Buffer.from("asset"))
        .then(() => {
          expect(getAssetSync("/path/to/assets")).to.eqls("uploaded");
        });
    });
  });

  describe("Members", () => {
    it("should return the name of the bucket", () => {
      let instance = new CloudDriver("bucket");

      expect(instance.bucket).to.equals("bucket");
    });
  });
});
