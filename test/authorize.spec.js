const { expect } = require("chai");
const { basicAuth } = require("../app/authorize");

describe("authorize", () => {
  describe("basicAuth", () => {
    it("should create basic authentication encoded credential", () => {
      expect(basicAuth("user", "secret")).to.equals("dXNlcjpzZWNyZXQ=");
    });
  });
});
