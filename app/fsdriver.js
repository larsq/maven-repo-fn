const fs = require("fs");
const path = require("path");
const { IOError } = require("./exceptions");
const { env } = require("./util");
const logger = require("./logfactory").logger("FsDrive");

/**
 * Class that uploads and download files from file system.
 * This class is mainly used for local testing.
 */
class FsDriver {
  /**
   * @param {string} directory the root for files
   */
  constructor(directory) {
    logger.info("Creating driver, setting root to %s", directory);
    this.directory = directory;
  }

  /**
   * the absolute path for the root in the file system
   * @type string
   */
  get root() {
    return this.directory;
  }

  /**
   * interface provided for express.js framework
   */
  get interface() {
    const that = this;

    return {
      upload: function upload(req, res) {
        logger.info(
          `upload to path=${req.path} length=${req.headers["content-length"]} type=${req.headers["content-type"]}`
        );

        return that
          .upload(req.path, req.body)
          .then(() => {
            res.status(200).send();
          })
          .catch((err) => {
            logger.error(err);
            res.status(500).send();
          });
      },

      download: function download(req, res) {
        logger.info(`download from path ${req.path}`);

        return that
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
   * @param {string} [relativePath] the relative path from root. If undefined, the root
   * is used
   * @returns {Promise<string>} a promise that this path exists
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

  /**
   * Promise to get the buffer of the file
   * @param {string} relativePath the relative path to root
   * @returns {Promise<Buffer>}
   */
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

  /**
   * Promise to store buffer at specified location
   * @param {string} relativePath the relative path to root
   * @param {Buffer} stream the buffer to store
   *
   */
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

  /**
   * Factory method to create instance. The root is provided from FSDRIVER_PATH
   * environment variable
   * @returns {FsDriver} a new instance
   */
  static create() {
    const path = env("FSDRIVER_PATH");

    return new FsDriver(path);
  }
}

module.exports = FsDriver;
