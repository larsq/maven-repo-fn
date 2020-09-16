const {
  onRequest,
  switchOnMethod,
  rewritePath,
  acceptedContentType,
} = require("./filters");

const { env } = require("./util");

function driver() {
  const mode = env("RUN_MODE").toLowerCase();

  if (mode == "local") {
    return require("./fsdriver").create();
  } else if (mode == "cloud") {
    return require("./clouddriver").create();
  } else {
    throw Error(`Unsupported mode: ${mode}`);
  }
}

function createRewritePath() {
  const source = env("SOURCE_PATH");
  const target = env("TARGET_PATH");

  return rewritePath(source, target);
}

const instance = driver();
const transformPath = createRewritePath();

const onPut = onRequest(instance.interface.upload, [
  transformPath,
  acceptedContentType("application/octet-stream"),
]);

const onGet = onRequest(instance.interface.download, [transformPath]);

module.exports = switchOnMethod({ PUT: onPut, GET: onGet });
