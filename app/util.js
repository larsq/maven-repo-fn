const path = require("path");

function authorize(req, type, credentials) {
  if (!req.headers.authorization) {
    return false;
  }

  return req.headers.authorization === `${type} ${credentials}`;
}

function replace(path, prefix, targetPrefix) {
  const [nPath, nPrefix, nTargetPrefix] = [
    normalize(path),
    normalize(prefix),
    normalize(targetPrefix),
  ];

  if (nPath.startsWith(`${nPrefix}/`)) {
    return nPath.replace(`${nPrefix}/`, `${nTargetPrefix}/`);
  }

  return undefined;
}

/**
 * Normalize path to neither start nor end with slash
 * @param {String} path the path to normalize
 */
function normalize(path) {
  if (path === "/") {
    return "";
  }

  const startsWithSlash = path.startsWith("/");
  const endsWithSlash = path.endsWith("/");

  const startAt = Number(startsWithSlash);
  const offset = Number(startsWithSlash) + Number(endsWithSlash);

  return path.substr(startAt, path.length - offset);
}

/**
 * Expands a path into array of full path of descendants
 * @example
 * // returns ["foo", "foo/bar"]
 * paths("foo/bar")
 * @param {String} fullPath the path to expand
 * @returns {String[]} Returns array of string, each of the elements
 * specifies the full path of the descendants
 */
function paths(fullPath) {
  let accumulated = [fullPath];
  let parent = path.dirname(fullPath);

  while (parent !== ".") {
    accumulated.unshift(parent);
    parent = path.dirname(parent);
  }

  return accumulated;
}

module.exports = { authorize, replace, paths };
