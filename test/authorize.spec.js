const { expect } = require("chai");
const { credential } = require("../app/authorize");

describe("authorize", () => {
  describe("credential", () => {
    it("should create basic authentication encoded credential", () => {
      expect(credential("user", "secret")).to.equals("dXNlcjpzZWNyZXQ=");
    });
  });
});
