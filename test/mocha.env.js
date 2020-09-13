const process = require("process");

process.env.BUNYAN_LEVEL = "fatal";
process.env.AUTH_USERNAME = "user";
process.env.AUTH_PASSWORD = "secret";
process.env.FSDRIVER_PATH = require("tempy").directory();
