const { authorizeWithCredentials, credential } = require("./authorize");
const log = require("bunyan").createLogger({
  name: "request",
  level: process.env.BUNYAN_LOG_LEVEL || "info",
});
const { onUploadOrDownload } = require("./files");
const { USERNAME, PASSWORD } = require("./config");

function isGetOrPut(req, res, onSuccess) {
  log.debug(
    `received request ${req.method} ${req.path} ${JSON.stringify(req.headers)}`
  );

  switch (req.method) {
    case "GET":
    case "PUT":
      onSuccess(req, res);
      break;
    default:
      res.status(405).send();
  }
}

function createCallback(filters, fn) {
  let unprocessed = Array.from(filters);

  const filterFn = (req, res) => {
    if (!unprocessed.length) {
      fn(req, res);
    } else {
      const next = unprocessed.shift();
      next(req, res, filterFn);
    }
  };

  return filterFn;
}

function onRequest(handleRequest, filters) {
  return (req, res) => {
    createCallback(filters, handleRequest)(req, res);
  };
}

function factory() {
  return onRequest(onUploadOrDownload, [
    isGetOrPut,
    authorizeWithCredentials(credential(USERNAME, PASSWORD)),
  ]);
}

module.exports = factory;
