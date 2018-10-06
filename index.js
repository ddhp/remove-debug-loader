const loaderUtils = require('loader-utils');

function validateInputAsArray(input) {
  return input instanceof Array ? input.join('|') : [input].join('|');
}

function requireRegexp(moduleName) {
  const moduleString = validateInputAsArray(moduleName);
  return new RegExp(`.*?require\\(\\s*['"](\\./|(\\.\\./)*)?(${moduleString}|debug)['"]\\s*\\).*`, 'g');
}

function importRegexp(moduleName) {
  const moduleString = validateInputAsArray(moduleName);
  return new RegExp(`import\\s{?\\s*.+\\s*}?\\sfrom\\s['"](\\./|(\\.\\./)*)?(${moduleString}|debug)['"].*`, 'g');
}

function methodInvocationRegexp(methodName) {
  const methodString = validateInputAsArray(methodName);
  return new RegExp(`(?:\\b.*\\.)?\\b(?:${methodString}|debug)\\(.*\\)(?:;|\\b)?`, 'g');
}

function methodDefinitionRegexp(methodName) {
  const methodString = validateInputAsArray(methodName);
  return new RegExp(`\\b((?:var|const|let|,)\\s){0,1}(?:${methodString}|debug)\\s?=\\s?.*(,|;)?`, 'g');
}

function replaceWithRegexp(source, regexp) {
  return source.replace(regexp, '');
}

function replaceWithRegexps(source, regexps) {
  return regexps.reduce((prev, regexp) => replaceWithRegexp(prev, regexp), source);
}

exports = function loader(source) {
  const options = loaderUtils.getOptions(this) || {};
  const methodName = options.methodName || ['debug'];
  const moduleName = options.moduleName || [''];

  return replaceWithRegexps(source, [
    requireRegexp(moduleName),
    importRegexp(moduleName),
    methodInvocationRegexp(methodName),
    methodDefinitionRegexp(methodName),
  ]);
};

exports.methodInvocationRegexp = methodInvocationRegexp;
exports.methodDefinitionRegexp = methodDefinitionRegexp;
exports.requireRegexp = requireRegexp;
exports.importRegexp = importRegexp;
module.exports = exports;
