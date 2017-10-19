const loaderUtils = require('loader-utils')
const requireRegexp = new RegExp(/.*?require\(\s*[\'"]debug[\'"]\s*\).*/, 'g')
const importRegexp = new RegExp(/^import\s{\s*.+\s*}\sfrom\s[\'"]debug[\'"].*/, 'g')

function genDebugRegexpWithMethodname(methodname) {
  return new RegExp('.*' + methodname + '\\(\.*?\\)\.*', 'g')
}

function replaceWithRegexp(source, regexp) {
  return source.replace(regexp, '\n')
}

function replaceWithRegexps(source, regexps) {
  regexps.map((regexp) => {
    source = replaceWithRegexp(source, regexp)
  })

  return source
}

module.exports = function (source) {
  const options = loaderUtils.getOptions(this) || {},
        methodName = options.methodName || 'debug',
        methodRegexp = genDebugRegexpWithMethodname(methodName),
        response = replaceWithRegexps(source, [requireRegexp, importRegexp, methodRegexp])
  return replaceWithRegexps(source, [requireRegexp, importRegexp, methodRegexp])
}
