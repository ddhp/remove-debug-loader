const loaderUtils = require('loader-utils')
function validateInputAsArray(input) {
  return input instanceof Array ? input.join('|') : [input].join('|')
}

function requireRegexp(moduleName) {
  const moduleString = validateInputAsArray(moduleName)
  return new RegExp('.*?require\\(\\s*[\'"](\\./|(\\.\\./)*)?(' + moduleString + '|debug)[\'"]\\s*\\).*', 'g')
}

function importRegexp(moduleName) {
  const moduleString = validateInputAsArray(moduleName)
  return new RegExp('import\\s{?\\s*.+\\s*}?\\sfrom\\s[\'"](\\./|(\\.\\./)*)?(' + moduleString + '|debug)[\'"].*', 'g')
}

function methodNameRegexp(methodName) {
  const methodString = validateInputAsArray(methodName)
  return new RegExp('.*(' + methodString + '|debug)(\\(\.*?\\)|\\s?=\\s?)\.*', 'g')
}

function replaceWithRegexp(source, regexp) {
  return source.replace(regexp, '\n')
}

function replaceWithRegexps(source, regexps) {
  regexps.map((regexp, i) => {
    source = replaceWithRegexp(source, regexp)
  })

  return source
}

module.exports = exports = function (source) {
  const options = loaderUtils.getOptions(this) || {},
        methodName = options.methodName || ['debug'],
        moduleName = options.moduleName || ['']
  return replaceWithRegexps(source, [
          requireRegexp(moduleName), 
          importRegexp(moduleName), 
          methodNameRegexp(methodName)
        ])
}

exports.methodNameRegexp = methodNameRegexp
exports.requireRegexp = requireRegexp
exports.importRegexp = importRegexp
