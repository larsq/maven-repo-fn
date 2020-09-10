const {
  onRequest,
  switchOnMethod,
  rewritePath,
  acceptedContentType,
} = require("./filters");

const FsDriver = require("./fsdriver");

const instance = FsDriver.create();

const onPut = onRequest(instance.interface.upload, [
  rewritePath("repo", "maven-repo"),
  acceptedContentType("application/octet-stream"),
]);

const onGet = onRequest(instance.interface.download, [rewritePath("repo", "maven-repo")]);

module.exports = switchOnMethod({ PUT: onPut, GET: onGet });
