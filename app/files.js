const log = require("bunyan").createLogger({
  name: "files",
  level: process.env.BUNYAN_LOG_LEVEL || "info",
});
const { onRequest, switchOnMethod, rewritePath } = require("./filters");

function upload(req, res) {
  log.debug(
    `upload to path=${req.path} length=${req.headers["content-length"]} type=${req.headers["content-type"]}`
  );

  if (req.headers["content-type"] !== "application/octet-stream") {
    res.sendStatus(415);
    return;
  }

  res.sendStatus(200);
}

function download(req, res) {
  log.info(`download from path ${req.path}`);
  res.sendStatus(200);
}

const onPut = onRequest(upload, [rewritePath("repo", "maven-repo")]);
const onGet = onRequest(download, [rewritePath("repo", "maven-repo")]);

module.exports = switchOnMethod({ PUT: onPut, GET: onGet });
