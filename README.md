# remove-debug-loader

remove [debug](https://github.com/visionmedia/debug) from your code, by
- remove `require` and `import` debug
- remove method name - `debug`'s definition and invocation (name `debug` is default and can be config in loader options)
- remove custom modules(when you patched debug library)

## Installation
```
$ yarn add remove-debug-loader --dev
```
or
```
$ npm i --save-dev remove-debug-loader
```

## How to use
config `webpack.config.js` with:

```js
...
module: {
  rules: [{
    test: /\.js$/,
    use: [{
      loader: 'remove-debug-loader'
    }]
  }]
}
...
```

this would remove these patterns

requiring debug:

```js
const debug = require('debug')
```

also support `import` syntax:

```js
import debug from 'debug'
```

and debug methods

```js
debug('some log to log', 'stuff')
```

since [debug](https://github.com/visionmedia/debug) is log to stderr by default on server side (see [here](https://github.com/visionmedia/debug#output-streams)), we usually patch debug to another individual module

so you can add extra config to webpack if defining custom log method name and importing patched log library

e.g

```js
import patchedToStdout from './patchedToStdout'
const myLog = patchedToStdout('mynamespace')

myLog('some log to log', 'stuffs')
```

in this case, we need to remove importing patchedToStdout also `myLog`'s definition and invocation, so set loader's options `methodName` and `moduleName`:
```js
{
  use: [{
    loader: 'remove-debug-loader',
    options: {
      moduleName: ['patchedToStdout'],
      methodName: ['myLog']
    }
  }]
}
```

those 2 options are array, so it supports as much as keyword you want to remove

## Known Issue
removing multi line debug invocation isn't support yet, i.e
```js
debug('a multi-line log message which would break code build',
      'use remove-debug-loader with this precaution')
```

## License
see LICENSE
