const { env } = require("./util");

const USERNAME = env("AUTH_USERNAME");
const PASSWORD = env("AUTH_PASSWORD");

module.exports = { USERNAME, PASSWORD };
