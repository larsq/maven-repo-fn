const chai = require("chai");
const http = require("chai-http");
const server = require("../app/server");
const RequestFactory = require("../app/request");
const fs = require("fs-extra");
const process = require("process");
const FsDriver = require("../app/fsdriver");
const Path = require("path");
const tempy = require("tempy");
const LogFactory = require("../app/logfactory");

chai.use(http);
const expect = chai.expect;

const DEFAULT_USERNAME = "user";
const DEFAULT_PASSWORD = "secret";

/**
 * @param {string[]} files the relative paths of files to create
 * @returns {FsDriver} the created driver
 */
function createDriverWithAssets(files) {
  const instance = FsDriver.create();

  files.forEach((file) => {
    const fullPath = Path.join(instance.root, file);

    fs.ensureDirSync(Path.dirname(fullPath));
    fs.writeFileSync(fullPath, file);
  });

  return instance;
}

/**
 *
 * @param {FsDriver} driver
 * @param {string} relativePath
 * @returns {Buffer} the stored instance as a buffer
 */
function readAsset(driver, relativePath) {
  const fullPath = Path.join(driver.root, relativePath);

  return fs.readFileSync(fullPath);
}

describe("server", () => {
  let driver;
  let app;

  before(() => {
    LogFactory.adjust();
    driver = createDriverWithAssets(["maven-repo/adir/file.txt"]);

    app = server(RequestFactory());
  });

  it("should return 401 if user credenitals is not set", () => {
    chai
      .request(app)
      .get("/")
      .end((err, res) => {
        expect(res).to.have.status(401);
      });
  });

  it("should return 401 if user credentials are wrong", () => {
    chai
      .request(app)
      .get("/")
      .auth("user", "guess")
      .end((err, res) => {
        expect(res).to.have.status(401);
      });
  });

  it("should support GET", () => {
    chai
      .request(app)
      .get("/repo/adir/file.txt")
      .auth(DEFAULT_USERNAME, DEFAULT_PASSWORD)
      .buffer()
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.eql(Buffer.from("maven-repo/adir/file.txt"));
      });
  });

  it("should return 404 if file does not exists", () => {
    chai
      .request(app)
      .get("/repo/adir/nonexistent.txt")
      .auth(DEFAULT_USERNAME, DEFAULT_PASSWORD)
      .end((err, res) => {
        expect(res).to.have.status(404);
      });
  });

  it("should return 404 if url not refers a file", () => {
    chai
      .request(app)
      .get("/repo/adir")
      .auth(DEFAULT_USERNAME, DEFAULT_PASSWORD)
      .end((err, res) => {
        expect(res).to.have.status(404);
      });
  });

  it("should only be able to download files under /repo", () => {
    chai
      .request(app)
      .get("/path/repo/adir/file.txt")
      .auth(DEFAULT_USERNAME, DEFAULT_PASSWORD)
      .end((err, res) => {
        expect(res).to.have.status(400);
      });
  });

  it("should only support application/octet-stream when uploading files", () => {
    chai
      .request(app)
      .put("/repo/path")
      .auth(DEFAULT_USERNAME, DEFAULT_PASSWORD)
      .type("text")
      .send("something")
      .end((err, res) => {
        expect(res).to.have.status(415);
      });
  });

  it("should support PUT", () => {
    request = chai
      .request(app)
      .put("/repo/path")
      .auth(DEFAULT_USERNAME, DEFAULT_PASSWORD)
      .type("application/octet-stream")
      .set("Content-Length", "12")
      .send(Buffer.from("input string"))
      .end((err, res) => {
        expect(res).to.have.status(200);

        let actual = readAsset(driver, "maven-repo/path");
        expect(actual).to.eql(Buffer.from("input string"));
      });
  });

  it("should only support PUT under /repo", () => {
    request = chai
      .request(app)
      .put("/path/repo")
      .auth(DEFAULT_USERNAME, DEFAULT_PASSWORD)
      .type("application/octet-stream")
      .set("Content-Length", "12")
      .send(Buffer.from("input string"))
      .end((err, res) => {
        expect(res).to.have.status(400);
      });
  });

  it("should not support POST", () => {
    chai
      .request(app)
      .post("/repo/path")
      .type("text")
      .send("something")
      .end((err, res) => {
        expect(res).to.have.status(405);
      });
  });
});
