class IOError extends Error {
  constructor(message, code) {
    super(message);
    this.name = this.constructor.name;
    this.stack = Error.captureStackTrace(this, this.constructor);
    this.code = code;
  }
}

module.exports = {
  IOError,
};
