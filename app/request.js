const { authorizeWithCredentials, basicAuth } = require("./authorize");
const { onRequest, acceptMethods } = require("./filters");
const fileRequest = require("./files");
const { USERNAME, PASSWORD } = require("./config");

function factory() {
  return onRequest(fileRequest, [
    acceptMethods(["GET", "PUT"]),
    authorizeWithCredentials("Basic", basicAuth(USERNAME, PASSWORD)),
  ]);
}

module.exports = factory;
