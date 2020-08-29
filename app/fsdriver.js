const fs = require("fs");
const path = require("path");
const { paths } = require("./util");
const { IOError } = require("./exceptions");
const logger = require("bunyan").createLogger({
  name: "FsDriver",
  level: process.env.BUNYAN_LEVEL || "info",
});

class FsDriver {
  constructor(directory) {
    this.directory = directory;
  }

  get root() {
    return this.directory;
  }

  /**
   * Promise that a given path exists.
   * @param {?String} relativePath the relative path from root. If undefined, the root
   * is used
   * @returns {Promise<String>} a promise that this path exists
   */
  existing(relativePath) {
    const fullPath = relativePath
      ? path.join(this.root, relativePath)
      : this.root;

    return fs.promises
      .stat(fullPath)
      .then((stat) => {
        if (stat.isDirectory()) {
          return fullPath;
        }

        throw new IOError(`${fullPath} is not directory`, "ENOTDIR");
      })
      .catch((err) => {
        if (err.code === "ENOENT") {
          return fs.promises
            .mkdir(fullPath, { recursive: true })
            .then(() => fullPath);
        }

        throw err;
      });
  }

  download(relativePath) {
    const fullPath = path.join(this.root, relativePath);

    return Promise.resolve(fullPath)
      .then(fs.promises.stat)
      .then((stat) => {
        if (!stat.isFile()) {
          throw new IOError(`${relativePath} is a directory`, "EISDIR");
        }

        return fs.promises.readFile(fullPath);
      })
      .catch((err) => {
        throw new IOError(err.message, err.code);
      });
  }

  upload(relativePath, stream) {
    const fullPath = path.join(this.root, relativePath);

    logger.debug("uploading file to %s", fullPath);

    return this.existing(path.dirname(relativePath))
      .then(() =>
        fs.promises.writeFile(fullPath, stream, {
          flag: "wx",
        })
      )
      .catch((err) => {
        logger.error("error while uploading: %s (%s)", err.message, err.code);
        throw new IOError(err.message, err.code);
      });
  }
}

module.exports = FsDriver;
