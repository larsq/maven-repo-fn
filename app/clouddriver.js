const { Request, Response } = require("express");

/**
 * Express Callback
 * @callback ExpressCallback
 * @param {Request} req express.js request
 * @param {Response} res express.js response
 */

/**
 * Express Interface
 * @typedef {Object} ExpressInterface
 * @property {ExpressCallback} upload
 * @property {ExpressCallback} download
 */

const logger = require("./logfactory").logger("CloudDriver");

/**
 * Clouddriver uses a Google Storage for download and upload of files.
 */
class CloudDriver {
  /**
   * @param {string} bucket the name of the bucket. The name is expected to be set
   */
  constructor(bucket) {
    logger.info("Configured bucket: %s", bucket);

    this._bucket = bucket;
  }

  /**
   * The configure bucket
   * @type {string}
   */
  get bucket() {
    return this._bucket;
  }

  /**
   * interface provided for express.js framework
   * @type ExpressInterface
   */
  get interface() {
    const that = this;

    return {
      download: function download(req, res) {
        return that
          .download(req.path)
          .then((buffer) => {
            res.status(200).send(buffer);
          })
          .catch((err) => {
            res.status(500).send();
          });
      },

      upload: function upload(req, res) {
        return that
          .upload(req.path, req.body)
          .then(() => {
            res.status(200).send();
          })
          .catch((err) => {
            res.status(500).send();
          });
      },
    };
  }

  /**
   * Promise for downloading the content for this path
   * @param {string} bucketPath the path in the bucket to download
   * @returns {Promise} a promise representing the content of the path as Buffer
   */
  download(bucketPath) {
    //return Promise.resolve();
  }

  upload(bucketPath, content) {
    //return Promise.resolve();
  }

  static create() {}
}

module.exports = CloudDriver;
