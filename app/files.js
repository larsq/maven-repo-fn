const log = require("bunyan").createLogger({
  name: "files",
  level: process.env.BUNYAN_LOG_LEVEL || "info",
});
const { onRequest } = require("./filters");

const { replace } = require("./util");

function upload(req, res) {
  const targetPath = replace(req.path, "repo", "maven-repo");

  if (!targetPath) {
    res.sendStatus(400);
    return;
  }

  log.debug(
    `upload to path=${targetPath} length=${req.headers["content-length"]} type=${req.headers["content-type"]}`
  );

  if (req.headers["content-type"] !== "application/octet-stream") {
    res.sendStatus(415);
    return;
  }

  res.sendStatus(200);
}

function download(req, res) {
  const targetPath = replace(req.path, "repo", "maven-repo");

  if (!targetPath) {
    res.sendStatus(400);
    return;
  }

  log.info(`download from path ${targetPath}`);
  res.sendStatus(200);
}

const onPut = onRequest(upload, []);
const onGet = onRequest(download, []);

function onUploadOrDownload(req, res) {
  const methods = { PUT: onPut, GET: onGet };

  if (req.method in methods) {
    log.debug(`processing ${req.method}`);
    methods[req.method](req, res);
  } else {
    res.status(405).send();
  }
}

module.exports = {
  onUploadOrDownload,
};
