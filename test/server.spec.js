const chai = require("chai");
const http = require("chai-http");
const server = require("../app/server");
const RequestFactory = require("../app/request");
const { Readable } = require("stream");

chai.use(http);
const expect = chai.expect;
const app = server(RequestFactory());

const DEFAULT_USERNAME = "user";
const DEFAULT_PASSWORD = "secret";

describe("server", () => {
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
      .get("/repo/path")
      .auth(DEFAULT_USERNAME, DEFAULT_PASSWORD)
      .end((err, res) => {
        expect(res).to.have.status(200);
      });
  });

  it("should only be able to download files under /repo", () => {
    chai
      .request(app)
      .get("/path/repo")
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
