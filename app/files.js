const log = require("bunyan").createLogger({
  name: "files",
  level: process.env.BUNYAN_LOG_LEVEL || "info",
});

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

function onUploadOrDownload(req, res) {
  if (req.method === "PUT") {
    upload(req, res);
  } else {
    download(req, res);
  }
}

module.exports = {
  onUploadOrDownload,
};
