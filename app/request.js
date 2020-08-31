const { authorizeWithCredentials, credential } = require("./authorize");
const { onRequest, acceptMethods } = require("./filters");
const { onUploadOrDownload } = require("./files");
const { USERNAME, PASSWORD } = require("./config");

function factory() {
  return onRequest(onUploadOrDownload, [
    acceptMethods(["GET", "PUT"]),
    authorizeWithCredentials(credential(USERNAME, PASSWORD)),
  ]);
}

module.exports = factory;
