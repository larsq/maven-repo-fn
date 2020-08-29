const { expect } = require("chai");
const FsDriver = require("../app/fsdriver");
const { IOError } = require("../app/exceptions");
const tempy = require("tempy");
const del = require("del");
const fs = require("fs");
const { assert } = require("console");

describe("FsDriver", () => {
  describe("create", () => {
    let root;

    before(() => {
      root = tempy.directory();
    });

    afterEach(() => {
      del.sync([`${root}/dir`], { force: true });
    });

    it("should have a root property", () => {
      const path = `${root}/dir`;
      const instance = new FsDriver(path);

      expect(instance.root).to.be.equal(path);
    });

    it("should promise that a non-existing directory exists", () => {
      const path = `${root}/dir`;
      const instance = new FsDriver(path);

      return instance.existing().then((promisedPath) => {
        expect(promisedPath).to.be.equal(path);
        expect(fs.existsSync(instance.root)).to.be.true;
      });
    });

    it("should promise that an existing directory exists", () => {
      const path = `${root}/dir`;
      fs.mkdirSync(path);

      const instance = new FsDriver(path);
      return instance.existing().then((promisedPath) => {
        expect(promisedPath).to.be.equal(path);
        expect(fs.existsSync(instance.root)).to.be.true;
      });
    });
  });

  describe("upload", () => {
    let root;
    let instance;
    let buffer;

    before(() => {
      root = tempy.directory();
      instance = new FsDriver(`${root}/dir`);
      buffer = Buffer.from("input string");

      fs.mkdirSync(`${root}/dir`);
      fs.writeFileSync(`${root}/dir/file.txt`, "A simple file");
      fs.mkdirSync(`${root}/dir/dir2`);
    });

    after(() => {
      del.sync([`${root}/dir`], { force: true });
    });

    it("should promise an uploaded file", () => {
      return instance
        .upload("file2.txt", buffer)
        .then(() => {
          return fs.promises.readFile(`${root}/dir/file2.txt`);
        })
        .then((actualBuffer) => {
          expect(actualBuffer).to.exist;
          expect(actualBuffer.equals(buffer)).to.be.true;
        });
    });

    it("should promise to auto-create missing directories when uploading a file", () => {
      return instance
        .upload("dir2/dir3/file2.txt", buffer)
        .then(() => {
          return fs.promises.readFile(`${root}/dir/dir2/dir3/file2.txt`);
        })
        .then((actualBuffer) => {
          expect(actualBuffer).to.exist;
          expect(actualBuffer.equals(buffer)).to.be.true;
        });
    });

    it("should reject a promise if there are already a file with same name", () => {
      return instance
        .upload("file.txt", buffer)
        .then(() => expect.fail())
        .catch((err) => {
          expect(err).is.instanceOf(IOError);
          expect(err.code).to.equals("EEXIST");
        });
    });
  });

  describe("download", () => {
    let root;
    let instance;

    before(() => {
      root = tempy.directory();
      instance = new FsDriver(`${root}/dir`);

      fs.mkdirSync(`${root}/dir`);
      fs.writeFileSync(`${root}/dir/file.txt`, "A simple file");
      fs.mkdirSync(`${root}/dir/dir2`);
    });

    after(() => {
      del.sync([`${root}/dir`], { force: true });
    });

    it("should promise a buffer with existing file", () => {
      return instance.download("file.txt").then((buffer) => {
        expect(buffer).to.be.instanceOf(Buffer);
        expect(buffer.length).to.equals(13);
      });
    });

    it("should reject a promise a buffer given a non-existing file", () => {
      return instance
        .download("other.txt")
        .then(() => {
          expect.fail();
        })
        .catch((err) => {
          expect(err).instanceOf(IOError);
          expect(err.code).to.equals("ENOENT");
        });
    });

    it("should reject a promise a buffer given a directory", () => {
      return instance
        .download("dir2")
        .then(() => {
          expect.fail();
        })
        .catch((err) => {
          expect(err).instanceOf(IOError);
          expect(err.code).to.equals("EISDIR");
        });
    });
  });

});
