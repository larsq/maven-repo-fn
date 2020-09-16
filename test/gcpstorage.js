const stream = require("stream");
const rewiremock = require("rewiremock/node");
const { createStubInstance } = require("sinon");
const tempy = require("tempy");
const { createWriteStream } = require("fs");

class FakeStorage {
  constructor() {
    this._bucket = undefined;
    this._path = undefined;
  }

  bucket(bucket) {
    this._bucket = bucket;
    return this;
  }

  file(path) {
    this._path = path;
    return this;
  }

  download() {
    return Promise.resolve(FakeStorage.assets[this._path]);
  }

  createWriteStream() {
    const tmp = tempy.file({
      name: "foo.txt",
    });

    FakeStorage._assets[this._path] = "uploaded";

    // The result of what is uploaded is ignored
    return createWriteStream(tmp);
  }

  static get assets() {
    if (!FakeStorage._assets) {
      FakeStorage._assets = {};
    }

    return FakeStorage._assets;
  }

  /**
   * Sets defined objects
   * @param {string[]} assets paths to define.
   * Each path is associated with a buffer "downloaded"
   */
  static givenAssets(assets) {
    if (!assets) {
      return;
    }

    assets.forEach((key) => {
      FakeStorage.assets[key] = Buffer.from("downloaded");
    });
  }

  /**
   * Clears the storage
   */
  static reset() {
    FakeStorage._assets = {};
  }
}

const map = {
  Storage: FakeStorage,
};

function rewire(module) {
  rewiremock("@google-cloud/storage").mockThrough((name, value) => {
    if (typeof value == "function") {
      return map[name] || createStubInstance(value);
    } else {
      return value;
    }
  });

  try {
    rewiremock.enable();
    return require(module);
  } finally {
    rewiremock.disable();
  }
}

module.exports = {
  rewire,
  /**
   * Appends paths for mocked bucket
   * @param {string[]} assets an array of set assets
   */
  givenAssets: function givenAssets(assets) {
    FakeStorage.givenAssets(assets);
  },
  /**
   * Reset contents for mocked bucket
   */
  clearAssets: function clearAssets() {
    FakeStorage.reset();
  },
  /**
   * Inspects the set blob for given path
   * @param {string} givenPath the content of given path
   * @returns {Buffer|undefined} the blob for the path or undefined 
   */
  getAssetSync: function getAssetSync(givenPath) {
    return FakeStorage.assets[givenPath];
  },
};
