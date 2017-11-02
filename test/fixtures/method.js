// original debug
const debug = require('debug')('mynamespace')
debug('some log to log')
debug()

// patched log
import patchedToStdout from './patchedToStdout'
const myLog = patchedToStdout('mynamespace')
myLog('some log to log from myLog', 'stuffs')

const customLog = patchedToStdout('anothernamespace')
customLog('some log to log from customLog', 'stuffs')
