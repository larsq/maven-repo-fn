const bunyan = require("bunyan");
const process = require("process");

class LoggerFactory {
  constructor(defaultLevel) {
    this._level = defaultLevel || process.env.BUNYAN_LEVEL || "info";
    this._loggers = {};
  }

  /**
   * Adjust log level of exsting ones and set the default level
   * to the new one
   * @param {?String} newLevel the new level or pick the one in  the BUNYAN_LEVEL env variable
   * @returns {string} the new effective level
   */
  adjust(newLevel) {
    let effectiveLevel = newLevel || process.env.BUNYAN_LEVEL;

    if (effectiveLevel) {
      this._level = effectiveLevel;
      for (const [key, value] of Object.entries(this._loggers)) {
        value.level(effectiveLevel);
      }
      return effectiveLevel;
    } else {
      return;
    }
  }

  /**
   * Create logger if not exists otherwise return existing one
   * with adjusted log level
   * @param {string} name the name of the logger
   * @param {string} [level] the level or default if not defined
   *
   * @returns {bunyan.Logger} logger instance
   */
  logger(name, level) {
    if (!this._loggers[name]) {
      this._loggers[name] = bunyan.createLogger({
        name,
        level: level || this._level,
      });

      return this._loggers[name];
    } else {
      let existing = this._loggers[name];
      if (level) {
        existing.level(level);
      }

      return existing;
    }
  }
}

module.exports = new LoggerFactory();
