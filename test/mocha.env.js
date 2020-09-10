const process = require("process");

process.env.BUNYAN_LEVEL = "debug";
process.env.AUTH_USERNAME = "user";
process.env.AUTH_PASSWORD = "secret";
process.env.FSDRIVER_PATH = require("tempy").directory();
