const path = require("path");

/**
 * Replace the heading path elements with new ones
 *
 * @param {String} path the path to replace
 * @param {String} prefix the heading path elements to be replace
 * @param {String} targetPrefix the path elements for replacement
 *
 * @returns {String} the new path
 */
function replace(path, prefix, targetPrefix) {
  const [nPath, nPrefix, nTargetPrefix] = [
    normalize(path),
    normalize(prefix),
    normalize(targetPrefix),
  ];

  if (nPath.startsWith(`${nPrefix}/`)) {
    return nPath.replace(`${nPrefix}/`, `/${nTargetPrefix}/`);
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

function env(name) {
  if (name in process.env) {
    return process.env[name];
  }

  throw Error(`${name} not defined`);
}

module.exports = { env, replace, paths };
