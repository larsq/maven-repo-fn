const { expect } = require("chai");
const { replace, paths } = require("../app/util");

describe("util", () => {
  describe("paths", ()=>{
    it("should split into subpaths", () => {
      expect(paths("foo/bar/woz")).to.eql([
        "foo",
        "foo/bar",
        "foo/bar/woz",
      ]);
    });
  })

  describe("replace", () => {
    it("should return undefined for path that does not start with prefix", () => {
      const target = replace("source/given/target", "/other", "ignored");

      expect(target).to.be.undefined;
    });

    it("should replace source suffix with target", () => {
      const targets = [
        replace("/source/given/target", "/source", "target"),
        replace("source/given/target", "source", "/target"),
        replace("/source/given/target", "source/", "target/"),
        replace("/source/given/target", "/source/", "/target/"),
      ];

      targets.forEach((target) => {
        expect(target).to.be.equal("/target/given/target");
      });
    });
  });
});
