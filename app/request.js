const { authorizeWithCredentials, credential } = require("./authorize");
const { isGetOrPut, onRequest } = require("./filters");
const { onUploadOrDownload } = require("./files");
const { USERNAME, PASSWORD } = require("./config");

function factory() {
  return onRequest(onUploadOrDownload, [
    isGetOrPut,
    authorizeWithCredentials(credential(USERNAME, PASSWORD)),
  ]);
}

module.exports = factory;
