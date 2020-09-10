const process = require("process");
const fs = require("fs");
const path = require("path");
const { IOError } = require("./exceptions");
const { env } = require("./util");
const logger = require("./logfactory").logger("FsDrive");

class FsDriver {
  constructor(directory) {
    logger.info("Creating driver, setting root to %s", directory);
    this.directory = directory;
  }

  /**
   * @returns {String} the root
   */
  get root() {
    return this.directory;
  }

  get interface() {
    const that = this;

    return {
      upload: function upload(req, res) {
        logger.info(
          `upload to path=${req.path} length=${req.headers["content-length"]} type=${req.headers["content-type"]}`
        );

        that
          .upload(req.path, req.body)
          .then(() => {
            res.sendStatus(200);
          })
          .catch((err) => {
            logger.error(err);
            res.status(500).send();
          });
      },

      download: function download(req, res) {
        logger.info(`download from path ${req.path}`);

        that
          .download(req.path)
          .then((buffer) => {
            res.status(200).send(buffer);
          })
          .catch((err) => {
            if (err.code === "ENOENT") {
              logger.warn(`${req.path} does not exists`);
              res.status(404).send();
            } else if (err.code === "EISDIR") {
              logger.warn(`${req.path} is a directory`);
              res.status(404).send();
            } else {
              logger.error(err);
              res.status(500).send();
            }
          });
      },
    };
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
          logger.debug("creating non-existent directories: %s", relativePath);

          return fs.promises
            .mkdir(fullPath, { recursive: true })
            .then(() => fullPath);
        }

        throw err;
      });
  }

  download(relativePath) {
    logger.debug("download file: %s", path.join(this.root, relativePath));

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

    logger.debug("uploading file: %s", relativePath);

    return this.existing(path.dirname(relativePath))
      .then(() =>
        fs.promises.writeFile(fullPath, stream, {
          flag: "w",
        })
      )
      .catch((err) => {
        logger.error("error while uploading: %s (%s)", err.message, err.code);
        throw new IOError(err.message, err.code);
      });
  }

  static create() {
    const path = env("FSDRIVER_PATH");

    return new FsDriver(path);
  }
}

module.exports = FsDriver;
