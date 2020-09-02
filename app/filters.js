const { replace } = require("./util");

const log = require("bunyan").createLogger({
  name: "filters",
  level: process.env.BUNYAN_LOG_LEVEL || "info",
});

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

/**
 * Creates a filer to check if method is acceptable
 * otherwise send a 405 error response
 * @param {String[]} methods list of acceptable methods
 */
function acceptMethods(methods) {
  return function acceptMethods(req, res, onSuccess) {
    const method = req.method;

    if (methods.some((e) => e === method)) {
      onSuccess(req, res);
    } else {
      log.debug(`${req.method} is not allowed: allowed methods are ${methods}`);
      res.status(405).send();
    }
  };
}

function switchOnMethod(methods) {
  return function onUploadOrDownload(req, res) {
    if (req.method in methods) {
      log.debug(`processing ${req.method}`);
      methods[req.method](req, res);
    } else {
      res.status(405).send();
    }
  };
}

function rewritePath(sourcePathPrefix, replaceWith) {
  return function rewrite(req, res, onSuccess) {
    const targetPath = replace(req.path, sourcePathPrefix, replaceWith);

    if (!targetPath) {
      res.status(400).send();
      return;
    }

    req.path = targetPath;
    onSuccess(req, res);
  };
}

function acceptedContentType(contentType) {
  return function acceptedContentType(req, res, onSuccess) {
    if (req.headers["content-type"] !== contentType) {
      res.sendStatus(415);
      return;
    }

    onSuccess(req, res);
  };
}

module.exports = {
  acceptMethods,
  onRequest,
  switchOnMethod,
  rewritePath,
  acceptedContentType,
};
