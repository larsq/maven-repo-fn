function authorize(req, type, credentials) {
  if (!req.headers.authorization) {
    return false;
  }

  return req.headers.authorization === `${type} ${credentials}`;
}

/**
 * Genrates basic authorization encoded credentials from username/password
 * @param {string} username the username
 * @param {string} password password in clear text
 *
 * @returns {string} a Base64 encoded string
 */
function basicAuth(username, password) {
  if (!username || !password) {
    throw Error("username and password must be set");
  }
  
  return Buffer.from(`${username}:${password}`).toString("base64");
}

function authorizeWithCredentials(type, credential) {
  return function hasCorrectCredentials(req, res, onSuccess) {
    if (authorize(req, type, credential)) {
      onSuccess(req, res);
    } else {
      res.status(401).send();
    }
  };
}

module.exports = {
  authorizeWithCredentials,
  basicAuth,
};
